// BYOK — enrutamiento dinámico de proveedores de IA.
// Si el usuario envía su propia API Key en el body, se usa su proveedor/modelo.
// Si no, se hace fallback transparente al Lovable AI Gateway con LOVABLE_API_KEY.

export type UserModel = {
  provider: "openai" | "anthropic" | "google" | "deepseek" | "perplexity";
  model: string;
  apiKey: string;
};

export type LLMTarget = {
  /** Etiqueta para logs */
  label: string;
  isAnthropic: boolean;
  endpoint: string;
  headers: Record<string, string>;
  model: string;
};

const OPENAI_COMPATIBLE: Record<string, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  deepseek: "https://api.deepseek.com/v1/chat/completions",
  perplexity: "https://api.perplexity.ai/chat/completions",
  google: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
};

/** Valida el userModel recibido del cliente. */
export function parseUserModel(raw: unknown): UserModel | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const provider = String(m.provider ?? "");
  const model = String(m.model ?? "").trim();
  const apiKey = String(m.apiKey ?? "").trim();
  const valid = ["openai", "anthropic", "google", "deepseek", "perplexity"];
  if (!valid.includes(provider)) return null;
  if (!model || model.length > 120) return null;
  if (apiKey.length < 10 || apiKey.length > 400) return null;
  return { provider: provider as UserModel["provider"], model, apiKey };
}

/** Resuelve a dónde y con qué credenciales se dispara el prompt final. */
export function resolveTarget(userModel: UserModel | null, fallbackModel: string, lovableKey: string): LLMTarget {
  if (!userModel) {
    return {
      label: `lovable:${fallbackModel}`,
      isAnthropic: false,
      endpoint: "https://ai.gateway.lovable.dev/v1/chat/completions",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      model: fallbackModel,
    };
  }

  if (userModel.provider === "anthropic") {
    return {
      label: `anthropic:${userModel.model}`,
      isAnthropic: true,
      endpoint: "https://api.anthropic.com/v1/messages",
      headers: {
        "x-api-key": userModel.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      model: userModel.model,
    };
  }

  return {
    label: `${userModel.provider}:${userModel.model}`,
    isAnthropic: false,
    endpoint: OPENAI_COMPATIBLE[userModel.provider],
    headers: { Authorization: `Bearer ${userModel.apiKey}`, "Content-Type": "application/json" },
    model: userModel.model,
  };
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ToolDef = {
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
};

export type LLMResult = {
  ok: boolean;
  status: number;
  /** Texto de la respuesta (si no se usó tool calling) */
  content: string;
  /** Argumentos JSON de la tool forzada (si se pidió una tool) */
  toolArgs: string | null;
  finishReason: string | null;
  errorText?: string;
};

/**
 * Llamada unificada. Adapta automáticamente el formato Anthropic (system separado,
 * tools con input_schema y tool_choice por nombre) frente al formato OpenAI-compatible.
 */
export async function callLLM(
  target: LLMTarget,
  messages: ChatMessage[],
  opts: { tool?: ToolDef; maxTokens?: number } = {},
): Promise<LLMResult> {
  const maxTokens = opts.maxTokens ?? 16000;

  let body: Record<string, unknown>;
  if (target.isAnthropic) {
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const rest = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
    body = {
      model: target.model,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: rest.length ? rest : [{ role: "user", content: " " }],
      ...(opts.tool
        ? {
            tools: [
              {
                name: opts.tool.name,
                description: opts.tool.description ?? "",
                input_schema: opts.tool.parameters,
              },
            ],
            tool_choice: { type: "tool", name: opts.tool.name },
          }
        : {}),
    };
  } else {
    body = {
      model: target.model,
      messages,
      ...(opts.tool
        ? {
            tools: [
              {
                type: "function",
                function: {
                  name: opts.tool.name,
                  description: opts.tool.description ?? "",
                  parameters: opts.tool.parameters,
                },
              },
            ],
            tool_choice: { type: "function", function: { name: opts.tool.name } },
          }
        : {}),
      max_tokens: maxTokens,
    };
  }

  const res = await fetch(target.endpoint, {
    method: "POST",
    headers: target.headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("callLLM error", target.label, res.status, errorText.slice(0, 500));
    return { ok: false, status: res.status, content: "", toolArgs: null, finishReason: null, errorText };
  }

  const json = await res.json();

  if (target.isAnthropic) {
    const blocks: any[] = Array.isArray(json?.content) ? json.content : [];
    const toolBlock = blocks.find((b) => b?.type === "tool_use");
    const text = blocks.filter((b) => b?.type === "text").map((b) => b.text).join("");
    return {
      ok: true,
      status: res.status,
      content: text ?? "",
      toolArgs: toolBlock ? JSON.stringify(toolBlock.input ?? {}) : null,
      finishReason: json?.stop_reason ?? null,
    };
  }

  const choice = json?.choices?.[0];
  const call = choice?.message?.tool_calls?.[0];
  return {
    ok: true,
    status: res.status,
    content: choice?.message?.content ?? "",
    toolArgs: call?.function?.arguments ?? null,
    finishReason: choice?.finish_reason ?? null,
  };
}

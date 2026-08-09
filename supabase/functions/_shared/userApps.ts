// Apps del usuario (MCP / API) como herramientas para cualquier IA del canvas.
// El "cerebro" (modelo) puede ser el de Lovable o el BYOK del usuario: las herramientas son las mismas.
import { createClient } from "npm:@supabase/supabase-js@2";
import { callLLM, type LLMTarget } from "./llm.ts";

export type UserAppRow = {
  id: string;
  name: string;
  connector_type: "mcp" | "api";
  url: string | null;
  api_key: string | null;
  enabled: boolean;
  is_builtin: boolean;
  builtin_key: string | null;
};

/** Carga las apps activas del usuario autenticado (service role, nunca expone las keys al cliente). */
export async function loadUserApps(authHeader: string | null): Promise<UserAppRow[]> {
  try {
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (!token) return [];
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) return [];
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: userRes } = await admin.auth.getUser(token);
    const userId = userRes?.user?.id;
    if (!userId) return [];
    const { data, error } = await admin
      .from("user_apps")
      .select("id, name, connector_type, url, api_key, enabled, is_builtin, builtin_key")
      .eq("user_id", userId)
      .eq("enabled", true);
    if (error) {
      console.error("loadUserApps error", error.message);
      return [];
    }
    return (data ?? []).filter((a: UserAppRow) => !a.is_builtin && !!a.url);
  } catch (e) {
    console.error("loadUserApps exception", e);
    return [];
  }
}

export function appsCatalogText(apps: UserAppRow[]): string {
  if (!apps.length) return "";
  return apps
    .map((a) => `- ${a.name} (${a.connector_type === "mcp" ? "MCP" : "API"}) base: ${a.url}`)
    .join("\n");
}

type PlannedCall = { app: string; method?: string; path?: string; query?: string; body?: string };

const PLAN_TOOL = {
  name: "plan_app_calls",
  description: "Decide si hay que llamar a alguna app conectada del usuario antes de responder.",
  parameters: {
    type: "object",
    properties: {
      needsApps: { type: "boolean" },
      calls: {
        type: "array",
        items: {
          type: "object",
          properties: {
            app: { type: "string", description: "Nombre exacto de la app conectada" },
            method: { type: "string", enum: ["GET", "POST"] },
            path: { type: "string", description: "Ruta relativa a la base URL, empieza con /" },
            query: { type: "string", description: "Query string sin '?', opcional" },
            body: { type: "string", description: "JSON string del body si method=POST" },
          },
          required: ["app", "path"],
        },
      },
    },
    required: ["needsApps"],
  },
};

/** Ejecuta una llamada a una app conectada con su credencial guardada. */
async function runCall(apps: UserAppRow[], call: PlannedCall): Promise<string> {
  const app = apps.find((a) => a.name.trim().toLowerCase() === String(call.app ?? "").trim().toLowerCase());
  if (!app?.url) return `App "${call.app}" no encontrada.`;
  const base = app.url.replace(/\/+$/, "");
  const path = String(call.path ?? "/").startsWith("/") ? call.path! : `/${call.path ?? ""}`;
  const url = `${base}${path}${call.query ? `?${call.query}` : ""}`;
  const method = (call.method ?? "GET").toUpperCase() === "POST" ? "POST" : "GET";
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(app.api_key ? { Authorization: `Bearer ${app.api_key}` } : {}),
      },
      ...(method === "POST" && call.body ? { body: call.body } : {}),
      signal: AbortSignal.timeout(25000),
    });
    const text = await res.text();
    return `↳ ${app.name} ${method} ${path} → ${res.status}\n${text.slice(0, 6000)}`;
  } catch (e) {
    return `↳ ${app.name} ${method} ${path} → error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

/**
 * Si el usuario menciona/necesita apps, planifica y ejecuta las llamadas,
 * devolviendo un bloque de contexto con los resultados para el prompt final.
 */
export async function maybeUseApps(params: {
  apps: UserAppRow[];
  target: LLMTarget;
  prompt: string;
  contextLabel?: string;
}): Promise<string> {
  const { apps, target, prompt } = params;
  if (!apps.length) return "";

  const sys = `Eres un planificador de herramientas. El usuario tiene estas apps conectadas:
${appsCatalogText(apps)}

Decide si para cumplir la instrucción hay que hacer peticiones HTTP a alguna de ellas.
- Usa apps SOLO si el usuario las menciona (por nombre o con un tag "@Nombre") o si claramente pide datos externos que requieren esa app.
- Si no hace falta, responde needsApps=false y calls vacío.
- Máximo 2 llamadas. Rutas relativas a la base URL. La autenticación ya se agrega automáticamente.`;

  let plan: { needsApps?: boolean; calls?: PlannedCall[] } = {};
  try {
    const res = await callLLM(
      target,
      [
        { role: "system", content: sys },
        { role: "user", content: prompt },
      ],
      { tool: PLAN_TOOL, maxTokens: 1200 },
    );
    if (!res.ok || !res.toolArgs) return "";
    plan = JSON.parse(res.toolArgs);
  } catch (e) {
    console.error("maybeUseApps plan error", e);
    return "";
  }

  const calls = Array.isArray(plan.calls) ? plan.calls.slice(0, 2) : [];
  if (!plan.needsApps || !calls.length) return "";

  const results: string[] = [];
  for (const c of calls) results.push(await runCall(apps, c));

  return `\n\n---
RESULTADOS DE APPS CONECTADAS (úsalos como fuente real de datos; no inventes):
${results.join("\n\n")}\n`;
}

// BYOK — catálogo de proveedores de IA y almacenamiento local seguro (solo navegador).

export type AIProviderId = "openai" | "anthropic" | "google" | "deepseek" | "perplexity";

export type AIProvider = {
  id: AIProviderId;
  name: string;
  /** Modelos sugeridos (el usuario puede escribir otro) */
  models: string[];
  keyPlaceholder: string;
  keyHint: string;
  docsUrl: string;
};

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "anthropic",
    name: "Claude",
    models: ["claude-sonnet-4-5", "claude-opus-4-1", "claude-3-5-haiku-latest"],
    keyPlaceholder: "sk-ant-...",
    keyHint: "Consíguela en console.anthropic.com → API Keys",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "openai",
    name: "ChatGPT",
    models: ["gpt-4.1", "gpt-4o", "gpt-4o-mini"],
    keyPlaceholder: "sk-...",
    keyHint: "Consíguela en platform.openai.com → API Keys",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "google",
    name: "Gemini",
    models: ["gemini-3.6-flash", "gemini-3-pro", "gemini-2.5-pro"],
    keyPlaceholder: "AIza...",
    keyHint: "Consíguela en aistudio.google.com → Get API key",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    models: ["deepseek-chat", "deepseek-reasoner"],
    keyPlaceholder: "sk-...",
    keyHint: "Consíguela en platform.deepseek.com → API Keys",
    docsUrl: "https://platform.deepseek.com/api_keys",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    models: ["sonar", "sonar-pro", "sonar-reasoning"],
    keyPlaceholder: "pplx-...",
    keyHint: "Consíguela en perplexity.ai → Settings → API",
    docsUrl: "https://www.perplexity.ai/settings/api",
  },
];

export function getProvider(id: string): AIProvider | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}

export type UserModel = {
  id: string;
  provider: AIProviderId;
  model: string;
  apiKey: string;
  enabled: boolean;
  createdAt: number;
};

const STORAGE_KEY = "miiles.byok.models";
const EVENT = "miiles:byok-changed";

export function readUserModels(): UserModel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((m) => m && m.provider && m.model && m.apiKey);
  } catch {
    return [];
  }
}

export function writeUserModels(models: UserModel[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
  } catch {
    /* storage lleno o bloqueado */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function subscribeUserModels(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Modelo activo (el primero habilitado) o null si se usa el modelo del sistema. */
export function getActiveUserModel(): { provider: AIProviderId; model: string; apiKey: string } | null {
  const active = readUserModels().find((m) => m.enabled);
  if (!active) return null;
  return { provider: active.provider, model: active.model, apiKey: active.apiKey };
}

/** Payload que se envía en el body de las edge functions. */
export function userModelPayload() {
  const active = getActiveUserModel();
  return active ? { userModel: active } : {};
}

export function maskKey(key: string) {
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

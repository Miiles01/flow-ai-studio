import { supabase } from "@/integrations/supabase/client";
import { userModelPayload, getProvider } from "@/lib/aiModels";

export type WidgetAIHistoryMsg = { role: "user" | "assistant"; content: string };
export type WidgetAIResult =
  | { intent: "query"; answer: string; jobId?: string; pending?: boolean }
  | { intent: "edit"; data: Record<string, unknown>; answer?: string };

export class WidgetAIModelError extends Error {
  provider: string;
  model: string;
  constructor(provider: string, model: string) {
    const providerName = getProvider(provider)?.name ?? provider;
    super(`Parece que tu modelo ${providerName} (${model}) no tiene créditos disponibles. Cambia a otro modelo en Apps → Modelos.`);
    this.name = "WidgetAIModelError";
    this.provider = provider;
    this.model = model;
  }
}

export async function runWidgetAI(params: {
  widgetType: string;
  data: unknown;
  prompt: string;
  history?: WidgetAIHistoryMsg[];
  /** Data de los demás widgets del canvas, para sincronizar info entre widgets. */
  canvasWidgets?: { nodeId: string; widgetType?: string; data: unknown }[];

  flowId?: string | null;
  nodeId?: string;
}): Promise<WidgetAIResult> {
  const { data, error } = await supabase.functions.invoke("widget-ai", {
    body: { ...params, ...userModelPayload() },
  });
  if (error) throw new Error(error.message || "Error llamando a widget-ai");
  if ((data as any)?.switchModel) {
    throw new WidgetAIModelError(String((data as any).provider), String((data as any).model));
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as WidgetAIResult;
}


export type WidgetAIComment = {
  id: string;
  prompt: string;
  answer: string;
  createdAt: number;
  read?: boolean;
  /** Tarea en segundo plano (Apify u otra app): mientras esté pendiente el comentario muestra un loader. */
  pending?: boolean;
  jobId?: string;
  status?: "running" | "done" | "error";
  provider?: string;
};

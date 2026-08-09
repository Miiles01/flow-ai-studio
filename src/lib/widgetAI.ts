import { supabase } from "@/integrations/supabase/client";
import { userModelPayload } from "@/lib/aiModels";

export type WidgetAIHistoryMsg = { role: "user" | "assistant"; content: string };
export type WidgetAIResult =
  | { intent: "query"; answer: string; jobId?: string; pending?: boolean }
  | { intent: "edit"; data: Record<string, unknown>; answer?: string };

export async function runWidgetAI(params: {
  widgetType: string;
  data: unknown;
  prompt: string;
  history?: WidgetAIHistoryMsg[];
  flowId?: string | null;
  nodeId?: string;
}): Promise<WidgetAIResult> {
  const { data, error } = await supabase.functions.invoke("widget-ai", {
    body: { ...params, ...userModelPayload() },
  });
  if (error) throw new Error(error.message || "Error llamando a widget-ai");
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

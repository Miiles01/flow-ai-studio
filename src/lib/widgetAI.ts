import { supabase } from "@/integrations/supabase/client";

export type WidgetAIHistoryMsg = { role: "user" | "assistant"; content: string };
export type WidgetAIResult =
  | { intent: "query"; answer: string }
  | { intent: "edit"; data: Record<string, unknown>; answer?: string };

export async function runWidgetAI(params: {
  widgetType: string;
  data: unknown;
  prompt: string;
  history?: WidgetAIHistoryMsg[];
}): Promise<WidgetAIResult> {
  const { data, error } = await supabase.functions.invoke("widget-ai", { body: params });
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
};

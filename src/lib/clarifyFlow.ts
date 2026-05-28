import { supabase } from "@/integrations/supabase/client";

export type ClarifyQuestion = {
  id: string;
  question: string;
  allow_multiple?: boolean;
  options: string[];
};

export type ClarifyResult = {
  needs_clarification: boolean;
  intent: string;
  questions: ClarifyQuestion[];
  refined_prompt: string;
};

export async function clarifyPrompt(prompt: string): Promise<ClarifyResult> {
  const { data, error } = await supabase.functions.invoke("clarify-flow", {
    body: { prompt },
  });

  if (error) {
    console.error("clarify-flow error:", error);
    // Fail open: let the user generate directly
    return { needs_clarification: false, intent: prompt, questions: [], refined_prompt: prompt };
  }

  if (data?.error) {
    return { needs_clarification: false, intent: prompt, questions: [], refined_prompt: prompt };
  }

  return data as ClarifyResult;
}

/** Builds an enriched prompt from the original + the user's selected answers. */
export function buildEnrichedPrompt(
  basePrompt: string,
  result: ClarifyResult,
  answers: Record<string, string[]>
): string {
  const lines: string[] = [basePrompt.trim()];
  const details: string[] = [];

  for (const q of result.questions) {
    const selected = answers[q.id];
    if (selected && selected.length > 0) {
      details.push(`- ${q.question} ${selected.join(", ")}`);
    }
  }

  if (details.length > 0) {
    lines.push("\nDetalles adicionales para afinar el flujo:");
    lines.push(...details);
  }

  return lines.join("\n");
}

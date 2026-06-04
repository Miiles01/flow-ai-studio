import { supabase } from "@/integrations/supabase/client";

export type PlanPhase = {
  name: string;
  detail: string;
};

export type PlanResult = {
  title: string;
  objective: string;
  summary: string;
  phases: PlanPhase[];
  deliverables: string[];
};

export async function planFlow(prompt: string): Promise<PlanResult | null> {
  const { data, error } = await supabase.functions.invoke("plan-flow", {
    body: { prompt },
  });

  if (error) {
    console.error("plan-flow error:", error);
    return null;
  }
  if (data?.error) {
    console.error("plan-flow error:", data.error);
    return null;
  }

  return data as PlanResult;
}

/** Turns an approved plan into a rich instruction block appended to the generation prompt. */
export function buildPlanContext(basePrompt: string, plan: PlanResult): string {
  const lines: string[] = [basePrompt.trim()];

  lines.push("\n--- PLAN ESTRATÉGICO APROBADO (constrúyelo fielmente como un flujo completo y profesional) ---");
  if (plan.objective) lines.push(`Objetivo: ${plan.objective}`);
  if (plan.summary) lines.push(`Estrategia: ${plan.summary}`);

  if (plan.phases.length > 0) {
    lines.push("Fases (cada fase debe convertirse en una sección clara del flujo, con pasos y checklists detallados):");
    plan.phases.forEach((p, i) => {
      lines.push(`${i + 1}. ${p.name}: ${p.detail}`);
    });
  }

  if (plan.deliverables.length > 0) {
    lines.push("Entregables que el flujo debe reflejar:");
    plan.deliverables.forEach((d) => lines.push(`- ${d}`));
  }

  return lines.join("\n");
}

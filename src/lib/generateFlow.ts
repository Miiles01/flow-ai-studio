import type { Node, Edge } from "@xyflow/react";
import type { FlowNodeData } from "@/components/nodes/FlowNode";
import { supabase } from "@/integrations/supabase/client";

type AIStep = {
  label: string;
  description?: string;
  type: "start" | "process" | "decision" | "action" | "end";
};

export async function generateFlowFromPrompt(
  prompt: string
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const enhancedPrompt = `${prompt}

---
CRITICAL INSTRUCTION FOR AI: Ignore any previous formatting rules in the system prompt. You MUST return the output as a JSON OBJECT with "nodes" and "edges" arrays.
Each node MUST have:
- "id": unique string identifier (e.g. "1", "2")
- "type": one of "shape", "todo", "text"
- "position": {"x": number, "y": number}
- "data": an object based on the type

Node Types and Data:
1. "shape": {"shape": "square"|"circle"|"diamond"|"hexagon"|"star", "label": "text", "fillColor": "hex", "textColor": "hex", "fontSize": 14}
2. "todo": {"title": "text", "subtitle": "text", "tasks": [{"id": "t1", "text": "task", "completed": boolean}], "backgroundColor": "hex", "accentColor": "hex"}
3. "text": {"html": "<b>Title</b>", "fontSize": 24, "textColor": "hex"}

Rules:
- Organize the nodes logically with X and Y positions. Increment X by 300 for sequential steps.
- Make it colorful and visually appealing (use colors like #3B82F6, #F97316, #22C55E).
- If you use edges, generate them in "edges": [{"id": "e1-2", "source": "1", "target": "2", "animated": true, "style": {"stroke": "hex", "strokeWidth": 2}}].
- Respond ONLY with valid JSON: {"nodes": [...], "edges": [...]}`;

  const { data, error } = await supabase.functions.invoke("generate-flow", {
    body: { prompt: enhancedPrompt },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(error.message || "Error al generar el flujo");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  // 1. Si la nueva función Edge está desplegada, vendrá en data.nodes
  if (data.nodes && Array.isArray(data.nodes) && data.nodes.length > 0 && data.nodes[0].position) {
    return { nodes: data.nodes, edges: data.edges || [] };
  }

  // 2. Si la función Edge vieja está desplegada, pero la IA obedeció el nuevo prompt, vendrá dentro de data.steps.nodes
  if (data.steps && data.steps.nodes && Array.isArray(data.steps.nodes)) {
    return { nodes: data.steps.nodes, edges: data.steps.edges || [] };
  }

  // 3. Fallback absoluto si la IA insistió en devolver el array simple antiguo
  const steps = data.steps;

  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error("La IA no generó pasos válidos");
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const startX = 400;
  const startY = 60;
  const gapY = 120;

  steps.forEach((step, i) => {
    const node: Node = {
      id: `ai-${Date.now()}-${i}`,
      type: "flowNode",
      position: { x: startX, y: startY + i * gapY },
      data: {
        label: step.label,
        description: step.description,
        type: step.type || "process",
      } as FlowNodeData,
    };
    nodes.push(node);

    if (i > 0) {
      edges.push({
        id: `e-${nodes[i - 1].id}-${node.id}`,
        source: nodes[i - 1].id,
        target: node.id,
        animated: true,
      });
    }
  });

  return { nodes, edges };
}

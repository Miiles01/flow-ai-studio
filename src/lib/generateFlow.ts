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
CRITICAL INSTRUCTION FOR AI: Ignore any previous formatting rules. You MUST return a JSON OBJECT with "nodes" and "edges" arrays.
You are an expert UX/UI Flow Designer. Your job is to create visually STUNNING, vibrant, and highly detailed diagrams.

Each node MUST have:
- "id": unique string (e.g. "n1", "n2")
- "type": MUST BE EXACTLY ONE OF: "shapeNode", "todoNode", "textNode"
- "position": {"x": number, "y": number}
- "data": an object based on the type

🎨 NODE TYPES & DATA:
1. "shapeNode" (for steps, decisions, start/end):
   - "data": {"shape": "square"|"circle"|"diamond"|"hexagon"|"document", "label": "Text here", "fillColor": "#Hex", "textColor": "#Hex", "fontSize": 14}
   - Use #4059F1 (Blue), #F36F56 (Coral), #45B382 (Green), #F5A623 (Orange), #8B5CF6 (Purple). NEVER use plain white. Always use white text (#FFFFFF) on colored backgrounds.

2. "todoNode" (for checklists or grouped tasks):
   - "data": {"title": "Main Step", "subtitle": "Description", "tasks": [{"id": "t1", "text": "Task 1", "completed": boolean}], "backgroundColor": "#1C1C1E", "accentColor": "#4059F1"}

3. "textNode" (for large titles/headers in the canvas):
   - "data": {"html": "<b>FLOW TITLE</b>", "fontSize": 32, "textColor": "#333333"}

📐 LAYOUT RULES:
- Spread nodes out! X should increment by 350-400px. Y can vary for branches.
- Use "circle" for start/end, "diamond" for decisions, "square"/"document" for processes.
- Edges: {"id": "e1-2", "source": "n1", "target": "n2", "animated": true, "style": {"stroke": "#A3A8B8", "strokeWidth": 2}}

Respond ONLY with valid JSON: {"nodes": [...], "edges": [...]}`;

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

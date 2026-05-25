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
You are a Senior Process Architect and Expert UX/UI Designer. Your mission is to create visually STUNNING, vibrant, highly detailed, and COMPREHENSIVE flow diagrams.

Each node MUST have:
- "id": unique string (e.g. "n1", "n2")
- "type": MUST BE EXACTLY ONE OF: "shapeNode", "todoNode", "textNode", "imageNode"
- "position": {"x": number, "y": number}
- "data": an object based on the type

🎨 NODE TYPES & DATA:
1. "shapeNode" (for steps, decisions, start/end):
   - "data": {"shape": "square"|"circle"|"diamond"|"hexagon"|"document", "label": "Text here", "fillColor": "#Hex", "textColor": "#Hex", "fontSize": 14}
   - Palettes: Use vibrant, modern colors like #4059F1 (Royal Blue), #F36F56 (Coral), #45B382 (Emerald), #F5A623 (Amber), #8B5CF6 (Purple). NEVER use plain white backgrounds. Always use white text (#FFFFFF) on dark/colored backgrounds for high contrast.

2. "todoNode" (for checklists or complex grouped tasks):
   - "data": {"title": "Main Step", "subtitle": "Description", "tasks": [{"id": "t1", "text": "Task 1", "completed": boolean}], "backgroundColor": "#1C1C1E", "accentColor": "#4059F1"}

3. "textNode" (for large contextual titles or section headers):
   - "data": {"html": "<b>SECTION TITLE</b><br><span style='font-size:14px'>Description</span>", "fontSize": 24, "textColor": "#A3A8B8"}

4. "imageNode" (for visual placeholders or logos):
   - "data": {"url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop", "width": 200, "height": 150}

📐 ARCHITECTURE & LAYOUT RULES (CRITICAL):
- Create COMPREHENSIVE flows. Generate at least 6 to 12 nodes. Do not generate simple straight lines if a process requires decisions.
- Create BRANCHING PATHS using "diamond" shapes for decisions, splitting into "Yes" and "No" or multiple options.
- Spread nodes out! X should increment by 350-400px. Y must vary for branches (e.g., Y: -250 for top branch, Y: +250 for bottom branch).
- Use "circle" for start/end, "diamond" for decisions, "document" for outputs/files, "square" for standard processes.

🔗 EDGES RULES:
- "edges": [{"id": "e1-2", "source": "n1", "target": "n2", "animated": true, "label": "Yes", "style": {"stroke": "#A3A8B8", "strokeWidth": 2}}]
- If branching from a decision node, you MUST add a "label" (e.g., "Aprobado", "Rechazado") to the edge.

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

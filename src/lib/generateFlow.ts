import type { Node, Edge } from "@xyflow/react";
import type { FlowNodeData } from "@/components/nodes/FlowNode";
import { supabase } from "@/integrations/supabase/client";

type AIStep = {
  label: string;
  description?: string;
  type: "start" | "process" | "decision" | "action" | "end";
};

function assignOptimalHandles(nodes: Node[], edges: Edge[]): Edge[] {
  return edges.map((edge) => {
    // If the edge already has handle IDs, keep them
    if (edge.sourceHandle && edge.targetHandle) return edge;

    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) return edge;

    const sx = sourceNode.position.x;
    const sy = sourceNode.position.y;
    const tx = targetNode.position.x;
    const ty = targetNode.position.y;

    const dx = tx - sx;
    const dy = ty - sy;

    let sourceHandle = "right";
    let targetHandle = "left";

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        sourceHandle = "right";
        targetHandle = "left";
      } else {
        sourceHandle = "left";
        targetHandle = "right";
      }
    } else {
      if (dy > 0) {
        sourceHandle = "bottom";
        targetHandle = "top";
      } else {
        sourceHandle = "top";
        targetHandle = "bottom";
      }
    }

    return {
      ...edge,
      sourceHandle,
      targetHandle,
    };
  });
}

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

📐 ARCHITECTURE & LAYOUT RULES (CRITICAL - PREMIUM SYMMETRICAL DESIGN):
- PERFECT GRID ALIGNMENT: The diagram must look extremely neat, structured, and symmetric like a high-end mind map. All nodes in a sequential path must align to the exact same Y level (e.g. Y: 250).
- CONSTANT X-SPACING: Every consecutive step in a sequence must increment X by exactly 350px (e.g. X: 100, 450, 800, 1150, 1500...). Keep spacing uniform across the entire flowchart.
- SYMMETRIC DECISION BRANCHING: When a decision node (diamond shape) splits into branches:
  - Branch A (e.g., "Yes" or active path) must offset Y downwards by exactly 200px (e.g. Y: 450) and then continue perfectly straight horizontally at Y: 450, incrementing X by 350px.
  - Branch B (e.g., "No" or fallback path) must offset Y upwards by exactly 200px (e.g. Y: 50) and then continue perfectly straight horizontally at Y: 50, incrementing X by 350px.
  - This prevents weird diagonal lines, random vertical overlaps, and layout chaos.
- SHAPE MEANINGS:
  - "circle" shape for start and end nodes.
  - "diamond" shape for decision points.
  - "square" or "hexagon" for standard processes and activities.
  - "todoNode" for phases containing detailed actionable checklist steps.

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
    return { nodes: data.nodes, edges: assignOptimalHandles(data.nodes, data.edges || []) };
  }

  // 2. Si la función Edge vieja está desplegada, pero la IA obedeció el nuevo prompt, vendrá dentro de data.steps.nodes
  if (data.steps && data.steps.nodes && Array.isArray(data.steps.nodes)) {
    return { nodes: data.steps.nodes, edges: assignOptimalHandles(data.steps.nodes, data.steps.edges || []) };
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
  return { nodes, edges: assignOptimalHandles(nodes, edges) };
}

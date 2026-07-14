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

export type ExtendContext = {
  side: "top" | "bottom" | "left" | "right";
  summary: string;
};

const SIDE_DIRECTION: Record<string, string> = {
  top: "hacia ARRIBA",
  bottom: "hacia ABAJO",
  left: "hacia la IZQUIERDA",
  right: "hacia la DERECHA",
};

export async function generateFlowFromPrompt(
  prompt: string,
  extendContext?: ExtendContext
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const extendBlock = extendContext
    ? `\n\n---
🔗 MODO AMPLIACIÓN (CONTINÚA UN FLUJO EXISTENTE):
El usuario YA tiene este elemento en su canvas y quiere AMPLIAR el flujo a partir de él, ${SIDE_DIRECTION[extendContext.side] || ""}.
ELEMENTO DE ORIGEN (léelo, entiéndelo y continúa de forma coherente a partir de aquí):
"""
${extendContext.summary}
"""
REGLAS DE AMPLIACIÓN:
- NO repitas ni regeneres el elemento de origen; genera SOLO los nuevos nodos que surgen a partir de él.
- Los nuevos nodos deben ser una continuación lógica y coherente con el contenido del elemento de origen y con la petición del usuario.
- Posiciona los nodos nuevos comenzando en x:0, y:0 y crecientes; el sistema los reubicará junto al elemento de origen.
- Mantén el mismo idioma, tono y estilo visual que el elemento de origen.
- NO generes un nodo de título grande (NO uses "textNode" como encabezado suelto al inicio). En modo ampliación NO se necesita título; continúa directamente con más formas/nodos (shapeNode, todoNode, etc.) conectados entre sí a partir del elemento de origen.\n`
    : "";

  const enhancedPrompt = `${prompt}${extendBlock}


---
CRITICAL INSTRUCTION FOR AI: Ignore any previous formatting rules. You MUST return a JSON OBJECT with "nodes" and "edges" arrays.
You are a Senior Process Architect and Expert UX/UI Designer. Your mission is to create visually STUNNING, vibrant, highly detailed, and COMPREHENSIVE flow diagrams.

Each node MUST have:
- "id": unique string (e.g. "n1", "n2")
- "type": MUST BE EXACTLY ONE OF: "shapeNode", "todoNode", "textNode", "imageNode", "embedNode"
- "position": {"x": number, "y": number}
- "data": an object based on the type

🎨 NODE TYPES & DATA:
1. "shapeNode" (for steps, decisions, start/end):
   - "data": {"shape": "square"|"circle"|"diamond"|"hexagon"|"document", "label": "Text here", "fillColor": "#Hex", "textColor": "#Hex", "fontSize": 14}
   - Palettes: For shapeNodes, strictly prioritize using black (#000000) or brand blue (#4059F1) backgrounds with white text. Do not use random colors like orange, red, green, or purple unless strictly necessary for semantic meaning.
   - LINE BREAKS FOR BALANCED TEXT: The UI renders newlines perfectly and wraps words cleanly. You MUST insert explicit '\n' in the "label" string to split long lines into balanced rows (e.g. use "Creación de\nContenido" or "Enviar\nEmail Frío" or "¿Presupuesto\npara Ads?" instead of single long lines) so words do not break awkwardly.

2. "todoNode" (for checklists or complex grouped tasks):
   - "data": {"title": "Main Step", "subtitle": "Description", "tasks": [{"id": "t1", "text": "Task 1", "completed": boolean}], "backgroundColor": "#FFFFFF", "textColor": "#000000", "accentColor": "#4059F1"}
   - CRITICAL COLOR RULE: Checklist backgrounds MUST ALWAYS be "#FFFFFF" (pure white) and text/labels MUST ALWAYS be "#000000" (pure black). NEVER use dark backgrounds or other colors for todoNode.
   - RESPONSIVE WRAPPING: Title, subtitle, and task items automatically wrap to new lines and auto-resize height if long or if container is small. Write complete, detailed task items without fear of text clipping.

3. "textNode" (for specific annotations or prospect links):
   - "data": {"html": "<b style='color:#000000'>Texto</b>", "fontSize": 24, "textColor": "#000000"}
   - DO NOT generate a global title or header textNode at the top of the canvas for the flow. Omit the general title entirely. Use textNodes ONLY for specific annotations or clickable prospect links.
   - CRITICAL COLOR RULE: Text nodes MUST ALWAYS use "#000000" (pure black) for "textColor" and inside HTML style attributes.

4. "imageNode" (for visual placeholders or logos):
   - "data": {"url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop", "width": 200, "height": 150}

5. "embedNode" (to embed a real website live inside the canvas — iframe):
   - "data": {"url": "https://sitio-real.com"} con "style": {"width": 480, "height": 320}
   - Solo con URLs reales (ej. el "website" de un prospecto). NUNCA inventes URLs. Inclúyelo solo si aporta valor al plan/objetivos del cliente.

6. "kanbanNode" (WIDGET PIZARRA — SOLO si el usuario pide explícitamente "pizarra", "kanban", "tablero de tareas" o similar; NO lo generes por defecto):
   - "style": {"width": 780, "height": 440}
   - "data": {"title": "Nombre", "showTitle": true, "showSubtitle": false, "backgroundColor": "#FFFFFF", "textColor": "#111827", "accentColor": "#4059F1", "columns": [{"id":"col-1","title":"Por hacer","cards":[{"id":"c-1","title":"Tarea","subtitle":"Opcional","url":"https://opcional.com","fields":[{"id":"f-1","label":"Prioridad","value":"Alta"}]}]}]}
   - Columnas y cards con "id" único; subtitle/url/fields opcionales. Fondo blanco (invierte solo en dark mode).
   - Colócalo aparte del flujo con al menos 200px de separación. NO conectes edges hacia/desde el kanbanNode.



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
- "edges": [{"id": "e1-2", "source": "n1", "target": "n2", "animated": false, "label": "Yes", "style": {"stroke": "#A3A8B8", "strokeWidth": 2}}]
- If branching from a decision node, you MUST add a "label" (e.g., "Aprobado", "Rechazado") to the edge.
- Do NOT animate the edges (always set "animated": false).

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

  // 1. Nueva función Edge desplegada: los nodos vienen en data.nodes
  if (data.nodes && Array.isArray(data.nodes) && data.nodes.length > 0) {
    // Aceptar los nodos aunque alguno no traiga "position": asignar una por defecto
    // en vez de descartar toda la respuesta y mostrar un error engañoso.
    let fallbackY = 0;
    const nodes = data.nodes.map((n: Node, i: number) => {
      if (n && typeof n === "object" && !n.position) {
        fallbackY = i * 160;
        return { ...n, position: { x: 400, y: fallbackY } };
      }
      return n;
    });
    return { nodes, edges: assignOptimalHandles(nodes, data.edges || []) };
  }

  // 2. Función Edge vieja pero con el nuevo formato dentro de data.steps.nodes
  if (data.steps && data.steps.nodes && Array.isArray(data.steps.nodes) && data.steps.nodes.length > 0) {
    return { nodes: data.steps.nodes, edges: assignOptimalHandles(data.steps.nodes, data.steps.edges || []) };
  }


  // 3. Fallback absoluto si la IA insistió en devolver el array simple antiguo
  const steps = data.steps;

  if (!Array.isArray(steps) || steps.length === 0) {
    // Distinguir "no llegaron nodos" de un formato inesperado para un error más claro.
    if (data.nodes && Array.isArray(data.nodes) && data.nodes.length === 0) {
      throw new Error("La IA no devolvió ningún nodo. Intenta reformular tu descripción.");
    }
    throw new Error("La IA devolvió un formato de flujo no reconocido");
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
        animated: false,
      });
    }
  });
  return { nodes, edges: assignOptimalHandles(nodes, edges) };
}

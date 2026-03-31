import type { Node, Edge } from "@xyflow/react";
import type { FlowNodeData } from "@/components/nodes/FlowNode";

// Simple local flow generation based on prompt keywords
// This creates a reasonable diagram without needing an AI backend

export function generateFlowFromPrompt(prompt: string): { nodes: Node[]; edges: Edge[] } {
  const lower = prompt.toLowerCase();
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Parse prompt into steps
  let steps: { label: string; description?: string; type: string }[] = [];

  // Check for common flow patterns
  if (lower.includes("registro") || lower.includes("signup") || lower.includes("sign up")) {
    steps = [
      { label: "Inicio", type: "start" },
      { label: "Formulario de registro", description: "El usuario completa sus datos", type: "process" },
      { label: "¿Datos válidos?", description: "Validar email y contraseña", type: "decision" },
      { label: "Enviar verificación", description: "Email de confirmación", type: "action" },
      { label: "Confirmar cuenta", description: "Usuario verifica email", type: "process" },
      { label: "Cuenta creada", type: "end" },
    ];
  } else if (lower.includes("login") || lower.includes("autenticación") || lower.includes("iniciar sesión")) {
    steps = [
      { label: "Inicio", type: "start" },
      { label: "Ingresar credenciales", description: "Email y contraseña", type: "process" },
      { label: "¿Credenciales válidas?", type: "decision" },
      { label: "Generar token", description: "JWT o sesión", type: "action" },
      { label: "Acceso concedido", type: "end" },
    ];
  } else if (lower.includes("pago") || lower.includes("checkout") || lower.includes("compra")) {
    steps = [
      { label: "Inicio", type: "start" },
      { label: "Carrito de compras", description: "Revisar productos", type: "process" },
      { label: "Datos de envío", description: "Dirección y método", type: "process" },
      { label: "Método de pago", description: "Tarjeta, PayPal, etc.", type: "action" },
      { label: "¿Pago exitoso?", type: "decision" },
      { label: "Confirmar pedido", description: "Enviar confirmación", type: "action" },
      { label: "Pedido completado", type: "end" },
    ];
  } else {
    // Generic: split by commas, "y", "luego", "después"
    const parts = prompt
      .split(/[,;]|\by\b|\bluego\b|\bdespués\b|\bthen\b|\band\b/i)
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length <= 1) {
      steps = [
        { label: "Inicio", type: "start" },
        { label: prompt.slice(0, 40), description: prompt.length > 40 ? prompt : undefined, type: "process" },
        { label: "Procesamiento", description: "Ejecutar lógica principal", type: "action" },
        { label: "¿Resultado OK?", type: "decision" },
        { label: "Fin", type: "end" },
      ];
    } else {
      steps = [
        { label: "Inicio", type: "start" },
        ...parts.map((p) => ({
          label: p.slice(0, 30),
          description: p.length > 30 ? p : undefined,
          type: "process" as const,
        })),
        { label: "Fin", type: "end" },
      ];
    }
  }

  // Create nodes with vertical layout
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
        type: step.type,
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

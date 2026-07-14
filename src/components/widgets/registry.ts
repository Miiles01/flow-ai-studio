/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REGLA GLOBAL DE WIDGETS — LEE ESTO ANTES DE AÑADIR UN WIDGET NUEVO
 * ═══════════════════════════════════════════════════════════════════════════
 *  Todos los widgets (Pizarra, Tarjeta de cliente, futuros) siguen la MISMA
 *  lógica visual y de interacción que el resto de nodos del canvas:
 *   - Son movibles y redimensionables (NodeResizer).
 *   - Tienen un tooltip flotante de edición (fondo, color de texto, eliminar).
 *   - Se les puede ampliar con IA desde los lados (NodeExtendHandles).
 *
 *  ⚠️ ÚNICA EXCEPCIÓN — REGLA IMPORTANTE:
 *  Los WIDGETS **NO conectan lazos/edges**. No se les pueden arrastrar
 *  líneas de entrada ni de salida. Por eso ninguno de sus componentes
 *  renderiza `<Handle>` de React Flow. Esta regla es intencional y aplica
 *  a cualquier IA que edite el código: NO añadir Handles a widgets ni
 *  generar edges hacia/desde nodos de tipo widget.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Columns3, UserSquare2, type LucideIcon } from "lucide-react";
import type { Node } from "@xyflow/react";

export type WidgetDef = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  createNode: (position: { x: number; y: number }) => Node;
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const WIDGETS: WidgetDef[] = [
  {
    id: "kanban",
    name: "Pizarra",
    description: "Columnas con tarjetas arrastrables para organizar estados",
    icon: Columns3,
    createNode: (position) => ({
      id: `kanban-${Date.now()}`,
      type: "kanbanNode",
      position,
      style: { width: 780, height: 440 },
      data: {
        title: "Pizarra",
        showTitle: true,
        showSubtitle: false,
        columns: [
          { id: uid(), title: "Por hacer", cards: [] },
          { id: uid(), title: "En progreso", cards: [] },
          { id: uid(), title: "Hecho", cards: [] },
        ],
      },
    }),
  },
  {
    id: "client-card",
    name: "Tarjeta de cliente",
    description: "Perfil de prospecto con contacto, etiquetas, valor y campos personalizados",
    icon: UserSquare2,
    createNode: (position) => ({
      id: `client-${Date.now()}`,
      type: "clientCardNode",
      position,
      style: { width: 320, height: 340 },
      data: {
        name: "Nuevo cliente",
        role: "",
        tags: [],
        assignees: [],
        fields: [],
      },
    }),
  },
];

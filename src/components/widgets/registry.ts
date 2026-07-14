import { Columns3, type LucideIcon } from "lucide-react";
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
];

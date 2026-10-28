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

import { Columns3, UserSquare2, LayoutGrid, LineChart, Globe, FileSignature, type LucideIcon } from "lucide-react";
import type { Node } from "@xyflow/react";

export type WidgetDef = {
  id: string;
  name: string;
  nameKey: string;
  descriptionKey: string;
  badgeKey?: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
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
    nameKey: "widgets2.text111",
    description: "Columnas con tarjetas arrastrables para organizar estados",
    descriptionKey: "widgets2.extra126",
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
    id: "campaigns",
    name: "Campañas",
    nameKey: "widgets2.extra122",
    description: "Cuadrícula de tarjetas de colaboración con marcas: cobro, cuotas, entregables y exclusividad",
    descriptionKey: "widgets2.extra127",
    icon: LayoutGrid,
    createNode: (position) => ({
      id: `campaigns-${Date.now()}`,
      type: "campaignsNode",
      position,
      style: { width: 520, height: 520 },
      data: {
        title: "Campañas",
        showTitle: true,
        showSubtitle: false,
        campaigns: [],
      },
    }),
  },
  {
    id: "client-card",
    name: "Tarjeta de cliente",
    nameKey: "widgets2.extra123",
    description: "Perfil de prospecto con contacto, etiquetas, valor y campos personalizados",
    descriptionKey: "widgets2.extra128",
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
  {
    id: "ingresos",
    name: "Ingresos",
    nameKey: "widgets2.extra124",
    description: "Dashboard financiero: total cerrado, promedio, cobrado vs por cobrar, top marcas y pendientes. Se sincroniza con Campañas.",
    descriptionKey: "widgets2.extra129",
    icon: LineChart,
    createNode: (position) => ({
      id: `ingresos-${Date.now()}`,
      type: "ingresosNode",
      position,
      style: { width: 880, height: 900 },
      data: {
        title: "Ingresos",
        showTitle: true,
        subtitle: "Lo que cerraste por mes y lo que está por entrar.",
        showSubtitle: true,
      },
    }),
  },
  {
    id: "collab-finder",
    name: "Buscador de colaboraciones",
    nameKey: "widgets2.text82",
    description: "Cuadrícula de sitios web donde encontrar colaboraciones: clic en la imagen y abre el enlace",
    descriptionKey: "widgets2.extra130",
    icon: Globe,
    badge: "Creadores",
    badgeKey: "widgets2.extra132",
    createNode: (position) => ({
      id: `collab-${Date.now()}`,
      type: "collabFinderNode",
      position,
      style: { width: 520, height: 480 },
      data: {
        title: "Buscador de colaboraciones",
        showTitle: true,
        links: [
          { id: uid(), url: "https://creator.brkaway.co/", label: "Brkaway" },
          { id: uid(), url: "https://www.hubb.mx/", label: "Hubb" },
          { id: uid(), url: "https://www.conugc.com/", label: "ConUGC" },
          { id: uid(), url: "https://fuelyourbrands.com/", label: "Fuel Your Brands" },
          { id: uid(), url: "https://app.lizza.ai/", label: "Lizza" },
          { id: uid(), url: "https://www.heycollabify.com/", label: "Collabify" },
        ],
      },
    }),
  },
  {
    id: "contracts",
    name: "Contratos",
    nameKey: "widgets2.extra125",
    description: "Documento con tamaño de hoja, logotipo, páginas y enlace público para firma",
    descriptionKey: "widgets2.extra131",
    icon: FileSignature,
    createNode: (position) => ({
      id: `contract-${Date.now()}`,
      type: "contractsNode",
      position,
      style: { width: 816, height: 1056 },
      draggable: true,
      data: {
        title: "Contratos",
        currency: "MXN",
        pageSize: "Carta",
        logoPosition: "top-left",
        publicId: crypto.randomUUID(),
        pages: [{ id: uid(), content: "" }],
      },
    }),
  },
];

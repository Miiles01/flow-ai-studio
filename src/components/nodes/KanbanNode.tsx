import { memo, useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Palette,
  Heading1,
  Heading2,
  Link2,
  X,
  GripVertical,
  Image as ImageIcon,
  Users,
  Tag as TagIcon,
  AlignLeft,
  Mail,
  User as UserIcon,
  ListChecks,
  Check,
  ArrowUp,
  ArrowDown,
  Baseline,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import NodeExtendHandles from "@/components/nodes/NodeExtendHandles";
import WidgetCommentSlot from "@/components/nodes/WidgetCommentSlot";
import { useWidgetAutoFit } from "@/hooks/useWidgetAutoFit";
import { Switch } from "@/components/ui/switch";

export type KanbanAssignee = {
  id: string;
  name: string;
  email?: string;
};

export type KanbanTag = {
  id: string;
  label: string;
  color: string;
};

export type KanbanImageRatio = "1:1" | "4:3" | "16:9";

export type KanbanTaskItem = {
  id: string;
  text: string;
  completed: boolean;
  note?: string;
};

export type KanbanCard = {
  id: string;
  title: string;
  subtitle?: string;
  showSubtitle?: boolean;
  description?: string;
  url?: string;
  image?: { url: string; ratio: KanbanImageRatio };
  assignees?: KanbanAssignee[];
  tags?: KanbanTag[];
  /** Checklist de tareas (puede provenir de una Lista de Tareas arrastrada). */
  tasks?: KanbanTaskItem[];
  // Legacy — kept for backwards compat
  fields?: { id: string; label: string; value: string }[];
};

export type KanbanColumn = {
  id: string;
  title: string;
  cards: KanbanCard[];
};

/** Hint temporal de drop cuando se arrastra un todoNode encima de la pizarra. */
export type KanbanTodoDropHint =
  | { kind: "column"; colId: string; index: number }
  | { kind: "card"; colId: string; cardId: string };

export type KanbanNodeData = {
  title?: string;
  showTitle?: boolean;
  subtitle?: string;
  showSubtitle?: boolean;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  columns?: KanbanColumn[];
  _todoDrop?: KanbanTodoDropHint | null;
};


const RAINBOW_COLORS = [
  { name: "Transparente", value: "transparent" },
  { name: "Rojo", value: "#EF4444" },
  { name: "Naranja", value: "#F97316" },
  { name: "Amarillo", value: "#FACC15" },
  { name: "Verde", value: "#22C55E" },
  { name: "Azul", value: "#4059F1" },
  { name: "Morado", value: "#A855F7" },
  { name: "Rosa", value: "#FCB5B9" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Negro", value: "#1F2937" },
];

const TAG_COLORS = [
  "#EF4444", // Rojo
  "#F97316", // Naranja
  "#FACC15", // Amarillo
  "#22C55E", // Verde
  "#4059F1", // Azul
  "#A855F7", // Morado
  "#FCB5B9", // Rosa
  "#1F2937", // Negro
];

const PRESET_PRIORITY_TAGS: { label: string; color: string }[] = [
  { label: "Baja", color: "#22C55E" },
  { label: "Media", color: "#FACC15" },
  { label: "Alta", color: "#F97316" },
  { label: "Urgente", color: "#EF4444" },
];

const IMAGE_RATIOS: { label: string; value: KanbanImageRatio; aspect: string }[] = [
  { label: "1:1", value: "1:1", aspect: "1 / 1" },
  { label: "4:3", value: "4:3", aspect: "4 / 3" },
  { label: "16:9", value: "16:9", aspect: "16 / 9" },
];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaultColumns = (): KanbanColumn[] => [
  { id: uid(), title: "Por hacer", cards: [] },
  { id: uid(), title: "En progreso", cards: [] },
  { id: uid(), title: "Hecho", cards: [] },
];

const isWhiteColor = (color: string | undefined): boolean => {
  if (!color) return false;
  const c = color.trim().toLowerCase();
  return c === "#ffffff" || c === "white" || c === "#fff" || c === "#fafafa" || c === "#f3f4f6";
};
const isBlackColor = (color: string | undefined): boolean => {
  if (!color) return false;
  const c = color.trim().toLowerCase();
  return c === "#000000" || c === "black" || c === "#000" || c === "#111827" || c === "#1f2937" || c === "#1c1c1e";
};

const initials = (nameOrEmail: string): string => {
  const s = (nameOrEmail || "").trim();
  if (!s) return "?";
  const parts = s.includes("@") ? s.split("@")[0].split(/[._-]/) : s.split(/\s+/);
  return parts
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";
};

const KanbanNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes, getNodes } = useReactFlow();
  const { zoom } = useViewport();
  const { isDark } = useTheme();
  const nodeData = data as KanbanNodeData;

  const isSingleSelected = selected && getNodes().filter((n) => n.selected).length === 1;

  const columns = nodeData.columns ?? defaultColumns();
  const title = nodeData.title ?? "Pizarra";
  const showTitle = nodeData.showTitle ?? true;
  const showSubtitle = nodeData.showSubtitle ?? false;
  const subtitle = nodeData.subtitle ?? "";

  const rawFill = nodeData.backgroundColor ?? (isDark ? "#2C2C2E" : "#FFFFFF");
  const backgroundColor = isDark && isWhiteColor(rawFill) ? "#2C2C2E" : rawFill;

  // Determina si el fondo de la pizarra requiere texto blanco en el encabezado y columnas
  const isBoardDark = (() => {
    if (backgroundColor === "transparent") return isDark;
    const c = (backgroundColor || "").trim().toLowerCase();
    // Colores oscuros / saturados que requieren texto blanco en el título de la pizarra y cabecera de columnas:
    if (
      c === "#ef4444" || // Rojo
      c === "#f97316" || // Naranja
      c === "#4059f1" || // Azul
      c === "#2563eb" ||
      c === "#a855f7" || // Morado
      c === "#1f2937" || // Negro
      c === "#111827" ||
      c === "#2c2c2e" || // Dark mode
      c === "#1c1c1e" ||
      c === "#000000" ||
      c === "black"
    ) {
      return true;
    }
    // Colores claros que usan texto negro en el título y cabecera:
    if (
      c === "#facc15" || // Amarillo
      c === "#22c55e" || // Verde
      c === "#fcb5b9" || // Rosa
      c === "#ffffff" || // Blanco
      c === "white" ||
      c === "#fafafa" ||
      c === "#f3f4f6"
    ) {
      return false;
    }
    if (c.startsWith("#") && (c.length === 7 || c.length === 4)) {
      const hex = c.replace("#", "");
      const fullHex = hex.length === 3 ? hex.split("").map((x) => x + x).join("") : hex;
      const r = parseInt(fullHex.substring(0, 2), 16) || 0;
      const g = parseInt(fullHex.substring(2, 4), 16) || 0;
      const b = parseInt(fullHex.substring(4, 6), 16) || 0;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return lum < 0.6;
    }
    return isDark;
  })();

  // Texto para el título de la pizarra, subtítulo, títulos de columna y botones del tablero:
  const boardTextColor = isBoardDark ? "#FFFFFF" : "#111827";
  // Texto para el interior de las tarjetas (en modo claro siempre negro sobre tarjeta blanca):
  const cardTextColor = isDark ? "#FFFFFF" : "#111827";
  
  const colDotColor = isBoardDark
    ? "#FFFFFF"
    : isWhiteColor(backgroundColor) || backgroundColor === "transparent"
      ? (nodeData.accentColor ?? "#4059F1")
      : "#111827";

  const accentColor = nodeData.accentColor ?? "#4059F1";

  const [activePicker, setActivePicker] = useState<"fill" | null>(null);
  const [editingCard, setEditingCard] = useState<{ colId: string; cardId: string; anchorEl: HTMLElement } | null>(null);
  const dragRef = useRef<{ cardId: string; fromCol: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ col: string; index: number } | null>(null);
  const todoDrop = nodeData._todoDrop ?? null;

  const outerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useWidgetAutoFit(id, (nodeData as any)._aiFitNonce, scrollRef, outerRef, { minHeight: 280, maxHeight: 2000 });

  const update = (patch: Partial<KanbanNodeData>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
  };

  const updateColumns = (fn: (cols: KanbanColumn[]) => KanbanColumn[]) => {
    update({ columns: fn(columns) });
  };

  useEffect(() => {
    if (!nodeData.columns) update({ columns });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addColumn = () => {
    updateColumns((cols) => [...cols, { id: uid(), title: "Nueva columna", cards: [] }]);
  };
  const removeColumn = (colId: string) => {
    updateColumns((cols) => cols.filter((c) => c.id !== colId));
  };
  const renameColumn = (colId: string, name: string) => {
    updateColumns((cols) => cols.map((c) => (c.id === colId ? { ...c, title: name } : c)));
  };
  const addCard = (colId: string) => {
    updateColumns((cols) =>
      cols.map((c) =>
        c.id === colId
          ? { ...c, cards: [...c.cards, { id: uid(), title: "Nueva tarjeta" }] }
          : c,
      ),
    );
  };
  const updateCard = (colId: string, cardId: string, patch: Partial<KanbanCard>) => {
    updateColumns((cols) =>
      cols.map((c) =>
        c.id === colId
          ? { ...c, cards: c.cards.map((k) => (k.id === cardId ? { ...k, ...patch } : k)) }
          : c,
      ),
    );
  };
  const removeCard = (colId: string, cardId: string) => {
    updateColumns((cols) =>
      cols.map((c) => (c.id === colId ? { ...c, cards: c.cards.filter((k) => k.id !== cardId) } : c)),
    );
  };
  const moveCard = (cardId: string, fromCol: string, toCol: string, toIndex: number) => {
    updateColumns((cols) => {
      const src = cols.find((c) => c.id === fromCol);
      if (!src) return cols;
      const card = src.cards.find((k) => k.id === cardId);
      if (!card) return cols;

      return cols.map((c) => {
        if (c.id === fromCol && fromCol === toCol) {
          const filtered = c.cards.filter((k) => k.id !== cardId);
          const insertAt = Math.min(toIndex, filtered.length);
          const next = [...filtered.slice(0, insertAt), card, ...filtered.slice(insertAt)];
          return { ...c, cards: next };
        }
        if (c.id === fromCol) return { ...c, cards: c.cards.filter((k) => k.id !== cardId) };
        if (c.id === toCol) {
          const insertAt = Math.min(toIndex, c.cards.length);
          return { ...c, cards: [...c.cards.slice(0, insertAt), card, ...c.cards.slice(insertAt)] };
        }
        return c;
      });
    });
  };

  const cardBg = isDark ? "hover:brightness-110" : "bg-white hover:bg-neutral-50";
  const cardBgStyle = isDark ? { backgroundColor: "#1C1C1E" } : {};
  const columnBg = isBoardDark ? "bg-white/[0.08]" : isDark ? "bg-white/[0.02]" : "bg-black/[0.025]";
  const borderCls = isBoardDark ? "border-white/15" : isDark ? "border-white/10" : "border-black/10";
  const cardBorderCls = isDark ? "border-white/[0.08]" : "border-neutral-200";

  const editing = editingCard
    ? columns.find((c) => c.id === editingCard.colId)?.cards.find((k) => k.id === editingCard.cardId) ?? null
    : null;

  return (
    <div className="group/widget" style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer isVisible={!!isSingleSelected} minWidth={400} minHeight={280} lineStyle={{ border: "none" }} />

      <AnimatePresence>
        {isSingleSelected && (
          <div
            className="absolute -top-14 left-1/2 z-[1000] pointer-events-auto node-floating-toolbar"
            style={{
              transform: `translate(-50%, 0) scale(${1 / zoom})`,
              transformOrigin: "bottom center",
              whiteSpace: "nowrap",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] relative ${
                isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-100"
              }`}
            >
              <button
                onClick={() => update({ showTitle: !showTitle })}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  showTitle ? "bg-[#4059F1] text-white" : isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-neutral-100 text-neutral-600"
                }`}
                title="Mostrar/ocultar título"
              >
                <Heading1 size={13} />
              </button>
              <button
                onClick={() => update({ showSubtitle: !showSubtitle })}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  showSubtitle ? "bg-[#4059F1] text-white" : isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-neutral-100 text-neutral-600"
                }`}
                title="Mostrar/ocultar subtítulo"
              >
                <Heading2 size={13} />
              </button>

              <div className={`w-[1px] h-4 mx-1 ${isDark ? "bg-white/10" : "bg-neutral-200"}`} />

              <button
                onClick={() => setActivePicker(activePicker === "fill" ? null : "fill")}
                className={`w-7 h-7 flex items-center justify-center rounded-lg relative ${isDark ? "hover:bg-white/10" : "hover:bg-neutral-100"}`}
                title="Color de fondo"
              >
                <Palette size={13} className="text-[#6B7280]" />
                <div
                  className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white"
                  style={{ backgroundColor }}
                />
              </button>

              {activePicker === "fill" && (
                <PickerPopover
                  colors={RAINBOW_COLORS}
                  onPick={(v) => {
                    update({ backgroundColor: v });
                    setActivePicker(null);
                  }}
                  isDark={isDark}
                />
              )}

              <div className={`w-[1px] h-4 mx-1 ${isDark ? "bg-white/10" : "bg-neutral-200"}`} />

              <button
                onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  isDark ? "hover:bg-red-500/20 text-white/60 hover:text-red-400" : "hover:bg-red-50 text-neutral-400 hover:text-red-500"
                }`}
                title="Eliminar"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 left-1/2 z-20 h-5 w-28 -translate-x-1/2 cursor-grab rounded-b-xl active:cursor-grabbing" title="Mover widget">
        <div className={`mx-auto mt-1.5 h-1.5 w-8 rounded-full opacity-0 transition-opacity group-hover/widget:opacity-100 ${isBoardDark ? "bg-white/40" : "bg-black/20"}`} />
      </div>

      <div
        ref={outerRef}
        className="w-full h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
        style={{
          backgroundColor,
          color: boardTextColor,
          "--scrollbar-color": boardTextColor,
          boxShadow: selected ? "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)" : "0 4px 12px -1px rgba(0,0,0,0.015), 0 2px 4px -1px rgba(0,0,0,0.01)"
        } as React.CSSProperties}
      >
        {(showTitle || showSubtitle) && (
          <div className="px-5 pt-4 pb-3 shrink-0">
            {showTitle && (
              <input
                value={title}
                onChange={(e) => update({ title: e.target.value })}
                className={`nodrag nopan bg-transparent border-none outline-none text-[16px] font-semibold w-full ${
                  isBoardDark ? "placeholder:text-white/45" : "placeholder:text-black/35"
                }`}
                style={{ color: boardTextColor }}
                placeholder="Título"
              />
            )}
            {showSubtitle && (
              <input
                value={subtitle}
                onChange={(e) => update({ subtitle: e.target.value })}
                className={`nodrag nopan bg-transparent border-none outline-none text-[12px] font-normal w-full mt-0.5 ${
                  isBoardDark ? "placeholder:text-white/45 text-white/90" : "placeholder:text-black/35 text-neutral-700"
                }`}
                style={{ color: boardTextColor }}
                placeholder="Subtítulo"
              />
            )}
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-auto kanban-scrollbar">
          <div className="flex gap-3 p-4 items-stretch min-w-min min-h-full">
            {columns.map((col) => (
              <div
                key={col.id}
                data-kanban-col={col.id}
                className="w-[240px] shrink-0 flex flex-col h-full"

                onDragOver={(e) => {
                  if (!dragRef.current) return;
                  e.preventDefault();
                  setDropTarget({ col: col.id, index: col.cards.length });
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const d = dragRef.current;
                  const target = dropTarget;
                  if (d && target) moveCard(d.cardId, d.fromCol, target.col, target.index);
                  dragRef.current = null;
                  setDropTarget(null);
                }}
              >
                <div className={`w-full rounded-md ${columnBg} border ${borderCls} flex flex-col max-h-full group/col`}>
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 border-b"
                    style={{ borderColor: isBoardDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: colDotColor }} />
                    <input
                      value={col.title}
                      onChange={(e) => renameColumn(col.id, e.target.value)}
                      className="nodrag nopan bg-transparent border-none outline-none text-[12px] font-semibold flex-1 min-w-0"
                      style={{ color: boardTextColor }}
                    />
                    <span className={`text-[10px] font-medium ${isBoardDark ? "text-white/70" : "text-black/50"}`}>{col.cards.length}</span>
                    <button
                      onClick={() => removeColumn(col.id)}
                      className={`opacity-0 hover:opacity-100 group-hover:opacity-100 p-1 rounded transition-colors ${
                        isBoardDark ? "hover:bg-white/15 text-white/70 hover:text-white" : "hover:bg-black/10 text-neutral-500 hover:text-neutral-900"
                      }`}
                      title="Eliminar columna"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 p-2 overflow-y-auto kanban-scrollbar">
                    {col.cards.map((card, idx) => (
                      <div key={card.id} data-kanban-card={card.id} data-kanban-card-col={col.id}>
                        {((dropTarget?.col === col.id && dropTarget.index === idx) ||
                          (todoDrop?.kind === "column" && todoDrop.colId === col.id && todoDrop.index === idx)) && (
                          <div className="h-0.5 rounded-full mb-2" style={{ backgroundColor: accentColor }} />
                        )}
                        <CardView
                          card={card}
                          colId={col.id}
                          isTodoDropTarget={todoDrop?.kind === "card" && todoDrop.cardId === card.id}

                          isDark={isDark}
                          textColor={cardTextColor}
                          accentColor={accentColor}
                          borderCls={cardBorderCls}
                          cardBg={cardBg}
                          cardBgStyle={cardBgStyle}
                          isOpen={editingCard?.cardId === card.id}
                          onOpen={(el) => setEditingCard({ colId: col.id, cardId: card.id, anchorEl: el })}
                          onUpdate={(patch) => updateCard(col.id, card.id, patch)}
                          onRemove={() => {
                            if (editingCard?.cardId === card.id) setEditingCard(null);
                            removeCard(col.id, card.id);
                          }}
                          onDragStart={(e) => {
                            dragRef.current = { cardId: card.id, fromCol: col.id };
                            try {
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", card.id);
                            } catch { /* noop */ }
                          }}
                          onDragOver={(e) => {
                            if (!dragRef.current) return;
                            e.preventDefault();
                            e.stopPropagation();
                            setDropTarget({ col: col.id, index: idx });
                          }}
                          onDragEnd={() => {
                            dragRef.current = null;
                            setDropTarget(null);
                          }}
                        />
                      </div>
                    ))}

                    {todoDrop?.kind === "column" && todoDrop.colId === col.id && todoDrop.index >= col.cards.length && (
                      <div className="h-0.5 rounded-full" style={{ backgroundColor: accentColor }} />
                    )}

                    <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-200 ease-in-out group-hover/col:max-h-12 group-hover/col:opacity-100 group-hover/col:mt-1">
                      <button
                        onClick={() => addCard(col.id)}
                        className={`w-full nodrag nopan flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-lg border border-dashed transition-colors ${
                          isBoardDark ? "border-white/20 hover:bg-white/10 text-white/80" : "border-black/20 hover:bg-black/5 text-neutral-700"
                        }`}
                      >
                        <Plus size={12} /> Agregar tarjeta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addColumn}
              className={`w-[240px] shrink-0 h-11 self-start flex items-center justify-center gap-1 text-[12px] rounded-md border border-dashed transition-colors ${
                isBoardDark ? "border-white/25 hover:bg-white/10 text-white/90" : "border-black/20 hover:bg-black/5 text-neutral-700"
              }`}
            >
              <Plus size={13} /> Nueva columna
            </button>
          </div>
        </div>
      </div>

      {editingCard && editing && (
        <CardEditorPopover
          anchorEl={editingCard.anchorEl}
          card={editing}
          isDark={isDark}
          accentColor={accentColor}
          onClose={() => setEditingCard(null)}
          onUpdate={(patch) => updateCard(editingCard.colId, editingCard.cardId, patch)}
        />
      )}

      <NodeExtendHandles nodeId={id} />
      <WidgetCommentSlot nodeId={id} />

    </div>
  );
};

/* ─────────── Card view ─────────── */

const CardView = ({
  card,
  colId,
  isDark,
  textColor,
  accentColor,
  borderCls,
  cardBg,
  cardBgStyle,
  isOpen,
  isTodoDropTarget,
  onOpen,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}: {
  card: KanbanCard;
  colId: string;
  isDark: boolean;
  textColor: string;
  accentColor: string;
  borderCls: string;
  cardBg: string;
  cardBgStyle: React.CSSProperties;
  isOpen: boolean;
  isTodoDropTarget?: boolean;
  onOpen: (el: HTMLElement) => void;
  onUpdate: (patch: Partial<KanbanCard>) => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const ratioValue = card.image?.ratio ?? "16:9";
  const ratioCss = IMAGE_RATIOS.find((r) => r.value === ratioValue)?.aspect ?? "16 / 9";
  const tasks = card.tasks ?? [];
  const doneCount = tasks.filter((t) => t.completed).length;

  const toggleTask = (taskId: string) => {
    onUpdate({
      tasks: tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    });
  };

  const openEditor = () => {
    if (!ref.current) return;
    onOpen(ref.current);
  };

  return (
    <div
      ref={ref}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(e);
      }}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("input,textarea,button,a,select")) return;
        openEditor();
      }}
      className={`nodrag nopan group rounded border ${borderCls} ${cardBg} p-2.5 cursor-pointer transition-all shadow-sm ${
        isOpen || isTodoDropTarget ? "ring-2" : ""
      }`}
      style={{
        color: textColor,
        ...cardBgStyle,
        ...(isTodoDropTarget
          ? { boxShadow: `0 0 0 2px ${accentColor}, 0 0 14px 2px ${accentColor}66` }
          : isOpen
            ? { boxShadow: `0 0 0 2px ${accentColor}` }
            : {}),
      } as React.CSSProperties}
    >

      {card.image?.url && (
        <div
          className={`rounded overflow-hidden mb-2 border ${borderCls}`}
          style={{ aspectRatio: ratioCss, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
        >
          <img src={card.image.url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-start gap-1.5" style={{ color: textColor }}>
        <GripVertical size={12} className="opacity-30 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {(card.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {card.tags!.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${t.color}22`,
                    color: t.color,
                    border: `1px solid ${t.color}44`,
                  }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          )}

          <div
            className="nodrag nopan w-full text-[13px] font-medium whitespace-pre-wrap break-words leading-tight"
            style={{ color: textColor }}
          >
            {card.title || "Título"}
          </div>
          {(card.showSubtitle || card.subtitle) && (
            <div
              className={`nodrag nopan w-full text-[11px] mt-1 whitespace-pre-wrap break-words leading-tight ${isDark ? "text-white/85" : "text-neutral-600"}`}
              style={{ color: textColor }}
            >
              {card.subtitle || "Subtítulo"}
            </div>
          )}

          {card.description && (
            <p
              className={`text-[11px] mt-1.5 whitespace-pre-wrap break-words leading-snug ${isDark ? "text-white/90" : "text-neutral-700"}`}
              style={{ color: textColor }}
            >
              {card.description}
            </p>
          )}

          {tasks.length > 0 && (
            <div className="mt-2 space-y-1" style={{ color: textColor }}>
              <div className="flex items-center gap-1.5 text-[9px] font-semibold opacity-60" style={{ color: textColor }}>
                <ListChecks size={10} />
                <span>
                  {doneCount}/{tasks.length}
                </span>
              </div>
              {tasks.map((t) => (
                <div key={t.id} className="flex items-start gap-2 py-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(t.id);
                    }}
                    className={`w-4 h-4 rounded-full flex items-center justify-center border-[1.5px] border-solid transition-all shrink-0 duration-200 mt-[2px] ${
                      t.completed
                        ? ""
                        : isDark
                        ? "bg-white/[0.05] border-white/15 hover:border-white/30 hover:bg-white/[0.08]"
                        : "bg-black/[0.03] border-black/15 hover:border-black/30 hover:bg-black/[0.05]"
                    }`}
                    style={{
                      borderColor: t.completed
                        ? (accentColor && accentColor !== "transparent" ? accentColor : "#4059F1")
                        : undefined,
                      backgroundColor: t.completed
                        ? (accentColor && accentColor !== "transparent" ? accentColor : "#4059F1")
                        : undefined,
                    }}
                    title={t.completed ? "Marcar como pendiente" : "Marcar como completada"}
                  >
                    {t.completed && (
                      <Check
                        size={10}
                        className={`${
                          (accentColor && accentColor !== "transparent" ? (accentColor === "#FFFFFF" || accentColor === "#FACC15") : false)
                            ? "text-gray-900"
                            : "text-white"
                        } stroke-[3.5]`}
                      />
                    )}
                  </button>
                  <span
                    className="text-[11px] leading-snug break-words flex-1 min-w-0"
                    style={{
                      color: textColor,
                      opacity: t.completed ? 0.45 : 0.85,
                      textDecoration: t.completed ? "line-through" : "none",
                    }}
                  >
                    {t.text || "Tarea"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {card.url && (
            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 mt-1.5 text-[10px] px-1.5 py-0.5 rounded-full border truncate max-w-full"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)", color: accentColor }}
            >
              <Link2 size={9} /> <span className="truncate">{card.url.replace(/^https?:\/\//, "")}</span>
            </a>
          )}

          {(card.assignees?.length ?? 0) > 0 && (
            <div className="flex items-center gap-0.5 mt-1.5">
              {card.assignees!.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  title={a.email ? `${a.name} · ${a.email}` : a.name}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold border-2"
                  style={{
                    backgroundColor: accentColor,
                    color: "#fff",
                    borderColor: isDark ? "#2C2C2E" : "#fff",
                    marginLeft: -4,
                  }}
                >
                  {initials(a.name || a.email || "")}
                </div>
              ))}
              {(card.assignees!.length ?? 0) > 4 && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] opacity-60 border-2"
                  style={{ borderColor: isDark ? "#2C2C2E" : "#fff", marginLeft: -4 }}
                >
                  +{card.assignees!.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:!text-red-500 shrink-0"
          title="Eliminar"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

/* ─────────── Card editor popover ─────────── */

const CardEditorPopover = ({
  anchorEl,
  card,
  isDark,
  accentColor,
  onClose,
  onUpdate,
}: {
  anchorEl: HTMLElement;
  card: KanbanCard;
  isDark: boolean;
  accentColor: string;
  onClose: () => void;
  onUpdate: (patch: Partial<KanbanCard>) => void;
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: -999, left: -999 });

  useLayoutEffect(() => {
    let frame: number;
    const updatePos = () => {
      if (!popoverRef.current) {
        frame = requestAnimationFrame(updatePos);
        return;
      }
      const rect = anchorEl.getBoundingClientRect();
      const w = popoverRef.current.offsetWidth;
      const h = popoverRef.current.offsetHeight;
      
      let left = rect.right + 8;
      if (left + w > window.innerWidth - 12) left = Math.max(12, rect.left - w - 8);
      let top = rect.top;
      if (top + h > window.innerHeight - 12) top = Math.max(12, window.innerHeight - h - 12);
      
      setPos(prev => {
        if (Math.abs(prev.top - top) > 0.5 || Math.abs(prev.left - left) > 0.5) {
          return { top, left };
        }
        return prev;
      });
      frame = requestAnimationFrame(updatePos);
    };
    updatePos();
    return () => cancelAnimationFrame(frame);
  }, [anchorEl]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const [activeField, setActiveField] = useState<string | null>(null);

  const showSubtitle = activeField === "subtitle" || !!card.subtitle;
  const showDescription = activeField === "description" || !!card.description;
  const showUrl = activeField === "url" || !!card.url;
  const showImage = activeField === "image" || !!card.image?.url;

  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [newAssigneeEmail, setNewAssigneeEmail] = useState("");

  const addTag = (label: string, color: string) => {
    const clean = label.trim().slice(0, 30);
    if (!clean) return;
    const next = [...(card.tags ?? []), { id: uid(), label: clean, color }];
    onUpdate({ tags: next });
  };
  const removeTag = (tid: string) => {
    onUpdate({ tags: (card.tags ?? []).filter((t) => t.id !== tid) });
  };
  const addAssignee = () => {
    const name = newAssigneeName.trim().slice(0, 60);
    const email = newAssigneeEmail.trim().slice(0, 120);
    if (!name && !email) return;
    const next = [
      ...(card.assignees ?? []),
      { id: uid(), name: name || email.split("@")[0], email: email || undefined },
    ];
    onUpdate({ assignees: next });
    setNewAssigneeName("");
    setNewAssigneeEmail("");
  };
  const removeAssignee = (aid: string) => {
    onUpdate({ assignees: (card.assignees ?? []).filter((a) => a.id !== aid) });
  };

  /* Checklist */
  const cardTasks = card.tasks ?? [];
  const setTasks = (next: KanbanTaskItem[]) => onUpdate({ tasks: next });
  const addTask = () => setTasks([...cardTasks, { id: uid(), text: "", completed: false }]);
  const updateTask = (tid: string, text: string) =>
    setTasks(cardTasks.map((t) => (t.id === tid ? { ...t, text } : t)));
  const toggleTask = (tid: string) =>
    setTasks(cardTasks.map((t) => (t.id === tid ? { ...t, completed: !t.completed } : t)));
  const removeTask = (tid: string) => setTasks(cardTasks.filter((t) => t.id !== tid));
  const moveTask = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= cardTasks.length) return;
    const next = [...cardTasks];
    [next[idx], next[target]] = [next[target], next[idx]];
    setTasks(next);
  };



  const panelCls = isDark
    ? "bg-[#1C1C1E] border border-white/10 text-white"
    : "bg-white border border-neutral-200 text-neutral-900";
  const inputCls = isDark
    ? "bg-white/5 border border-white/10 text-white placeholder:text-white/40"
    : "bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400";
  const ghostBtn = isDark
    ? "border border-white/10 hover:bg-white/5 text-white/80"
    : "border border-neutral-200 hover:bg-neutral-50 text-neutral-700";

  return createPortal(
    <>
      <div
        ref={popoverRef}
        className={`fixed z-[10000] w-[280px] max-h-[340px] overflow-y-auto editor-scrollbar rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${panelCls}`}
        style={{ top: pos.top, left: pos.left, visibility: pos.top === -999 ? "hidden" : "visible" }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="sticky top-0 z-10 px-4 pt-4 pb-6 flex items-center justify-between"
          style={{ background: isDark ? "linear-gradient(to bottom, #1C1C1E 60%, transparent)" : "linear-gradient(to bottom, #ffffff 60%, transparent)" }}
        >
          <span className="text-[13px] font-semibold">Editar tarjeta</span>
          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-[11px] font-medium ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-black"}`}
          >
            <span>Cerrar</span>
            <X size={12} />
          </button>
        </div>

        <div className="px-4 pb-4">
          {/* Section: Basics */}
      <Section label="Título">
        <input
          value={card.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className={`w-full text-[13px] px-2 py-1.5 rounded-md outline-none ${inputCls}`}
          placeholder="Título"
        />
      </Section>

      <ExpandableRow
        icon={<Baseline size={12} />}
        label="Subtítulo"
        isActive={showSubtitle}
        onActivate={() => setActiveField("subtitle")}
        isDark={isDark}
      >
        {showSubtitle && (
          <input
            autoFocus={activeField === "subtitle"}
            value={card.subtitle ?? ""}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            onBlur={(e) => {
              if (!e.target.value.trim()) onUpdate({ subtitle: undefined });
              setActiveField(null);
            }}
            className={`w-full text-[12px] px-2 py-1.5 rounded-md outline-none ${inputCls}`}
            placeholder="Subtítulo"
          />
        )}
      </ExpandableRow>

      <ExpandableRow
        icon={<AlignLeft size={12} />}
        label="Descripción"
        isActive={showDescription}
        onActivate={() => setActiveField("description")}
        isDark={isDark}
      >
        {showDescription && (
          <textarea
            autoFocus={activeField === "description"}
            value={card.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            onBlur={(e) => {
              if (!e.target.value.trim()) onUpdate({ description: undefined });
              setActiveField(null);
            }}
            rows={3}
            className={`w-full text-[12px] px-2 py-1.5 rounded-md outline-none resize-none ${inputCls}`}
            placeholder="Escribe una descripción…"
          />
        )}
      </ExpandableRow>

      <ExpandableRow
        icon={<Link2 size={12} />}
        label="Enlace"
        isActive={showUrl}
        onActivate={() => setActiveField("url")}
        isDark={isDark}
      >
        {showUrl && (
          <input
            autoFocus={activeField === "url"}
            value={card.url ?? ""}
            onChange={(e) => onUpdate({ url: e.target.value })}
            onBlur={(e) => {
              if (!e.target.value.trim()) onUpdate({ url: undefined });
              setActiveField(null);
            }}
            className={`w-full text-[12px] px-2 py-1.5 rounded-md outline-none ${inputCls}`}
            placeholder="https://…"
          />
        )}
      </ExpandableRow>

      <ExpandableRow
        icon={<ImageIcon size={12} />}
        label="Imagen"
        isActive={showImage}
        onActivate={() => setActiveField("image")}
        isDark={isDark}
      >
        {showImage && (
          <div className="space-y-1.5">
            <input
              autoFocus={activeField === "image"}
              value={card.image?.url ?? ""}
              onChange={(e) => onUpdate({ image: { url: e.target.value, ratio: card.image?.ratio ?? "16:9" } })}
              onBlur={(e) => {
                if (!e.target.value.trim()) onUpdate({ image: undefined });
                setActiveField(null);
              }}
              className={`w-full text-[12px] px-2 py-1.5 rounded-md outline-none ${inputCls}`}
              placeholder="URL de la imagen"
            />
            <div className="flex gap-1">
              {IMAGE_RATIOS.map((r) => {
                const active = (card.image?.ratio ?? "16:9") === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() =>
                      onUpdate({ image: { url: card.image?.url ?? "", ratio: r.value } })
                    }
                    className={`flex-1 text-[11px] py-1 rounded-md transition-colors ${
                      active
                        ? "text-white"
                        : isDark
                          ? "border border-white/10 text-white/70 hover:bg-white/5"
                          : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                    style={active ? { backgroundColor: accentColor } : undefined}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </ExpandableRow>

      {/* Tags */}
      <Section label="Etiquetas" icon={<TagIcon size={12} />}>
        {(card.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {card.tags!.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${t.color}22`, color: t.color, border: `1px solid ${t.color}44` }}
              >
                {t.label}
                <button onClick={() => removeTag(t.id)} className="opacity-60 hover:opacity-100">
                  <X size={9} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1 mb-2">
          {PRESET_PRIORITY_TAGS.map((p) => (
            <button
              key={p.label}
              onClick={() => addTag(p.label, p.color)}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium hover:opacity-80"
              style={{ backgroundColor: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}
            >
              + {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <input
            value={newTagLabel}
            onChange={(e) => setNewTagLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTag(newTagLabel, newTagColor);
                setNewTagLabel("");
              }
            }}
            className={`flex-1 text-[11px] px-2 py-1 rounded-md outline-none ${inputCls}`}
            placeholder="Nueva etiqueta"
          />
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => setShowTagPicker(!showTagPicker)}
              className="w-5 h-5 rounded-full border shadow-sm transition-transform hover:scale-105"
              style={{ backgroundColor: newTagColor, borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }}
              title="Seleccionar color"
            />
            {showTagPicker && (
              <div className={`absolute bottom-full mb-2 -left-12 w-[120px] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-2.5 grid grid-cols-4 gap-1.5 z-50 ${isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-100"}`}>
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setNewTagColor(c);
                      setShowTagPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full mx-auto border border-neutral-200/60 shadow-sm transition-transform ${newTagColor === c ? "ring-2 ring-offset-1" : "hover:scale-110"}`}
                    style={{
                      backgroundColor: c,
                      ["--tw-ring-color" as any]: c,
                      ["--tw-ring-offset-color" as any]: isDark ? "#2C2C2E" : "#fff",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              addTag(newTagLabel, newTagColor);
              setNewTagLabel("");
            }}
            className={`text-[11px] px-2 py-1 rounded-md ${ghostBtn}`}
          >
            <Plus size={11} />
          </button>
        </div>
      </Section>

      {/* Assignees */}
      <Section label="Equipo" icon={<Users size={12} />}>
        {(card.assignees?.length ?? 0) > 0 && (
          <div className="space-y-1 mb-1.5">
            {card.assignees!.map((a) => (
              <div
                key={a.id}
                className={`flex items-center gap-2 px-2 py-1 rounded-md ${isDark ? "bg-white/5" : "bg-neutral-50"}`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
                  style={{ backgroundColor: accentColor }}
                >
                  {initials(a.name || a.email || "")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium truncate">{a.name}</div>
                  {a.email && <div className="text-[10px] opacity-60 truncate">{a.email}</div>}
                </div>
                <button onClick={() => removeAssignee(a.id)} className="opacity-60 hover:opacity-100 hover:text-red-500">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-1">
          <div className="relative">
            <UserIcon size={11} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              value={newAssigneeName}
              onChange={(e) => setNewAssigneeName(e.target.value)}
              className={`w-full text-[11px] pl-6 pr-2 py-1 rounded-md outline-none ${inputCls}`}
              placeholder="Nombre"
            />
          </div>
          <div className="relative">
            <Mail size={11} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              value={newAssigneeEmail}
              onChange={(e) => setNewAssigneeEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAssignee()}
              className={`w-full text-[11px] pl-6 pr-2 py-1 rounded-md outline-none ${inputCls}`}
              placeholder="correo@miiles.app (opcional)"
            />
          </div>
          <button
            onClick={addAssignee}
            className={`w-full text-[11px] py-1 rounded-md flex items-center justify-center gap-1 ${ghostBtn}`}
          >
            <Plus size={11} /> Agregar persona
          </button>
        </div>
      </Section>

      {/* Checklist de tareas */}
      <Section label="Tareas" icon={<ListChecks size={12} />}>
        {cardTasks.length > 0 && (
          <div className="space-y-1 mb-2">
            {cardTasks.map((t, idx) => (
              <div key={t.id} className="group/tk flex items-center gap-2">
                <button
                  onClick={() => toggleTask(t.id)}
                  className={`w-4 h-4 shrink-0 rounded-full flex items-center justify-center border-[1.5px] border-solid transition-all duration-200 ${
                    t.completed
                      ? ""
                      : isDark
                      ? "bg-white/[0.05] border-white/15 hover:border-white/30 hover:bg-white/[0.08]"
                      : "bg-black/[0.03] border-black/15 hover:border-black/30 hover:bg-black/[0.05]"
                  }`}
                  style={{
                    borderColor: t.completed
                      ? (accentColor && accentColor !== "transparent" ? accentColor : "#4059F1")
                      : undefined,
                    backgroundColor: t.completed
                      ? (accentColor && accentColor !== "transparent" ? accentColor : "#4059F1")
                      : undefined,
                  }}
                  title={t.completed ? "Marcar como pendiente" : "Marcar como completada"}
                >
                  {t.completed && (
                    <Check
                      size={10}
                      className={`${
                        (accentColor && accentColor !== "transparent" ? (accentColor === "#FFFFFF" || accentColor === "#FACC15") : false)
                          ? "text-gray-900"
                          : "text-white"
                      } stroke-[3.5]`}
                    />
                  )}
                </button>
                <input
                  value={t.text}
                  onChange={(e) => updateTask(t.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTask();
                    }
                  }}
                  placeholder="Tarea…"
                  className={`flex-1 min-w-0 text-[11px] px-2 py-1 rounded-md outline-none ${inputCls}`}
                  style={{
                    textDecoration: t.completed ? "line-through" : "none",
                    opacity: t.completed ? 0.6 : 1,
                  }}
                />
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/tk:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveTask(idx, -1)}
                    className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100"
                    title="Subir"
                  >
                    <ArrowUp size={10} />
                  </button>
                  <button
                    onClick={() => moveTask(idx, 1)}
                    className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100"
                    title="Bajar"
                  >
                    <ArrowDown size={10} />
                  </button>
                  <button
                    onClick={() => removeTask(t.id)}
                    className="p-0.5 rounded opacity-60 hover:opacity-100 hover:text-red-500"
                    title="Eliminar"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={addTask}
          className={`w-full text-[11px] py-1 rounded-md flex items-center justify-center gap-1 ${ghostBtn}`}
        >
          <Plus size={11} /> Agregar tarea
        </button>
      </Section>

        </div>
      </div>
    </>,
    document.body,
  );
};

const Section = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="mb-4">
    <div className="flex items-center gap-1.5 text-[12px] font-semibold opacity-80 mb-2 border-b pb-1" style={{ borderColor: "rgba(150,150,150,0.15)" }}>
      {icon}
      {label}
    </div>
    {children}
  </div>
);

const ExpandableRow = ({
  icon,
  label,
  isActive,
  onActivate,
  isDark,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onActivate: () => void;
  isDark: boolean;
  children?: React.ReactNode;
}) => (
  <div className="mb-2">
    <div
      onClick={() => { if (!isActive) onActivate(); }}
      className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
        isActive
          ? isDark
            ? "bg-white/10 text-white"
            : "bg-neutral-100 text-neutral-900"
          : isDark
            ? "text-white/70 hover:bg-white/5 cursor-pointer"
            : "text-neutral-600 hover:bg-neutral-50 cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {icon} {label}
      </div>
    </div>
    {isActive && children && <div className="mt-2 pl-1">{children}</div>}
  </div>
);


const PickerPopover = ({
  colors,
  onPick,
  isDark,
}: {
  colors: { name: string; value: string }[];
  onPick: (v: string) => void;
  isDark: boolean;
}) => (
  <div
    className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-2.5 grid grid-cols-5 gap-1.5 z-50 w-[150px] ${
      isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-100"
    }`}
  >
    {colors.map((c) => (
      <button
        key={c.value}
        onClick={() => onPick(c.value)}
        className="w-6 h-6 rounded-full border border-neutral-200/60 transition-transform hover:scale-110 relative overflow-hidden shadow-sm"
        style={{ backgroundColor: c.value === "transparent" ? "white" : c.value }}
        title={c.name}
      >
        {c.value === "transparent" && <div className="absolute inset-0 w-full h-[1.5px] top-1/2 bg-red-500 rotate-45" />}
      </button>
    ))}
  </div>
);

export default memo(KanbanNode);

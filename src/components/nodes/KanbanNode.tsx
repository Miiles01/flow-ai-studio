import { memo, useState, useRef, useEffect } from "react";
import { type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Palette, Baseline, Heading1, Heading2, Link2, MoreHorizontal, X, GripVertical } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import NodeExtendHandles from "@/components/nodes/NodeExtendHandles";

export type KanbanCard = {
  id: string;
  title: string;
  subtitle?: string;
  url?: string;
  fields?: { id: string; label: string; value: string }[];
};

export type KanbanColumn = {
  id: string;
  title: string;
  cards: KanbanCard[];
};

export type KanbanNodeData = {
  title?: string;
  showTitle?: boolean;
  subtitle?: string;
  showSubtitle?: boolean;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  columns?: KanbanColumn[];
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

const TEXT_COLORS = [
  { name: "Negro", value: "#111827" },
  { name: "Gris", value: "#6B7280" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Azul", value: "#2563EB" },
  { name: "Verde", value: "#059669" },
  { name: "Rojo", value: "#DC2626" },
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

  // Default: fondo blanco / texto negro. En dark mode se invierten dinámicamente
  // (mismo patrón que ShapeNode).
  const rawFill = nodeData.backgroundColor ?? "#FFFFFF";
  const backgroundColor = isDark && isWhiteColor(rawFill) ? "#2C2C2E" : rawFill;

  const rawText = nodeData.textColor ?? "#111827";
  const textColor = isDark && (isBlackColor(rawText) || isWhiteColor(rawFill)) ? "#FFFFFF" : rawText;

  const accentColor = nodeData.accentColor ?? "#4059F1";

  const [activePicker, setActivePicker] = useState<"fill" | "text" | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const dragRef = useRef<{ cardId: string; fromCol: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ col: string; index: number } | null>(null);


  const update = (patch: Partial<KanbanNodeData>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
  };

  const updateColumns = (fn: (cols: KanbanColumn[]) => KanbanColumn[]) => {
    update({ columns: fn(columns) });
  };

  // Ensure default columns get persisted the first time
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

  const cardBg = isDark ? "bg-white/5 hover:bg-white/10" : "bg-white hover:bg-neutral-50";
  const columnBg = isDark ? "bg-white/5" : "bg-black/[0.03]";
  const borderCls = isDark ? "border-white/10" : "border-neutral-200";

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer isVisible={!!isSingleSelected} minWidth={400} minHeight={280} lineStyle={{ border: "none" }} />

      {/* Floating toolbar */}
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
              {/* Toggle title */}
              <button
                onClick={() => update({ showTitle: !showTitle })}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  showTitle ? "bg-[#4059F1] text-white" : isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-neutral-100 text-neutral-600"
                }`}
                title="Mostrar/ocultar título"
              >
                <Heading1 size={13} />
              </button>
              {/* Toggle subtitle */}
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

              {/* Fill */}
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
              {/* Text */}
              <button
                onClick={() => setActivePicker(activePicker === "text" ? null : "text")}
                className={`w-7 h-7 flex items-center justify-center rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-neutral-100"}`}
                title="Color de texto"
              >
                <Baseline size={13} style={{ color: textColor }} className="stroke-[2.5]" />
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
              {activePicker === "text" && (
                <PickerPopover
                  colors={TEXT_COLORS}
                  onPick={(v) => {
                    update({ textColor: v });
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

      {/* Body */}
      <div
        className={`w-full h-full rounded-2xl border overflow-hidden flex flex-col ${borderCls}`}
        style={{ backgroundColor, color: textColor }}
      >
        {/* Header */}
        {(showTitle || showSubtitle) && (
          <div className="px-5 pt-4 pb-3 shrink-0">
            {showTitle && (
              <input
                value={title}
                onChange={(e) => update({ title: e.target.value })}
                className="nodrag nopan bg-transparent border-none outline-none text-[16px] font-semibold w-full"
                style={{ color: textColor }}
                placeholder="Título"
              />
            )}
            {showSubtitle && (
              <input
                value={subtitle}
                onChange={(e) => update({ subtitle: e.target.value })}
                className="nodrag nopan bg-transparent border-none outline-none text-[12px] font-light w-full mt-0.5 opacity-70"
                style={{ color: textColor }}
                placeholder="Subtítulo"
              />
            )}
          </div>
        )}

        {/* Columns */}
        <div className="flex-1 overflow-auto nodrag nopan">
          <div className="flex gap-3 p-4 items-start min-w-min">
            {columns.map((col) => (
              <div
                key={col.id}
                className={`w-[240px] shrink-0 rounded-md ${columnBg} border ${borderCls} flex flex-col max-h-full group/col`}
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
                {/* Column header */}
                <div
                  className="flex items-center gap-2 px-3 py-2.5 border-b"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  <input
                    value={col.title}
                    onChange={(e) => renameColumn(col.id, e.target.value)}
                    className="nodrag nopan bg-transparent border-none outline-none text-[12px] font-semibold flex-1 min-w-0 uppercase tracking-wider"
                    style={{ color: textColor }}
                  />
                  <span className="text-[10px] opacity-50 font-mono">{col.cards.length}</span>
                  <button
                    onClick={() => removeColumn(col.id)}
                    className={`opacity-0 hover:opacity-100 group-hover:opacity-100 p-1 rounded ${
                      isDark ? "hover:bg-white/10" : "hover:bg-neutral-200"
                    }`}
                    title="Eliminar columna"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 p-2 overflow-y-auto">
                  {col.cards.map((card, idx) => (
                    <div key={card.id}>
                      {dropTarget?.col === col.id && dropTarget.index === idx && (
                        <div className="h-0.5 rounded-full mb-2" style={{ backgroundColor: accentColor }} />
                      )}
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
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
                        className={`nodrag nopan group rounded-lg border ${borderCls} ${cardBg} p-2.5 cursor-grab active:cursor-grabbing transition-colors shadow-sm`}
                      >
                        <div className="flex items-start gap-1.5">
                          <GripVertical size={12} className="opacity-30 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <input
                              value={card.title}
                              onChange={(e) => updateCard(col.id, card.id, { title: e.target.value })}
                              className="nodrag nopan w-full bg-transparent border-none outline-none text-[13px] font-medium"
                              style={{ color: textColor }}
                              placeholder="Título"
                            />
                            {(card.subtitle !== undefined && card.subtitle !== "") || editingCard === card.id ? (
                              <input
                                value={card.subtitle ?? ""}
                                onChange={(e) => updateCard(col.id, card.id, { subtitle: e.target.value })}
                                className="nodrag nopan w-full bg-transparent border-none outline-none text-[11px] font-light mt-0.5 opacity-70"
                                style={{ color: textColor }}
                                placeholder="Subtítulo"
                              />
                            ) : null}
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
                            {card.fields && card.fields.length > 0 && (
                              <div className="mt-1.5 space-y-0.5">
                                {card.fields.map((f) => (
                                  <div key={f.id} className="flex items-center gap-1 text-[10px] opacity-80">
                                    <span className="font-semibold">{f.label}:</span>
                                    <input
                                      value={f.value}
                                      onChange={(e) => {
                                        const next = (card.fields || []).map((x) =>
                                          x.id === f.id ? { ...x, value: e.target.value } : x,
                                        );
                                        updateCard(col.id, card.id, { fields: next });
                                      }}
                                      className="nodrag nopan flex-1 bg-transparent border-none outline-none min-w-0"
                                      style={{ color: textColor }}
                                    />
                                    <button
                                      onClick={() => {
                                        const next = (card.fields || []).filter((x) => x.id !== f.id);
                                        updateCard(col.id, card.id, { fields: next });
                                      }}
                                      className="opacity-0 group-hover:opacity-60 hover:!opacity-100"
                                      title="Quitar campo"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {editingCard === card.id && (
                              <div className="mt-2 space-y-1.5 pt-2 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
                                <input
                                  value={card.url ?? ""}
                                  onChange={(e) => updateCard(col.id, card.id, { url: e.target.value })}
                                  placeholder="URL (https://…)"
                                  className={`nodrag nopan w-full text-[11px] px-2 py-1 rounded border outline-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-neutral-200"}`}
                                />
                                <button
                                  onClick={() => {
                                    const next = [...(card.fields || []), { id: uid(), label: "Campo", value: "" }];
                                    updateCard(col.id, card.id, { fields: next });
                                  }}
                                  className={`w-full text-[11px] px-2 py-1 rounded border flex items-center justify-center gap-1 ${isDark ? "border-white/10 hover:bg-white/5" : "border-neutral-200 hover:bg-neutral-50"}`}
                                >
                                  <Plus size={10} /> Agregar campo
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              onClick={() => setEditingCard(editingCard === card.id ? null : card.id)}
                              className="opacity-0 group-hover:opacity-60 hover:!opacity-100"
                              title="Editar"
                            >
                              <MoreHorizontal size={12} />
                            </button>
                            <button
                              onClick={() => removeCard(col.id, card.id)}
                              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:!text-red-500"
                              title="Eliminar"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add card */}
                  <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-200 ease-in-out group-hover/col:max-h-12 group-hover/col:opacity-100 group-hover/col:mt-1">
                    <button
                      onClick={() => addCard(col.id)}
                      className={`w-full nodrag nopan flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-lg border border-dashed transition-colors ${
                        isDark ? "border-white/10 hover:bg-white/5 text-white/50" : "border-neutral-300 hover:bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      <Plus size={12} /> Agregar tarjeta
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add column */}
            <button
              onClick={addColumn}
              className={`w-[240px] shrink-0 h-11 flex items-center justify-center gap-1 text-[12px] rounded-md border border-dashed transition-colors ${
                isDark ? "border-white/15 hover:bg-white/5 text-white/60" : "border-neutral-300 hover:bg-neutral-100 text-neutral-500"
              }`}
            >
              <Plus size={13} /> Nueva columna
            </button>
          </div>
        </div>
      </div>

      <NodeExtendHandles nodeId={id} />
    </div>
  );
};

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
    className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-xl shadow-2xl p-2.5 grid grid-cols-5 gap-1.5 z-50 w-[150px] ${
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

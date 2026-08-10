/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REGLA GLOBAL DE WIDGETS (Miiles) — LEE ESTO ANTES DE EDITAR
 * ═══════════════════════════════════════════════════════════════════════════
 *  Los WIDGETS (KanbanNode, ClientCardNode, CampaignsNode y futuros)
 *  comparten esta lógica:
 *  1. Son nodos de React Flow arrastrables/redimensionables con toolbar
 *     flotante (fondo, color de texto, eliminar) y NodeExtendHandles.
 *  2. **NO CONECTAN LAZOS/EDGES.** No renderizan `<Handle>` de React Flow.
 *     No añadas <Handle /> aquí, no se generen edges hacia/desde ellos.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  CampaignsNode — "Campañas": cuadrícula de tarjetas de colaboración.
 *  Cada tarjeta representa una campaña con marca. Al hacer click en una
 *  tarjeta se abre un editor flotante con el formulario completo:
 *   - Información comercial y financiera
 *   - Cuotas (desglose dinámico)
 *   - Entregables por formato (Reel, TikTok, Story, Post, Short YT, Video YT, Evento)
 *   - Exclusividad
 *   - Notas internas
 */

import { memo, useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Palette, X, Search, ArrowLeft, Repeat, DollarSign,
  Instagram, Youtube, Calendar, Users, Minus, Heading1, Heading2, Check, ChevronDown,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import NodeExtendHandles from "@/components/nodes/NodeExtendHandles";
import WidgetCommentSlot from "@/components/nodes/WidgetCommentSlot";
import { useWidgetAutoFit } from "@/hooks/useWidgetAutoFit";

export type CampaignStatus = "Pendiente" | "Activa" | "Completada";
export type CampaignPayType = "monetario" | "intercambio";

export type CampaignInstallment = {
  id: string;
  amount: number;
  date?: string;
};

export type CampaignDeliverables = {
  reel: number;
  tiktok: number;
  story: number;
  post: number;
  short: number;
  video: number;
  event: number;
};

export type Campaign = {
  id: string;
  brand: string;
  status: CampaignStatus;
  payType: CampaignPayType;
  amount: number;
  installmentsCount: 1 | 2 | 3 | 4 | 6;
  installments: CampaignInstallment[];
  closeMonth?: string;
  paymentDays: 15 | 30 | 45 | 60 | 90;
  deliverables: CampaignDeliverables;
  exclusivity: boolean;
  exclusivityDays?: number;
  notes?: string;
  createdAt: number;
  /** Ref al ClientCardNode asignado (id del nodo React Flow). */
  clientId?: string;
  /** URL de imagen de portada de la campaña. */
  coverUrl?: string;
  /** Posición vertical de la portada (0 = arriba, 100 = abajo). */
  coverPosY?: number;
  /** Timestamp cuando se marcó como cobrada. Alimenta el widget Ingresos. */
  paidAt?: number;
};

export type CampaignsNodeData = {
  title?: string;
  showTitle?: boolean;
  subtitle?: string;
  showSubtitle?: boolean;
  campaigns?: Campaign[];
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  /** Disposición de las tarjetas: libre, agrupadas en columnas o en filas. */
  layout?: CampaignsLayout;
  /** Criterio de agrupación cuando layout != "none". */
  groupBy?: CampaignsGroupBy;
};

export type CampaignsLayout = "none" | "columns" | "rows";
export type CampaignsGroupBy = "status" | "payment";

const LAYOUT_OPTIONS: Array<{ value: CampaignsLayout; label: string }> = [
  { value: "none", label: "Sin orden" },
  { value: "columns", label: "Por columnas" },
  { value: "rows", label: "Por filas" },
];

const GROUP_OPTIONS: Array<{ value: CampaignsGroupBy; label: string }> = [
  { value: "status", label: "Estado" },
  { value: "payment", label: "Cobro" },
];

const STATUS_ORDER: CampaignStatus[] = ["Pendiente", "Activa", "Completada"];
const PAYMENT_GROUPS = ["Cobrado", "Por cobrar", "Intercambio"] as const;

const paymentGroupOf = (c: Campaign) =>
  c.payType === "intercambio" ? "Intercambio" : c.paidAt ? "Cobrado" : "Por cobrar";


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

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isWhite = (c?: string) => {
  const v = (c || "").trim().toLowerCase();
  return v === "#ffffff" || v === "white" || v === "#fff" || v === "#fafafa";
};
const isBlack = (c?: string) => {
  const v = (c || "").trim().toLowerCase();
  return v === "#000000" || v === "black" || v === "#000" || v === "#111827" || v === "#1f2937";
};
const initials = (s: string) => {
  const t = (s || "").trim();
  if (!t) return "?";
  const parts = t.split(/\s+/);
  return parts.filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
};
const formatMoney = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n || 0);

const emptyDeliverables = (): CampaignDeliverables => ({
  reel: 0, tiktok: 0, story: 0, post: 0, short: 0, video: 0, event: 0,
});

const totalPieces = (d: CampaignDeliverables) =>
  d.reel + d.tiktok + d.story + d.post + d.short + d.video + d.event;

const primaryFormat = (d: CampaignDeliverables): string | null => {
  const entries: Array<[keyof CampaignDeliverables, string]> = [
    ["reel", "Reel"], ["tiktok", "TikTok"], ["story", "Story"],
    ["post", "Post"], ["short", "Short YT"], ["video", "Video YT"], ["event", "Evento"],
  ];
  const found = entries.find(([k]) => d[k] > 0);
  return found ? found[1] : null;
};

const makeCampaign = (): Campaign => ({
  id: uid(),
  brand: "",
  status: "Pendiente",
  payType: "monetario",
  amount: 0,
  installmentsCount: 1,
  installments: [{ id: uid(), amount: 0 }],
  paymentDays: 30,
  deliverables: emptyDeliverables(),
  exclusivity: false,
  exclusivityDays: 60,
  notes: "",
  createdAt: Date.now(),
});

const STATUS_STYLES: Record<CampaignStatus, { bg: string; text: string; border: string }> = {
  Pendiente:  { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  Activa:     { bg: "#E8ECFE", text: "#4059F1", border: "#C7CFFD" },
  Completada: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
};

/* ─────────────────────────── NODE ─────────────────────────── */

const CampaignsNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes, getNodes } = useReactFlow();
  const { zoom } = useViewport();
  const { isDark } = useTheme();
  const d = data as CampaignsNodeData;

  const isSingleSelected = selected && getNodes().filter((n) => n.selected).length === 1;

  const rawFill = d.backgroundColor ?? (isDark ? "#2C2C2E" : "#FFFFFF");
  const backgroundColor = isDark && isWhite(rawFill) ? "#2C2C2E" : rawFill;
  const accentColor = d.accentColor ?? "#4059F1";
  const title = d.title ?? "Campañas";
  const showTitle = d.showTitle ?? true;
  const subtitle = d.subtitle ?? "";
  const showSubtitle = d.showSubtitle ?? false;

  // Calculamos automáticamente si el fondo del widget requiere texto blanco
  // IMPORTANTE: No forzar true por isDark — hay que evaluar el color real del fondo,
  // porque el usuario puede elegir amarillo/verde/rosa en dark mode y el texto debe ser negro.
  const isBoardDark = (() => {
    const v = (backgroundColor || "").trim().toLowerCase();
    if (!v || v === "transparent") return isDark;
    // Oscuros / saturados → texto blanco
    if (
      v === "#ef4444" || v === "#f97316" ||
      v === "#4059f1" || v === "#2563eb" ||
      v === "#a855f7" ||
      v === "#1f2937" || v === "#111827" ||
      v === "#2c2c2e" || v === "#1c1c1e" ||
      v === "#000000" || v === "black"
    ) return true;
    // Claros → texto negro
    if (
      v === "#facc15" || v === "#22c55e" || v === "#fcb5b9" ||
      v === "#ffffff" || v === "white" || v === "#fafafa" || v === "#f3f4f6"
    ) return false;
    // Cálculo de luminancia para cualquier otro color
    if (v.startsWith("#") && (v.length === 7 || v.length === 4)) {
      const hex = v.length === 4
        ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`
        : v;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return lum < 0.55;
    }
    return isDark;
  })();

  const boardTextColor = isBoardDark ? "#FFFFFF" : "#111827";

  const [activePicker, setActivePicker] = useState<"fill" | null>(null);
  const [filter, setFilter] = useState("");
  const [openCampaignId, setOpenCampaignId] = useState<string | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useWidgetAutoFit(id, (d as any)._aiFitNonce, scrollRef, anchorRef, { minHeight: 320, maxHeight: 2200 });

  const campaigns = d.campaigns ?? [];

  const update = (patch: Partial<CampaignsNodeData>) =>
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));

  const updateCampaign = (cid: string, patch: Partial<Campaign>) => {
    const next = campaigns.map((c) => (c.id === cid ? { ...c, ...patch } : c));
    update({ campaigns: next });
  };

  const addCampaign = () => {
    const c = makeCampaign();
    update({ campaigns: [c, ...campaigns] });
    setOpenCampaignId(c.id);
  };

  const removeCampaign = (cid: string) => {
    update({ campaigns: campaigns.filter((c) => c.id !== cid) });
    if (openCampaignId === cid) setOpenCampaignId(null);
  };

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter((c) => c.brand.toLowerCase().includes(q));
  }, [campaigns, filter]);

  const layout: CampaignsLayout = d.layout ?? "none";
  const groupBy: CampaignsGroupBy = d.groupBy ?? "status";

  const groups = useMemo(() => {
    if (layout === "none") return [];
    const keys: string[] = groupBy === "status" ? [...STATUS_ORDER] : [...PAYMENT_GROUPS];
    return keys.map((key) => ({
      key,
      items: filtered.filter((c) =>
        groupBy === "status" ? c.status === key : paymentGroupOf(c) === key
      ),
    }));
  }, [filtered, layout, groupBy]);


  const openCampaign = campaigns.find((c) => c.id === openCampaignId) || null;

  return (
    <div className="group/widget" style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer isVisible={!!isSingleSelected} minWidth={380} minHeight={320} lineStyle={{ border: "none" }} />

      <AnimatePresence>
        {isSingleSelected && !openCampaign && (
          <div
            className="absolute -top-14 left-1/2 z-[1000] pointer-events-auto node-floating-toolbar shadow-xl"
            style={{ transform: `translate(-50%, 0) scale(${1 / zoom})`, transformOrigin: "bottom center", whiteSpace: "nowrap" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-2xl relative ${
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

              <div className="relative">
                <button
                  onClick={() => setActivePicker(activePicker === "fill" ? null : "fill")}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg relative ${isDark ? "hover:bg-white/10" : "hover:bg-neutral-100"}`}
                  title="Color de fondo"
                >
                  <Palette size={13} className="text-[#6B7280]" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white overflow-hidden" style={{ backgroundColor: backgroundColor === "transparent" ? "white" : backgroundColor }}>
                    {backgroundColor === "transparent" && <div className="absolute inset-0 w-full h-[1px] top-1/2 bg-red-500 rotate-45" />}
                  </div>
                </button>
                {activePicker === "fill" && (
                  <PickerPopover colors={RAINBOW_COLORS} selected={rawFill} onPick={(v) => { update({ backgroundColor: v }); setActivePicker(null); }} isDark={isDark} />
                )}
              </div>

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
        ref={anchorRef}
        className="w-full h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300 cursor-pointer"
        style={{
          backgroundColor,
          color: boardTextColor,
          "--scrollbar-color": boardTextColor,
          boxShadow: selected
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)"
            : "0 4px 12px -1px rgba(0,0,0,0.015), 0 2px 4px -1px rgba(0,0,0,0.01)",
        } as React.CSSProperties}
      >
        {/* Header */}
        <div
          className="px-5 pt-5 pb-3 shrink-0 border-b"
          style={{ borderColor: isBoardDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-start justify-between gap-3">
            {(showTitle || showSubtitle) && (
              <div className="flex-1 min-w-0">
                {showTitle && (
                  <input
                    value={title}
                    onChange={(e) => update({ title: e.target.value })}
                    className={`nodrag nopan w-full bg-transparent border-none outline-none text-[22px] font-semibold tracking-tight ${
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
                    className={`nodrag nopan w-full bg-transparent border-none outline-none text-[12px] font-normal mt-0.5 ${
                      isBoardDark ? "placeholder:text-white/45 text-white/90" : "placeholder:text-black/35 text-neutral-700"
                    }`}
                    style={{ color: boardTextColor }}
                    placeholder="Subtítulo"
                  />
                )}
              </div>
            )}
            <button
              onClick={addCampaign}
              className="nodrag nopan shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-white transition-opacity hover:opacity-80 "
              style={{ backgroundColor: "#111827" }}
            >
              <Plus size={14} /> Nueva
            </button>
          </div>

          {/* Filtros: disposición + agrupación + buscador */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Orden"
              value={layout}
              options={LAYOUT_OPTIONS}
              onChange={(v) => update({ layout: v as CampaignsLayout })}
              isBoardDark={isBoardDark}
              textColor={boardTextColor}
            />
            <FilterSelect
              label="Agrupar"
              value={groupBy}
              options={GROUP_OPTIONS}
              onChange={(v) => update({ groupBy: v as CampaignsGroupBy })}
              isBoardDark={isBoardDark}
              textColor={boardTextColor}
              disabled={layout === "none"}
            />
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors flex-1 min-w-[150px]"
              style={{
                backgroundColor: isBoardDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
                borderColor: isBoardDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)",
              }}
            >
              <Search size={13} style={{ color: boardTextColor, opacity: 0.6 }} />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Buscar marca…"
                className={`nodrag nopan flex-1 min-w-0 bg-transparent border-none outline-none text-[12.5px] ${
                  isBoardDark ? "placeholder:text-white/55" : "placeholder:text-black/35"
                }`}
                style={{ color: boardTextColor }}
              />
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div ref={scrollRef} className="p-4 flex-1 overflow-y-auto kanban-scrollbar">
          {campaigns.length === 0 ? (
            <div className={`h-full flex flex-col items-center justify-center gap-2 text-center ${isBoardDark ? "text-white/75" : "text-neutral-500"}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isBoardDark ? "bg-white/10 text-white" : "bg-black/[0.04] text-neutral-600"}`}>
                <Plus size={20} />
              </div>
              <p className="text-[12.5px]">Aún no tienes campañas.</p>
              <button
                onClick={addCampaign}
                className="nodrag nopan text-[11.5px] underline underline-offset-2 font-medium"
                style={{ color: isBoardDark ? "#FFFFFF" : accentColor }}
              >
                Añadir la primera
              </button>
            </div>
          ) : layout === "none" ? (
            filtered.length === 0 ? (
              <EmptySearch isBoardDark={isBoardDark} />
            ) : (
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                {filtered.map((c) => (
                  <CampaignCard
                    key={c.id}
                    c={c}
                    isDark={isBoardDark}
                    accentColor={accentColor}
                    onOpen={() => setOpenCampaignId(c.id)}
                  />
                ))}
              </div>
            )
          ) : layout === "columns" ? (
            <div className="flex gap-3 items-start overflow-x-auto kanban-scrollbar pb-1">
              {groups.map((g) => (
                <div key={g.key} className="shrink-0 grow basis-[230px] min-w-[230px] max-w-[420px] flex flex-col gap-2">
                  <GroupHeader label={g.key} count={g.items.length} isBoardDark={isBoardDark} textColor={boardTextColor} />
                  <div className="flex flex-col gap-3">
                    {g.items.map((c) => (
                      <CampaignCard
                        key={c.id}
                        c={c}
                        isDark={isBoardDark}
                        accentColor={accentColor}
                        onOpen={() => setOpenCampaignId(c.id)}
                      />
                    ))}
                    {g.items.length === 0 && <GroupEmpty isBoardDark={isBoardDark} />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {groups.map((g) => (
                <div key={g.key} className="flex flex-col gap-2">
                  <GroupHeader label={g.key} count={g.items.length} isBoardDark={isBoardDark} textColor={boardTextColor} />
                  {g.items.length === 0 ? (
                    <GroupEmpty isBoardDark={isBoardDark} />
                  ) : (
                    <div className="flex gap-3 overflow-x-auto kanban-scrollbar pb-1">
                      {g.items.map((c) => (
                        <div key={c.id} className="shrink-0 w-[230px]">
                          <CampaignCard
                            c={c}
                            isDark={isBoardDark}
                            accentColor={accentColor}
                            onOpen={() => setOpenCampaignId(c.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {openCampaign && anchorRef.current && (
        <CampaignEditorPopover
          anchorEl={anchorRef.current}
          campaign={openCampaign}
          isDark={isDark}
          accentColor={accentColor}
          onClose={() => setOpenCampaignId(null)}
          onUpdate={(patch) => updateCampaign(openCampaign.id, patch)}
          onDelete={() => removeCampaign(openCampaign.id)}
        />
      )}

      <NodeExtendHandles nodeId={id} />
      <WidgetCommentSlot nodeId={id} />
    </div>
  );
};

/* ─────────── Controles de filtro / agrupación ─────────── */

const FilterSelect = ({
  label, value, options, onChange, isBoardDark, textColor, disabled,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
  isBoardDark: boolean;
  textColor: string;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const current = options.find((o) => o.value === value)?.label ?? options[0]?.label;

  return (
    <div ref={ref} className="relative nodrag nopan">
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`nodrag nopan flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${
          disabled ? "opacity-40 cursor-not-allowed" : "hover:brightness-110"
        }`}
        style={{
          color: textColor,
          backgroundColor: isBoardDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
          borderColor: isBoardDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)",
        }}
      >
        <span className="opacity-60">{label}:</span>
        <span className="truncate max-w-[110px]">{current}</span>
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>

      {open && (
        <div
          className={`absolute top-full mt-1.5 left-0 z-[60] min-w-[160px] rounded-xl p-1.5 border ${
            isBoardDark ? "bg-[#1C1C1E] border-white/10" : "bg-white border-neutral-200"
          }`}
        >
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`nodrag nopan w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-[12.5px] ${
                isBoardDark ? "text-white hover:bg-white/10" : "text-neutral-900 hover:bg-neutral-100"
              } ${o.value === value ? (isBoardDark ? "bg-white/10" : "bg-neutral-100") : ""}`}
            >
              {o.label}
              {o.value === value && <Check size={13} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const GroupHeader = ({
  label, count, isBoardDark, textColor,
}: { label: string; count: number; isBoardDark: boolean; textColor: string }) => (
  <div className="flex items-center gap-2 px-1">
    <span className="text-[12px] font-semibold tracking-tight" style={{ color: textColor }}>{label}</span>
    <span
      className="text-[10.5px] font-medium px-1.5 py-0.5 rounded-full"
      style={{
        color: textColor,
        opacity: 0.7,
        backgroundColor: isBoardDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
      }}
    >
      {count}
    </span>
  </div>
);

const GroupEmpty = ({ isBoardDark }: { isBoardDark: boolean }) => (
  <div
    className={`rounded-2xl border border-dashed py-4 text-center text-[11.5px] ${
      isBoardDark ? "border-white/15 text-white/50" : "border-black/10 text-neutral-400"
    }`}
  >
    Sin campañas
  </div>
);

const EmptySearch = ({ isBoardDark }: { isBoardDark: boolean }) => (
  <div className={`h-full flex items-center justify-center text-[12.5px] ${isBoardDark ? "text-white/60" : "text-neutral-500"}`}>
    Sin resultados para tu búsqueda.
  </div>
);

/* ─────────── Campaign card (grid tile) ─────────── */


const CampaignCard = ({
  c, isDark, accentColor, onOpen,
}: {
  c: Campaign; isDark: boolean; accentColor: string; onOpen: () => void;
}) => {
  const status = isDark
    ? (c.status === "Pendiente"
        ? { bg: "rgba(245, 158, 11, 0.18)", text: "#FCD34D", border: "rgba(245, 158, 11, 0.35)" }
        : c.status === "Activa"
        ? { bg: "rgba(64, 89, 241, 0.22)", text: "#93C5FD", border: "rgba(64, 89, 241, 0.4)" }
        : { bg: "rgba(16, 185, 129, 0.18)", text: "#6EE7B7", border: "rgba(16, 185, 129, 0.35)" })
    : STATUS_STYLES[c.status];
  const pieces = totalPieces(c.deliverables);
  const fmt = primaryFormat(c.deliverables);
  const brand = c.brand || "Sin nombre";
  const cardTextColor = isDark ? "#FFFFFF" : "#111827";

  return (
    <button
      onClick={onOpen}
      className={`nodrag nopan text-left rounded-2xl border p-3.5 transition-all hover:${
        isDark ? "border-white/[0.08] hover:brightness-110" : "bg-white border-[#E8ECFE] hover:border-[#C7CFFD] "
      }`}
      style={{
        color: cardTextColor,
        ...(isDark ? { backgroundColor: "#1C1C1E" } : {}),
      }}
    >
      {c.coverUrl && (
        <div className={`-mx-3.5 -mt-3.5 mb-3 h-[150px] overflow-hidden rounded-t-2xl ${isDark ? "bg-white/5" : "bg-neutral-100"}`}>
          <img
            src={c.coverUrl}
            alt={`Portada de ${brand}`}
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ objectPosition: `50% ${c.coverPosY ?? 50}%` }}
            onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
          />
        </div>
      )}
      <div className="flex items-start gap-3" style={{ color: cardTextColor }}>
        <div
          className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-[12px] font-semibold ${
            isDark ? "bg-white/15 text-white" : "bg-neutral-100 text-neutral-700"
          }`}
        >
          {initials(brand)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold truncate leading-tight" style={{ color: cardTextColor }}>{brand}</p>
              <p className="text-[11px] opacity-60 mt-0.5 truncate" style={{ color: cardTextColor }}>
                {pieces} contenido{pieces === 1 ? "" : "s"}{fmt ? ` · ${fmt}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {c.exclusivity && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={
                  isDark
                    ? { backgroundColor: "rgba(64, 89, 241, 0.22)", color: "#93C5FD", border: "1px solid rgba(64, 89, 241, 0.4)" }
                    : { backgroundColor: "#E8ECFE", color: "#4059F1", border: "1px solid #C7CFFD" }
                }
              >
                Exclusividad
              </span>
            )}
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: status.bg, color: status.text, border: `1px solid ${status.border}` }}
            >
              {c.status}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-[17px] font-bold tracking-tight" style={{ color: cardTextColor }}>
          {c.payType === "intercambio" ? "Intercambio" : formatMoney(c.amount)}
        </span>
      </div>
    </button>
  );
};

/* ─────────── Cover positioner (drag to align) ─────────── */

const CoverPositioner = ({
  url, posY, softSurface, onChange,
}: {
  url: string; posY: number; softSurface: string; onChange: (v: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const startY = e.clientY;
    const startPos = posY;
    const h = el.offsetHeight || 1;
    setDragging(true);
    const onMove = (ev: MouseEvent) => {
      const delta = ((ev.clientY - startY) / h) * 100;
      onChange(Math.min(100, Math.max(0, Math.round(startPos - delta))));
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={ref}
      onMouseDown={startDrag}
      className={`h-[150px] rounded-lg overflow-hidden select-none ${softSurface} ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
    >
      <img
        src={url}
        alt="Vista previa de la portada"
        draggable={false}
        className="w-full h-full object-cover pointer-events-none"
        style={{ objectPosition: `50% ${posY}%` }}
      />
    </div>
  );
};

/* ─────────── Editor popover with full form ─────────── */

const CampaignEditorPopover = ({
  anchorEl, campaign, isDark, accentColor, onClose, onUpdate, onDelete,
}: {
  anchorEl: HTMLElement;
  campaign: Campaign;
  isDark: boolean;
  accentColor: string;
  onClose: () => void;
  onUpdate: (patch: Partial<Campaign>) => void;
  onDelete: () => void;
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: -999, left: -999 });

  useLayoutEffect(() => {
    let frame: number;
    const updatePos = () => {
      if (!popoverRef.current) { frame = requestAnimationFrame(updatePos); return; }
      const rect = anchorEl.getBoundingClientRect();
      const w = popoverRef.current.offsetWidth;
      const h = popoverRef.current.offsetHeight;
      let left = rect.right + 8;
      if (left + w > window.innerWidth - 12) left = Math.max(12, rect.left - w - 8);
      if (left < 12) left = 12;
      let top = Math.max(12, rect.top);
      if (top + h > window.innerHeight - 12) top = Math.max(12, window.innerHeight - h - 12);
      setPos((prev) =>
        Math.abs(prev.top - top) > 0.5 || Math.abs(prev.left - left) > 0.5 ? { top, left } : prev,
      );
      frame = requestAnimationFrame(updatePos);
    };
    updatePos();
    return () => cancelAnimationFrame(frame);
  }, [anchorEl]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const panelCls = isDark ? "bg-[#1C1C1E] border border-white/10 text-white" : "bg-white border border-neutral-200 text-neutral-900";
  const inputCls = isDark ? "bg-white/5 border border-white/10 text-white placeholder:text-white/40" : "bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400";
  const subtle = isDark ? "text-white/60" : "text-neutral-500";
  const softSurface = isDark ? "bg-white/5" : "bg-neutral-50";

  // Keep installments array length in sync with count
  useEffect(() => {
    const arr = campaign.installments ?? [];
    if (arr.length === campaign.installmentsCount) return;
    const base = campaign.amount / campaign.installmentsCount;
    const next: CampaignInstallment[] = Array.from({ length: campaign.installmentsCount }, (_, i) =>
      arr[i] ?? { id: uid(), amount: Math.round(base) },
    );
    onUpdate({ installments: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign.installmentsCount]);

  const setDeliverable = (k: keyof CampaignDeliverables, delta: number) => {
    const cur = campaign.deliverables[k] ?? 0;
    const next = Math.max(0, cur + delta);
    onUpdate({ deliverables: { ...campaign.deliverables, [k]: next } });
  };

  const setInstallment = (idx: number, patch: Partial<CampaignInstallment>) => {
    const arr = [...(campaign.installments ?? [])];
    arr[idx] = { ...arr[idx], ...patch };
    onUpdate({ installments: arr });
  };

  const total = totalPieces(campaign.deliverables);
  const status = STATUS_STYLES[campaign.status];

  // ── Client integration: read clientCardNode instances from canvas ──
  const { getNodes, setNodes } = useReactFlow();
  const clientOptions = useMemo(() => {
    return getNodes()
      .filter((n) => n.type === "clientCardNode")
      .map((n) => ({ id: n.id, name: ((n.data as any)?.name || "Sin nombre") as string, avatarUrl: (n.data as any)?.avatarUrl as string | undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getNodes, campaign.clientId]);
  const selectedClient = clientOptions.find((c) => c.id === campaign.clientId);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);

  const createAndAssignClient = (name: string) => {
    const newId = `client-${Date.now()}`;
    // Place the new client near the campaigns node
    const nodes = getNodes();
    const owner = nodes.find((n) => n.type === "campaignsNode" && ((n.data as any)?.campaigns ?? []).some((c: Campaign) => c.id === campaign.id));
    const basePos = owner ? { x: owner.position.x + ((owner.style?.width as number) ?? 520) + 60, y: owner.position.y } : { x: 100, y: 100 };
    setNodes((nds) => [
      ...nds,
      {
        id: newId,
        type: "clientCardNode",
        position: basePos,
        style: { width: 320, height: 340 },
        data: { name: name || "Nuevo cliente", role: "", tags: [], assignees: [], fields: [] },
      } as any,
    ]);
    onUpdate({ clientId: newId });
    setClientPickerOpen(false);
  };


  const content = (
    <div
      ref={popoverRef}
      className={`fixed z-[10000] rounded-2xl overflow-hidden flex flex-col ${panelCls}`}
      style={{
        top: pos.top,
        left: pos.left,
        width: 520,
        maxHeight: `min(720px, calc(100vh - 24px))`,
        opacity: pos.top < 0 ? 0 : 1,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className={`px-5 py-3.5 flex items-center justify-between border-b ${isDark ? "border-white/10" : "border-neutral-100"} shrink-0`}>
        <div className="flex items-center gap-2">
          <span
            className="text-[10.5px] px-2.5 py-1 rounded-full font-semibold"
            style={{ backgroundColor: status.bg, color: status.text, border: `1px solid ${status.border}` }}
          >
            {campaign.status}
          </span>
          <button
            onClick={onDelete}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? "hover:bg-red-500/20 text-white/60 hover:text-red-400" : "hover:bg-red-50 text-neutral-400 hover:text-red-500"
            }`}
            title="Eliminar campaña"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <button
          onClick={onClose}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-[11px] font-medium ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-black"}`}
        >
          <span>Cerrar</span>
          <X size={12} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto kanban-scrollbar p-5 space-y-6">
        {/* Brand name */}
        <div>
          <input
            autoFocus
            value={campaign.brand}
            onChange={(e) => onUpdate({ brand: e.target.value })}
            placeholder="Nombre de la marca"
            className="w-full bg-transparent border-none outline-none text-[22px] font-bold tracking-tight placeholder:opacity-40"
          />
        </div>

        {/* Cliente asignado */}
        <Section title="Cliente" subtle={subtle}>
          <div className="relative">
            <button
              onClick={() => setClientPickerOpen((v) => !v)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left ${inputCls} hover:opacity-95`}
            >
              {selectedClient ? (
                <>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0" style={{ backgroundColor: accentColor }}>
                    {selectedClient.avatarUrl ? <img src={selectedClient.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : initials(selectedClient.name)}
                  </div>
                  <span className="flex-1 text-[13px] font-medium truncate">{selectedClient.name}</span>
                  <span className={`text-[11px] ${subtle}`}>Cambiar</span>
                </>
              ) : (
                <>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${softSurface}`}>
                    <Users size={13} className="opacity-60" />
                  </div>
                  <span className={`flex-1 text-[13px] ${subtle}`}>Asignar cliente…</span>
                </>
              )}
            </button>
            {clientPickerOpen && (
              <div className={`absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl p-2 max-h-[280px] overflow-y-auto ${isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-200"}`}>
                {clientOptions.length > 0 && (
                  <div className="mb-1 space-y-0.5">
                    {clientOptions.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { onUpdate({ clientId: c.id }); setClientPickerOpen(false); }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[12.5px] ${isDark ? "hover:bg-white/10" : "hover:bg-neutral-100"} ${c.id === campaign.clientId ? (isDark ? "bg-white/10" : "bg-neutral-100") : ""}`}
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ backgroundColor: accentColor }}>
                          {c.avatarUrl ? <img src={c.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : initials(c.name)}
                        </div>
                        <span className="truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {campaign.clientId && (
                  <button
                    onClick={() => { onUpdate({ clientId: undefined }); setClientPickerOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-[12px] ${subtle} ${isDark ? "hover:bg-white/10" : "hover:bg-neutral-100"}`}
                  >
                    Quitar cliente
                  </button>
                )}
                <button
                  onClick={() => createAndAssignClient(campaign.brand || "Nuevo cliente")}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[12.5px] font-medium border-t mt-1 pt-2 ${isDark ? "border-white/10 hover:bg-white/10 text-white" : "border-neutral-100 hover:bg-neutral-100 text-neutral-900"}`}
                >
                  <Plus size={12} /> Crear nuevo cliente
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* Portada */}
        <Section title="Portada" subtle={subtle}>
          <input
            value={campaign.coverUrl ?? ""}
            onChange={(e) => onUpdate({ coverUrl: e.target.value.trim() || undefined })}
            placeholder="https://… URL de la imagen"
            className={`w-full px-3 py-2.5 rounded-lg text-[13px] outline-none ${inputCls}`}
          />
          {campaign.coverUrl && (
            <div className="mt-2">
              <CoverPositioner
                url={campaign.coverUrl}
                posY={campaign.coverPosY ?? 50}
                softSurface={softSurface}
                onChange={(v) => onUpdate({ coverPosY: v })}
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[11px] ${subtle}`}>Arrastra la imagen para ajustar la altura</span>
                <button
                  onClick={() => onUpdate({ coverUrl: undefined, coverPosY: undefined })}
                  className={`text-[11.5px] ${subtle} hover:opacity-80`}
                >
                  Quitar portada
                </button>
              </div>
            </div>
          )}
        </Section>



        {/* Cobro rápido */}
        <Section title="Pago" subtle={subtle}>
          <label className={`flex items-center gap-2.5 p-3 rounded-lg cursor-pointer ${softSurface}`}>
            <input
              type="checkbox"
              checked={!!campaign.paidAt}
              onChange={(e) => onUpdate({ paidAt: e.target.checked ? Date.now() : undefined })}
              className={isDark ? "accent-white" : "accent-black"}
            />
            <span className="text-[12.5px] font-medium">Marcar como cobrada</span>
            {campaign.paidAt && (
              <span className={`ml-auto text-[11px] font-semibold ${isDark ? "text-white" : "text-black"}`}>Cobrado</span>
            )}
          </label>
        </Section>


        {/* Estado */}
        <Section title="Estado de la colaboración" subtle={subtle}>
          <SegmentedGroup
            value={campaign.status}
            options={[
              { value: "Pendiente", label: "Pendiente" },
              { value: "Activa", label: "Activa" },
              { value: "Completada", label: "Completada" },
            ]}
            onChange={(v) => onUpdate({ status: v as CampaignStatus })}
            isDark={isDark}
            accentColor={accentColor}
          />
        </Section>

        {/* Tipo de cobro + monto */}
        <Section title="Cobro" subtle={subtle}>
          <SegmentedGroup
            value={campaign.payType}
            options={[
              { value: "monetario", label: "💵 Monetario" },
              { value: "intercambio", label: "🔄 Intercambio" },
            ]}
            onChange={(v) => onUpdate({ payType: v as CampaignPayType })}
            isDark={isDark}
            accentColor={accentColor}
          />
          {campaign.payType === "monetario" && (
            <div className="mt-3">
              <label className={`text-[11.5px] font-medium ${subtle}`}>Monto total a cobrar</label>
              <div className={`mt-1 flex items-center gap-2 px-3 py-2 rounded-lg ${inputCls}`}>
                <DollarSign size={14} className="opacity-60" />
                <input
                  type="number"
                  min={0}
                  value={campaign.amount || ""}
                  onChange={(e) => onUpdate({ amount: Number(e.target.value) || 0 })}
                  placeholder="0"
                  className="flex-1 bg-transparent border-none outline-none text-[15px] font-semibold"
                />
              </div>
            </div>
          )}
        </Section>

        {/* Cuotas */}
        {campaign.payType === "monetario" && (
          <Section title="Número de cuotas" subtle={subtle}>
            <SegmentedGroup
              value={String(campaign.installmentsCount)}
              options={[1, 2, 3, 4, 6].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(v) => onUpdate({ installmentsCount: Number(v) as Campaign["installmentsCount"] })}
              isDark={isDark}
              accentColor={accentColor}
            />
            {campaign.installmentsCount === 1 ? (
              <p className={`text-[11.5px] mt-2 ${subtle}`}>Pago único. Si quieres puedes cargar la fecha estimada.</p>
            ) : null}
            <div className="mt-3 space-y-2">
              {(campaign.installments ?? []).map((inst, i) => (
                <div key={inst.id} className={`grid grid-cols-[auto_1fr_1fr] items-center gap-2 p-2 rounded-lg ${softSurface}`}>
                  <span className={`text-[11px] px-2 py-1 rounded-md font-medium ${isDark ? "bg-white/10" : "bg-white border border-neutral-200"}`}>
                    {i + 1}/{campaign.installmentsCount}
                  </span>
                  <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${inputCls}`}>
                    <DollarSign size={12} className="opacity-60" />
                    <input
                      type="number"
                      min={0}
                      value={inst.amount || ""}
                      onChange={(e) => setInstallment(i, { amount: Number(e.target.value) || 0 })}
                      placeholder="0"
                      className="flex-1 bg-transparent border-none outline-none text-[12.5px]"
                    />
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${inputCls}`}>
                    <Calendar size={12} className="opacity-60" />
                    <input
                      type="date"
                      value={inst.date ?? ""}
                      onChange={(e) => setInstallment(i, { date: e.target.value })}
                      className="flex-1 bg-transparent border-none outline-none text-[12px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Mes de cierre */}
        <Section title="Mes de cierre del trato" subtle={subtle}>
          <select
            value={campaign.closeMonth ?? ""}
            onChange={(e) => onUpdate({ closeMonth: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg text-[13px] ${inputCls}`}
          >
            <option value="">Selecciona un mes</option>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <p className={`text-[11px] mt-1 ${subtle}`}>Usado en estadísticas de ingresos.</p>
        </Section>

        {/* Días de pago */}
        <Section title="Días de pago" subtle={subtle}>
          <SegmentedGroup
            value={String(campaign.paymentDays)}
            options={[15, 30, 45, 60, 90].map((n) => ({ value: String(n), label: String(n) }))}
            onChange={(v) => onUpdate({ paymentDays: Number(v) as Campaign["paymentDays"] })}
            isDark={isDark}
            accentColor={accentColor}
          />
          <p className={`text-[11px] mt-1 ${subtle}`}>Días hábiles después del último entregable publicado.</p>
        </Section>

        {/* Entregables */}
        <Section
          title="Entregables de contenido"
          subtle={subtle}
          right={<span className={`text-[11.5px] font-medium ${subtle}`}>{total} {total === 1 ? "pieza" : "piezas"}</span>}
        >
          <div className="grid grid-cols-2 gap-2">
            <DeliverableCounter icon={<Instagram size={13} />} label="Reel (Instagram)"    value={campaign.deliverables.reel}   onDec={() => setDeliverable("reel", -1)}   onInc={() => setDeliverable("reel", 1)}   isDark={isDark} inputCls={inputCls} />
            <DeliverableCounter icon={<span className="text-[13px]">🎵</span>} label="TikTok" value={campaign.deliverables.tiktok} onDec={() => setDeliverable("tiktok", -1)} onInc={() => setDeliverable("tiktok", 1)} isDark={isDark} inputCls={inputCls} />
            <DeliverableCounter icon={<Instagram size={13} />} label="Story (Instagram)"   value={campaign.deliverables.story}  onDec={() => setDeliverable("story", -1)}  onInc={() => setDeliverable("story", 1)}  isDark={isDark} inputCls={inputCls} />
            <DeliverableCounter icon={<Instagram size={13} />} label="Post (Instagram)"    value={campaign.deliverables.post}   onDec={() => setDeliverable("post", -1)}   onInc={() => setDeliverable("post", 1)}   isDark={isDark} inputCls={inputCls} />
            <DeliverableCounter icon={<Youtube size={13} />}   label="Short de YouTube"    value={campaign.deliverables.short}  onDec={() => setDeliverable("short", -1)}  onInc={() => setDeliverable("short", 1)}  isDark={isDark} inputCls={inputCls} />
            <DeliverableCounter icon={<Youtube size={13} />}   label="Video de YouTube"    value={campaign.deliverables.video}  onDec={() => setDeliverable("video", -1)}  onInc={() => setDeliverable("video", 1)}  isDark={isDark} inputCls={inputCls} />
            <DeliverableCounter icon={<Users size={13} />}     label="Asistencia a evento" value={campaign.deliverables.event}  onDec={() => setDeliverable("event", -1)}  onInc={() => setDeliverable("event", 1)}  isDark={isDark} inputCls={inputCls} />
          </div>
        </Section>

        {/* Exclusividad */}
        <Section title="Legal" subtle={subtle}>
          <label className={`flex items-center gap-2.5 p-3 rounded-lg cursor-pointer ${softSurface}`}>
            <input
              type="checkbox"
              checked={campaign.exclusivity}
              onChange={(e) => onUpdate({ exclusivity: e.target.checked })}
              className="accent-[#4059F1]"
            />
            <span className="text-[12.5px] font-medium">La campaña tiene cláusula de exclusividad</span>
          </label>
          {campaign.exclusivity && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={campaign.exclusivityDays ?? 60}
                onChange={(e) => onUpdate({ exclusivityDays: Number(e.target.value) || 0 })}
                className={`w-24 px-3 py-2 rounded-lg text-[13px] ${inputCls}`}
              />
              <span className={`text-[12px] ${subtle}`}>días · inicia con la publicación.</span>
            </div>
          )}
        </Section>

        {/* Notas */}
        <Section title="Notas internas" subtle={subtle}>
          <textarea
            value={campaign.notes ?? ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Recordatorios, condiciones especiales, contactos…"
            rows={3}
            className={`w-full px-3 py-2 rounded-lg text-[13px] resize-y ${inputCls}`}
          />
        </Section>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

/* ─────────── Small subcomponents ─────────── */

const Section = ({
  title, subtle, right, children,
}: { title: string; subtle: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <h4 className={`text-[12px] font-semibold ${subtle}`}>{title}</h4>
      {right}
    </div>
    {children}
  </div>
);

const SegmentedGroup = ({
  value, options, onChange, isDark, accentColor,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
  isDark: boolean;
  accentColor: string;
}) => (
  <div className={`inline-flex flex-wrap gap-1 p-1 rounded-lg ${isDark ? "bg-white/5" : "bg-neutral-100"}`}>
    {options.map((opt) => {
      const active = opt.value === value;
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
          style={
            active
              ? { backgroundColor: accentColor, color: "#fff" }
              : { color: isDark ? "rgba(255,255,255,0.7)" : "#4B4F63" }
          }
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

const DeliverableCounter = ({
  icon, label, value, onDec, onInc, isDark, inputCls,
}: {
  icon: React.ReactNode; label: string; value: number;
  onDec: () => void; onInc: () => void; isDark: boolean; inputCls: string;
}) => (
  <div className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg ${inputCls}`}>
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="opacity-70 shrink-0">{icon}</span>
      <span className="text-[11.5px] truncate">{label}</span>
    </div>
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={onDec}
        className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
          isDark ? "hover:bg-white/10 border border-white/10" : "hover:bg-neutral-100 border border-neutral-200"
        }`}
      >
        <Minus size={10} />
      </button>
      <span className="w-5 text-center text-[12.5px] font-semibold tabular-nums">{value}</span>
      <button
        onClick={onInc}
        className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
          isDark ? "hover:bg-white/10 border border-white/10" : "hover:bg-neutral-100 border border-neutral-200"
        }`}
      >
        <Plus size={10} />
      </button>
    </div>
  </div>
);

const PickerPopover = ({
  colors, selected, onPick, isDark,
}: {
  colors: Array<{ name: string; value: string }>;
  selected?: string;
  onPick: (v: string) => void;
  isDark: boolean;
}) => (
  <div
    className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-xl p-2.5 grid grid-cols-5 gap-1.5 z-[1001] w-[150px] ${
      isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-100"
    } shadow-xl`}
  >
    {colors.map((c) => (
      <button
        key={c.value}
        onClick={() => onPick(c.value)}
        className="w-6 h-6 rounded-full border border-neutral-200/60 transition-transform hover:scale-110 relative overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: c.value === "transparent" ? "white" : c.value }}
        title={c.name}
      >
        {c.value === "transparent" && <div className="absolute inset-0 w-full h-[1.5px] top-1/2 bg-red-500 rotate-45" />}
        {selected === c.value && c.value !== "transparent" && (
          <Check size={10} className={c.value === "#FFFFFF" ? "text-gray-700" : "text-white"} strokeWidth={2.5} />
        )}
      </button>
    ))}
  </div>
);

export default memo(CampaignsNode);

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
  Plus, Trash2, Palette, Baseline, X, Search, ArrowLeft, Repeat, DollarSign,
  Instagram, Youtube, Calendar, Users, Minus, Heading1, Heading2, Check,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import NodeExtendHandles from "@/components/nodes/NodeExtendHandles";

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

  const rawFill = d.backgroundColor ?? "#FFFFFF";
  const backgroundColor = isDark && isWhite(rawFill) ? "#1C1C1E" : rawFill;
  const rawText = d.textColor ?? "#111827";
  const textColor = isDark && (isBlack(rawText) || isWhite(rawFill)) ? "#FFFFFF" : rawText;
  const accentColor = d.accentColor ?? "#4059F1";
  const title = d.title ?? "Campañas";
  const showTitle = d.showTitle ?? true;
  const subtitle = d.subtitle ?? "";
  const showSubtitle = d.showSubtitle ?? false;

  const [activePicker, setActivePicker] = useState<"fill" | "text" | null>(null);
  const [filter, setFilter] = useState("");
  const [openCampaignId, setOpenCampaignId] = useState<string | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

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

  const openCampaign = campaigns.find((c) => c.id === openCampaignId) || null;

  const borderCls = isDark ? "border-white/10" : "border-neutral-200";
  const subtleText = isDark ? "text-white/60" : "text-neutral-500";
  const softSurface = isDark ? "bg-white/5" : "bg-neutral-50";

  return (
    <div className="group/widget" style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer isVisible={!!isSingleSelected} minWidth={380} minHeight={320} lineStyle={{ border: "none" }} />

      <AnimatePresence>
        {isSingleSelected && !openCampaign && (
          <div
            className="absolute -top-14 left-1/2 z-[1000] pointer-events-auto node-floating-toolbar"
            style={{ transform: `translate(-50%, 0) scale(${1 / zoom})`, transformOrigin: "bottom center", whiteSpace: "nowrap" }}
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

              <div className="relative">
              <button
                onClick={() => setActivePicker(activePicker === "text" ? null : "text")}
                className={`w-7 h-7 flex items-center justify-center rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-neutral-100"}`}
                title="Color de texto"
              >
                <Baseline size={13} style={{ color: textColor }} className="stroke-[2.5]" />
              </button>
              {activePicker === "text" && (
                <PickerPopover colors={TEXT_COLORS} selected={rawText} onPick={(v) => { update({ textColor: v }); setActivePicker(null); }} isDark={isDark} />
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
        <div className="mx-auto mt-1.5 h-1.5 w-8 rounded-full bg-neutral-300/70 opacity-0 transition-opacity group-hover/widget:opacity-100" />
      </div>

      <div
        ref={anchorRef}
        className={`w-full h-full rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${selected ? "border-[#4059F1]/40" : borderCls}`}
        style={{
          backgroundColor,
          color: textColor,
          boxShadow: selected
            ? "0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.05)"
            : "0 6px 16px -2px rgba(0,0,0,0.06), 0 2px 6px -1px rgba(0,0,0,0.03)",
        }}
      >
        {/* Header */}
        <div className={`px-5 pt-5 pb-3 shrink-0 border-b ${isDark ? "border-white/10" : "border-neutral-100"}`}>
          <div className="flex items-start justify-between gap-3">
            {(showTitle || showSubtitle) && (
              <div className="flex-1 min-w-0">
                {showTitle && (
                  <input
                    value={title}
                    onChange={(e) => update({ title: e.target.value })}
                    className="nodrag nopan w-full bg-transparent border-none outline-none text-[22px] font-semibold tracking-tight"
                    style={{ color: textColor }}
                    placeholder="Título"
                  />
                )}
                {showSubtitle && (
                  <input
                    value={subtitle}
                    onChange={(e) => update({ subtitle: e.target.value })}
                    className="nodrag nopan w-full bg-transparent border-none outline-none text-[12px] font-light mt-0.5 opacity-70"
                    style={{ color: textColor }}
                    placeholder="Subtítulo"
                  />
                )}
              </div>
            )}
            <button
              onClick={addCampaign}
              className="nodrag nopan shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              <Plus size={14} /> Nueva
            </button>
          </div>

          <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? "border-white/10 bg-white/5" : "border-neutral-200 bg-white"}`}>
            <Search size={13} className={subtleText} />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar por marca…"
              className="nodrag nopan flex-1 bg-transparent border-none outline-none text-[12.5px]"
              style={{ color: textColor }}
            />
          </div>
        </div>

        {/* Grid of campaign cards */}
        <div className="p-4 flex-1 overflow-y-auto kanban-scrollbar">
          {filtered.length === 0 ? (
            <div className={`h-full flex flex-col items-center justify-center gap-2 text-center ${subtleText}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${softSurface}`}>
                <Plus size={20} />
              </div>
              <p className="text-[12.5px]">Aún no tienes campañas.</p>
              <button
                onClick={addCampaign}
                className="nodrag nopan text-[11.5px] underline underline-offset-2"
                style={{ color: accentColor }}
              >
                Añadir la primera
              </button>
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {filtered.map((c) => (
                <CampaignCard
                  key={c.id}
                  c={c}
                  isDark={isDark}
                  accentColor={accentColor}
                  onOpen={() => setOpenCampaignId(c.id)}
                />
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
    </div>
  );
};

/* ─────────── Campaign card (grid tile) ─────────── */

const CampaignCard = ({
  c, isDark, accentColor, onOpen,
}: {
  c: Campaign; isDark: boolean; accentColor: string; onOpen: () => void;
}) => {
  const status = STATUS_STYLES[c.status];
  const pieces = totalPieces(c.deliverables);
  const fmt = primaryFormat(c.deliverables);
  const brand = c.brand || "Sin nombre";

  return (
    <button
      onClick={onOpen}
      className={`nodrag nopan text-left rounded-2xl border p-3.5 transition-all hover:shadow-md ${
        isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-[#E8ECFE] hover:border-[#C7CFFD]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-[12px] font-semibold ${
            isDark ? "bg-white/10 text-white/80" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {initials(brand)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold truncate leading-tight">{brand}</p>
              <p className="text-[11px] opacity-60 mt-0.5 truncate">
                {pieces} contenido{pieces === 1 ? "" : "s"}{fmt ? ` · ${fmt}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {c.exclusivity && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: "#E8ECFE", color: "#4059F1", border: "1px solid #C7CFFD" }}
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
        <span className="text-[17px] font-bold tracking-tight">
          {c.payType === "intercambio" ? "Intercambio" : formatMoney(c.amount)}
        </span>
      </div>
    </button>
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

  const panelCls = isDark
    ? "bg-[#1C1C1E] border border-white/10 text-white"
    : "bg-white border border-neutral-200 text-neutral-900";
  const inputCls = isDark
    ? "bg-white/5 border border-white/10 text-white placeholder:text-white/40"
    : "bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400";
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

  const content = (
    <div
      ref={popoverRef}
      className={`fixed z-[10000] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${panelCls}`}
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
        <button onClick={onClose} className={`flex items-center gap-1.5 text-[13px] ${subtle} hover:opacity-80`}>
          <ArrowLeft size={14} /> Volver
        </button>
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
      <h4 className={`text-[11px] uppercase tracking-wider font-semibold ${subtle}`}>{title}</h4>
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
    className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-xl shadow-2xl p-2.5 grid grid-cols-5 gap-1.5 z-[1001] w-[150px] ${
      isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-100"
    }`}
  >
    {colors.map((c) => (
      <button
        key={c.value}
        onClick={() => onPick(c.value)}
        className="w-6 h-6 rounded-full border border-neutral-200/60 transition-transform hover:scale-110 relative overflow-hidden shadow-sm flex items-center justify-center"
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

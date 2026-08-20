/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REGLA GLOBAL DE WIDGETS (Miiles) — LEE ESTO ANTES DE EDITAR
 *  Los widgets son movibles/redimensionables, tienen toolbar flotante y
 *  NO conectan lazos/edges (no renderizan <Handle> de React Flow).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { memo, useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { isColorDark } from "@/lib/utils";
import { type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Palette, ExternalLink, ChevronDown, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import NodeExtendHandles from "@/components/nodes/NodeExtendHandles";
import WidgetCommentSlot from "@/components/nodes/WidgetCommentSlot";
import { useWidgetAutoFit } from "@/hooks/useWidgetAutoFit";

export type CollabLink = { id: string; url: string; imageUrl?: string; label?: string };

export type CollabFinderNodeData = {
  title?: string;
  showTitle?: boolean;
  links?: CollabLink[];
  backgroundColor?: string;
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

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isWhite = (c?: string) => {
  const v = (c || "").trim().toLowerCase();
  return v === "#ffffff" || v === "white" || v === "#fff" || v === "#fafafa" || v === "#f3f4f6";
};

export const hostOf = (url: string) => {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
};

const BRAND_IMAGES: Record<string, string> = {
  "hubb.mx": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlHJUOa7k9-l1VyMbmOIaKZCvXIhm59vif-3cqISlLAHjh-Xw51DTneTeW&s=10",
  "brkaway.co": "https://cdn.prod.website-files.com/6673ffe5c15a5086f8abfb21/667e7309408405f1bafe9291_Frame%201742-3.webp",
  "fuelyourbrands.com": "https://elreferente.es/wp-content/uploads/2022/02/Logo-2-1.png",
  "lizza.ai": "https://lizza.ai/og-image.jpg",
  "collabify.com": "https://startupslatam.com/wp-content/uploads/2025/05/Collabify-768x432.png"
};

const previewFor = (l: CollabLink) => {
  if (l.imageUrl?.trim()) return l.imageUrl.trim();
  const host = hostOf(l.url);
  for (const [domain, img] of Object.entries(BRAND_IMAGES)) {
    if (host.includes(domain)) return img;
  }
  return `https://api.microlink.io/?url=${encodeURIComponent(
    l.url.startsWith("http") ? l.url : `https://${l.url}`,
  )}&screenshot=true&meta=false&embed=screenshot.url`;
};

const faviconFor = (url: string) => `https://icons.duckduckgo.com/ip3/${hostOf(url)}.ico`;

const CollabFinderNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes, getNodes } = useReactFlow();
  const { zoom } = useViewport();
  const { isDark } = useTheme();
  const d = data as CollabFinderNodeData;
  const links = d.links ?? [];

  const isSingleSelected = selected && getNodes().filter((n) => n.selected).length === 1;

  const rawFill = d.backgroundColor ?? (isDark ? "#2C2C2E" : "#FFFFFF");
  const backgroundColor = isDark && isWhite(rawFill) ? "#2C2C2E" : rawFill;
  const isEffectiveBgDark = backgroundColor === "transparent" ? isDark : isColorDark(backgroundColor);
  const textColor = isEffectiveBgDark ? "#FFFFFF" : "#111827";
  const subtleText = isEffectiveBgDark ? "text-white/60" : "text-neutral-500";

  const [activePicker, setActivePicker] = useState<"fill" | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useWidgetAutoFit(id, (d as any)._aiFitNonce, scrollRef, anchorRef, { minHeight: 240, maxHeight: 1400 });

  const update = (patch: Partial<CollabFinderNodeData>) =>
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), ...patch } } : n)),
    );

  const [filter, setFilter] = useState("all");

  const categories = [
    { id: "all", label: "Todos" },
    { id: "latam", label: "LatAm & MX" },
    { id: "speed", label: "Velocidad" },
    { id: "niche", label: "Nicho" },
  ];

  const getLevel = (link: CollabLink, filterId: string) => {
    const term = (link.label || link.url).toLowerCase();
    if (filterId === "latam") {
      if (term.includes("collabify")) return 1;
      if (term.includes("hubb") || term.includes("lizza")) return 2;
      return 3;
    }
    if (filterId === "speed") {
      if (term.includes("hubb")) return 1;
      if (term.includes("brkaway")) return 2;
      return 3;
    }
    if (filterId === "niche") {
      if (term.includes("fuel") || term.includes("brands")) return 1;
      if (term.includes("collabify") || term.includes("lizza")) return 2;
      return 3;
    }
    return 1;
  };

  const visibleLinks = links.filter(l => {
    const term = (l.label || l.url).toLowerCase();
    if (term.includes("conugc")) return false;
    return true;
  });

  const level1 = visibleLinks.filter(l => getLevel(l, filter) === 1);
  const level2 = visibleLinks.filter(l => getLevel(l, filter) === 2);
  const level3 = visibleLinks.filter(l => getLevel(l, filter) === 3);

  return (
    <div className="group/widget" style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer isVisible={!!isSingleSelected} minWidth={300} minHeight={260} lineStyle={{ border: "none" }} />

      <AnimatePresence>
        {isSingleSelected && (
          <div
            className="absolute -top-14 left-1/2 z-[1000] pointer-events-auto node-floating-toolbar shadow-sm"
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
                onClick={() => setActivePicker(activePicker === "fill" ? null : "fill")}
                className={`w-7 h-7 flex items-center justify-center rounded-lg relative ${isDark ? "hover:bg-white/10" : "hover:bg-neutral-100"}`}
                title="Color de fondo"
              >
                <Palette size={13} className="text-[#6B7280]" />
                <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white" style={{ backgroundColor }} />
              </button>

              {activePicker === "fill" && (
                <PickerPopover colors={RAINBOW_COLORS} onPick={(v) => { update({ backgroundColor: v }); setActivePicker(null); }} isDark={isDark} />
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
        <div className={`mx-auto mt-1.5 h-1.5 w-8 rounded-full opacity-0 transition-opacity group-hover/widget:opacity-100 ${isEffectiveBgDark ? "bg-white/40" : "bg-black/20"}`} />
      </div>

      <div
        ref={anchorRef}
        className="w-full h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
        style={{
          backgroundColor,
          color: textColor,
          boxShadow: selected
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)"
            : "0 4px 12px -1px rgba(0,0,0,0.015), 0 2px 4px -1px rgba(0,0,0,0.01)",
        }}
      >
        {(d.showTitle ?? true) && (
          <div className="px-4 pt-4 pb-0 shrink-0">
            <div className="text-[15px] font-semibold" style={{ color: textColor }}>
              {d.title || "Buscador de colaboraciones"}
            </div>
            
            {/* Filters */}
            <div className="mt-3 mb-1 pointer-events-auto">
              <FilterSelect
                label="Filtro"
                value={filter}
                options={categories.map(c => ({ value: c.id, label: c.label }))}
                onChange={setFilter}
                isDark={isEffectiveBgDark}
              />
            </div>
          </div>
        )}

        <div ref={scrollRef} className="px-4 pb-4 pt-3 flex-1 overflow-y-auto kanban-scrollbar pointer-events-auto">
          
          {(() => {
            const renderCard = (l: CollabLink) => (
              <a
                key={l.id}
                href={l.url.startsWith("http") ? l.url : `https://${l.url}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className={`nodrag nopan group/card shrink-0 flex flex-col w-[200px] rounded-xl overflow-hidden border shadow-sm transition-all ${
                  isEffectiveBgDark ? "border-white/10 bg-white/5 hover:border-white/25" : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
                title={l.url}
              >
                <div className={`relative aspect-[16/10] overflow-hidden ${isEffectiveBgDark ? "bg-white/10" : "bg-neutral-100"}`}>
                  <img
                    src={previewFor(l)}
                    alt={l.label || hostOf(l.url)}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.dataset.fallback !== "1") {
                        img.dataset.fallback = "1";
                        img.src = faviconFor(l.url);
                        img.className = "w-10 h-10 m-auto absolute inset-0 object-contain";
                      }
                    }}
                  />
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white">
                      <ExternalLink size={12} />
                    </span>
                  </div>
                </div>
                <div className="px-2.5 py-2.5 flex items-center justify-center text-center">
                  <span className="text-[12px] font-medium truncate" style={{ color: textColor }}>
                    {l.label || hostOf(l.url)}
                  </span>
                </div>
              </a>
            );

            if (filter === "all") {
              return (
                <div className="flex flex-wrap gap-3">
                  {visibleLinks.map(renderCard)}
                </div>
              );
            }

            const getLevelTitle = (level: number, filterId: string) => {
              if (filterId === "latam") {
                if (level === 1) return "Operación regional nativa";
                if (level === 2) return "Presencia local (México / LatAm)";
                return "Enfoque internacional o europeo";
              }
              if (filterId === "speed") {
                if (level === 1) return "Respuesta rápida";
                if (level === 2) return "En ocasiones hay demoras";
                return "El proceso suele ser largo";
              }
              if (filterId === "niche") {
                if (level === 1) return "Micro-influencers y nicho";
                if (level === 2) return "Creadores UGC estándar";
                return "Enfoque en Ads y automatización";
              }
              return level === 1 ? "Recomendadas" : level === 2 ? "Alternativas" : "Otras opciones";
            };

            return (
              <div className="flex flex-col gap-5">
                {level1.length > 0 && (
                  <div>
                    <h4 className={`text-[12px] font-medium mb-2.5 ${isEffectiveBgDark ? 'text-white/80' : 'text-neutral-600'}`}>{getLevelTitle(1, filter)}</h4>
                    <div className="flex flex-wrap gap-3">{level1.map(renderCard)}</div>
                  </div>
                )}
                {level2.length > 0 && (
                  <div>
                    <h4 className={`text-[12px] font-medium mb-2.5 ${isEffectiveBgDark ? 'text-white/80' : 'text-neutral-600'}`}>{getLevelTitle(2, filter)}</h4>
                    <div className="flex flex-wrap gap-3">{level2.map(renderCard)}</div>
                  </div>
                )}
                {level3.length > 0 && (
                  <div>
                    <h4 className={`text-[12px] font-medium mb-2.5 ${isEffectiveBgDark ? 'text-white/80' : 'text-neutral-600'}`}>{getLevelTitle(3, filter)}</h4>
                    <div className="flex flex-wrap gap-3">{level3.map(renderCard)}</div>
                  </div>
                )}
              </div>
            );
          })()}

          {visibleLinks.length === 0 && (
            <p className={`text-[11px] mt-3 ${subtleText}`}>No hay sitios disponibles.</p>
          )}
        </div>
      </div>


      <NodeExtendHandles nodeId={id} />
      <WidgetCommentSlot nodeId={id} />
    </div>
  );
};

/* ─────────── Editor popover ─────────── */


const PickerPopover = ({ colors, onPick, isDark }: { colors: { name: string; value: string }[]; onPick: (v: string) => void; isDark: boolean }) => (
  <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-xl p-2.5 grid grid-cols-5 gap-1.5 z-50 w-[150px] ${isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-100"} shadow-sm`}>
    {colors.map((c) => (
      <button
        key={c.value}
        onClick={() => onPick(c.value)}
        className="w-6 h-6 rounded-full border border-neutral-200/60 transition-transform hover:scale-110 relative overflow-hidden"
        style={{ backgroundColor: c.value === "transparent" ? "white" : c.value }}
        title={c.name}
      >
        {c.value === "transparent" && <div className="absolute inset-0 w-full h-[1.5px] top-1/2 bg-red-500 rotate-45" />}
      </button>
    ))}
  </div>
);

export default memo(CollabFinderNode);

const FilterSelect = ({
  label, value, options, onChange, isDark,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
  isDark: boolean;
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

  const current = options.find((o) => o.value === value)?.label ?? options[0]?.label;

  return (
    <div ref={ref} className="relative nodrag nopan">
      <button
        onClick={() => setOpen((v) => !v)}
        className="nodrag nopan flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11.5px] font-medium transition-colors hover:brightness-110"
        style={{
          color: isDark ? "#ffffff" : "#000000",
          backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "#ffffff",
          borderColor: isDark ? "rgba(255,255,255,0.15)" : "#E5E7EB",
        }}
      >
        <span className="opacity-60">{label}:</span>
        <span className="truncate max-w-[140px]">{current}</span>
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>

      {open && (
        <div
          className={`absolute top-full mt-1.5 left-0 z-[60] min-w-[200px] rounded-md p-1.5 border shadow-sm ${
            isDark ? "bg-[#1C1C1E] border-white/10" : "bg-white border-neutral-200"
          }`}
        >
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`nodrag nopan w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11.5px] ${
                isDark ? "text-white hover:bg-white/10" : "text-neutral-900 hover:bg-neutral-100"
              } ${o.value === value ? (isDark ? "bg-white/10" : "bg-neutral-100") : ""}`}
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

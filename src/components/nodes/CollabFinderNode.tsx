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
import { Trash2, Palette, X, Plus, Link2, ExternalLink, Image as ImageIcon } from "lucide-react";
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

const previewFor = (l: CollabLink) =>
  l.imageUrl?.trim() ||
  `https://api.microlink.io/?url=${encodeURIComponent(
    l.url.startsWith("http") ? l.url : `https://${l.url}`,
  )}&screenshot=true&meta=false&embed=screenshot.url`;

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
  const [editorOpen, setEditorOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useWidgetAutoFit(id, (d as any)._aiFitNonce, scrollRef, anchorRef, { minHeight: 240, maxHeight: 1400 });

  const update = (patch: Partial<CollabFinderNodeData>) =>
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));

  return (
    <div className="group/widget" style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer isVisible={!!isSingleSelected} minWidth={300} minHeight={220} lineStyle={{ border: "none" }} />

      <AnimatePresence>
        {isSingleSelected && !editorOpen && (
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
          <div className="px-4 pt-4 pb-2 shrink-0">
            <div className="text-[15px] font-semibold" style={{ color: textColor }}>
              {d.title || "Buscador de colaboraciones"}
            </div>
          </div>
        )}

        <div ref={scrollRef} className="px-4 pb-4 pt-2 flex-1 overflow-y-auto kanban-scrollbar">
          <div className="grid grid-cols-2 gap-3">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.url.startsWith("http") ? l.url : `https://${l.url}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className={`nodrag nopan group/card block rounded-xl overflow-hidden border transition-all hover:-translate-y-0.5 ${
                  isEffectiveBgDark ? "border-white/10 bg-white/5 hover:border-white/25" : "border-neutral-200 bg-white hover:shadow-md"
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
                <div className="px-2.5 py-2 flex items-center gap-2">
                  <img src={faviconFor(l.url)} alt="" className="w-4 h-4 rounded-sm shrink-0" loading="lazy" />
                  <span className="text-[11.5px] font-medium truncate" style={{ color: textColor }}>
                    {l.label || hostOf(l.url)}
                  </span>
                </div>
              </a>
            ))}

            <button
              onClick={() => setEditorOpen(true)}
              className={`nodrag nopan rounded-xl border border-dashed aspect-[16/10] flex flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
                isEffectiveBgDark ? "border-white/20 text-white/60 hover:bg-white/5" : "border-neutral-300 text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              <Plus size={16} />
              Añadir sitio
            </button>
          </div>

          {links.length === 0 && (
            <p className={`text-[11px] mt-3 ${subtleText}`}>Añade sitios donde encontrar colaboraciones.</p>
          )}
        </div>
      </div>

      {editorOpen && anchorRef.current && (
        <LinksEditorPopover
          anchorEl={anchorRef.current}
          links={links}
          isDark={isDark}
          onClose={() => setEditorOpen(false)}
          onChange={(next) => update({ links: next })}
        />
      )}

      <NodeExtendHandles nodeId={id} />
      <WidgetCommentSlot nodeId={id} />
    </div>
  );
};

/* ─────────── Editor popover ─────────── */

const LinksEditorPopover = ({
  anchorEl, links, isDark, onClose, onChange,
}: {
  anchorEl: HTMLElement;
  links: CollabLink[];
  isDark: boolean;
  onClose: () => void;
  onChange: (next: CollabLink[]) => void;
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: -999, left: -999 });
  const [newUrl, setNewUrl] = useState("");
  const [newImage, setNewImage] = useState("");

  useLayoutEffect(() => {
    let frame: number;
    const updatePos = () => {
      if (!popoverRef.current) { frame = requestAnimationFrame(updatePos); return; }
      const rect = anchorEl.getBoundingClientRect();
      const w = popoverRef.current.offsetWidth;
      const h = popoverRef.current.offsetHeight;
      let left = rect.right + 8;
      if (left + w > window.innerWidth - 12) left = Math.max(12, rect.left - w - 8);
      let top = rect.top;
      if (top + h > window.innerHeight - 12) top = Math.max(12, window.innerHeight - h - 12);
      setPos((prev) => (Math.abs(prev.top - top) > 0.5 || Math.abs(prev.left - left) > 0.5 ? { top, left } : prev));
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

  const add = () => {
    const url = newUrl.trim();
    if (!url) return;
    onChange([...links, { id: uid(), url, imageUrl: newImage.trim() || undefined }]);
    setNewUrl("");
    setNewImage("");
  };
  const patch = (id: string, p: Partial<CollabLink>) =>
    onChange(links.map((l) => (l.id === id ? { ...l, ...p } : l)));
  const remove = (id: string) => onChange(links.filter((l) => l.id !== id));

  return createPortal(
    <div
      ref={popoverRef}
      className={`fixed z-[10000] w-[320px] max-h-[70vh] overflow-y-auto rounded-2xl p-4 shadow-xl ${panelCls}`}
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-semibold">Sitios de colaboraciones</div>
        <button onClick={onClose} className="opacity-60 hover:opacity-100"><X size={14} /></button>
      </div>

      <div className="space-y-2 mb-4">
        {links.map((l) => (
          <div key={l.id} className={`rounded-lg p-2 space-y-1.5 ${isDark ? "bg-white/5" : "bg-neutral-50"}`}>
            <div className="flex items-center gap-1.5">
              <img src={faviconFor(l.url)} alt="" className="w-4 h-4 rounded-sm shrink-0" />
              <input
                value={l.url}
                onChange={(e) => patch(l.id, { url: e.target.value })}
                className={`flex-1 text-[11px] px-2 py-1 rounded-md outline-none ${inputCls}`}
                placeholder="https://sitio.com"
              />
              <button onClick={() => remove(l.id)} className="opacity-60 hover:opacity-100 hover:text-red-500 px-1"><X size={11} /></button>
            </div>
            <div className="flex items-center gap-1.5">
              <ImageIcon size={12} className="opacity-50 shrink-0" />
              <input
                value={l.imageUrl ?? ""}
                onChange={(e) => patch(l.id, { imageUrl: e.target.value })}
                className={`flex-1 text-[11px] px-2 py-1 rounded-md outline-none ${inputCls}`}
                placeholder="URL de imagen (opcional)"
              />
            </div>
            <input
              value={l.label ?? ""}
              onChange={(e) => patch(l.id, { label: e.target.value })}
              className={`w-full text-[11px] px-2 py-1 rounded-md outline-none ${inputCls}`}
              placeholder="Nombre (opcional)"
            />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className={`w-full text-[11px] px-2 py-1.5 rounded-md outline-none ${inputCls}`}
          placeholder="https://nuevo-sitio.com"
        />
        <input
          value={newImage}
          onChange={(e) => setNewImage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className={`w-full text-[11px] px-2 py-1.5 rounded-md outline-none ${inputCls}`}
          placeholder="URL de imagen (opcional)"
        />
        <button
          onClick={add}
          className={`w-full flex items-center justify-center gap-1 text-[11px] px-2 py-1.5 rounded-md ${
            isDark ? "bg-white/10 hover:bg-white/15 text-white" : "bg-black text-white hover:bg-neutral-800"
          }`}
        >
          <Plus size={12} /> Añadir sitio
        </button>
      </div>
    </div>,
    document.body,
  );
};

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

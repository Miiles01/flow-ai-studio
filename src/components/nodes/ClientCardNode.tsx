/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REGLA GLOBAL DE WIDGETS (Miiles) — LEE ESTO ANTES DE EDITAR
 * ═══════════════════════════════════════════════════════════════════════════
 *  Los WIDGETS (KanbanNode, ClientCardNode y futuros) comparten esta lógica:
 *  1. Son nodos de React Flow arrastrables/redimensionables y con toolbar
 *     flotante (fondo, eliminar) — misma UX que los demás.
 *  2. Tienen `NodeExtendHandles` para ampliar con IA desde sus lados.
 *  3. **NO CONECTAN LAZOS/EDGES.** No renderizan `<Handle>` de React Flow,
 *     por lo que no se les pueden arrastrar líneas de entrada/salida.
 *     NO añadas <Handle /> a ningún widget. Esta regla es intencional.
 *  4. La IA no debe generar edges hacia/desde nodos widget.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { memo, useState, useRef, useEffect, useLayoutEffect } from "react";
import { isColorDark } from "@/lib/utils";
import { createPortal } from "react-dom";
import { type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Palette, X, Mail, Phone, Building2, Tag as TagIcon,
  Users, AlignLeft, DollarSign, User as UserIcon, Image as ImageIcon,
  Link2, ListPlus,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import NodeExtendHandles from "@/components/nodes/NodeExtendHandles";
import WidgetCommentSlot from "@/components/nodes/WidgetCommentSlot";
import { useWidgetAutoFit } from "@/hooks/useWidgetAutoFit";

export type ClientTag = { id: string; label: string; color: string };
export type ClientAssignee = { id: string; name: string; email?: string };
export type ClientField = { id: string; label: string; value: string };

export type ClientCardNodeData = {
  name?: string;
  role?: string;         // Cargo / empresa
  company?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  website?: string;
  description?: string;
  value?: string;        // Valor del prospecto (texto libre: "$12,500 MXN")
  tags?: ClientTag[];
  assignees?: ClientAssignee[];
  fields?: ClientField[];
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

const TAG_COLORS = ["#EF4444", "#F97316", "#FACC15", "#22C55E", "#4059F1", "#A855F7", "#FCB5B9", "#1F2937"];
const PRESET_STATUS_TAGS = [
  { label: "Nuevo", color: "#4059F1" },
  { label: "Contactado", color: "#F97316" },
  { label: "Interesado", color: "#22C55E" },
  { label: "Cerrado", color: "#A855F7" },
  { label: "Perdido", color: "#EF4444" },
];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isWhite = (c?: string) => {
  const v = (c || "").trim().toLowerCase();
  return v === "#ffffff" || v === "white" || v === "#fff" || v === "#fafafa" || v === "#f3f4f6";
};

const initials = (s: string) => {
  const t = (s || "").trim();
  if (!t) return "?";
  const parts = t.includes("@") ? t.split("@")[0].split(/[._-]/) : t.split(/\s+/);
  return parts.filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
};

const ClientCardNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes, getNodes } = useReactFlow();
  const { zoom } = useViewport();
  const { isDark } = useTheme();
  const d = data as ClientCardNodeData;

  const isSingleSelected = selected && getNodes().filter((n) => n.selected).length === 1;

  const rawFill = d.backgroundColor ?? (isDark ? "#2C2C2E" : "#FFFFFF");
  const backgroundColor = isDark && isWhite(rawFill) ? "#2C2C2E" : rawFill;
  
  const isEffectiveBgDark = backgroundColor === "transparent" ? isDark : isColorDark(backgroundColor);
  const cardTextColor = isEffectiveBgDark ? "#FFFFFF" : "#111827";
  const subtleText = isEffectiveBgDark ? "text-white/70" : "text-neutral-500";
  const accentColor = d.accentColor ?? "#4059F1";

  const [activePicker, setActivePicker] = useState<"fill" | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useWidgetAutoFit(id, (d as any)._aiFitNonce, scrollRef, anchorRef, { minHeight: 220, maxHeight: 1400 });

  const update = (patch: Partial<ClientCardNodeData>) =>
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));

  const dividerCls = isEffectiveBgDark ? "border-white/10" : "border-neutral-100";

  return (
    <div className="group/widget" style={{ width: "100%", height: "100%", position: "relative" }}>
      <NodeResizer isVisible={!!isSingleSelected} minWidth={260} minHeight={180} lineStyle={{ border: "none" }} />

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
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("input,textarea,button,a,select")) return;
          setEditorOpen(true);
        }}
        className="w-full h-full rounded-2xl overflow-hidden flex flex-col transition-all duration-300 cursor-pointer"
        style={{
          backgroundColor,
          color: cardTextColor,
          boxShadow: selected
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)"
            : "0 4px 12px -1px rgba(0,0,0,0.015), 0 2px 4px -1px rgba(0,0,0,0.01)",
        }}
      >
        {/* Header: avatar + name + role */}
        <div className="p-4 flex items-start gap-3 shrink-0">
          <div
            className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-[13px] font-semibold overflow-hidden"
            style={{ backgroundColor: accentColor, color: "#fff" }}
          >
            {d.avatarUrl ? (
              <img src={d.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initials(d.name || d.email || "?")
            )}
          </div>
          <div className="flex-1 min-w-0">
            <input
              value={d.name ?? ""}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Nombre del cliente"
              className={`nodrag nopan w-full bg-transparent border-none outline-none text-[15px] font-semibold ${
                isEffectiveBgDark ? "placeholder:text-white/40" : "placeholder:text-neutral-400"
              }`}
              style={{ color: cardTextColor }}
            />
            <input
              value={d.role ?? ""}
              onChange={(e) => update({ role: e.target.value })}
              placeholder="Cargo / empresa"
              className={`nodrag nopan w-full bg-transparent border-none outline-none text-[11px] font-normal mt-0.5 ${
                isEffectiveBgDark ? "placeholder:text-white/50 text-white/90" : "placeholder:text-neutral-400 text-neutral-600"
              }`}
              style={{ color: isEffectiveBgDark ? "#FFFFFF" : cardTextColor }}
            />
          </div>
        </div>

        {/* Body */}
        <div ref={scrollRef} className="px-4 pb-4 flex-1 overflow-y-auto kanban-scrollbar space-y-2">
          {(d.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {d.tags!.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${t.color}22`, color: t.color, border: `1px solid ${t.color}44` }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          )}

          {d.description && (
            <p
              className={`text-[11.5px] whitespace-pre-wrap break-words leading-snug ${
                isEffectiveBgDark ? "text-white" : "text-neutral-700"
              }`}
              style={{ color: isEffectiveBgDark ? "#FFFFFF" : cardTextColor }}
            >
              {d.description}
            </p>
          )}

          {(d.email || d.phone || d.website) && (
            <div className="space-y-1 pt-1">
              {d.email && (
                <div className={`flex items-center gap-1.5 text-[11px] ${isEffectiveBgDark ? "text-white" : "opacity-80"}`} style={{ color: isEffectiveBgDark ? "#FFFFFF" : cardTextColor }}>
                  <Mail size={11} className={`${isEffectiveBgDark ? "text-white/70" : "opacity-60"} shrink-0`} />
                  <span className="truncate">{d.email}</span>
                </div>
              )}
              {d.phone && (
                <div className={`flex items-center gap-1.5 text-[11px] ${isEffectiveBgDark ? "text-white" : "opacity-80"}`} style={{ color: isEffectiveBgDark ? "#FFFFFF" : cardTextColor }}>
                  <Phone size={11} className={`${isEffectiveBgDark ? "text-white/70" : "opacity-60"} shrink-0`} />
                  <span className="truncate">{d.phone}</span>
                </div>
              )}
              {d.website && (
                <a
                  href={d.website}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-[11px] truncate font-medium hover:underline"
                  style={{ color: isEffectiveBgDark ? "#93C5FD" : accentColor }}
                >
                  <Link2 size={11} className="opacity-70 shrink-0" />
                  <span className="truncate">{d.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
            </div>
          )}

          {(d.fields?.length ?? 0) > 0 && (
            <div className={`pt-1.5 border-t ${dividerCls} space-y-1`}>
              {d.fields!.map((f) => (
                <div key={f.id} className="flex items-baseline justify-between gap-2 text-[11px]">
                  <span className={`${subtleText} shrink-0`}>{f.label}</span>
                  <span className="font-medium truncate text-right" style={{ color: isEffectiveBgDark ? "#FFFFFF" : cardTextColor }}>{f.value}</span>
                </div>
              ))}
            </div>
          )}

          {d.value && (
            <div className={`pt-1.5 mt-1 border-t ${dividerCls} flex items-center justify-between`}>
              <span className={`text-[10px] tracking-wide ${subtleText}`}>Valor</span>
              <span className="text-[13px] font-semibold" style={{ color: isEffectiveBgDark ? "#93C5FD" : accentColor }}>{d.value}</span>
            </div>
          )}

          {(d.assignees?.length ?? 0) > 0 && (
            <div className="flex items-center gap-1 pt-1">
              <span className={`text-[10px] ${subtleText} mr-1`}>Asignado a</span>
              {d.assignees!.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  title={a.email ? `${a.name} · ${a.email}` : a.name}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold border-2"
                  style={{
                    backgroundColor: accentColor,
                    color: "#fff",
                    borderColor: isEffectiveBgDark ? "#2C2C2E" : "#fff",
                    marginLeft: -4,
                  }}
                >
                  {initials(a.name || a.email || "")}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editorOpen && anchorRef.current && (
        <ClientEditorPopover
          anchorEl={anchorRef.current}
          data={d}
          isDark={isDark}
          accentColor={accentColor}
          onClose={() => setEditorOpen(false)}
          onUpdate={update}
        />
      )}

      <NodeExtendHandles nodeId={id} />
      <WidgetCommentSlot nodeId={id} />
    </div>
  );
};

/* ─────────── Editor popover ─────────── */

const ClientEditorPopover = ({
  anchorEl, data, isDark, accentColor, onClose, onUpdate,
}: {
  anchorEl: HTMLElement;
  data: ClientCardNodeData;
  isDark: boolean;
  accentColor: string;
  onClose: () => void;
  onUpdate: (patch: Partial<ClientCardNodeData>) => void;
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
      let top = rect.top;
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

  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [newAssigneeEmail, setNewAssigneeEmail] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  const panelCls = isDark ? "bg-[#1C1C1E] border border-white/10 text-white" : "bg-white border border-neutral-200 text-neutral-900";
  const inputCls = isDark ? "bg-white/5 border border-white/10 text-white placeholder:text-white/40" : "bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400";
  const ghostBtn = isDark ? "border border-white/10 hover:bg-white/5 text-white/80" : "border border-neutral-200 hover:bg-neutral-50 text-neutral-700";

  const addTag = (label: string, color: string) => {
    const clean = label.trim().slice(0, 30);
    if (!clean) return;
    onUpdate({ tags: [...(data.tags ?? []), { id: uid(), label: clean, color }] });
  };
  const removeTag = (tid: string) =>
    onUpdate({ tags: (data.tags ?? []).filter((t) => t.id !== tid) });

  const addAssignee = () => {
    const name = newAssigneeName.trim().slice(0, 60);
    const email = newAssigneeEmail.trim().slice(0, 120);
    if (!name && !email) return;
    onUpdate({
      assignees: [
        ...(data.assignees ?? []),
        { id: uid(), name: name || email.split("@")[0], email: email || undefined },
      ],
    });
    setNewAssigneeName(""); setNewAssigneeEmail("");
  };
  const removeAssignee = (aid: string) =>
    onUpdate({ assignees: (data.assignees ?? []).filter((a) => a.id !== aid) });

  const addField = () => {
    const label = newFieldLabel.trim().slice(0, 40);
    const value = newFieldValue.trim().slice(0, 120);
    if (!label || !value) return;
    onUpdate({ fields: [...(data.fields ?? []), { id: uid(), label, value }] });
    setNewFieldLabel(""); setNewFieldValue("");
  };
  const removeField = (fid: string) =>
    onUpdate({ fields: (data.fields ?? []).filter((f) => f.id !== fid) });
  const updateField = (fid: string, patch: Partial<ClientField>) =>
    onUpdate({ fields: (data.fields ?? []).map((f) => (f.id === fid ? { ...f, ...patch } : f)) });

  return createPortal(
    <div
      ref={popoverRef}
      className={`fixed z-[10000] w-[300px] max-h-[440px] overflow-y-auto editor-scrollbar rounded-2xl ${panelCls}`}
      style={{ top: pos.top, left: pos.left, visibility: pos.top === -999 ? "hidden" : "visible" }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-6 flex items-center justify-between"
        style={{ background: isDark ? "linear-gradient(to bottom, #1C1C1E 60%, transparent)" : "linear-gradient(to bottom, #ffffff 60%, transparent)" }}
      >
        <span className="text-[13px] font-semibold">Editar cliente</span>
        <button
          onClick={onClose}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-[11px] font-medium ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-black"}`}
        >
          <span>Cerrar</span><X size={12} />
        </button>
      </div>

      <div className="px-4 pb-4">
        <Section label="Información" icon={<UserIcon size={12} />}>
          <div className="space-y-1.5">
            <input
              value={data.name ?? ""}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Nombre"
              className={`w-full text-[12px] px-2 py-1.5 rounded-md outline-none ${inputCls}`}
            />
            <input
              value={data.role ?? ""}
              onChange={(e) => onUpdate({ role: e.target.value })}
              placeholder="Cargo / empresa"
              className={`w-full text-[12px] px-2 py-1.5 rounded-md outline-none ${inputCls}`}
            />
            <div className="relative">
              <ImageIcon size={11} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                value={data.avatarUrl ?? ""}
                onChange={(e) => onUpdate({ avatarUrl: e.target.value || undefined })}
                placeholder="URL de foto (opcional)"
                className={`w-full text-[12px] pl-7 pr-2 py-1.5 rounded-md outline-none ${inputCls}`}
              />
            </div>
          </div>
        </Section>

        <Section label="Descripción" icon={<AlignLeft size={12} />}>
          <textarea
            value={data.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value || undefined })}
            rows={3}
            placeholder="Notas del prospecto…"
            className={`w-full text-[12px] px-2 py-1.5 rounded-md outline-none resize-none ${inputCls}`}
          />
        </Section>

        <Section label="Contacto" icon={<Mail size={12} />}>
          <div className="space-y-1.5">
            <div className="relative">
              <Mail size={11} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                value={data.email ?? ""}
                onChange={(e) => onUpdate({ email: e.target.value || undefined })}
                placeholder="correo@ejemplo.com"
                className={`w-full text-[12px] pl-7 pr-2 py-1.5 rounded-md outline-none ${inputCls}`}
              />
            </div>
            <div className="relative">
              <Phone size={11} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                value={data.phone ?? ""}
                onChange={(e) => onUpdate({ phone: e.target.value || undefined })}
                placeholder="+52 55 0000 0000"
                className={`w-full text-[12px] pl-7 pr-2 py-1.5 rounded-md outline-none ${inputCls}`}
              />
            </div>
            <div className="relative">
              <Building2 size={11} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                value={data.website ?? ""}
                onChange={(e) => onUpdate({ website: e.target.value || undefined })}
                placeholder="https://sitio.com"
                className={`w-full text-[12px] pl-7 pr-2 py-1.5 rounded-md outline-none ${inputCls}`}
              />
            </div>
          </div>
        </Section>

        <Section label="Valor del prospecto" icon={<DollarSign size={12} />}>
          <input
            value={data.value ?? ""}
            onChange={(e) => onUpdate({ value: e.target.value || undefined })}
            placeholder="$12,500 MXN"
            className={`w-full text-[12px] px-2 py-1.5 rounded-md outline-none ${inputCls}`}
          />
        </Section>

        <Section label="Etiquetas" icon={<TagIcon size={12} />}>
          {(data.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {data.tags!.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${t.color}22`, color: t.color, border: `1px solid ${t.color}44` }}
                >
                  {t.label}
                  <button onClick={() => removeTag(t.id)} className="opacity-60 hover:opacity-100"><X size={9} /></button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1 mb-2">
            {PRESET_STATUS_TAGS.map((p) => (
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
              onKeyDown={(e) => { if (e.key === "Enter") { addTag(newTagLabel, newTagColor); setNewTagLabel(""); } }}
              className={`flex-1 text-[11px] px-2 py-1 rounded-md outline-none ${inputCls}`}
              placeholder="Nueva etiqueta"
            />
            <div className="relative flex items-center justify-center">
              <button
                onClick={() => setShowTagPicker(!showTagPicker)}
                className="w-5 h-5 rounded-full border "
                style={{ backgroundColor: newTagColor, borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }}
              />
              {showTagPicker && (
                <div className={`absolute bottom-full mb-2 -left-12 w-[120px] rounded-xl p-2.5 grid grid-cols-4 gap-1.5 z-50 ${isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-100"} shadow-sm`}>
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setNewTagColor(c); setShowTagPicker(false); }}
                      className={`w-6 h-6 rounded-full mx-auto border border-neutral-200/60 ${newTagColor === c ? "ring-2 ring-offset-1" : "hover:scale-110"}`}
                      style={{ backgroundColor: c, ["--tw-ring-color" as any]: c, ["--tw-ring-offset-color" as any]: isDark ? "#2C2C2E" : "#fff" }}
                    />
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => { addTag(newTagLabel, newTagColor); setNewTagLabel(""); }}
              className={`text-[11px] px-2 py-1 rounded-md ${ghostBtn}`}
            >
              <Plus size={11} />
            </button>
          </div>
        </Section>

        <Section label="Asignados" icon={<Users size={12} />}>
          {(data.assignees?.length ?? 0) > 0 && (
            <div className="space-y-1 mb-1.5">
              {data.assignees!.map((a) => (
                <div key={a.id} className={`flex items-center gap-2 px-2 py-1 rounded-md ${isDark ? "bg-white/5" : "bg-neutral-50"}`}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white shrink-0" style={{ backgroundColor: accentColor }}>
                    {initials(a.name || a.email || "")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium truncate">{a.name}</div>
                    {a.email && <div className="text-[10px] opacity-60 truncate">{a.email}</div>}
                  </div>
                  <button onClick={() => removeAssignee(a.id)} className="opacity-60 hover:opacity-100 hover:text-red-500"><X size={11} /></button>
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
                placeholder="correo (opcional)"
              />
            </div>
            <button onClick={addAssignee} className={`w-full text-[11px] py-1 rounded-md flex items-center justify-center gap-1 ${ghostBtn}`}>
              <Plus size={11} /> Agregar persona
            </button>
          </div>
        </Section>

        <Section label="Campos personalizados" icon={<ListPlus size={12} />}>
          {(data.fields?.length ?? 0) > 0 && (
            <div className="space-y-1 mb-1.5">
              {data.fields!.map((f) => (
                <div key={f.id} className={`flex items-center gap-1 px-1 py-1 rounded-md ${isDark ? "bg-white/5" : "bg-neutral-50"}`}>
                  <input
                    value={f.label}
                    onChange={(e) => updateField(f.id, { label: e.target.value })}
                    className={`w-[40%] text-[11px] px-1.5 py-0.5 rounded outline-none bg-transparent border ${isDark ? "border-white/10" : "border-neutral-200"}`}
                    placeholder="Campo"
                  />
                  <input
                    value={f.value}
                    onChange={(e) => updateField(f.id, { value: e.target.value })}
                    className={`flex-1 text-[11px] px-1.5 py-0.5 rounded outline-none bg-transparent border ${isDark ? "border-white/10" : "border-neutral-200"}`}
                    placeholder="Valor"
                  />
                  <button onClick={() => removeField(f.id)} className="opacity-60 hover:opacity-100 hover:text-red-500 px-1"><X size={11} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1">
            <input
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              className={`w-[40%] text-[11px] px-2 py-1 rounded-md outline-none ${inputCls}`}
              placeholder="Campo"
            />
            <input
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addField()}
              className={`flex-1 text-[11px] px-2 py-1 rounded-md outline-none ${inputCls}`}
              placeholder="Valor"
            />
            <button onClick={addField} className={`text-[11px] px-2 py-1 rounded-md ${ghostBtn}`}><Plus size={11} /></button>
          </div>
        </Section>
      </div>
    </div>,
    document.body,
  );
};

const Section = ({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="mb-4">
    <div className="flex items-center gap-1.5 text-[12px] font-semibold opacity-80 mb-2 border-b pb-1" style={{ borderColor: "rgba(150,150,150,0.15)" }}>
      {icon}{label}
    </div>
    {children}
  </div>
);

const PickerPopover = ({ colors, onPick, isDark }: { colors: { name: string; value: string }[]; onPick: (v: string) => void; isDark: boolean }) => (
  <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-xl p-2.5 grid grid-cols-5 gap-1.5 z-50 w-[150px] ${isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-100"} shadow-sm`}>
    {colors.map((c) => (
      <button
        key={c.value}
        onClick={() => onPick(c.value)}
        className="w-6 h-6 rounded-full border border-neutral-200/60 transition-transform hover:scale-110 relative overflow-hidden "
        style={{ backgroundColor: c.value === "transparent" ? "white" : c.value }}
        title={c.name}
      >
        {c.value === "transparent" && <div className="absolute inset-0 w-full h-[1.5px] top-1/2 bg-red-500 rotate-45" />}
      </button>
    ))}
  </div>
);

export default memo(ClientCardNode);

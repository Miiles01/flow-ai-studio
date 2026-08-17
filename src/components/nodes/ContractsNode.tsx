/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REGLA GLOBAL DE WIDGETS (Miiles)
 *  Widget de Contratos: tamaño fijo de hoja (no redimensionable), sin lazos,
 *  controles dentro de la hoja al pasar el cursor, sin divisores ni mayúsculas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { memo, useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useParams } from "react-router-dom";
import { type NodeProps, useReactFlow, useViewport, NodeResizer, NodeToolbar, Position } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Upload, ExternalLink, ImageIcon, PenLine, FileText, Video, Briefcase, Palette, Code, Shield, LayoutTemplate } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SignatureDialog from "@/components/contracts/SignatureDialog";
import SignatureFieldBox from "@/components/contracts/SignatureFieldBox";
import NodeExtendHandles from "@/components/nodes/NodeExtendHandles";
import WidgetCommentSlot from "@/components/nodes/WidgetCommentSlot";
import {
  CURRENCIES,
  PAGE_SIZES,
  PAGE_DIMENSIONS,
  readLogoAsDataUrl,
  syncContract,
  LOGO_POSITIONS,
  logoPositionClass,
  uid,
  fetchFieldSignatures,
  type SignatureField,
  type ContractPage,
  type ContractsNodeData,
  type LogoPosition,
} from "@/lib/contracts";
import ContractRichText from "@/lib/contractRichText";
import { repaginate } from "@/lib/contractPagination";
import { CONTRACT_TEMPLATES, TEMPLATE_CATEGORIES, templatePages, type ContractTemplate } from "@/lib/contractTemplates";




const CAT_ICONS: Record<string, any> = {
  "Creadores y marcas": Video,
  "Freelance": Briefcase,
  "Agencia": Briefcase,
  "Diseño": Palette,
  "Producto digital": Code,
  "Servicios": FileText,
  "Legal": Shield,
};

const ContractsNode = ({ id, data, selected }: NodeProps) => {
  const { isDark } = useTheme();
  
  // Variables dinámicas para matching con Figma
  const panelCls = isDark ? "bg-[#1C1C1E] border-white/10" : "bg-white border-gray-100";
  const hoverCls = isDark ? "hover:bg-white/10" : "hover:bg-gray-50";
  const textSubtle = isDark ? "text-white/40" : "text-gray-400";
  const textMuted = isDark ? "text-white/60" : "text-gray-500";
const textPrimary = isDark ? "text-white" : "text-gray-900";
  const pillCls = `px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${isDark ? "bg-white/10 border-white/10 text-white hover:bg-white/20 hover:border-white/20" : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"}`;

  const { setNodes } = useReactFlow();
  const { zoom } = useViewport();
  const { id: flowId } = useParams();
  const d = data as ContractsNodeData;

  const pages: ContractPage[] = d.pages?.length ? d.pages : [{ id: uid(), content: "" }];
  const dims = PAGE_DIMENSIONS[d.pageSize || "Carta"] ?? PAGE_DIMENSIONS.Carta;

  const [hovered, setHovered] = useState(false);
  const [activePage, setActivePage] = useState(0);

  const scrollToPage = (idx: number) => {
    setActivePage(idx);
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.clientHeight * idx, behavior: "smooth" });
    }
  };
  const [openMenu, setOpenMenu] = useState<"moneda" | "hoja" | "logo" | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [editing, setEditing] = useState(false);
  const [signingField, setSigningField] = useState<SignatureField | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pageIndex = Math.min(activePage, pages.length - 1);
  const signatureFields: SignatureField[] = d.signatureFields ?? [];
  const fieldSignatures = d.fieldSignatures ?? {};
  const logoPosition = d.logoPosition || "top-left";

  const update = (patch: Partial<ContractsNodeData>) =>
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));

  // Mantiene el tamaño exacto de hoja aunque cambie el formato.
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, style: { ...(n.style ?? {}), width: dims.width, height: dims.height } } : n
      )
    );
  }, [dims.width, dims.height, id, setNodes]);

  // Paginación automática: el contenido nunca desborda la hoja.
  useEffect(() => {
    if (editing) return;
    const t = setTimeout(() => {
      const next = repaginate(pages, dims);
      if (next) update({ pages: next });
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pages), dims.width, dims.height, editing]);

  // Sincroniza la versión pública del documento.
  useEffect(() => {
    const t = setTimeout(() => {
      void syncContract({ ...d, pages, signatureFields }, { nodeId: id, flowId });
    }, 900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    d.title,
    d.currency,
    d.pageSize,
    d.logoUrl,
    d.logoPosition,
    d.logoRepeat,
    JSON.stringify(pages),
    JSON.stringify(signatureFields),
    d.publicId,
  ]);

  // Trae las firmas guardadas (propias o de quien recibió el enlace) para verlas en el canvas.
  useEffect(() => {
    if (!d.publicId) return;
    let alive = true;
    const pull = async () => {
      const remote = await fetchFieldSignatures(d.publicId);
      if (!alive || !remote) return;
      if (JSON.stringify(remote) !== JSON.stringify(d.fieldSignatures ?? {})) {
        update({ fieldSignatures: remote });
      }
    };
    void pull();
    const t = setInterval(pull, 20000);
    return () => {
      alive = false;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.publicId, JSON.stringify(d.fieldSignatures ?? {})]);

  // Sincroniza la página activa con el scroll.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const pageH = el.clientHeight;
      const idx = Math.max(0, Math.min(pages.length - 1, Math.round(el.scrollTop / pageH)));
      setActivePage(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pages.length]);



  const setPageContent = (value: string) => {
    update({ pages: pages.map((p, i) => (i === pageIndex ? { ...p, content: value } : p)) });
  };

  const addPage = () => {
    const next = [...pages, { id: uid(), content: "" }];
    update({ pages: next });
    setTimeout(() => scrollToPage(next.length - 1), 10);
  };

  const removePage = (index: number) => {
    if (pages.length === 1) return;
    const next = pages.filter((_, i) => i !== index);
    update({ pages: next });
    setTimeout(() => scrollToPage(Math.max(0, Math.min(pageIndex, next.length - 1))), 10);
  };

  const addSignatureField = () => {
    update({
      signatureFields: [...signatureFields, { id: uid(), pageIndex, label: "Firma" }],
    });
  };

  const removeSignatureField = (fieldId: string) => {
    update({ signatureFields: signatureFields.filter((f) => f.id !== fieldId) });
  };

  /** Guarda la firma en el documento compartido; el canvas la refleja al instante. */
  const signField = async (field: SignatureField, payload: { name: string; email: string | null; dataUrl: string }) => {
    if (!d.publicId) return;
    await syncContract({ ...d, pages, signatureFields }, { nodeId: id, flowId });
    const { data: res, error } = await supabase.functions.invoke("sign-contract", {
      body: { publicId: d.publicId, fieldId: field.id, ...payload, signature: payload.dataUrl },
    });
    if (error || (res as any)?.error) return;
    update({
      fieldSignatures: {
        ...fieldSignatures,
        [field.id]: {
          name: payload.name,
          email: payload.email,
          dataUrl: payload.dataUrl,
          signedAt: new Date().toISOString(),
        },
      },
    });
  };

  const applyTemplate = (tpl: ContractTemplate, mode: "replace" | "append") => {
    const nuevas = templatePages(tpl);
    if (mode === "replace") {
      update({ title: tpl.title, pages: nuevas });
      setTimeout(() => scrollToPage(0), 10);
      return;
    }
    const conContenido = pages.filter((p) => p.content.trim().length > 0);
    const next = [...conContenido, ...nuevas];
    update({ pages: next });
    setTimeout(() => scrollToPage(conContenido.length - 1), 10);
  };

  const handleFile = async (file?: File | null) => {

    if (!file) return;
    if (!/image\/(png|jpeg|jpg|svg\+xml)/.test(file.type)) return;
    try {
      update({ logoUrl: await readLogoAsDataUrl(file) });
    } catch {
      /* imagen no válida */
    }
  };

  const openPublic = async () => {
    await syncContract({ ...d, pages, signatureFields }, { nodeId: id, flowId });
    window.open(`/contrato/${d.publicId}`, "_blank", "noopener");
  };

  return (
    <>
      <NodeResizer isVisible={!!selected} minWidth={dims.width} minHeight={dims.height} lineStyle={{ border: "none" }} />
      <AnimatePresence>
        {selected && (
          <NodeToolbar isVisible={true} position={Position.Top} offset={15}>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className={`flex items-center ${isDark ? "bg-[#1C1C1E]" : "bg-white"} border ${isDark ? "border-white/10" : "border-gray-100"} p-1 rounded-2xl shadow-sm`}
            >
              <button
                onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Eliminar widget"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          </NodeToolbar>
        )}
      </AnimatePresence>
      <div
      className="group/widget"
      style={{ width: "100%", height: "100%", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setOpenMenu(null);
        setShowTemplates(false);
      }}
    >
      {/* Zona para mover el widget */}
      <div
        className="absolute top-0 left-1/2 z-30 h-5 w-28 -translate-x-1/2 cursor-grab rounded-b-xl active:cursor-grabbing"
        title="Mover widget"
      >
        <div className="mx-auto mt-1.5 h-1.5 w-8 rounded-full bg-black/10 opacity-0 transition-opacity group-hover/widget:opacity-100" />
      </div>

      {/* Hoja */}
      <div
        className={`relative h-full w-full overflow-hidden rounded-2xl ${isDark ? "bg-[#111827]" : "bg-white"} shadow-sm`}
        style={{ boxShadow: selected ? "0 6px 24px -12px rgba(0,0,0,0.16)" : "0 2px 12px -8px rgba(0,0,0,0.12)" }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {/* Píldora Izquierda (Título y Páginas) */}
        <div
          className={`nodrag nopan absolute left-6 top-6 z-20 flex flex-col gap-0.5 rounded-xl ${isDark ? "bg-[#1C1C1E]/95" : "bg-white/95"} px-4 py-2.5 shadow-sm backdrop-blur-sm transition-all duration-200 border ${isDark ? "border-white/5" : "border-gray-100/50"} ${
            hovered ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
          }`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            value={d.title ?? "Contratos"}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Contratos"
            className={`w-48 bg-transparent text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} outline-none placeholder:text-gray-300`}
          />
          <span className={`text-[10px] font-medium ${textSubtle}`}>
            {pages.length} {pages.length === 1 ? "página" : "páginas"}
          </span>
        </div>

        {/* Píldora Derecha (Controles) */}
        <div
          className={`nodrag nopan absolute right-6 top-6 z-20 flex items-center gap-1 rounded-xl ${isDark ? "bg-[#1C1C1E]/95" : "bg-white/95"} p-1.5 shadow-sm backdrop-blur-sm transition-all duration-200 border ${isDark ? "border-white/5" : "border-gray-100/50"} ${
            hovered ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
          }`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative shrink-0">
            <button className={pillCls} onClick={() => setOpenMenu(openMenu === "moneda" ? null : "moneda")}>
              {d.currency || "MXN"}
            </button>
            {openMenu === "moneda" && (
              <Menu
                items={CURRENCIES}
                active={d.currency || "MXN"}
                onPick={(v) => {
                  update({ currency: v });
                  setOpenMenu(null);
                }}
              />
            )}
          </div>

          <div className="relative shrink-0">
            <button className={pillCls} onClick={() => setOpenMenu(openMenu === "hoja" ? null : "hoja")}>
              {d.pageSize || "Carta"}
            </button>
            {openMenu === "hoja" && (
              <Menu
                items={PAGE_SIZES}
                active={d.pageSize || "Carta"}
                onPick={(v) => {
                  update({ pageSize: v });
                  setOpenMenu(null);
                }}
              />
            )}
          </div>

          <div className="relative shrink-0">
            <button className={pillCls} onClick={() => setOpenMenu(openMenu === "logo" ? null : "logo")}>
              <span className="flex items-center gap-1.5">
                <ImageIcon size={13} strokeWidth={2} /> Logo
              </span>
            </button>
            {openMenu === "logo" && (
              <div className={`absolute right-0 top-full z-30 mt-2 w-[230px] rounded-2xl ${isDark ? "bg-[#1C1C1E]/95" : "bg-white/95"} p-1.5 shadow-sm backdrop-blur-sm border ${isDark ? "border-white/10" : "border-gray-100"}`}>
                <button
                  onClick={() => fileRef.current?.click()}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs ${isDark ? "text-white/70" : "text-gray-600"} ${isDark ? "hover:bg-white/10" : "hover:bg-gray-50"} ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}
                >
                  <Upload size={12} /> {d.logoUrl ? "Cambiar imagen" : "Subir imagen"}
                </button>
                <p className="px-3 pb-1 pt-2 text-[10px] font-light text-gray-300">Posición</p>
                {LOGO_POSITIONS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => update({ logoPosition: p.value })}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-gray-50 ${
                      logoPosition === p.value ? `bg-gray-50 ${isDark ? "text-white" : "text-gray-900"}` : isDark ? "text-white/60" : "text-gray-500"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <p className="px-3 pb-1 pt-2 text-[10px] font-light text-gray-300">Páginas</p>
                {[
                  { value: false, label: "Solo la primera hoja" },
                  { value: true, label: "Repetir en todas" },
                ].map((o) => (
                  <button
                    key={String(o.value)}
                    onClick={() => update({ logoRepeat: o.value })}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-gray-50 ${
                      !!d.logoRepeat === o.value ? `bg-gray-50 ${isDark ? "text-white" : "text-gray-900"}` : isDark ? "text-white/60" : "text-gray-500"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
                {d.logoUrl && (
                  <button
                    onClick={() => {
                      update({ logoUrl: undefined });
                      setOpenMenu(null);
                    }}
                    className={`mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs ${isDark ? "text-white/40" : "text-gray-400"} ${isDark ? "hover:bg-white/10" : "hover:bg-gray-50"} ${isDark ? "hover:text-white" : "hover:text-gray-900"}`}
                  >
                    <Trash2 size={12} /> Quitar logotipo
                  </button>
                )}
              </div>
            )}
          </div>

          <button onClick={addSignatureField} className={`${pillCls} shrink-0`} title="Insertar campo de firma">
            <span className="flex items-center gap-1.5">
              <PenLine size={13} strokeWidth={2} /> Firma
            </span>
          </button>

          <button onClick={openPublic} className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#111827] text-white hover:bg-gray-800 transition-colors shrink-0">
            <span className="flex items-center gap-1.5">
              <ExternalLink size={13} strokeWidth={2} /> Abrir
            </span>
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {dragOver && (
          <div className={`pointer-events-none absolute inset-4 z-20 flex items-center justify-center rounded-2xl border ${isDark ? "border-dashed border-white/20" : "border-dashed border-gray-300"} bg-black/5 text-xs font-light ${isDark ? "text-white/60" : "text-gray-500"}`}>
            Suelta aquí tu logotipo
          </div>
        )}

        {/* Contenido de la hoja - scroll vertical entre páginas */}
        <div ref={scrollRef} className="nowheel nodrag nopan h-full overflow-y-auto contract-scrollbar" onWheelCapture={(e) => e.stopPropagation()}>
          {pages.map((p, i) => (
            <div key={p.id} className="relative flex h-full flex-col px-14 pb-24 pt-32">
              {(i === 0 || d.logoRepeat) &&
                (d.logoUrl ? (
                  <img
                    src={d.logoUrl}
                    alt="Logotipo del documento"
                    className={`absolute z-10 max-h-16 max-w-[160px] object-contain ${logoPositionClass(logoPosition)}`}
                  />
                ) : (
                  i === 0 && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`nodrag nopan absolute z-10 flex h-14 w-14 items-center justify-center rounded-xl text-gray-400 opacity-0 transition-opacity duration-200 group-hover/widget:opacity-30 ${logoPositionClass(logoPosition)}`}
                      title="Subir logotipo (JPG, PNG o SVG)"
                    >
                      <ImageIcon size={20} />
                    </button>
                  )
                ))}
              {i === 0 && (
                <h2 className={`mb-8 text-[26px] font-medium leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                  {d.title?.trim() || "Contratos"}
                </h2>
              )}
              {editing && pageIndex === i ? (
                <textarea
                  autoFocus
                  value={p.content ?? ""}
                  onChange={(e) => setPageContent(e.target.value)}
                  onBlur={() => setEditing(false)}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder="Escribe aquí el contenido"
                  className={`nodrag nopan min-h-0 flex-1 resize-none bg-transparent text-[13.5px] font-light leading-[1.85] ${isDark ? "text-white/90" : "text-gray-800"} outline-none ${isDark ? "placeholder:text-white/20" : "placeholder:text-gray-300"}`}
                />
              ) : (
                <div
                  onClick={() => {
                    scrollToPage(i);
                    setEditing(true);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`nodrag nopan min-h-0 flex-1 cursor-text overflow-hidden text-[13.5px] font-light leading-[1.85] ${isDark ? "text-white/90" : "text-gray-800"}`}
                >
                  {p.content?.trim() ? (
                    <ContractRichText content={p.content} isDark={isDark} />
                  ) : (
                    <span className={isDark ? "text-white/30" : "text-gray-300"}>
                      Escribe aquí el contenido
                    </span>
                  )}
                </div>
              )}
              {signatureFields.filter((f) => f.pageIndex === i).length > 0 && (
                <div className="mt-6 flex flex-wrap gap-6">
                  {signatureFields
                    .filter((f) => f.pageIndex === i)
                    .map((f) => (
                      <SignatureFieldBox
                        key={f.id}
                        label={f.label}
                        signature={fieldSignatures[f.id]}
                        onClick={fieldSignatures[f.id] ? undefined : () => setSigningField(f)}
                        onRemove={() => removeSignatureField(f.id)}
                      />
                    ))}
                </div>
              )}
              <div className="absolute bottom-6 left-0 right-0 text-center text-[11px] font-light text-gray-300">
                Página {i + 1} de {pages.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plantillas */}
      <div
        className={`nodrag nopan absolute top-6 z-30 flex items-start transition-all duration-200 ${
          hovered ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-2 opacity-0"
        }`}
        style={{
          right: "100%",
          marginRight: 14 / zoom,
          transform: `scale(${1 / zoom})`,
          transformOrigin: "right top",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {!showTemplates ? (
            <motion.div
              key="btn"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`flex flex-col overflow-hidden rounded-2xl ${isDark ? "bg-[#1C1C1E]/95" : "bg-white/95"} shadow-sm backdrop-blur-sm border ${isDark ? "border-white/5" : "border-gray-100/50"}`}
            >
            <button
              onClick={() => setShowTemplates(true)}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 ${isDark ? "text-white/60" : "text-gray-500"} ${isDark ? "hover:text-white" : "hover:text-gray-900"} transition-colors`}
            >
              <span className={`text-[10px] font-medium ${isDark ? "text-white/70" : "text-gray-600"}`}>Plantillas</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isDark ? "bg-white/10" : "bg-gray-50"} ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "hover:bg-white/20" : "hover:bg-gray-100"}`}>
                <FileText size={16} strokeWidth={2} />
              </div>
            </button>
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className={`flex flex-col overflow-hidden rounded-2xl ${isDark ? "bg-[#1C1C1E]/95" : "bg-white/95"} shadow-sm backdrop-blur-sm border ${isDark ? "border-white/5" : "border-gray-100/50"}`}
            >
            <div
              className="nowheel flex flex-col w-[200px] max-h-[520px] overflow-y-auto p-2"
              onWheelCapture={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 pb-2 pt-1">
                <p className={`text-[11px] font-medium ${isDark ? "text-white/60" : "text-gray-500"}`}>Plantillas</p>
              </div>
              <div className="flex flex-col gap-0.5">
                {CONTRACT_TEMPLATES.map((t) => {
                  const Icon = CAT_ICONS[t.category] || FileText;
                  return (
                    <div key={t.id} className="group/tpl relative">
                      <button
                        onClick={() => applyTemplate(t, "replace")}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left ${isDark ? "hover:bg-white/10" : "hover:bg-gray-50"} transition-colors`}
                        title="Reemplazar el documento con esta plantilla"
                      >
                        <div className={`flex shrink-0 items-center justify-center ${isDark ? "text-white/40" : "text-gray-400"} ${isDark ? "text-white/60 group-hover/tpl:text-white/90" : "text-gray-400 group-hover/tpl:text-gray-600"}`}>
                          <Icon size={14} strokeWidth={2} />
                        </div>
                        <span className={`block text-xs font-medium ${isDark ? "text-white/80" : "text-gray-700"}`}>{t.name}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          applyTemplate(t, "append");
                        }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 hidden rounded-full p-1.5 text-gray-400 hover:bg-white dark:hover:bg-slate-700 ${isDark ? "hover:text-white" : "hover:text-gray-900"} group-hover/tpl:block shadow-sm border ${isDark ? "border-white/5" : "border-gray-100/50"}`}
                        title="Añadir al final del documento"
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navegador de páginas */}

      <div
        className={`nodrag nopan nowheel absolute top-1/2 z-30 flex flex-col items-center gap-2.5 rounded-lg ${isDark ? "bg-[#1C1C1E]/90" : "bg-white/90"} p-2 shadow-sm backdrop-blur-sm transition-all duration-200 border ${isDark ? "border-white/5" : "border-gray-100/50"} max-h-[320px] overflow-y-auto contract-scrollbar ${
          hovered ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-2 opacity-0"
        }`}
        style={{
          left: "100%",
          marginLeft: 14 / zoom,
          transform: `translateY(-50%) scale(${1 / zoom})`,
          transformOrigin: "left center",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onWheelCapture={(e) => e.stopPropagation()}
      >
        {pages.map((p, i) => (
          <div key={p.id} className="group/page relative">
            <button
              onClick={() => scrollToPage(i)}
              className={`flex h-16 w-12 flex-col justify-between overflow-hidden rounded-sm p-1.5 transition-colors border ${
                i === pageIndex ? `${isDark ? "bg-white/10" : "bg-gray-50"} ${isDark ? "border-white/30" : "border-gray-900"} ${isDark ? "ring-1 ring-white/30" : "ring-1 ring-gray-900"}` : `${isDark ? "bg-[#1C1C1E]" : "bg-white"} ${isDark ? "border-white/10" : "border-gray-100"}/50 ${isDark ? "hover:bg-white/10" : "hover:bg-gray-50"} ${isDark ? "hover:border-white/20" : "hover:border-gray-200"}`
              }`}
              title={`Página ${i + 1}`}
            >
              <span className="line-clamp-3 text-left w-full text-[4px] font-light leading-[1.6] text-gray-400">
                {p.content?.trim() || " "}
              </span>
              <span className={`w-full text-center text-[10px] font-bold ${i === pageIndex ? (isDark ? "text-white" : "text-gray-900") : isDark ? "text-white/80" : "text-gray-700"}`}>
                {i + 1}
              </span>
            </button>
            {pages.length > 1 && (
              <button
                onClick={() => removePage(i)}
                className={`absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full ${isDark ? "bg-white/10 text-white/60" : "bg-white text-gray-500"} shadow-md border ${isDark ? "border-white/10" : "border-gray-100"} hover:text-red-500 group-hover/page:flex transition-colors`}
                title="Eliminar página"
              >
                <Trash2 size={8} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addPage}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm ${isDark ? "text-white/40" : "text-gray-400"} transition-colors border ${isDark ? "border-dashed border-white/20" : "border-dashed border-gray-300"} ${isDark ? "hover:bg-white/10" : "hover:bg-gray-50"} ${isDark ? "hover:text-white" : "hover:text-gray-900"} ${isDark ? "hover:border-white/30" : "hover:border-gray-400"}`}
          title="Añadir página"
        >
          <Plus size={12} />
        </button>
      </div>

      <SignatureDialog
        open={!!signingField}
        label={signingField?.label}
        onClose={() => setSigningField(null)}
        onConfirm={async (payload) => {
          if (signingField) await signField(signingField, payload);
        }}
      />

      <NodeExtendHandles nodeId={id} />
      <WidgetCommentSlot nodeId={id} />
    </div>
    </>
  );
};

const Menu = ({ items, active, onPick }: { items: string[]; active: string; onPick: (v: string) => void }) => {
  const { isDark } = useTheme();
  return (
  <div className={`absolute right-0 top-full z-30 mt-2 w-[140px] rounded-2xl ${isDark ? "bg-[#1C1C1E]/95" : "bg-white/95"} p-1.5 shadow-sm backdrop-blur-sm`}>
    {items.map((it) => (
      <button
        key={it}
        onClick={() => onPick(it)}
        className={`block w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-gray-50 ${
          it === active ? `bg-gray-50 ${isDark ? "text-white" : "text-gray-900"}` : isDark ? "text-white/60" : "text-gray-500"
        }`}
      >
        {it}
      </button>
    ))}
  </div>
  );
};

export default memo(ContractsNode);

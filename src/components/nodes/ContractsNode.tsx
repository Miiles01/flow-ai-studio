/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REGLA GLOBAL DE WIDGETS (Miiles)
 *  Widget de Contratos: tamaño fijo de hoja (no redimensionable), sin lazos,
 *  controles dentro de la hoja al pasar el cursor, sin divisores ni mayúsculas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { memo, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { type NodeProps, useReactFlow, useViewport } from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Plus, Upload, ExternalLink, ImageIcon } from "lucide-react";
import NodeExtendHandles from "@/components/nodes/NodeExtendHandles";
import WidgetCommentSlot from "@/components/nodes/WidgetCommentSlot";
import {
  CURRENCIES,
  PAGE_SIZES,
  PAGE_DIMENSIONS,
  readLogoAsDataUrl,
  syncContract,
  uid,
  type ContractPage,
  type ContractsNodeData,
  type LogoPosition,
} from "@/lib/contracts";

const LOGO_POSITIONS: { value: LogoPosition; label: string }[] = [
  { value: "top-left", label: "Arriba a la izquierda" },
  { value: "top-right", label: "Arriba a la derecha" },
  { value: "bottom-left", label: "Abajo a la izquierda" },
  { value: "bottom-right", label: "Abajo a la derecha" },
];

const logoClass = (pos: LogoPosition) => {
  switch (pos) {
    case "top-right":
      return "top-10 right-12";
    case "bottom-left":
      return "bottom-12 left-12";
    case "bottom-right":
      return "bottom-12 right-12";
    default:
      return "top-10 left-12";
  }
};

const ContractsNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const { zoom } = useViewport();
  const { id: flowId } = useParams();
  const d = data as ContractsNodeData;

  const pages: ContractPage[] = d.pages?.length ? d.pages : [{ id: uid(), content: "" }];
  const dims = PAGE_DIMENSIONS[d.pageSize || "Carta"] ?? PAGE_DIMENSIONS.Carta;

  const [hovered, setHovered] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [openMenu, setOpenMenu] = useState<"moneda" | "hoja" | "logo" | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const page = pages[Math.min(activePage, pages.length - 1)];

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

  // Sincroniza la versión pública del documento.
  useEffect(() => {
    const t = setTimeout(() => {
      void syncContract({ ...d, pages }, { nodeId: id, flowId });
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.title, d.currency, d.pageSize, d.logoUrl, d.logoPosition, JSON.stringify(pages), d.publicId]);

  const setPageContent = (value: string) => {
    const next = pages.map((p, i) => (i === activePage ? { ...p, content: value } : p));
    update({ pages: next });
  };

  const addPage = () => {
    const next = [...pages, { id: uid(), content: "" }];
    update({ pages: next });
    setActivePage(next.length - 1);
  };

  const removePage = (index: number) => {
    if (pages.length === 1) return;
    const next = pages.filter((_, i) => i !== index);
    update({ pages: next });
    setActivePage((p) => Math.max(0, Math.min(p, next.length - 1)));
  };

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!/image\/(png|jpeg|jpg|svg\+xml)/.test(file.type)) return;
    try {
      const url = await readLogoAsDataUrl(file);
      update({ logoUrl: url });
    } catch {
      /* imagen no válida */
    }
  };

  const openPublic = async () => {
    await syncContract({ ...d, pages }, { nodeId: id, flowId });
    window.open(`/contrato/${d.publicId}`, "_blank", "noopener");
  };

  const chip =
    "px-3 py-1.5 rounded-full text-[12px] font-normal text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors";

  return (
    <div
      className="group/widget"
      style={{ width: "100%", height: "100%", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setOpenMenu(null);
      }}
    >
      {/* Zona para mover el widget */}
      <div
        className="absolute top-0 left-1/2 z-30 h-5 w-28 -translate-x-1/2 cursor-grab rounded-b-xl active:cursor-grabbing"
        title="Mover widget"
      >
        <div className="mx-auto mt-1.5 h-1.5 w-8 rounded-full bg-black/15 opacity-0 transition-opacity group-hover/widget:opacity-100" />
      </div>

      {/* Hoja */}
      <div
        className="relative w-full h-full rounded-[10px] bg-white overflow-hidden flex flex-col"
        style={{
          boxShadow: selected
            ? "0 18px 40px -12px rgba(0,0,0,0.18)"
            : "0 10px 30px -14px rgba(0,0,0,0.14)",
        }}
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
        {/* Controles dentro de la hoja */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="nodrag nopan absolute top-3 left-3 right-3 z-20 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 backdrop-blur"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                value={d.title ?? "Contratos"}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Contratos"
                className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
              />
              <span className="shrink-0 text-[12px] font-light text-neutral-400">
                {pages.length} {pages.length === 1 ? "página" : "páginas"}
              </span>

              <div className="relative shrink-0">
                <button className={chip} onClick={() => setOpenMenu(openMenu === "moneda" ? null : "moneda")}>
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
                <button className={chip} onClick={() => setOpenMenu(openMenu === "hoja" ? null : "hoja")}>
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
                <button className={chip} onClick={() => setOpenMenu(openMenu === "logo" ? null : "logo")}>
                  Logotipo
                </button>
                {openMenu === "logo" && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-[230px] rounded-2xl bg-white p-2 shadow-lg">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12.5px] text-neutral-700 hover:bg-neutral-100"
                    >
                      <Upload size={13} /> Subir imagen
                    </button>
                    {LOGO_POSITIONS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => {
                          update({ logoPosition: p.value });
                          setOpenMenu(null);
                        }}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12.5px] hover:bg-neutral-100 ${
                          (d.logoPosition || "top-left") === p.value ? "text-neutral-900" : "text-neutral-500"
                        }`}
                      >
                        <ImageIcon size={13} /> {p.label}
                      </button>
                    ))}
                    {d.logoUrl && (
                      <button
                        onClick={() => {
                          update({ logoUrl: undefined });
                          setOpenMenu(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[12.5px] text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={13} /> Quitar logotipo
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={openPublic}
                className="shrink-0 rounded-full bg-black px-3 py-1.5 text-[12px] font-normal text-white transition-colors hover:bg-neutral-800"
              >
                <span className="flex items-center gap-1.5">
                  <ExternalLink size={12} /> Abrir
                </span>
              </button>

              <button
                onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))}
                className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                title="Eliminar"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Logotipo */}
        {d.logoUrl && (
          <img
            src={d.logoUrl}
            alt="Logotipo del documento"
            className={`absolute z-10 max-h-16 max-w-[160px] object-contain ${logoClass(d.logoPosition || "top-left")}`}
          />
        )}

        {dragOver && (
          <div className="absolute inset-4 z-20 flex items-center justify-center rounded-2xl bg-neutral-50/90 text-[13px] font-light text-neutral-500">
            Suelta aquí tu logotipo
          </div>
        )}

        {/* Contenido de la hoja */}
        <div className="flex-1 overflow-hidden px-12 pb-16 pt-24">
          {activePage === 0 && (
            <h2 className="mb-8 text-[26px] font-normal leading-tight text-neutral-900">
              {d.title?.trim() || "Contratos"}
            </h2>
          )}
          <textarea
            value={page?.content ?? ""}
            onChange={(e) => setPageContent(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Escribe aquí el contenido del contrato o pídeselo a la inteligencia artificial."
            className="nodrag nopan h-full w-full resize-none bg-transparent text-[13.5px] font-light leading-[1.85] text-neutral-800 outline-none placeholder:text-neutral-300"
          />
        </div>

        <div className="absolute bottom-5 left-0 right-0 text-center text-[11px] font-light text-neutral-300">
          Página {Math.min(activePage, pages.length - 1) + 1} de {pages.length}
        </div>
      </div>

      {/* Navegador de páginas */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="nodrag nopan absolute top-0 z-30 flex flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-lg backdrop-blur"
            style={{ left: "100%", marginLeft: 12 / zoom, transform: `scale(${1 / zoom})`, transformOrigin: "top left" }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {pages.map((p, i) => (
              <div key={p.id} className="group/page relative">
                <button
                  onClick={() => setActivePage(i)}
                  className={`h-14 w-11 rounded-lg text-[11px] font-light transition-colors ${
                    i === activePage ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  }`}
                >
                  {i + 1}
                </button>
                {pages.length > 1 && (
                  <button
                    onClick={() => removePage(i)}
                    className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-white text-red-500 shadow group-hover/page:flex"
                    title="Eliminar página"
                  >
                    <Trash2 size={9} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addPage}
              className="flex h-9 w-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200"
              title="Añadir página"
            >
              <Plus size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <NodeExtendHandles nodeId={id} />
      <WidgetCommentSlot nodeId={id} />
    </div>
  );
};

const Menu = ({ items, active, onPick }: { items: string[]; active: string; onPick: (v: string) => void }) => (
  <div className="absolute right-0 top-full z-30 mt-2 w-[140px] rounded-2xl bg-white p-1.5 shadow-lg">
    {items.map((it) => (
      <button
        key={it}
        onClick={() => onPick(it)}
        className={`block w-full rounded-xl px-3 py-2 text-left text-[12.5px] hover:bg-neutral-100 ${
          it === active ? "text-neutral-900" : "text-neutral-500"
        }`}
      >
        {it}
      </button>
    ))}
  </div>
);

export default memo(ContractsNode);

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
import ContractRichText from "@/lib/contractRichText";
import { repaginate } from "@/lib/contractPagination";
import { CONTRACT_TEMPLATES, TEMPLATE_CATEGORIES, templatePages, type ContractTemplate } from "@/lib/contractTemplates";


const LOGO_POSITIONS: { value: LogoPosition; label: string }[] = [
  { value: "top-left", label: "Arriba a la izquierda" },
  { value: "top-right", label: "Arriba a la derecha" },
  { value: "bottom-left", label: "Abajo a la izquierda" },
  { value: "bottom-right", label: "Abajo a la derecha" },
];

const cornerClass = (pos: LogoPosition) => {
  switch (pos) {
    case "top-right":
      return "top-12 right-12";
    case "bottom-left":
      return "bottom-14 left-12";
    case "bottom-right":
      return "bottom-14 right-12";
    default:
      return "top-12 left-12";
  }
};

const PILL =
  "px-3 py-1.5 rounded-full text-xs font-normal bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-600 hover:text-gray-900 transition-colors";

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
  const [editing, setEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pageIndex = Math.min(activePage, pages.length - 1);
  const page = pages[pageIndex];
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
      void syncContract({ ...d, pages }, { nodeId: id, flowId });
    }, 900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.title, d.currency, d.pageSize, d.logoUrl, d.logoPosition, JSON.stringify(pages), d.publicId]);

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

  // Cuando cambia la página activa desde la sidebar, scrolla suavemente a ella.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pageH = el.clientHeight;
    el.scrollTo({ top: pageH * pageIndex, behavior: "smooth" });
  }, [pageIndex]);

  const setPageContent = (value: string) => {
    update({ pages: pages.map((p, i) => (i === pageIndex ? { ...p, content: value } : p)) });
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

  const applyTemplate = (tpl: ContractTemplate, mode: "replace" | "append") => {
    const nuevas = templatePages(tpl);
    if (mode === "replace") {
      update({ title: tpl.title, pages: nuevas });
      setActivePage(0);
      return;
    }
    const conContenido = pages.filter((p) => p.content.trim().length > 0);
    const next = [...conContenido, ...nuevas];
    update({ pages: next });
    setActivePage(conContenido.length);
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
    await syncContract({ ...d, pages }, { nodeId: id, flowId });
    window.open(`/contrato/${d.publicId}`, "_blank", "noopener");
  };

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
        <div className="mx-auto mt-1.5 h-1.5 w-8 rounded-full bg-black/10 opacity-0 transition-opacity group-hover/widget:opacity-100" />
      </div>

      {/* Hoja */}
      <div
        className="relative h-full w-full overflow-hidden rounded-2xl bg-white shadow-sm"
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
        {/* Barra de configuración dentro de la hoja */}
        <div
          className={`nodrag nopan absolute left-6 right-6 top-6 z-20 flex items-center gap-2 transition-all duration-200 ${
            hovered ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
          }`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            value={d.title ?? "Contratos"}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Contratos"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-300"
          />
          <span className="shrink-0 text-xs font-light text-gray-500">
            {pages.length} {pages.length === 1 ? "página" : "páginas"}
          </span>

          <div className="relative shrink-0">
            <button className={PILL} onClick={() => setOpenMenu(openMenu === "moneda" ? null : "moneda")}>
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
            <button className={PILL} onClick={() => setOpenMenu(openMenu === "hoja" ? null : "hoja")}>
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

          <button onClick={openPublic} className={`${PILL} shrink-0`}>
            <span className="flex items-center gap-1.5">
              <ExternalLink size={11} /> Abrir
            </span>
          </button>

          <button
            onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))}
            className="shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
            title="Eliminar"
          >
            <Trash2 size={12} />
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

        {/* Logotipo */}
        <div className={`nodrag nopan absolute z-10 ${cornerClass(logoPosition)}`} onMouseDown={(e) => e.stopPropagation()}>
          {d.logoUrl ? (
            <button onClick={() => setOpenMenu(openMenu === "logo" ? null : "logo")} title="Posición del logotipo">
              <img src={d.logoUrl} alt="Logotipo del documento" className="max-h-16 max-w-[160px] object-contain" />
            </button>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-14 w-14 items-center justify-center rounded-xl text-gray-400 opacity-0 transition-opacity duration-200 group-hover/widget:opacity-30"
              title="Subir logotipo"
            >
              <ImageIcon size={20} />
            </button>
          )}

          {openMenu === "logo" && (
            <div
              className={`absolute z-30 mt-2 w-[220px] rounded-2xl bg-white/95 p-1.5 shadow-sm backdrop-blur-sm ${
                logoPosition.includes("right") ? "right-0" : "left-0"
              } ${logoPosition.startsWith("bottom") ? "bottom-full mb-2" : "top-full"}`}
            >
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Upload size={12} /> Cambiar imagen
              </button>
              {LOGO_POSITIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    update({ logoPosition: p.value });
                    setOpenMenu(null);
                  }}
                  className={`block w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-gray-50 ${
                    logoPosition === p.value ? "bg-gray-50 text-gray-900" : "text-gray-500"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => {
                  update({ logoUrl: undefined });
                  setOpenMenu(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-900"
              >
                <Trash2 size={12} /> Quitar logotipo
              </button>
            </div>
          )}
        </div>

        {dragOver && (
          <div className="pointer-events-none absolute inset-4 z-20 flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-black/5 text-xs font-light text-gray-500">
            Suelta aquí tu logotipo
          </div>
        )}

        {/* Contenido de la hoja - scroll vertical entre páginas */}
        <div ref={scrollRef} className="nodrag nopan h-full overflow-y-auto">
          {pages.map((p, i) => (
            <div key={p.id} className="relative flex h-full flex-col px-12 pb-16 pt-24">
              {i === 0 && (
                <h2 className="mb-8 text-[26px] font-medium leading-tight text-gray-900">
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
                  placeholder="Escribe aquí el contenido del contrato o pídeselo a la inteligencia artificial. Usa **negritas**, - viñetas, 1. listas y [texto](enlace)."
                  className="nodrag nopan min-h-0 flex-1 resize-none bg-transparent text-[13.5px] font-light leading-[1.85] text-gray-800 outline-none placeholder:text-gray-300"
                />
              ) : (
                <div
                  onClick={() => {
                    setActivePage(i);
                    setEditing(true);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="nodrag nopan min-h-0 flex-1 cursor-text overflow-hidden text-[13.5px] font-light leading-[1.85] text-gray-800"
                >
                  {p.content?.trim() ? (
                    <ContractRichText content={p.content} />
                  ) : (
                    <span className="text-gray-300">
                      Escribe aquí el contenido del contrato o pídeselo a la inteligencia artificial.
                    </span>
                  )}
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
        className={`nodrag nopan absolute top-1/2 z-30 w-[230px] max-h-[520px] overflow-y-auto rounded-2xl bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-all duration-200 ${
          hovered ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-2 opacity-0"
        }`}
        style={{
          right: "100%",
          marginRight: 14 / zoom,
          transform: `translateY(-50%) scale(${1 / zoom})`,
          transformOrigin: "right center",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="px-3 pb-1 pt-2 text-xs font-light text-gray-500">Plantillas</p>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <div key={cat} className="pb-1">
            <p className="px-3 py-1 text-[10px] font-light text-gray-300">{cat}</p>
            {CONTRACT_TEMPLATES.filter((t) => t.category === cat).map((t) => (
              <div key={t.id} className="group/tpl relative">
                <button
                  onClick={() => applyTemplate(t, "replace")}
                  className="block w-full rounded-xl px-3 py-2 text-left hover:bg-gray-50"
                  title="Reemplazar el documento con esta plantilla"
                >
                  <span className="block text-xs text-gray-700">{t.name}</span>
                  <span className="mt-0.5 block text-[10px] font-light leading-snug text-gray-400">{t.description}</span>
                </button>
                <button
                  onClick={() => applyTemplate(t, "append")}
                  className="absolute right-2 top-2 hidden rounded-full p-1 text-gray-400 hover:bg-white hover:text-gray-900 group-hover/tpl:block"
                  title="Añadir al final del documento"
                >
                  <Plus size={11} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Navegador de páginas */}

      <div
        className={`nodrag nopan absolute top-1/2 z-30 flex flex-col items-center gap-2 rounded-2xl bg-white/90 p-2 shadow-sm backdrop-blur-sm transition-all duration-200 ${
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
      >
        {pages.map((p, i) => (
          <div key={p.id} className="group/page relative">
            <button
              onClick={() => setActivePage(i)}
              className={`flex h-16 w-12 flex-col justify-between overflow-hidden rounded-lg p-1.5 text-left transition-colors ${
                i === pageIndex ? "bg-gray-50 ring-1 ring-gray-200" : "bg-white hover:bg-gray-50"
              }`}
              title={`Página ${i + 1}`}
            >
              <span className="line-clamp-3 text-[4.5px] font-light leading-[1.6] text-gray-400">
                {p.content?.trim() || " "}
              </span>
              <span className={`text-[9px] font-light ${i === pageIndex ? "text-gray-900" : "text-gray-400"}`}>
                {i + 1}
              </span>
            </button>
            {pages.length > 1 && (
              <button
                onClick={() => removePage(i)}
                className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm hover:text-gray-900 group-hover/page:flex"
                title="Eliminar página"
              >
                <Trash2 size={8} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addPage}
          className="flex h-8 w-12 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
          title="Añadir página"
        >
          <Plus size={12} />
        </button>
      </div>

      <NodeExtendHandles nodeId={id} />
      <WidgetCommentSlot nodeId={id} />
    </div>
  );
};

const Menu = ({ items, active, onPick }: { items: string[]; active: string; onPick: (v: string) => void }) => (
  <div className="absolute right-0 top-full z-30 mt-2 w-[140px] rounded-2xl bg-white/95 p-1.5 shadow-sm backdrop-blur-sm">
    {items.map((it) => (
      <button
        key={it}
        onClick={() => onPick(it)}
        className={`block w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-gray-50 ${
          it === active ? "bg-gray-50 text-gray-900" : "text-gray-500"
        }`}
      >
        {it}
      </button>
    ))}
  </div>
);

export default memo(ContractsNode);

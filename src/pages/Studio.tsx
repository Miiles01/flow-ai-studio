import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dashboardI18n from "@/i18n";
const dt = (key: string, options?: Record<string, unknown>): string => dashboardI18n.t(key, options) as string;
import { StudioGridSkeleton } from "@/components/PageSkeletons";
import { useStudioTemplates } from "@/hooks/useStudioTemplates";
import { DiscoveriesBoard } from "@/components/discoveries/DiscoveriesBoard";
import StudioLibraryCard from "@/components/studio/StudioLibraryCard";
import MyPages from "@/components/studio/MyPages";
import StudioComponentCard from "@/components/studio/StudioComponentCard";
import { COMPONENT_CATEGORIES, STUDIO_COMPONENTS, type StudioComponent } from "@/lib/studioComponents";
import i18n, { pickLang } from "@/i18n";


type SeccionProps = {
  items: StudioComponent[];
  categorias: { id: string; es: string; en: string; pt?: string }[];
  titulo: { es: string; en: string; pt?: string };
  subtitulo: { es: string; en: string; pt?: string };
  etiqueta?: { es: string; en: string; pt?: string };   // opcional: si no hay, no se muestra
};

/** Sección de animaciones (Escenas o Componentes): pills por categoría, dos filas y «Ver más». */
function SeccionAnimaciones({ items, categorias, titulo, subtitulo, etiqueta }: SeccionProps) {
  // Solo dos filas al inicio (3 columnas en desktop, 2 en tablet y móvil); «Ver más» muestra el resto
  const [showAllComponents, setShowAllComponents] = useState(false);
  const [componentCols, setComponentCols] = useState(() => (window.matchMedia("(min-width: 1024px)").matches ? 3 : 2));
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setComponentCols(mq.matches ? 3 : 2);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const L = <T,>(o: { es: T; en: T; pt?: T }) => pickLang(o, i18n.language);
  // Filtros por categoría (solo las que ya tienen elementos)
  const [componentFilter, setComponentFilter] = useState<string | null>(null);
  const componentCategories = categorias.filter((cat) => items.some((c) => c.category === cat.id));
  const filteredComponents = componentFilter ? items.filter((c) => c.category === componentFilter) : items;
  const firstRows = componentCols * 2;
  // Fila bajo el cursor: sus previews se reproducen juntas (desktop y tablet); las demás quedan quietas
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const shownComponents = showAllComponents ? filteredComponents : filteredComponents.slice(0, firstRows);
  if (items.length === 0) return null;

  return (
      <section className="space-y-6">
        <div>
          {etiqueta && (
            <span className="mb-3 inline-flex rounded-full bg-black px-3 py-1 text-xs font-normal text-white dark:border dark:border-white/10">
              {L(etiqueta)}
            </span>
          )}
          <h2 className="text-xl md:text-2xl font-medium text-foreground">{L(titulo)}</h2>
          <p className="mt-1 text-sm font-light text-muted-foreground">{L(subtitulo)}</p>
        </div>
        {componentCategories.length > 1 && (
          // Pills de filtro (mismo estilo que el resto del dashboard)
          <div className="-mx-8 flex gap-2 overflow-x-auto px-8 pb-1 scrollbar-hide md:mx-0 md:px-0" role="group" aria-label={L({ es: "Filtrar por categoría", en: "Filter by category", pt: "Filtrar por categoria" })}>
            {[{ id: null as string | null, es: "Todas", en: "All", pt: "Todas" }, ...componentCategories].map((cat) => {
              const active = componentFilter === cat.id;
              return (
                <button
                  key={cat.id ?? "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => { setComponentFilter(cat.id); setShowAllComponents(false); }}
                  className={`flex-none rounded-full px-4 py-2 text-sm font-light transition-colors ${active ? "border border-foreground bg-foreground text-background" : "border border-miiles-gray-200 bg-transparent text-black dark:border-white/15 dark:text-white"}`}
                >
                  {L(cat)}
                </button>
              );
            })}
          </div>
        )}
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">{pickLang({ es: "Muy pronto", en: "Coming soon", pt: "Em breve" }, i18n.language)}</p>
        ) : (
          // Tres columnas en desktop, dos en tablet y en móvil (los marcos de celular son angostos)
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 pt-2" onMouseLeave={() => setHoveredRow(null)}>
            {shownComponents.map((c, i) => (
              <motion.div
                key={`${componentFilter ?? "all"}-${c.slug}`}
                initial={i >= firstRows ? { y: 12, opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i >= firstRows ? (i - firstRows) * 0.06 : 0, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                onMouseEnter={() => setHoveredRow(Math.floor(i / componentCols))}
              >
                <StudioComponentCard c={c} playing={hoveredRow === Math.floor(i / componentCols)} />
              </motion.div>
            ))}
          </div>
        )}
        {filteredComponents.length > firstRows && (
          // A la derecha, debajo de la última tarjeta de la fila
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAllComponents((v) => !v)}
              aria-expanded={showAllComponents}
              className="rounded-full bg-black px-6 py-2.5 text-sm font-normal text-white transition-colors hover:bg-miiles-pink dark:border dark:border-white/10 dark:hover:bg-zinc-900"
            >
              {showAllComponents ? L({ es: "Ver menos", en: "Show less", pt: "Ver menos" }) : L({ es: "Ver más", en: "Show more", pt: "Ver mais" })}
            </button>
          </div>
        )}
      </section>

  );
}

export default function Studio() {
  useTranslation();
  const { templates, loading } = useStudioTemplates();
  const list = templates;
  // Escenas (partes de un Reel) van en su propia sección, antes de Componentes
  const escenas = STUDIO_COMPONENTS.filter((c) => c.category === "Escena");
  const componentes = STUDIO_COMPONENTS.filter((c) => c.category !== "Escena");

  return (
    <div className="p-8 md:px-12 md:pb-12 md:pt-24 max-w-5xl mx-auto space-y-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-normal text-foreground">{dt("dashboard.text65")}</h1>
      </div>

      <MyPages />

      {/* Arquitectura logarítmica */}
      <section className="space-y-6">
        <div className="mb-2">
          <h2 className="text-xl md:text-2xl font-medium text-foreground">{dt("dashboard.text66")}</h2>
        </div>
        <DiscoveriesBoard />
      </section>

      {/* Escenas: partes de un Reel (pantalla dividida, gráficas, libro…) que se copian como prompt */}
      <SeccionAnimaciones
        items={escenas}
        categorias={COMPONENT_CATEGORIES.filter((cat) => cat.id === "Escena")}
        titulo={{ es: "Escenas", en: "Scenes", pt: "Cenas" }}
        subtitulo={{ es: "Partes de un Reel listas para copiar y pegar en tu asistente de IA", en: "Reel parts ready to copy and paste into your AI assistant", pt: "Partes de um Reel prontas para copiar e colar no seu assistente de IA" }}
        etiqueta={{ es: "Nuevo", en: "New", pt: "Novo" }}
      />

      {/* Componentes: animaciones de video y otros assets que se copian como prompt */}
      <SeccionAnimaciones
        items={componentes}
        categorias={COMPONENT_CATEGORIES.filter((cat) => cat.id !== "Escena")}
        titulo={{ es: "Componentes", en: "Components", pt: "Componentes" }}
        subtitulo={{ es: "Animaciones de video listas para copiar y pegar en tu asistente de IA", en: "Video animations ready to copy and paste into your AI assistant", pt: "Animações de vídeo prontas para copiar e colar no seu assistente de IA" }}
      />

      {/* Librería */}
      <section className="space-y-6">
        <div className="flex flex-wrap gap-4 justify-between items-end">
          <div>
            <h2 className="text-xl md:text-2xl font-medium text-foreground">{dt("dashboard.text67")}</h2>
          </div>
        </div>

        {loading ? (
          <StudioGridSkeleton />
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">{dt("dashboard.text68")}</p>
        ) : (
          // Dos columnas en desktop (con el sidebar abierto o cerrado) y tablet; una sola en móvil
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10 pt-2">
            {list.map((t) => <StudioLibraryCard key={t.id} t={t} />)}
          </div>
        )}
      </section>
    </div>
  );
}

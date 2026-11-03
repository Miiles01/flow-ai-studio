import { useTranslation } from "react-i18next";
import dashboardI18n from "@/i18n";
const dt = (key: string, options?: Record<string, unknown>): string => dashboardI18n.t(key, options) as string;
import { StudioGridSkeleton } from "@/components/PageSkeletons";
import { useStudioTemplates } from "@/hooks/useStudioTemplates";
import { DiscoveriesBoard } from "@/components/discoveries/DiscoveriesBoard";
import StudioLibraryCard from "@/components/studio/StudioLibraryCard";
import MyPages from "@/components/studio/MyPages";
import StudioComponentCard from "@/components/studio/StudioComponentCard";
import { STUDIO_COMPONENTS } from "@/lib/studioComponents";
import i18n from "@/i18n";


export default function Studio() {
  useTranslation();
  const { templates, loading } = useStudioTemplates();
  const list = templates;

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

      {/* Componentes: animaciones de video y otros assets que se copian como prompt */}
      <section className="space-y-6">
        <div>
          <span className="mb-3 inline-flex rounded-full bg-black px-3 py-1 text-xs font-normal text-white dark:border dark:border-white/10">
            {(i18n.language || "es").startsWith("en") ? "Coming soon" : "Próximo lanzamiento"}
          </span>
          <h2 className="text-xl md:text-2xl font-medium text-foreground">{(i18n.language || "es").startsWith("en") ? "Components" : "Componentes"}</h2>
          <p className="mt-1 text-sm font-light text-muted-foreground">
            {(i18n.language || "es").startsWith("en")
              ? "Video animations ready to copy and paste into your AI assistant"
              : "Animaciones de video listas para copiar y pegar en tu asistente de IA"}
          </p>
        </div>
        {STUDIO_COMPONENTS.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">{(i18n.language || "es").startsWith("en") ? "Coming soon" : "Muy pronto"}</p>
        ) : (
          // Tres columnas en desktop, dos en tablet y en móvil (los marcos de celular son angostos)
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 pt-2">
            {STUDIO_COMPONENTS.map((c) => <StudioComponentCard key={c.slug} c={c} />)}
          </div>
        )}
      </section>

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

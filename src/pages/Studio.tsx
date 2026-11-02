import { useTranslation } from "react-i18next";
import dashboardI18n from "@/i18n";
const dt = (key: string, options?: Record<string, unknown>): string => dashboardI18n.t(key, options) as string;
import { StudioGridSkeleton } from "@/components/PageSkeletons";
import { useStudioTemplates } from "@/hooks/useStudioTemplates";
import { DiscoveriesBoard } from "@/components/discoveries/DiscoveriesBoard";
import StudioLibraryCard from "@/components/studio/StudioLibraryCard";
import MyPages from "@/components/studio/MyPages";


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

import { StudioGridSkeleton } from "@/components/PageSkeletons";
import { useStudioTemplates } from "@/hooks/useStudioTemplates";
import { DiscoveriesBoard } from "@/components/discoveries/DiscoveriesBoard";
import StudioCard from "@/components/studio/StudioCard";


export default function Studio() {
  const { templates, loading } = useStudioTemplates();
  const list = templates;

  return (
    <div className="p-8 md:px-12 md:pb-12 md:pt-48 max-w-5xl mx-auto space-y-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-normal text-foreground">Estudio</h1>
      </div>

      {/* Arquitectura logarítmica */}
      <section className="space-y-6">
        <div className="mb-2">
          <h2 className="text-xl md:text-2xl font-medium text-foreground">Arquitectura logarítmica</h2>
          <p className="text-sm font-light text-miiles-gray-400 mt-1">
            Aprende sobre los logaritmos de cada red y cómo eligen qué mostrar.
          </p>
        </div>
        <DiscoveriesBoard />
      </section>

      {/* Librería */}
      <section className="space-y-6">
        <div className="flex flex-wrap gap-4 justify-between items-end">
          <div>
            <h2 className="text-xl md:text-2xl font-medium text-foreground">Librería</h2>
            <p className="text-sm font-light text-miiles-gray-400 mt-1">
              Plantillas para tu portafolio o embudo de ventas.
            </p>
          </div>
        </div>

        {loading ? (
          <StudioGridSkeleton />
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Aún no hay plantillas aquí.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {list.map((t) => <StudioCard key={t.id} t={t} />)}
          </div>
        )}
      </section>
    </div>
  );
}

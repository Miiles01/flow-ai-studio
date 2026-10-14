import { StudioGridSkeleton } from "@/components/PageSkeletons";
import { useState } from "react";
import { useStudioTemplates } from "@/hooks/useStudioTemplates";
import { useTheme } from "@/contexts/ThemeContext";
import { DiscoveriesBoard } from "@/components/discoveries/DiscoveriesBoard";
import StudioCard from "@/components/studio/StudioCard";

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "portfolio", label: "Portafolios" },
  { key: "website", label: "Páginas web" },
];

export default function Studio() {
  const { templates, loading } = useStudioTemplates();
  const { isDark } = useTheme();
  const [filter, setFilter] = useState("all");
  const list = filter === "all" ? templates : templates.filter((t) => t.kind === filter);

  return (
    <div className="p-8 md:px-12 md:pb-12 md:pt-48 max-w-5xl mx-auto space-y-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-normal text-foreground">Estudio</h1>
        <p className="text-sm font-light text-muted-foreground mt-1">
          Aprende cómo deciden los algoritmos y arma tu presentación con plantillas de portafolio o embudo de ventas.
        </p>
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
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-light transition-colors ${
                  filter === f.key
                    ? "bg-foreground text-background"
                    : isDark
                      ? "bg-white/10 text-white/60"
                      : "bg-background text-miiles-gray-400 shadow-sm"
                }`}
              >
                {f.label}
              </button>
            ))}
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

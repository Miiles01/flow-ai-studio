import { useMemo } from "react";
import { SECTORS, CATEGORIES, type ProspectCategory } from "@/data/prospect-categories";

type Prospect = {
  industry?: string | null;
  tags?: string[];
  notes?: string | null;
  company?: string | null;
};

type Props = {
  prospects: Prospect[];
  activeCategory: string | null;
  onFilter: (categoryId: string | null) => void;
};

function matchesCategory(prospect: Prospect, cat: ProspectCategory): boolean {
  const haystack = [
    prospect.industry ?? "",
    prospect.company ?? "",
    prospect.notes ?? "",
    ...(prospect.tags ?? []),
  ].join(" ").toLowerCase();
  return cat.keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

export default function ProspectBrain({ prospects, activeCategory, onFilter }: Props) {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      map[cat.id] = prospects.filter((p) => matchesCategory(p, cat)).length;
    }
    return map;
  }, [prospects]);

  const sectorTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const sector of SECTORS) {
      map[sector.id] = CATEGORIES
        .filter((c) => c.sectorId === sector.id)
        .reduce((sum, c) => sum + (counts[c.id] ?? 0), 0);
    }
    return map;
  }, [counts]);

  const activeCount = activeCategory ? (counts[activeCategory] ?? 0) : prospects.length;
  const activeSector = activeCategory
    ? SECTORS.find((s) => s.id === CATEGORIES.find((c) => c.id === activeCategory)?.sectorId)
    : null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 mb-1">
      {/* Mesh background */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 20% 10%, hsl(260 30% 12% / 1) 0%, hsl(222 20% 7% / 1) 65%)"
      }} />
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }} />
      {/* Faint glow orbs */}
      {activeSector && (
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${activeSector.color}15 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="relative p-5 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {SECTORS.map((s) => (
                <div key={s.id} className="w-1.5 h-1.5 rounded-full opacity-70" style={{ backgroundColor: s.color }} />
              ))}
            </div>
            <div>
              <span className="text-xs font-medium text-white/80 tracking-wide">Mapa de Categorías</span>
              <span className="ml-2 text-xs text-white/30">100 categorías · {prospects.length} prospectos</span>
            </div>
          </div>
          {activeCategory && (
            <button
              onClick={() => onFilter(null)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/60 hover:text-white/90 hover:bg-white/10 transition-all"
            >
              <span style={{ color: activeSector?.color }}>●</span>
              {activeCount} resultado{activeCount !== 1 ? "s" : ""}
              <span className="ml-1 opacity-50">× limpiar</span>
            </button>
          )}
        </div>

        {/* Sector grid */}
        <div className="grid grid-cols-2 gap-3">
          {SECTORS.map((sector) => {
            const cats = CATEGORIES.filter((c) => c.sectorId === sector.id);
            const total = sectorTotals[sector.id] ?? 0;
            const hasActive = activeCategory
              ? cats.some((c) => c.id === activeCategory)
              : false;

            return (
              <div
                key={sector.id}
                className="rounded-xl p-3.5 transition-all duration-200"
                style={{
                  background: hasActive ? `${sector.color}12` : sector.bgColor,
                  border: `1px solid ${hasActive ? sector.color + "50" : sector.borderColor}`,
                }}
              >
                {/* Sector header */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sector.color, boxShadow: `0 0 6px ${sector.color}80` }}
                  />
                  <span className="text-[11px] font-medium text-white/70 tracking-wide uppercase">
                    {sector.label}
                  </span>
                  {total > 0 && (
                    <span
                      className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${sector.color}20`, color: sector.color }}
                    >
                      {total}
                    </span>
                  )}
                </div>

                {/* Category chips */}
                <div className="flex flex-wrap gap-1">
                  {cats.map((cat) => {
                    const count = counts[cat.id] ?? 0;
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => onFilter(isActive ? null : cat.id)}
                        className="text-[11px] px-2 py-0.5 rounded-full border transition-all duration-150 select-none"
                        style={
                          isActive
                            ? {
                                backgroundColor: `${sector.color}22`,
                                borderColor: `${sector.color}70`,
                                color: sector.color,
                                boxShadow: `0 0 10px ${sector.color}30`,
                              }
                            : {
                                backgroundColor: "rgba(255,255,255,0.04)",
                                borderColor: "rgba(255,255,255,0.08)",
                                color: count > 0 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)",
                              }
                        }
                      >
                        {cat.label}
                        {count > 0 && (
                          <span
                            className="ml-1 text-[9px]"
                            style={{ opacity: isActive ? 0.9 : 0.45 }}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

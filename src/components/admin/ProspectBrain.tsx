import { useMemo, useState, useEffect, useRef } from "react";
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

// Posiciones de nodos en el SVG — diseño de cerebro de dos lóbulos
const NODE_POS: Record<string, { x: number; y: number }> = {
  beauty:   { x: 88,  y: 54  },
  wellness: { x: 56,  y: 118 },
  food:     { x: 90,  y: 182 },
  fashion:  { x: 168, y: 208 },
  tech:     { x: 162, y: 44  },
  home:     { x: 472, y: 54  },
  services: { x: 504, y: 118 },
  sustain:  { x: 470, y: 182 },
  mexico:   { x: 392, y: 208 },
  emerging: { x: 398, y: 44  },
};

const CENTER = { x: 280, y: 126 };

// Conexiones entre nodos adyacentes
const CONNECTIONS: [string, string][] = [
  ["beauty",   "wellness"],
  ["wellness", "food"],
  ["food",     "fashion"],
  ["fashion",  "tech"],
  ["tech",     "beauty"],
  ["home",     "services"],
  ["services", "sustain"],
  ["sustain",  "mexico"],
  ["mexico",   "emerging"],
  ["emerging", "home"],
  ["tech",     "emerging"],
  ["fashion",  "mexico"],
  ["beauty",   "home"],
  ["food",     "sustain"],
  ["wellness", "services"],
];

// Contador con animación de conteo
function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); prev.current = 0; return; }
    const start = prev.current;
    const duration = 900;
    const startTime = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (t < 1) requestAnimationFrame(animate);
      else prev.current = value;
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{display.toLocaleString("es-MX")}</>;
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

  const maxSectorTotal = Math.max(...Object.values(sectorTotals), 1);
  const activeCount = activeCategory ? (counts[activeCategory] ?? 0) : prospects.length;
  const activeSector = activeCategory
    ? SECTORS.find((s) => s.id === CATEGORIES.find((c) => c.id === activeCategory)?.sectorId)
    : null;

  const nodeRadius = (sectorId: string) => {
    const t = sectorTotals[sectorId] ?? 0;
    if (t === 0) return 8;
    return 8 + (t / maxSectorTotal) * 14;
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[hsl(222,20%,7%)] mb-1">

      {/* ── Stats header ───────────────────────────────────── */}
      <div className="px-5 pt-5 pb-2 flex items-start gap-6">
        <div className="shrink-0">
          <div className="text-[40px] leading-none font-light text-white tabular-nums tracking-tight">
            <AnimatedCount value={prospects.length} />
          </div>
          <div className="text-[11px] text-white/50 mt-1.5 font-light">
            Prospectos en red · {SECTORS.length} sectores
          </div>
        </div>

        <div className="flex-1 grid grid-cols-5 gap-x-3 gap-y-2.5 pt-1">
          {SECTORS.map((s) => {
            const t = sectorTotals[s.id] ?? 0;
            const pct = Math.round((t / Math.max(prospects.length, 1)) * 100);
            return (
              <div key={s.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/25 truncate leading-none">
                    {s.label.split(" ")[0]}
                  </span>
                  <span
                    className="text-[9px] tabular-nums font-medium"
                    style={{ color: t > 0 ? s.color : "rgba(255,255,255,0.15)" }}
                  >
                    {t}
                  </span>
                </div>
                <div className="h-[2px] rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: s.color, opacity: t > 0 ? 0.85 : 0 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SVG Cerebro ────────────────────────────────────── */}
      <div className="relative px-3 pb-1">
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }} />
        {/* Glow del sector activo */}
        {activeSector && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-700" style={{
            background: `radial-gradient(ellipse at 50% 50%, ${activeSector.color}15 0%, transparent 65%)`,
          }} />
        )}

        <svg viewBox="0 0 560 248" className="w-full relative" style={{ maxHeight: 210 }}>
          <defs>
            {SECTORS.map((s) => (
              <radialGradient key={s.id} id={`ng-${s.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Líneas centro → cada nodo */}
          {SECTORS.map((s) => {
            const pos = NODE_POS[s.id];
            if (!pos) return null;
            const t = sectorTotals[s.id] ?? 0;
            const isActive = activeSector?.id === s.id;
            return (
              <line
                key={`c-${s.id}`}
                x1={CENTER.x} y1={CENTER.y} x2={pos.x} y2={pos.y}
                stroke={isActive ? s.color : t > 0 ? s.color : "rgba(255,255,255,0.06)"}
                strokeWidth={isActive ? 1.5 : t > 0 ? 0.7 : 0.4}
                strokeDasharray={t > 0 ? undefined : "3 5"}
                opacity={isActive ? 0.85 : t > 0 ? 0.28 : 0.15}
              />
            );
          })}

          {/* Líneas entre nodos adyacentes */}
          {CONNECTIONS.map(([a, b]) => {
            const pA = NODE_POS[a], pB = NODE_POS[b];
            if (!pA || !pB) return null;
            const active = (sectorTotals[a] ?? 0) > 0 && (sectorTotals[b] ?? 0) > 0;
            return (
              <line
                key={`${a}-${b}`}
                x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y}
                stroke={active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)"}
                strokeWidth={active ? 0.6 : 0.3}
              />
            );
          })}

          {/* Nodo central */}
          <circle cx={CENTER.x} cy={CENTER.y} r={prospects.length > 0 ? 28 : 18}
            fill="rgba(255,255,255,0.05)"
            stroke={activeSector ? activeSector.color : "rgba(255,255,255,0.18)"}
            strokeWidth="1"
          />
          <circle cx={CENTER.x} cy={CENTER.y} r={prospects.length > 0 ? 38 : 26}
            fill="none"
            stroke={activeSector ? activeSector.color : "rgba(255,255,255,0.05)"}
            strokeWidth="0.5"
          />
          <text x={CENTER.x} y={CENTER.y - 5} textAnchor="middle" dominantBaseline="middle"
            fill="white" fontSize="12" fontWeight="300" opacity="0.75">
            {prospects.length > 0 ? prospects.length : "—"}
          </text>
          <text x={CENTER.x} y={CENTER.y + 9} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="300">
            total
          </text>

          {/* Nodos de sector */}
          {SECTORS.map((s) => {
            const pos = NODE_POS[s.id];
            if (!pos) return null;
            const t = sectorTotals[s.id] ?? 0;
            const r = nodeRadius(s.id);
            const isActive = activeSector?.id === s.id;
            const labelBelow = pos.y >= CENTER.y;

            return (
              <g key={s.id}>
                {(t > 0 || isActive) && (
                  <circle cx={pos.x} cy={pos.y} r={r + 12} fill={`url(#ng-${s.id})`} />
                )}
                <circle
                  cx={pos.x} cy={pos.y} r={r}
                  fill={t > 0 ? `${s.color}20` : "rgba(255,255,255,0.03)"}
                  stroke={isActive ? s.color : t > 0 ? `${s.color}70` : "rgba(255,255,255,0.09)"}
                  strokeWidth={isActive ? 2 : 1}
                />
                <circle
                  cx={pos.x} cy={pos.y} r={t > 0 ? 3 : 1.5}
                  fill={t > 0 ? s.color : "rgba(255,255,255,0.18)"}
                  opacity={t > 0 ? 0.9 : 0.4}
                />
                <text
                  x={pos.x} y={labelBelow ? pos.y + r + 10 : pos.y - r - 5}
                  textAnchor="middle"
                  fill={t > 0 ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)"}
                  fontSize="7.5" fontWeight="400"
                >
                  {s.label.split(" ")[0]}
                </text>
                {t > 0 && (
                  <text
                    x={pos.x} y={labelBelow ? pos.y + r + 20 : pos.y - r - 14}
                    textAnchor="middle"
                    fill={s.color} fontSize="7" opacity="0.7"
                  >
                    {t}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Grid de sectores (filtro) ───────────────────────── */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        {SECTORS.map((sector) => {
          const cats = CATEGORIES.filter((c) => c.sectorId === sector.id);
          const total = sectorTotals[sector.id] ?? 0;
          const isActiveSector = activeSector?.id === sector.id;

          return (
            <div
              key={sector.id}
              className="rounded-xl p-3 transition-all duration-200"
              style={{
                background: isActiveSector ? `${sector.color}0e` : "rgba(255,255,255,0.025)",
                border: `1px solid ${isActiveSector ? sector.color + "40" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: sector.color,
                    boxShadow: total > 0 ? `0 0 5px ${sector.color}70` : "none",
                  }}
                />
                <span className="text-[10px] font-medium text-white/45 tracking-wide">{sector.label}</span>
                {total > 0 && (
                  <span
                    className="ml-auto text-[9px] font-medium px-1.5 py-0.5 rounded-full tabular-nums"
                    style={{ backgroundColor: `${sector.color}18`, color: sector.color }}
                  >
                    {total}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {cats.map((cat) => {
                  const count = counts[cat.id] ?? 0;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onFilter(isActive ? null : cat.id)}
                      className="text-[10px] px-1.5 py-0.5 rounded-full border transition-all duration-150"
                      style={
                        isActive
                          ? { backgroundColor: `${sector.color}20`, borderColor: `${sector.color}60`, color: sector.color }
                          : {
                              backgroundColor: "rgba(255,255,255,0.03)",
                              borderColor: "rgba(255,255,255,0.07)",
                              color: count > 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.18)",
                            }
                      }
                    >
                      {cat.label}
                      {count > 0 && <span className="ml-1 opacity-40" style={{ fontSize: 9 }}>{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filtro activo ───────────────────────────────────── */}
      {activeCategory && (
        <div className="px-4 pb-4 -mt-1">
          <button
            onClick={() => onFilter(null)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-white/08 bg-white/[0.03] text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
          >
            <span style={{ color: activeSector?.color }}>●</span>
            {activeCount} resultado{activeCount !== 1 ? "s" : ""} · limpiar filtro
          </button>
        </div>
      )}
    </div>
  );
}

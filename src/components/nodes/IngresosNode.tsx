/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REGLA GLOBAL DE WIDGETS (Miiles) — LEE ESTO ANTES DE EDITAR
 * ═══════════════════════════════════════════════════════════════════════════
 *  Los WIDGETS (Kanban, ClientCard, Campaigns, Ingresos y futuros)
 *  comparten esta lógica:
 *  1. Son nodos de React Flow arrastrables/redimensionables con toolbar
 *     flotante (fondo, color de texto, eliminar) y NodeExtendHandles.
 *  2. **NO CONECTAN LAZOS/EDGES.** No renderizan `<Handle>` de React Flow.
 *
 *  IngresosNode — dashboard financiero. NO tiene data propia (más allá de
 *  título/subtítulo/rango). Deriva TODO desde los CampaignsNode presentes
 *  en el canvas: `data.campaigns[]` de cada nodo `campaignsNode`.
 *  Cambios en Campañas se reflejan aquí automáticamente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { memo, useMemo, useState, useRef } from "react";
import { type NodeProps, NodeResizer, useReactFlow, useViewport, useNodes } from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Trash2, Palette, Baseline, Heading1, Heading2, DollarSign, BarChart3,
  TrendingUp, Calendar, RotateCcw, ArrowUpRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import NodeExtendHandles from "@/components/nodes/NodeExtendHandles";
import type { Campaign } from "@/components/nodes/CampaignsNode";

export type IngresosNodeData = {
  title?: string;
  showTitle?: boolean;
  subtitle?: string;
  showSubtitle?: boolean;
  fromMonth?: string; // "YYYY-MM"
  toMonth?: string;   // "YYYY-MM"
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
};

const RAINBOW_COLORS = [
  { name: "Transparente", value: "transparent" },
  { name: "Rojo", value: "#EF4444" },
  { name: "Naranja", value: "#F97316" },
  { name: "Amarillo", value: "#FACC15" },
  { name: "Verde", value: "#22C55E" },
  { name: "Azul", value: "#4059F1" },
  { name: "Morado", value: "#A855F7" },
  { name: "Rosa", value: "#FCB5B9" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Negro", value: "#1F2937" },
];
const TEXT_COLORS = [
  { name: "Negro", value: "#111827" },
  { name: "Gris", value: "#6B7280" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Azul", value: "#2563EB" },
];

const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_FULL = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const fmtMoney = (n: number) =>
  `$ ${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(Math.round(n || 0))}`;

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const parseKey = (k?: string): { y: number; m: number } | null => {
  if (!k) return null;
  const [y, m] = k.split("-").map(Number);
  if (!y || !m) return null;
  return { y, m: m - 1 };
};
const keyLabel = (k?: string) => {
  const p = parseKey(k);
  if (!p) return "Selecciona mes";
  return `${MONTHS_FULL[p.m]} ${p.y}`;
};
const keyShort = (k: string) => {
  const p = parseKey(k);
  if (!p) return k;
  return `${MONTHS_SHORT[p.m]} ${String(p.y).slice(2)}`;
};

// Campaign date -> which month it "closes" in
const campaignMonthKey = (c: Campaign): string | null => {
  if (c.closeMonth) return c.closeMonth; // if set explicitly
  const withDate = (c.installments ?? []).find((i) => i.date);
  if (withDate?.date) {
    const d = new Date(withDate.date);
    if (!isNaN(d.getTime())) return monthKey(d);
  }
  if (c.createdAt) {
    const d = new Date(c.createdAt);
    return monthKey(d);
  }
  return null;
};

const IngresosNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes, getNodes } = useReactFlow();
  const { zoom } = useViewport();
  const { isDark } = useTheme();
  const allNodes = useNodes();
  const d = data as IngresosNodeData;

  const isSingleSelected = selected && getNodes().filter((n) => n.selected).length === 1;

  const bgColor = d.backgroundColor ?? (isDark ? "#2C2C2E" : "#FFFFFF");
  const txt = d.textColor ?? (isDark ? "#F5F5F7" : "#111827");
  const accent = d.accentColor ?? "#4059F1";
  const subtle = isDark ? "text-white/60" : "text-neutral-500";
  const border = isDark ? "border-white/10" : "border-neutral-200";
  const softSurface = isDark ? "bg-white/[0.03] border border-white/10" : "bg-white border border-neutral-200";
  const inputCls = isDark ? "bg-white/10 border border-white/10 text-white placeholder:text-white/40" : "bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400";

  const [bgOpen, setBgOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const update = (patch: Partial<IngresosNodeData>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...(n.data as any), ...patch } } : n)));
  };
  const remove = () => setNodes((nds) => nds.filter((n) => n.id !== id));

  // ── derive campaigns from canvas ─────────────────────────
  const allCampaigns: Campaign[] = useMemo(() => {
    const out: Campaign[] = [];
    for (const n of allNodes) {
      if (n.type === "campaignsNode") {
        const arr = ((n.data as any)?.campaigns ?? []) as Campaign[];
        for (const c of arr) out.push(c);
      }
    }
    return out;
  }, [allNodes]);

  // ── filter by date range ─────────────────────────────────
  const rangeCampaigns = useMemo(() => {
    const from = parseKey(d.fromMonth);
    const to = parseKey(d.toMonth);
    return allCampaigns.filter((c) => {
      const mk = campaignMonthKey(c);
      if (!mk) return true;
      const p = parseKey(mk);
      if (!p) return true;
      const val = p.y * 12 + p.m;
      if (from && val < from.y * 12 + from.m) return false;
      if (to && val > to.y * 12 + to.m) return false;
      return true;
    });
  }, [allCampaigns, d.fromMonth, d.toMonth]);

  const currentYear = new Date().getFullYear();

  // ── stats ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalRange = rangeCampaigns.reduce((s, c) => s + (c.amount || 0), 0);
    const totalHistoric = allCampaigns.reduce((s, c) => s + (c.amount || 0), 0);

    const paid = rangeCampaigns
      .filter((c) => (c as any).paidAt || c.status === "Completada")
      .reduce((s, c) => s + (c.amount || 0), 0);
    const pending = totalRange - paid;

    // By month
    const byMonth = new Map<string, number>();
    for (const c of rangeCampaigns) {
      const mk = campaignMonthKey(c);
      if (!mk) continue;
      byMonth.set(mk, (byMonth.get(mk) ?? 0) + (c.amount || 0));
    }
    const monthsInRange: string[] = [];
    const from = parseKey(d.fromMonth) ?? { y: currentYear - 1, m: 7 };
    const to = parseKey(d.toMonth) ?? { y: currentYear, m: new Date().getMonth() };
    let cy = from.y, cm = from.m;
    while (cy < to.y || (cy === to.y && cm <= to.m)) {
      monthsInRange.push(`${cy}-${String(cm + 1).padStart(2, "0")}`);
      cm++;
      if (cm > 11) { cm = 0; cy++; }
      if (monthsInRange.length > 24) break;
    }
    const chartData = monthsInRange.map((k) => ({
      key: k,
      label: keyShort(k),
      value: byMonth.get(k) ?? 0,
    }));

    const avgMonthly = monthsInRange.length ? totalRange / monthsInRange.length : 0;
    let topMonth: { key: string; value: number } | null = null;
    for (const [k, v] of byMonth) {
      if (!topMonth || v > topMonth.value) topMonth = { key: k, value: v };
    }

    // Top brands
    const byBrand = new Map<string, number>();
    for (const c of rangeCampaigns) {
      const b = (c.brand || "Sin nombre").trim() || "Sin nombre";
      byBrand.set(b, (byBrand.get(b) ?? 0) + (c.amount || 0));
    }
    const brands = Array.from(byBrand.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Pending list grouped by estimated date
    const pendingList = rangeCampaigns.filter((c) => !(c as any).paidAt && c.status !== "Completada");
    const grouped = new Map<string, Campaign[]>();
    for (const c of pendingList) {
      const withDate = (c.installments ?? []).find((i) => i.date);
      const label = withDate?.date
        ? new Date(withDate.date).toLocaleDateString("es-MX", { month: "long", year: "numeric" })
        : "Sin Fecha Estimada";
      const arr = grouped.get(label) ?? [];
      arr.push(c);
      grouped.set(label, arr);
    }

    return { totalRange, totalHistoric, paid, pending, chartData, avgMonthly, topMonth, brands, grouped };
  }, [rangeCampaigns, allCampaigns, d.fromMonth, d.toMonth, currentYear]);

  // ── toggle paid on a campaign ────────────────────────────
  const togglePaid = (campaignId: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.type !== "campaignsNode") return n;
        const arr = ((n.data as any)?.campaigns ?? []) as Campaign[];
        if (!arr.some((c) => c.id === campaignId)) return n;
        const next = arr.map((c) =>
          c.id === campaignId ? { ...c, paidAt: (c as any).paidAt ? undefined : Date.now() } : c
        );
        return { ...n, data: { ...(n.data as any), campaigns: next } };
      })
    );
  };

  const toolbarScale = Math.min(1.4, Math.max(0.7, 1 / zoom));
  const donutColors = ["#4059F1", "#A855F7", "#22C55E", "#F97316", "#EF4444", "#FCB5B9"];

  return (
    <div
      className="relative w-full h-full group/handle"
      style={{
        backgroundColor: bgColor,
        color: txt,
        borderRadius: 20,
        boxShadow: selected
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)"
          : "0 4px 12px -1px rgba(0,0,0,0.015), 0 2px 4px -1px rgba(0,0,0,0.01)",
      }}
    >
      <NodeResizer minWidth={640} minHeight={520} isVisible={!!selected} lineStyle={{ borderColor: accent, borderWidth: 1.5 }} handleStyle={{ backgroundColor: accent, width: 8, height: 8, borderRadius: 2, border: `2px solid ${bgColor}` }} />
      <NodeExtendHandles nodeId={id} />

      {/* Drag handle */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-20 cursor-grab active:cursor-grabbing">
        <div className={`w-10 h-1.5 rounded-full transition-opacity ${isDark ? "bg-white/20" : "bg-neutral-300"} opacity-0 group-hover/handle:opacity-100`} />
      </div>

      {/* Floating toolbar */}
      <AnimatePresence>
        {isSingleSelected && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            className="absolute z-40 nodrag nopan"
            style={{ top: -14 - 44 * toolbarScale, left: "50%", transform: `translateX(-50%) scale(${toolbarScale})`, transformOrigin: "bottom center" }}
          >
            <div className={`flex items-center gap-1 px-2 py-1.5 rounded-xl shadow-xl ${isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-200"}`}>
              <ToolBtn active={d.showTitle !== false} onClick={() => update({ showTitle: !(d.showTitle !== false) })} title="Título" isDark={isDark}><Heading1 size={14} /></ToolBtn>
              <ToolBtn active={!!d.showSubtitle} onClick={() => update({ showSubtitle: !d.showSubtitle })} title="Subtítulo" isDark={isDark}><Heading2 size={14} /></ToolBtn>
              <div className={`w-px h-4 mx-0.5 ${isDark ? "bg-white/10" : "bg-neutral-200"}`} />
              <div className="relative">
                <ToolBtn onClick={() => { setBgOpen((v) => !v); setTextOpen(false); }} title="Fondo" isDark={isDark}><Palette size={14} /></ToolBtn>
                {bgOpen && <PickerPopover colors={RAINBOW_COLORS} onPick={(v) => { update({ backgroundColor: v === "transparent" ? undefined : v }); setBgOpen(false); }} isDark={isDark} />}
              </div>
              <div className="relative">
                <ToolBtn onClick={() => { setTextOpen((v) => !v); setBgOpen(false); }} title="Texto" isDark={isDark}><Baseline size={14} /></ToolBtn>
                {textOpen && <PickerPopover colors={TEXT_COLORS} onPick={(v) => { update({ textColor: v }); setTextOpen(false); }} isDark={isDark} />}
              </div>
              <div className={`w-px h-4 mx-0.5 ${isDark ? "bg-white/10" : "bg-neutral-200"}`} />
              <ToolBtn onClick={remove} title="Eliminar" isDark={isDark} danger><Trash2 size={14} /></ToolBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="w-full h-full overflow-y-auto kanban-scrollbar p-6">
        {/* Header */}
        {d.showTitle !== false && (
          <input
            value={d.title ?? "Ingresos"}
            onChange={(e) => update({ title: e.target.value })}
            className="nodrag w-full bg-transparent border-none outline-none text-[28px] font-bold tracking-tight mb-1"
          />
        )}
        {d.showSubtitle && (
          <input
            value={d.subtitle ?? "Lo que cerraste por mes y lo que está por entrar."}
            onChange={(e) => update({ subtitle: e.target.value })}
            className={`nodrag w-full bg-transparent border-none outline-none text-[13.5px] mb-5 ${subtle}`}
          />
        )}
        {d.showTitle === false && d.showSubtitle !== true && <div className="h-2" />}

        {/* Date range */}
        <div className="flex items-end gap-3 mb-6 nodrag">
          <div>
            <div className={`text-[11px] mb-1.5 ${subtle}`}>Desde</div>
            <div className="relative">
              <button onClick={() => { setFromOpen((v) => !v); setToOpen(false); }} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium ${softSurface} hover:opacity-90`}>
                <Calendar size={13} className="opacity-60" />
                {keyLabel(d.fromMonth)}
              </button>
              {fromOpen && <MonthPicker value={d.fromMonth} onPick={(v) => { update({ fromMonth: v }); setFromOpen(false); }} isDark={isDark} />}
            </div>
          </div>
          <div>
            <div className={`text-[11px] mb-1.5 ${subtle}`}>Hasta</div>
            <div className="relative">
              <button onClick={() => { setToOpen((v) => !v); setFromOpen(false); }} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium ${softSurface} hover:opacity-90`}>
                <Calendar size={13} className="opacity-60" />
                {keyLabel(d.toMonth)}
              </button>
              {toOpen && <MonthPicker value={d.toMonth} onPick={(v) => { update({ toMonth: v }); setToOpen(false); }} isDark={isDark} />}
            </div>
          </div>
          {(d.fromMonth || d.toMonth) && (
            <button
              onClick={() => update({ fromMonth: undefined, toMonth: undefined })}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium ${subtle} hover:opacity-80 ${softSurface}`}
            >
              <RotateCcw size={12} /> Resetear
            </button>
          )}
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <KpiCard isDark={isDark} icon={<DollarSign size={14} />} accent={accent} label={`Total cerrado ${currentYear}`} value={fmtMoney(stats.totalRange)} sub={`Histórico: ${fmtMoney(stats.totalHistoric)}`} />
          <KpiCard isDark={isDark} icon={<BarChart3 size={14} />} accent={accent} label={`Promedio mensual ${currentYear}`} value={fmtMoney(stats.avgMonthly)} />
          <KpiCard isDark={isDark} icon={<TrendingUp size={14} />} accent={accent} label="Mes más alto" value={fmtMoney(stats.topMonth?.value ?? 0)} sub={stats.topMonth ? keyLabel(stats.topMonth.key) : "—"} />
        </div>

        {/* Cashflow row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl p-5" style={{ background: isDark ? "rgba(34,197,94,0.08)" : "linear-gradient(180deg, #ECFDF5 0%, #F7FEF9 100%)", border: `1px solid ${isDark ? "rgba(34,197,94,0.25)" : "#A7F3D0"}` }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-[13px] font-semibold" style={{ color: isDark ? "#4ADE80" : "#166534" }}>Cobrado</span>
            </div>
            <div className="text-[34px] font-bold tracking-tight leading-none" style={{ color: isDark ? "#F5F5F7" : "#0F172A" }}>{fmtMoney(stats.paid)}</div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: isDark ? "rgba(250,204,21,0.08)" : "linear-gradient(180deg, #FEFCE8 0%, #FEFDF3 100%)", border: `1px solid ${isDark ? "rgba(250,204,21,0.35)" : "#FDE68A"}` }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FACC15]" />
              <span className="text-[13px] font-semibold" style={{ color: isDark ? "#FDE047" : "#854D0E" }}>Por cobrar</span>
            </div>
            <div className="text-[34px] font-bold tracking-tight leading-none" style={{ color: isDark ? "#F5F5F7" : "#0F172A" }}>{fmtMoney(stats.pending)}</div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-[1.6fr_1fr] gap-4 mb-4">
          <div className={`rounded-2xl p-5 ${softSurface}`}>
            <div className="text-[13.5px] font-semibold mb-3">Total cerrado por mes</div>
            <div className="h-[220px] nodrag nopan">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: isDark ? "#9CA3AF" : "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isDark ? "#9CA3AF" : "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                  <RTooltip
                    cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
                    contentStyle={{ background: isDark ? "#1C1C1E" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number) => [fmtMoney(v), "Cerrado"]}
                  />
                  <Bar dataKey="value" fill={accent} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`rounded-2xl p-5 ${softSurface}`}>
            <div className="text-[13.5px] font-semibold mb-3">Top marcas</div>
            {stats.brands.length === 0 ? (
              <div className={`text-[12px] ${subtle} py-8 text-center`}>Aún no hay marcas.</div>
            ) : (
              <>
                <div className="h-[150px] nodrag nopan">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.brands} dataKey="value" nameKey="name" innerRadius={44} outerRadius={64} paddingAngle={2}>
                        {stats.brands.map((_, i) => (<Cell key={i} fill={donutColors[i % donutColors.length]} />))}
                      </Pie>
                      <RTooltip formatter={(v: number) => fmtMoney(v)} contentStyle={{ background: isDark ? "#1C1C1E" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, borderRadius: 12, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-1.5">
                  {stats.brands.map((b, i) => {
                    const pct = stats.totalRange > 0 ? Math.round((b.value / stats.totalRange) * 100) : 0;
                    return (
                      <div key={b.name} className="flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: donutColors[i % donutColors.length] }} />
                          <span className="truncate">{b.name}</span>
                        </div>
                        <span className={`${subtle} tabular-nums`}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pending list */}
        <div className={`rounded-2xl p-5 ${softSurface}`}>
          <div className="flex items-baseline justify-between mb-4">
            <div className="text-[15px] font-semibold">Por cobrar</div>
            <div className={`text-[12px] ${subtle}`}><span className="font-semibold" style={{ color: txt }}>{fmtMoney(stats.pending)}</span> pendiente</div>
          </div>
          {stats.grouped.size === 0 ? (
            <div className={`text-[12.5px] ${subtle} py-6 text-center`}>Sin pendientes 🎉</div>
          ) : (
            <div className="space-y-4">
              {Array.from(stats.grouped.entries()).map(([label, arr]) => {
                const groupTotal = arr.reduce((s, c) => s + (c.amount || 0), 0);
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[12.5px] font-semibold capitalize">{label}</div>
                      <div className={`text-[12px] ${subtle}`}>{fmtMoney(groupTotal)}</div>
                    </div>
                    <div className="space-y-1.5">
                      {arr.map((c) => (
                        <div key={c.id} className={`nodrag flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-neutral-50 hover:bg-neutral-100"} transition-colors`}>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[13px] font-medium truncate">{c.brand || "Sin nombre"}</span>
                            <ArrowUpRight size={12} className="opacity-40 shrink-0" />
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[13px] font-semibold tabular-nums">{fmtMoney(c.amount)}</span>
                            <button
                              onClick={() => togglePaid(c.id)}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors"
                              style={{ borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)", color: isDark ? "#E5E7EB" : "#374151" }}
                            >
                              Cobrado
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {allCampaigns.length === 0 && (
          <div className={`mt-4 rounded-xl p-4 text-[12.5px] text-center ${subtle} ${softSurface}`}>
            Añade el widget <span className="font-semibold">Campañas</span> y crea colaboraciones para ver aquí tus ingresos.
          </div>
        )}
      </div>
    </div>
  );
};

const ToolBtn = ({ onClick, children, title, isDark, active, danger }: { onClick: () => void; children: React.ReactNode; title: string; isDark: boolean; active?: boolean; danger?: boolean }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    title={title}
    className={`p-1.5 rounded-lg transition-colors ${
      danger
        ? isDark ? "hover:bg-red-500/20 text-white/70 hover:text-red-400" : "hover:bg-red-50 text-neutral-500 hover:text-red-500"
        : active
          ? isDark ? "bg-white/15 text-white" : "bg-neutral-900 text-white"
          : isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-neutral-100 text-neutral-600"
    }`}
  >
    {children}
  </button>
);

const KpiCard = ({ isDark, icon, accent, label, value, sub }: { isDark: boolean; icon: React.ReactNode; accent: string; label: string; value: string; sub?: string }) => (
  <div className={`rounded-2xl p-4 ${isDark ? "bg-white/[0.03] border border-white/10" : "bg-white border border-neutral-200"}`}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${accent}18`, color: accent }}>{icon}</div>
    <div className={`text-[11.5px] mb-1 ${isDark ? "text-white/60" : "text-neutral-500"}`}>{label}</div>
    <div className="text-[24px] font-bold tracking-tight leading-tight">{value}</div>
    {sub && <div className={`text-[11px] mt-1 ${isDark ? "text-white/40" : "text-neutral-400"}`}>{sub}</div>}
  </div>
);

const MonthPicker = ({ value, onPick, isDark }: { value?: string; onPick: (v: string) => void; isDark: boolean }) => {
  const now = new Date();
  const [year, setYear] = useState(parseKey(value)?.y ?? now.getFullYear());
  return (
    <div className={`nodrag nopan absolute top-full mt-2 left-0 z-50 rounded-xl shadow-2xl p-3 w-[220px] ${isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setYear((y) => y - 1)} className={`px-2 py-1 rounded-md text-[12px] ${isDark ? "hover:bg-white/10" : "hover:bg-neutral-100"}`}>‹</button>
        <div className="text-[13px] font-semibold">{year}</div>
        <button onClick={() => setYear((y) => y + 1)} className={`px-2 py-1 rounded-md text-[12px] ${isDark ? "hover:bg-white/10" : "hover:bg-neutral-100"}`}>›</button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {MONTHS_SHORT.map((m, i) => {
          const k = `${year}-${String(i + 1).padStart(2, "0")}`;
          const isSel = k === value;
          return (
            <button
              key={m}
              onClick={() => onPick(k)}
              className={`text-[12px] py-1.5 rounded-md capitalize transition-colors ${
                isSel
                  ? "bg-[#4059F1] text-white"
                  : isDark ? "hover:bg-white/10" : "hover:bg-neutral-100"
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const PickerPopover = ({ colors, onPick, isDark }: { colors: { name: string; value: string }[]; onPick: (v: string) => void; isDark: boolean }) => (
  <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-xl shadow-2xl p-2.5 grid grid-cols-5 gap-1.5 z-50 w-[150px] ${isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-neutral-100"}`}>
    {colors.map((c) => (
      <button
        key={c.value}
        onClick={() => onPick(c.value)}
        className="w-6 h-6 rounded-full border border-neutral-200/60 transition-transform hover:scale-110 relative overflow-hidden shadow-sm"
        style={{ backgroundColor: c.value === "transparent" ? "white" : c.value }}
        title={c.name}
      >
        {c.value === "transparent" && <div className="absolute inset-0 w-full h-[1.5px] top-1/2 bg-red-500 rotate-45" />}
      </button>
    ))}
  </div>
);

export default memo(IngresosNode);

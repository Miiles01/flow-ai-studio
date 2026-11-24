import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import dashboardI18n from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

const dt = (key: string, options?: Record<string, unknown>): string => dashboardI18n.t(key, options) as string;
const DAYS = 30;
const PLACEHOLDER: Point[] = [3, 5, 4, 7, 6, 9, 8, 11, 10, 14].map((views, i) => ({ day: String(i), views }));

type Point = { day: string; views: number };

/** Tarjeta del inicio: visitas a las páginas publicadas del usuario en los últimos 30 días. */
export function SiteVisitsCard({ userId, isDark }: { userId: string; isDark: boolean }) {
  const navigate = useNavigate();
  const [hasPage, setHasPage] = useState<boolean | null>(null);
  const [rows, setRows] = useState<{ day: string; views: number }[]>([]);

  useEffect(() => {
    let alive = true;
    const since = new Date(Date.now() - (DAYS - 1) * 86400000).toISOString().slice(0, 10);
    Promise.all([
      supabase.from("user_sites").select("id", { count: "exact", head: true }).eq("owner_id", userId).eq("status", "published"),
      // site_view_days aún no está en los tipos generados de Supabase.
      (supabase as any).from("site_view_days").select("day, views").eq("owner_id", userId).gte("day", since),
    ]).then(([sites, views]) => {
      if (!alive) return;
      setHasPage((sites.count ?? 0) > 0);
      setRows(views.error ? [] : (views.data ?? []));
    });
    return () => { alive = false; };
  }, [userId]);

  // Serie continua de 30 días (los días sin visitas cuentan 0); suma varias páginas del mismo día.
  const series = useMemo<Point[]>(() => {
    const byDay = new Map<string, number>();
    rows.forEach((r) => byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.views));
    return Array.from({ length: DAYS }, (_, i) => {
      const day = new Date(Date.now() - (DAYS - 1 - i) * 86400000).toISOString().slice(0, 10);
      return { day, views: byDay.get(day) ?? 0 };
    });
  }, [rows]);
  const total = series.reduce((a, p) => a + p.views, 0);
  // Sin página publicada: gráfica de ejemplo en gris, desactivada.
  const off = hasPage === false;
  const data = off ? PLACEHOLDER : series;
  const stroke = off ? (isDark ? "#52525B" : "#D4D4D8") : isDark ? "#FFFFFF" : "#111111";
  const locale = dashboardI18n.language;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`flex flex-col p-5 rounded-lg shadow-md cursor-pointer ${isDark ? "bg-white/5" : "bg-white"}`}
      onClick={() => navigate("/studio")}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-8 h-8 shrink-0 rounded-sm bg-background shadow-sm flex items-center justify-center">
          <Eye size={16} className={isDark ? "text-white" : "text-black"} />
        </div>
        {hasPage !== null && (
          <div className={`h-9 w-24 sm:w-28 shrink-0 ${off ? "pointer-events-none" : ""}`} aria-hidden={off} onClick={(e) => e.stopPropagation()}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {!off && <Tooltip
                  cursor={false}
                  contentStyle={{ borderRadius: 10, border: "none", fontSize: 11, padding: "4px 8px", background: isDark ? "#1C1C1E" : "#FFFFFF", color: isDark ? "#FFFFFF" : "#111111", boxShadow: "0 6px 20px rgba(0,0,0,.12)" }}
                  labelFormatter={(_, p) => (p?.[0] ? new Date(`${p[0].payload.day}T12:00:00Z`).toLocaleDateString(locale, { day: "numeric", month: "short" }) : "")}
                  formatter={(v: number) => [v.toLocaleString(locale), dt("dashboard.statVisitsShort")]}
                />}
                <Area type="monotone" dataKey="views" stroke={stroke} strokeWidth={1.5} fill="url(#visitsFill)" dot={false} isAnimationActive={!off} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <p className={`text-2xl font-normal ${off ? "text-miiles-gray-400" : "text-foreground"}`}>{off ? "—" : total.toLocaleString(locale)}</p>
      <p className="text-xs text-miiles-gray-400 font-light mt-1">{off ? dt("dashboard.statNoPage") : dt("dashboard.statVisits")}</p>
    </motion.div>
  );
}

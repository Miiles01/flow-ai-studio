import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import UserFlowDiagram from "@/components/admin/UserFlowDiagram";

type Row = {
  id: string; email: string; name: string | null; username: string | null;
  created_at: string; last_activity: string | null; onboarding: boolean;
  boards: number; widgets: number; pages: number; published_pages: number;
  plan: "free" | "pro" | "pro_test" | "pro_trial"; architecture_views: number; networks: string[];
  pricing_card_clicks: number; pro_clicks: number; contact_clicks: number;
  template_views: number; template_uses: number; is_admin: boolean;
};
type Tpl = { slug: string; title: string; views: number; uses: number; pages: number };
type Summary = Record<string, number>;

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "new", label: "Nuevos (7 días)" },
  { id: "noOnb", label: "Sin onboarding" },
  { id: "intent", label: "Intentaron comprar" },
  { id: "pro", label: "Pro" },
] as const;

const HAS = [
  { id: "onboarding", label: "Con onboarding", test: (u: Row) => u.onboarding },
  { id: "boards", label: "Con tableros", test: (u: Row) => u.boards > 0 },
  { id: "widgets", label: "Con widgets", test: (u: Row) => u.widgets > 0 },
  { id: "pages", label: "Con páginas", test: (u: Row) => u.pages > 0 },
] as const;
const RANGES = [14, 30, 90] as const;

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "2-digit" }) : "—");
const NET: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" };

export default function CustomersTab() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [users, setUsers] = useState<Row[]>([]);
  const [templates, setTemplates] = useState<Tpl[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [has, setHas] = useState<string[]>([]);
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const [series, setSeries] = useState<"new" | "total">("new");

  const daily = useMemo(() => {
    const day = (t: number) => new Date(t).toISOString().slice(0, 10);
    const counts = new Map<string, number>();
    users.forEach((u) => { const k = day(Date.parse(u.created_at)); counts.set(k, (counts.get(k) ?? 0) + 1); });
    const start = Date.now() - (range - 1) * 864e5;
    let total = users.filter((u) => day(Date.parse(u.created_at)) < day(start)).length;
    return Array.from({ length: range }, (_, i) => {
      const k = day(start + i * 864e5); const n = counts.get(k) ?? 0; total += n;
      return { k, label: new Date(k + "T12:00:00").toLocaleDateString("es-MX", { day: "2-digit", month: "short" }), new: n, total };
    });
  }, [users, range]);
  const periodNew = daily.reduce((a, d) => a + d.new, 0);

  const load = async () => {
    setLoading(true);
    const { data, error } = await adminFetch("admin-customers", {});
    setLoading(false);
    if (error || data?.error) return toast.error(data?.error ?? error?.message ?? "Error cargando");
    setSummary(data.summary); setUsers(data.users ?? []); setTemplates(data.templates ?? []);
  };
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => {
    const week = Date.now() - 7 * 864e5;
    return users.filter((u) => {
      if (q && !`${u.email} ${u.name ?? ""} ${u.username ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (!HAS.every((h) => !has.includes(h.id) || h.test(u))) return false;
      if (filter === "new") return Date.parse(u.created_at) >= week;
      if (filter === "noOnb") return !u.onboarding;
      if (filter === "intent") return u.pro_clicks + u.contact_clicks > 0;
      if (filter === "pro") return u.plan !== "free";
      return true;
    });
  }, [users, q, filter, has]);

  const cards = summary ? [
    ["Registrados", summary.total], ["Nuevos 7 días", summary.new7], ["Nuevos 30 días", summary.new30],
    ["Hicieron onboarding", summary.onboarding], ["Con tableros", summary.withBoards], ["Con páginas", summary.withPages],
    ["Pro (pago real)", summary.pro], ["Pro gratis (1 mes)", summary.proTrial ?? 0], ["Intentaron comprar", summary.buyIntent], ["Vieron Arquitectura", summary.architecture],
  ] : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-normal text-white">Clientes</h2>
          <p className="text-xs text-white/50 font-light">Sin contar tu cuenta de administrador. Las vistas de Arquitectura, precios y plantillas se miden desde hoy.</p>
        </div>
        <Button onClick={load} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Actualizar
        </Button>
      </div>

      {users.length > 0 && (
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-white/50 font-light">{series === "new" ? `Usuarios nuevos por día · últimos ${range} días` : "Usuarios registrados en total"}</p>
              <p className="text-3xl font-normal text-white mt-1">{series === "new" ? periodNew : daily[daily.length - 1]?.total}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["new", "total"] as const).map((v) => (
                <button key={v} onClick={() => setSeries(v)} className={`rounded-full px-3 py-1.5 text-xs ${series === v ? "bg-white text-black" : "bg-white/10 text-white/60"}`}>{v === "new" ? "Nuevos" : "Total"}</button>
              ))}
              <span className="w-px bg-white/10 mx-1" />
              {RANGES.map((r) => (
                <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-1.5 text-xs ${range === r ? "bg-white text-black" : "bg-white/10 text-white/60"}`}>{r} días</button>
              ))}
            </div>
          </div>
          <div className="h-72 text-white">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "currentColor", opacity: 0.5, fontSize: 11 }} minTickGap={24} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "currentColor", opacity: 0.5, fontSize: 11 }} />
                <Tooltip cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }}
                  contentStyle={{ borderRadius: 12, border: "1px solid rgba(128,128,128,.25)", background: "rgba(20,20,24,.92)", color: "#fff", fontSize: 12 }}
                  formatter={(v: number) => [v, series === "new" ? "Nuevos" : "Total"]} />
                <Area type="monotone" dataKey={series} stroke="currentColor" strokeWidth={2} fill="url(#adminArea)"
                  dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: "currentColor" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cards.map(([label, n]) => (
              <div key={label as string} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-xs text-white/50 font-light">{label}</p>
                <p className="text-2xl font-normal text-white mt-1">{n}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50 font-light">
            Pagos: modo real activo. Suscripciones reales: {summary.liveSubscriptions} · de prueba: {summary.testSubscriptions}
          </p>
        </>
      )}

      <UserFlowDiagram refreshKey={loading} />

      <section className="space-y-3">
        <h3 className="text-base font-normal text-white">Plantillas más vistas</h3>
        {templates.length === 0 ? <p className="text-xs text-white/40">Aún no hay datos.</p> : (
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/50 text-xs"><tr>
                <th className="text-left p-3 font-normal">Plantilla</th><th className="p-3 font-normal">Vistas</th>
                <th className="p-3 font-normal">«Usar esta plantilla»</th><th className="p-3 font-normal">Páginas creadas</th>
              </tr></thead>
              <tbody>{templates.map((t) => (
                <tr key={t.slug} className="border-t border-white/5">
                  <td className="p-3">{t.title}</td><td className="p-3 text-center">{t.views}</td>
                  <td className="p-3 text-center">{t.uses}</td><td className="p-3 text-center">{t.pages}</td>
                </tr>))}</tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o correo"
            className="max-w-xs bg-white/5 border-white/10 text-white" />
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs ${filter === f.id ? "bg-white text-black" : "bg-white/10 text-white/60"}`}>
              {f.label}
            </button>
          ))}
          <span className="w-px h-5 bg-white/10 mx-1" />
          {HAS.map((h) => {
            const on = has.includes(h.id);
            return (
              <button key={h.id} onClick={() => setHas((p) => on ? p.filter((x) => x !== h.id) : [...p, h.id])}
                className={`rounded-full px-3 py-1.5 text-xs border ${on ? "bg-white text-black border-transparent" : "border-white/10 text-white/60"}`}>
                {h.label}
              </button>
            );
          })}
          <span className="text-xs text-white/40 ml-auto">{shown.length} usuarios</span>
        </div>
        <div className="rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead className="bg-white/5 text-white/50"><tr>
              {["Usuario", "Registro", "Onboarding", "Tableros", "Widgets", "Páginas", "Plan", "Arquitectura", "Precios (cards / Pro / Contacto)", "Plantillas (vistas / usar)", "Última actividad"].map((h) => (
                <th key={h} className="text-left p-3 font-normal">{h}</th>))}
            </tr></thead>
            <tbody>{shown.map((u) => (
              <tr key={u.id} className={`border-t border-white/5 ${u.is_admin ? "opacity-50" : ""}`}>
                <td className="p-3"><div className="text-white">{u.name || u.username || "—"}{u.is_admin && " (admin)"}</div><div className="text-white/40">{u.email}</div></td>
                <td className="p-3">{fmt(u.created_at)}</td>
                <td className="p-3">{u.onboarding ? "Sí" : "No"}</td>
                <td className="p-3">{u.boards}</td>
                <td className="p-3">{u.widgets}</td>
                <td className="p-3">{u.pages}{u.published_pages ? ` (${u.published_pages} visibles)` : ""}</td>
                <td className="p-3">{u.plan === "pro" ? "Pro" : u.plan === "pro_test" ? "Pro (prueba)" : u.plan === "pro_trial" ? "Pro gratis (1 mes)" : "Free"}</td>
                <td className="p-3">{u.architecture_views ? u.networks.map((n) => NET[n] ?? n).join(", ") : "No"}</td>
                <td className="p-3">{u.pricing_card_clicks} / {u.pro_clicks} / {u.contact_clicks}</td>
                <td className="p-3">{u.template_views} / {u.template_uses}</td>
                <td className="p-3">{fmt(u.last_activity)}</td>
              </tr>))}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

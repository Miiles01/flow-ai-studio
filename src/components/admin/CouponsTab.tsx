import { useEffect, useState } from "react";
import { adminFetch } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Ticket, Power } from "lucide-react";

type PromoCode = {
  id: string;
  code: string;
  active: boolean;
  times_redeemed: number;
  max_redemptions: number | null;
  expires_at: number | null;
  created: number;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
  duration: string | null;
  duration_in_months: number | null;
};

const DURATIONS = [
  { value: "once", label: "Solo el primer pago" },
  { value: "repeating", label: "Varios meses" },
  { value: "forever", label: "Para siempre" },
];

export default function CouponsTab() {
  const [environment, setEnvironment] = useState<"live" | "sandbox">("live");
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "amount">("percent");
  const [value, setValue] = useState("20");
  const [duration, setDuration] = useState("once");
  const [months, setMonths] = useState("3");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");

  const load = async (env = environment) => {
    setLoading(true);
    const { data, error } = await adminFetch("admin-coupons", { action: "list", environment: env });
    setLoading(false);
    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? "Error cargando cupones");
      return;
    }
    setCodes(data.codes ?? []);
  };

  useEffect(() => {
    load(environment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment]);

  const create = async () => {
    setCreating(true);
    const { data, error } = await adminFetch("admin-coupons", {
      action: "create",
      environment,
      code,
      type,
      value: Number(value),
      duration,
      duration_in_months: Number(months),
      currency: "mxn",
      max_redemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
      expires_in_days: expiresInDays ? Number(expiresInDays) : undefined,
    });
    setCreating(false);
    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? "No se pudo crear el cupón");
      return;
    }
    toast.success(`Cupón ${data.code} creado`);
    setCode("");
    load();
  };

  const toggle = async (c: PromoCode) => {
    const { data, error } = await adminFetch("admin-coupons", {
      action: "toggle",
      environment,
      id: c.id,
      active: !c.active,
    });
    if (error || data?.error) {
      toast.error("No se pudo actualizar");
      return;
    }
    setCodes((prev) => prev.map((p) => (p.id === c.id ? { ...p, active: data.active } : p)));
  };

  const describe = (c: PromoCode) => {
    const off = c.percent_off
      ? `${c.percent_off}% de descuento`
      : `${((c.amount_off ?? 0) / 100).toFixed(2)} ${(c.currency ?? "").toUpperCase()} de descuento`;
    const dur = c.duration === "forever"
      ? "para siempre"
      : c.duration === "repeating"
        ? `por ${c.duration_in_months} mes(es)`
        : "en el primer pago";
    return `${off} · ${dur}`;
  };

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/30";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        {(["live", "sandbox"] as const).map((env) => (
          <button
            key={env}
            onClick={() => setEnvironment(env)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              environment === env ? "bg-white text-black" : "bg-white/10 text-white/60 hover:bg-white/15"
            }`}
          >
            {env === "live" ? "Producción" : "Pruebas"}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
        <h2 className="text-sm font-normal text-white flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nuevo cupón
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50 font-light">Código</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="MIILES20"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50 font-light">Tipo</Label>
            <div className="flex gap-2">
              {(["percent", "amount"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 px-3 py-2 rounded-md text-xs transition-colors ${
                    type === t ? "bg-white text-black" : "bg-white/10 text-white/60 hover:bg-white/15"
                  }`}
                >
                  {t === "percent" ? "Porcentaje %" : "Monto MXN"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50 font-light">Valor</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} type="number" className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/50 font-light">Duración</Label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`px-3 py-2 rounded-md text-xs transition-colors ${
                    duration === d.value ? "bg-white text-black" : "bg-white/10 text-white/60 hover:bg-white/15"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          {duration === "repeating" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50 font-light">Meses</Label>
              <Input value={months} onChange={(e) => setMonths(e.target.value)} type="number" className={inputClass} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50 font-light">Usos máximos (opcional)</Label>
            <Input
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              type="number"
              placeholder="Ilimitado"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50 font-light">Expira en (días, opcional)</Label>
            <Input
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              type="number"
              placeholder="Sin expiración"
              className={inputClass}
            />
          </div>
        </div>

        <Button
          onClick={create}
          disabled={creating || !code}
          className="rounded-full bg-white text-black hover:bg-white/90"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Crear cupón
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </div>
      ) : codes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-white/50">
          <Ticket className="h-8 w-8 mb-3" />
          <p className="text-sm font-light">Aún no hay cupones en este entorno.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-white/40 font-light">{codes.length} cupón(es)</p>
          {codes.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-mono">{c.code}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      c.active ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-white/40"
                    }`}
                  >
                    {c.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="text-xs text-white/50 font-light mt-1">{describe(c)}</p>
                <p className="text-[10px] text-white/30 font-light mt-0.5">
                  {c.times_redeemed} uso(s){c.max_redemptions ? ` de ${c.max_redemptions}` : ""}
                  {c.expires_at ? ` · expira ${new Date(c.expires_at * 1000).toLocaleDateString("es-MX")}` : ""}
                </p>
              </div>
              <Button
                onClick={() => toggle(c)}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full shrink-0"
              >
                <Power className="h-4 w-4" />
                {c.active ? "Desactivar" : "Activar"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

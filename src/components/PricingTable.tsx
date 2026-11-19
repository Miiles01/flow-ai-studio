import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useState } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/trackEvent";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Checkbox Icon Component
const CheckIcon = ({ highlighted }: { highlighted?: boolean }) => {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-[2px]">
      <circle cx="12" cy="12" r="10" stroke={highlighted ? "white" : "black"} strokeWidth="1.5"/>
      <path d="M8 12.5L10.5 15L16 9" stroke={highlighted ? "white" : "black"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Precio tipo odómetro (como "pricing" de Annnimate): columnas FIJAS de dígitos que solo ruedan.
// - Cada columna es una tira 0–9; cambiar de dígito solo mueve la tira (va hacia arriba o hacia abajo sola).
// - Ruedan escalonadas desde la derecha, con curva expo-out de 0.6 s.
// - Siempre existen maxDigits columnas: las que el precio no usa miden 0 de ancho y se abren/cierran suave,
//   igual que la coma de miles; así "$" y "/mes" se mueven con el número, sin saltos ni re-montajes.
const ROLL = "0.6s cubic-bezier(0.16, 1, 0.3, 1)";
const DIGIT_W = "0.57em";   // ancho de un dígito tabular en esta tipografía (más ancho se ven separados)
const RollingPrice = ({ value, maxDigits }: { value: string; maxDigits: number }) => {
  const digits = value.replace(/\D/g, "").split("");
  const n = digits.length;
  const cols: JSX.Element[] = [];
  for (let k = maxDigits - 1; k >= 0; k--) {             // k = posición desde la derecha
    const idx = n - 1 - k;
    const on = idx >= 0;
    const d = on ? Number(digits[idx]) : 0;
    cols.push(
      <span key={`d${k}`} aria-hidden="true" className="relative inline-block overflow-hidden"
        style={{ width: on ? DIGIT_W : 0, height: "1em", transition: `width ${ROLL}` }}>
        <span className="absolute left-0 top-0 flex flex-col" style={{ width: DIGIT_W, transform: `translateY(${-d}em)`, transition: `transform ${ROLL} ${(k * 0.04).toFixed(2)}s` }}>
          {Array.from({ length: 10 }, (_, f) => (
            <span key={f} className="block text-center" style={{ height: "1em", lineHeight: "1em" }}>{f}</span>
          ))}
        </span>
      </span>
    );
    if (k === 3) {                                         // coma de miles entre la 4.ª y la 3.ª cifra
      const sep = n > 3;
      cols.push(
        <span key="sep" aria-hidden="true" className="inline-block overflow-hidden text-center"
          style={{ width: sep ? "0.24em" : 0, height: "1em", lineHeight: "1em", opacity: sep ? 1 : 0, transition: `width ${ROLL}, opacity 0.3s ease` }}>,</span>
      );
    }
  }
  return (
    <span className="inline-flex items-end whitespace-nowrap tabular-nums" style={{ height: "1em", lineHeight: "1em" }} aria-label={value}>
      {cols}
    </span>
  );
};

/** Texto que rueda entre opciones (p. ej. "/mes" ↔ "/año", "MXN" ↔ "USD"): todas las caras viven en una tira. */
const Swap = ({ options, index }: { options: string[]; index: number }) => (
  <span className="relative inline-block overflow-hidden align-bottom" style={{ height: "1.25em", lineHeight: "1.25em" }}>
    <span className="invisible block whitespace-nowrap">{options.reduce((a, b) => (b.length > a.length ? b : a), "")}</span>
    <span className="absolute left-0 top-0 flex flex-col whitespace-nowrap" style={{ transform: `translateY(${-1.25 * index}em)`, transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
      {options.map((o, i) => <span key={i} aria-hidden={i !== index} style={{ height: "1.25em" }}>{o}</span>)}
    </span>
  </span>
);

type Moneda = "MXN" | "USD";

interface PricingTableProps {
  onPlanSelect?: (planName: string, cycle: "monthly" | "annually") => void;
  isModal?: boolean;
}

export default function PricingTable({ onPlanSelect, isModal }: PricingTableProps = {}) {
  const { t, i18n } = useTranslation();
  const localePath = useLocalePath();
  const plans = t("pricing.plans", { returnObjects: true }) as { id: string; name: string; monthlyPrice: string; annualPrice: string; description: string; features: string[]; cta: string; highlighted?: boolean; annualBadge?: string; customPrice?: boolean; prices?: Record<Moneda, { monthly: string; annual: string }> }[];
  const [cycle, setCycle] = useState<"monthly" | "annually">("monthly");
  // Moneda: pesos en español, dólares en inglés (se puede cambiar con el selector de arriba)
  const [moneda, setMoneda] = useState<Moneda>(() => ((i18n.language || "es").startsWith("en") ? "USD" : "MXN"));
  const monedas = t("pricing.currencies", { returnObjects: true }) as Record<Moneda, string>;
  const precio = (plan: (typeof plans)[number]) => {
    const pr = plan.prices?.[moneda];
    if (pr) return cycle === "monthly" ? pr.monthly : pr.annual;
    return cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  };
  // columnas del odómetro: las del precio más largo posible (todas las monedas y periodos)
  const maxDigits = Math.max(1, ...plans.flatMap((p) => (p.prices ? Object.values(p.prices).flatMap((x) => [x.monthly, x.annual]) : [p.monthlyPrice, p.annualPrice]).map((v) => v.replace(/\D/g, "").length)));

  return (
    <>
      {/* Selector de Moneda (arriba) y de Ciclo (Mensual / Anual) */}
      <section className="flex flex-col items-center justify-center gap-3 text-center px-6 pb-12">
        {/* Moneda: menú desplegable */}
        <Select value={moneda} onValueChange={(v) => setMoneda(v as Moneda)}>
          <SelectTrigger aria-label="Moneda" className="h-9 w-auto gap-2 rounded-full border border-gray-200 bg-white px-4 text-xs font-normal text-black shadow-none focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border border-gray-200 bg-white shadow-none">
            {(["MXN", "USD"] as Moneda[]).map((m) => (
              <SelectItem key={m} value={m} className="text-xs text-black focus:bg-gray-100 focus:text-black data-[state=checked]:bg-transparent">{(monedas?.[m] ?? m) + " (" + m + ")"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex w-64 p-1 bg-[#F5F5F8] rounded-full mx-auto cursor-pointer border border-gray-100 shadow-inner">
          <motion.div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-black rounded-full"
            animate={{ x: cycle === "monthly" ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
          <button
            onClick={() => setCycle("monthly")}
            className={`relative z-10 flex-1 py-2.5 text-xs font-normal transition-colors duration-300 ${cycle === "monthly" ? "text-white" : "text-gray-400"}`}
          >
            {t("pricing.monthly")}
          </button>
          <button
            onClick={() => setCycle("annually")}
            className={`relative z-10 flex-1 py-2.5 text-xs font-normal transition-colors duration-300 flex items-center justify-center gap-1.5 ${cycle === "annually" ? "text-white" : "text-gray-400"}`}
          >
            {t("pricing.annually")}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cycle === "annually" ? "bg-white/20 text-white" : "bg-miiles-blue/10 text-miiles-blue"}`}>
              -20%
            </span>
          </button>
        </div>
      </section>

      {/* Grid de Tablas de Precios */}
      <section className={`px-6 ${isModal ? "mb-4" : "mb-32"}`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              onClickCapture={(e) => {
                const isCta = !!(e.target as HTMLElement).closest("a,button[data-cta]");
                trackEvent(isCta ? "pricing_cta" : "pricing_card_click", {
                  plan: plan.id,
                  cta: isCta ? (plan.customPrice ? "contact" : /pro/i.test(plan.id) ? "pro" : "free") : undefined,
                  cycle,
                });
              }}
              className={`flex flex-col rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-2 ${
                plan.highlighted
                  ? "bg-black text-white shadow-[0_40px_80px_rgba(0,0,0,0.2)]"
                  : "bg-white text-black shadow-[0_20px_60px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
              }`}
            >
              <h3 className="text-2xl font-normal mb-2">{plan.name}</h3>
              <p className={`text-xs font-light mb-8 ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}>
                {plan.description}
              </p>
              
              <div className="flex items-end gap-1 mb-2">
                {plan.customPrice ? (
                  <div className="text-[38px] font-normal tracking-tight font-sans h-[1.1em] flex items-center">
                    {t("pricing.letsTalk")}
                  </div>
                ) : (
                  <>
                    <div className="text-5xl font-normal tracking-tight flex items-end" style={{ lineHeight: "1em" }}>
                      <span style={{ height: "1em", lineHeight: "1em" }}>$</span>
                      <RollingPrice value={precio(plan)} maxDigits={maxDigits} />
                    </div>
                    <span className={`whitespace-nowrap text-xs font-light ${plan.highlighted ? "text-white" : "text-gray-400"}`}>
                      <Swap options={["MXN", "USD"]} index={moneda === "MXN" ? 0 : 1} />{" "}
                      <Swap options={[t("pricing.perMonth"), t("pricing.perYear")]} index={cycle === "monthly" ? 0 : 1} />
                    </span>
                  </>
                )}
              </div>
              
              {/* La línea de ahorro siempre ocupa su lugar (en todas las tarjetas): mensual y anual miden lo mismo */}
              <p
                aria-hidden={!(cycle === "annually" && plan.annualBadge)}
                className={`text-[11px] font-light mb-8 h-[1.5em] transition-all duration-300 ${plan.highlighted ? "text-white/70" : "text-miiles-blue"} ${cycle === "annually" && plan.annualBadge ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
              >
                {plan.annualBadge ? `✦ ${plan.annualBadge}` : "\u00a0"}
              </p>

              <ul className="flex flex-col gap-4 mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs font-light flex items-center gap-2">
                    {/* Checkbox en vez de rombo (✦). En carta negra es blanco, en cartas grises es negro */}
                    <CheckIcon highlighted={plan.highlighted} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              {onPlanSelect ? (
                <button
                  data-cta
                  onClick={() => onPlanSelect(plan.id, cycle)}
                  className={`text-center px-8 py-4 rounded-full text-xs font-normal transition-all duration-300 font-sans ${
                    plan.highlighted 
                      ? "bg-white text-black hover:bg-opacity-90" 
                      : "bg-black text-white hover:bg-opacity-80"
                  }`}
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  to={localePath(plan.customPrice ? "/precios/negocios" : "/login")}
                  className={`text-center px-8 py-4 rounded-full text-xs font-normal transition-all duration-300 font-sans ${
                    plan.highlighted 
                      ? "bg-white text-black hover:bg-opacity-90" 
                      : "bg-black text-white hover:bg-opacity-80"
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

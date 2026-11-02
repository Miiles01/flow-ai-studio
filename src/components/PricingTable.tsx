import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/trackEvent";
import { motion } from "framer-motion";
import gsap from "gsap";

// Checkbox Icon Component
const CheckIcon = ({ highlighted }: { highlighted?: boolean }) => {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-[2px]">
      <circle cx="12" cy="12" r="10" stroke={highlighted ? "white" : "black"} strokeWidth="1.5"/>
      <path d="M8 12.5L10.5 15L16 9" stroke={highlighted ? "white" : "black"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Precio tipo odómetro (Annnimate "pricing"): cada dígito es una columna con las caras 0–9 y rueda
// hasta el número nuevo, escalonado desde la derecha. Si el precio gana o pierde dígitos, el ancho
// se anima para que "$" y el periodo se muevan con el número.
const DIGIT_W = 0.62; // em

const RollingPrice = ({ value }: { value: string }) => {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);
  const prevWidth = useRef<number | null>(null);

  // Antes de pintar el valor nuevo: cada columna arranca en el dígito que tenía en la misma posición (desde la derecha)
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const prev = prevRef.current;
    prevRef.current = value;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cols = Array.from(wrap.querySelectorAll<HTMLElement>("[data-roller]"));
    const prevDigits = prev.replace(/[^0-9]/g, "").split("").reverse();
    const ctx = gsap.context(() => {
      // Ancho: del valor anterior al nuevo
      const newW = wrap.scrollWidth;
      if (prevWidth.current !== null && prevWidth.current !== newW && !reduce) {
        gsap.fromTo(wrap, { width: prevWidth.current }, { width: newW, duration: 0.6, ease: "expo.out", clearProps: "width" });
      }
      prevWidth.current = newW;
      cols.reverse().forEach((roller, i) => {
        const to = Number(roller.dataset.roller);
        const from = prevDigits[i] !== undefined ? Number(prevDigits[i]) : 0;
        if (reduce || prev === value) { gsap.set(roller, { y: `${-to}em` }); return; }
        gsap.fromTo(roller, { y: `${-from}em` }, { y: `${-to}em`, duration: 0.6, ease: "expo.inOut", delay: i * 0.05 });
      });
      // Separadores (coma) entran suave
      if (!reduce && prev !== value) gsap.from(wrap.querySelectorAll("[data-sep]"), { opacity: 0, duration: 0.3, delay: 0.15 });
    }, wrap);
    return () => ctx.kill();
  }, [value]);

  return (
    <span ref={wrapRef} className="relative inline-flex items-baseline overflow-hidden whitespace-nowrap" aria-label={value}>
      {value.split("").map((ch, i) =>
        /[0-9]/.test(ch) ? (
          <span key={`d${value.length - i}`} aria-hidden="true" className="relative inline-block overflow-hidden" style={{ width: `${DIGIT_W}em`, height: "1.1em" }}>
            <span data-roller={ch} className="absolute left-0 top-0 flex flex-col" style={{ transform: `translateY(${-Number(ch)}em)` }}>
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className="block text-center" style={{ height: "1em", lineHeight: "1em", width: `${DIGIT_W}em`, paddingTop: "0.05em" }}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={`s${value.length - i}`} data-sep aria-hidden="true" className="inline-block">{ch}</span>
        )
      )}
    </span>
  );
};


interface PricingTableProps {
  onPlanSelect?: (planName: string, cycle: "monthly" | "annually") => void;
  isModal?: boolean;
}

export default function PricingTable({ onPlanSelect, isModal }: PricingTableProps = {}) {
  const { t } = useTranslation();
  const localePath = useLocalePath();
  const plans = t("pricing.plans", { returnObjects: true }) as { id: string; name: string; monthlyPrice: string; annualPrice: string; description: string; features: string[]; cta: string; highlighted?: boolean; annualBadge?: string; customPrice?: boolean }[];
  const [cycle, setCycle] = useState<"monthly" | "annually">("monthly");

  return (
    <>
      {/* Selector de Ciclo (Mensual / Anual) */}
      <section className="flex flex-col items-center justify-center text-center px-6 pb-12">
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
              
              <div className="flex items-baseline gap-1 mb-2">
                {plan.customPrice ? (
                  <div className="text-[38px] font-normal tracking-tight font-sans h-[1.1em] flex items-center">
                    {t("pricing.letsTalk")}
                  </div>
                ) : (
                  <>
                    <div className="text-5xl font-normal tracking-tight flex items-baseline">
                      <span>$</span>
                      <RollingPrice value={cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice} />
                    </div>
                    <span className={`text-xs font-light ${plan.highlighted ? "text-white" : "text-gray-400"}`}>
                      {t("pricing.currency")} {cycle === "monthly" ? t("pricing.perMonth") : t("pricing.perYear")}
                    </span>
                  </>
                )}
              </div>
              
              {cycle === "annually" && plan.annualBadge && (
                <p className={`text-[11px] font-light mb-8 ${plan.highlighted ? "text-white/70" : "text-miiles-blue"}`}>
                  ✦ {plan.annualBadge}
                </p>
              )}
              {!(cycle === "annually" && plan.annualBadge) && <div className="mb-8" />}

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

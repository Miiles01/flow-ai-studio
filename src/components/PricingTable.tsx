import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";

// Checkbox Icon Component
const CheckIcon = ({ highlighted }: { highlighted?: boolean }) => {
  return (
    <div 
      className={`
        w-4 h-4 rounded flex items-center justify-center border shrink-0
        ${highlighted 
          ? "border-white bg-white/20 text-white" 
          : "border-black bg-black/5 text-black"
        }
      `}
    >
      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
};

// 3D Rotating Price Animation Component
const RotatingPrice = ({ value }: { value: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prices, setPrices] = useState({ current: value, next: "" });
  const isAnimating = useRef(false);

  useEffect(() => {
    if (isAnimating.current || value === prices.current) return;
    setPrices(prev => ({ ...prev, next: value }));
  }, [value, prices.current]);

  useEffect(() => {
    if (!prices.next || !containerRef.current) return;

    isAnimating.current = true;
    const ctx = gsap.context(() => {
      const currentEl = containerRef.current?.querySelector(".current-price");
      const nextEl = containerRef.current?.querySelector(".next-price");

      if (!currentEl || !nextEl) return;

      const nextWidth = (nextEl as HTMLElement).offsetWidth;

      const tl = gsap.timeline({
        onComplete: () => {
          setPrices({ current: value, next: "" });
          isAnimating.current = false;
          gsap.set(containerRef.current, { width: "auto" });
        },
      });

      tl.to(containerRef.current, {
        width: nextWidth,
        duration: 0.6,
        ease: "expo.out",
      }, 0);

      gsap.set(nextEl, { autoAlpha: 1, rotationX: -90, transformOrigin: "50% 50% -0.5em" });
      tl.to(currentEl, {
        rotationX: 90,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        transformOrigin: "50% 50% -0.5em",
      }, 0)
        .to(nextEl, {
          rotationX: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        }, 0.1);
    }, containerRef);

    return () => ctx.revert();
  }, [prices.next, value]);

  return (
    <div 
      ref={containerRef} 
      className="relative inline-flex items-baseline justify-start overflow-visible h-[1.1em] transition-all" 
      style={{ perspective: "1000px" }}
    >
      <span className="current-price inline-block whitespace-nowrap">{prices.current}</span>
      {prices.next && (
        <span className="next-price absolute left-0 top-0 inline-block opacity-0 whitespace-nowrap">{prices.next}</span>
      )}
    </div>
  );
};

const plans = [
  {
    name: "Free",
    monthlyPrice: "0",
    annualPrice: "0",
    description: "Para explorar Miiles",
    features: ["1 proyecto", "Hasta 10 colaboraciones", "Soporte por email"],
    cta: "Empieza gratis",
  },
  {
    name: "Pro",
    monthlyPrice: "386",
    annualPrice: "3,712.00",
    description: "Para creadores en crecimiento",
    features: ["Proyectos ilimitados", "Colaboraciones ilimitadas", "Analítica avanzada", "Soporte prioritario"],
    cta: "Empezar Pro",
    highlighted: true,
    annualBadge: "Ahorra 20% con el plan anual",
  },
  {
    name: "Negocios",
    monthlyPrice: "¡Charlemos!",
    annualPrice: "¡Charlemos!",
    description: "Para equipos y empresas",
    features: ["Todo lo de Pro", "Cuentas multi-usuario", "API access", "Account manager"],
    cta: "Contactar",
    customPrice: true,
  },
];

export default function PricingTable() {
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
            Mensual
          </button>
          <button
            onClick={() => setCycle("annually")}
            className={`relative z-10 flex-1 py-2.5 text-xs font-normal transition-colors duration-300 flex items-center justify-center gap-1.5 ${cycle === "annually" ? "text-white" : "text-gray-400"}`}
          >
            Anual
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cycle === "annually" ? "bg-white/20 text-white" : "bg-miiles-blue/10 text-miiles-blue"}`}>
              -20%
            </span>
          </button>
        </div>
      </section>

      {/* Grid de Tablas de Precios */}
      <section className="px-6 mb-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-2 ${
                plan.highlighted
                  ? "bg-black text-white shadow-[0_40px_80px_rgba(0,0,0,0.2)]"
                  : "bg-[#F5F5F8] text-black"
              }`}
            >
              <h3 className="text-2xl font-normal mb-2">{plan.name}</h3>
              <p className={`text-xs font-light mb-8 ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}>
                {plan.description}
              </p>
              
              <div className="flex items-baseline gap-1 mb-2">
                {plan.customPrice ? (
                  <div className="text-[38px] font-normal tracking-tight font-sans h-[1.1em] flex items-center">
                    ¡Charlemos!
                  </div>
                ) : (
                  <>
                    <div className="text-5xl font-normal tracking-tight flex items-baseline">
                      <span>$</span>
                      <RotatingPrice value={cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice} />
                    </div>
                    <span className={`text-xs font-light ${plan.highlighted ? "text-gray-500" : "text-gray-400"}`}>
                      MXN {cycle === "monthly" ? "/mes" : "/año"}
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
              <Link
                to={plan.customPrice ? "/precios/negocios" : "/login"}
                className={`text-center px-8 py-4 rounded-full text-xs font-normal transition-all duration-300 font-sans ${
                  plan.highlighted 
                    ? "bg-white text-black hover:bg-opacity-90" 
                    : "bg-black text-white hover:bg-opacity-80"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

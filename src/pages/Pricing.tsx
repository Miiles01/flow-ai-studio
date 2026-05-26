import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";

// Registro de plugins de GSAP
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);

if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

// Registro de efectos personalizados
gsap.registerEffect({
  name: "rotateIn",
  extendTimeline: true,
  defaults: {
    duration: 0.7,
    rotationY: 0,
    rotationX: 90,
    transformOrigin: "50% 0",
    ease: "back.out(2.3)",
  },
  effect: (targets: any, config: any) => {
    let tl = gsap.timeline();
    tl.from(targets, {
      duration: config.duration,
      rotationY: config.rotationY,
      rotationX: config.rotationX,
      transformOrigin: config.transformOrigin,
      ease: config.ease,
      stagger: 0.03,
      force3D: true
    });
    tl.from(targets, {
      duration: 0.3,
      autoAlpha: 0,
      ease: "none",
      stagger: 0.02,
    }, 0);
    return tl;
  },
});

gsap.registerEffect({
  name: "rotateOut",
  extendTimeline: true,
  defaults: {
    duration: 0.5,
    x: 0,
    y: 15,
    rotationY: 0,
    rotationX: -90,
    rotationZ: 0,
    transformOrigin: "50% 100%",
    ease: "power1.in",
  },
  effect: (targets: any, config: any) => {
    let tl = gsap.timeline();
    tl.to(targets, {
      x: config.x,
      y: config.y,
      rotationY: config.rotationY,
      rotationX: config.rotationX,
      rotationZ: config.rotationZ,
      transformOrigin: config.transformOrigin,
      ease: config.ease,
      stagger: 0.03,
      force3D: true
    });
    tl.to(targets, {
      duration: 0.3,
      opacity: 0,
      ease: "none",
      stagger: 0.02,
    }, 0);
    return tl;
  },
});

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
    monthlyPrice: "179",
    annualPrice: "1,800",
    description: "Para creadores en crecimiento",
    features: ["Proyectos ilimitados", "Colaboraciones ilimitadas", "Analítica avanzada", "Soporte prioritario"],
    cta: "Empezar Pro",
    highlighted: true,
    annualBadge: "Ahorra con el plan anual",
  },
  {
    name: "Negocios",
    monthlyPrice: "499",
    annualPrice: "4,990",
    description: "Para equipos y empresas",
    features: ["Todo lo de Pro", "Cuentas multi-usuario", "API access", "Account manager"],
    cta: "Contactar",
  },
];

// Componente para el efecto de rotación 3D del precio ultra-estable
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

      // Medir el ancho del elemento invisible "next"
      gsap.set(nextEl, { display: "inline-block", opacity: 0, position: "relative" });
      const nextWidth = (nextEl as HTMLElement).offsetWidth;
      gsap.set(nextEl, { position: "absolute", opacity: 0 });

      const splitCurrent = new SplitText(currentEl, { type: "chars", charsClass: "price-char" });
      const splitNext = new SplitText(nextEl, { type: "chars", charsClass: "price-char" });

      const tl = gsap.timeline({
        onComplete: () => {
          setPrices({ current: value, next: "" });
          isAnimating.current = false;
          splitCurrent.revert();
          splitNext.revert();
          gsap.set(containerRef.current, { width: "auto" });
        }
      });

      // 1. Animar el ancho del contenedor global
      tl.to(containerRef.current, {
        width: nextWidth,
        duration: 0.6,
        ease: "expo.out"
      }, 0);

      // 2. Animar los caracteres
      gsap.set(nextEl, { autoAlpha: 1 });
      (tl as any).rotateOut(splitCurrent.chars, { duration: 0.4 }, 0)
        .rotateIn(splitNext.chars, { duration: 0.6 }, 0.1);

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

const Pricing = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const [cycle, setCycle] = useState<"monthly" | "annually">("monthly");

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-pricing",
      content: "#smooth-content-pricing",
      smooth: 1.4,
      effects: true,
    });

    const run = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content-pricing h1").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
        gsap.fromTo(split.lines, { yPercent: 110 }, {
          yPercent: 0, duration: 0.9, stagger: 0.08, ease: "osmo-ease",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    };
    run();

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <LandingNavbar />
      <div id="smooth-wrapper-pricing" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-pricing" className="bg-white text-black font-sans pb-0">
          
          <section className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-12">
            <h1 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight mb-8 max-w-4xl">
              Todo un ecosistema de IA. <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>Un solo pago.</span>
            </h1>
            <p className="text-lg font-light text-gray-500 max-w-2xl mb-12">
              Potencia tu marca con la flexibilidad que necesitas. Sin letras pequeñas, solo el impulso que mereces.
            </p>

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
                className={`relative z-10 flex-1 py-2.5 text-xs font-normal transition-colors duration-300 ${cycle === "annually" ? "text-white" : "text-gray-400"}`}
              >
                Anual
              </button>
            </div>
          </section>

          <section className="px-6 mb-32">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`flex flex-col rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-2 ${
                    plan.highlighted
                      ? "bg-black text-white shadow-[0_40px_80px_rgba(0,0,0,0.2)] scale-105"
                      : "bg-[#F5F5F8] text-black"
                  }`}
                >
                  <h3 className="text-2xl font-normal mb-2">{plan.name}</h3>
                  <p className={`text-xs font-light mb-8 ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <div className="text-5xl font-normal tracking-tight flex items-baseline">
                      <span>$</span>
                      <RotatingPrice value={cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice} />
                    </div>
                    <span className={`text-xs font-light ${plan.highlighted ? "text-gray-500" : "text-gray-400"}`}>
                      MXN {cycle === "monthly" ? "/mes" : "/año"}
                    </span>
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
                        <span className={plan.highlighted ? "text-white opacity-40" : "text-black opacity-30"}>✦</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/login"
                    className={`text-center px-8 py-4 rounded-full text-xs font-normal transition-all duration-300 ${
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

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Pricing;

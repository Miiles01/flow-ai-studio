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

// Registro de efectos personalizados inspirados en el ejemplo del usuario
gsap.registerEffect({
  name: "rotateIn",
  extendTimeline: true,
  defaults: {
    duration: 0.8,
    rotationY: 0,
    rotationX: 90,
    transformOrigin: "100% 0",
    ease: "back(2.3)",
  },
  effect: (targets: any, config: any) => {
    let tl = gsap.timeline();
    tl.from(targets, {
      duration: config.duration,
      rotationY: config.rotationY,
      rotationX: config.rotationX,
      transformOrigin: config.transformOrigin,
      ease: config.ease,
      stagger: 0.04,
    });
    tl.from(targets, {
      duration: 0.3,
      autoAlpha: 0,
      ease: "none",
      stagger: 0.03,
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
    y: 20,
    rotationY: 0,
    rotationX: -100,
    rotationZ: 0,
    transformOrigin: "100% 100%",
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
    monthlyPrice: "29",
    annualPrice: "19",
    description: "Para creadores en crecimiento",
    features: ["Proyectos ilimitados", "Colaboraciones ilimitadas", "Analítica avanzada", "Soporte prioritario"],
    cta: "Empezar Pro",
    highlighted: true,
  },
  {
    name: "Negocios",
    monthlyPrice: "99",
    annualPrice: "79",
    description: "Para equipos y empresas",
    features: ["Todo lo de Pro", "Cuentas multi-usuario", "API access", "Account manager"],
    cta: "Contactar",
  },
];

// Componente para el efecto de rotación 3D del precio
const RotatingPrice = ({ value }: { value: string }) => {
  const elRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!elRef.current) return;

    // Split actual
    const split = new SplitText(elRef.current, { type: "chars" });
    const tl = gsap.timeline({
      onComplete: () => {
        setDisplayValue(value);
        split.revert();
        
        // Animación de entrada para el nuevo valor
        requestAnimationFrame(() => {
          if (!elRef.current) return;
          const newSplit = new SplitText(elRef.current, { type: "chars" });
          (gsap as any).effects.rotateIn(newSplit.chars, {
            onComplete: () => newSplit.revert()
          });
        });
      }
    });

    // Salida del valor actual
    (tl as any).rotateOut(split.chars);

    return () => {
      tl.kill();
      split.revert();
    };
  }, [value]);

  return (
    <span ref={elRef} className="inline-block" style={{ perspective: "800px" }}>
      {displayValue}
    </span>
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
                  <div className="flex items-baseline gap-1 mb-10">
                    <div className="text-5xl font-normal tracking-tight flex items-baseline">
                      <span>$</span>
                      <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                        <RotatingPrice value={cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice} />
                      </motion.div>
                    </div>
                    <motion.span 
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={`text-xs font-light ${plan.highlighted ? "text-gray-500" : "text-gray-400"}`}
                    >
                      /mes
                    </motion.span>
                  </div>
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

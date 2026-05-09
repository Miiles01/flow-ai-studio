import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import logotipoSvg from "@/assets/miiles/logotipo.svg";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

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

const ScramblePrice = ({ value }: { value: string }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const characters = "0123456789X%&$#@";

  useEffect(() => {
    let frame = 0;
    const maxFrames = 10;
    const interval = setInterval(() => {
      if (frame >= maxFrames) {
        setDisplayValue(value);
        clearInterval(interval);
        return;
      }
      const scrambled = value
        .split("")
        .map(() => characters[Math.floor(Math.random() * characters.length)])
        .join("");
      setDisplayValue(scrambled);
      frame++;
    }, 40);
    return () => clearInterval(interval);
  }, [value]);

  return <span>{displayValue}</span>;
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
                    <span className="text-5xl font-normal tracking-tight">
                      $<ScramblePrice value={cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice} />
                    </span>
                    <span className={`text-xs font-light ${plan.highlighted ? "text-gray-500" : "text-gray-400"}`}>
                      /mes
                    </span>
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

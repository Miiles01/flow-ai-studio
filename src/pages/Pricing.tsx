import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import logotipoSvg from "@/assets/miiles/logotipo.svg";
import LandingNavbar from "@/components/LandingNavbar";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mes",
    description: "Para explorar Miiles",
    features: ["1 proyecto", "Hasta 10 colaboraciones", "Soporte por email"],
    cta: "Empieza gratis",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mes",
    description: "Para creadores en crecimiento",
    features: ["Proyectos ilimitados", "Colaboraciones ilimitadas", "Analítica avanzada", "Soporte prioritario"],
    cta: "Empezar Pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$99",
    period: "/mes",
    description: "Para equipos y empresas",
    features: ["Todo lo de Pro", "Cuentas multi-usuario", "API access", "Account manager"],
    cta: "Contactar",
  },
];

const Pricing = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-pricing",
      content: "#smooth-content-pricing",
      smooth: 1.4,
      effects: true,
    });

    const splits: SplitText[] = [];
    const run = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content-pricing h1, #smooth-content-pricing h2, #smooth-content-pricing h3").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
        splits.push(split);
        gsap.fromTo(split.lines, { yPercent: 110 }, {
          yPercent: 0, duration: 0.9, stagger: 0.08, ease: "osmo-ease",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    };
    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
    if (fontsReady) fontsReady.then(run); else run();

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      splits.forEach((s) => s.revert());
    };
  }, []);

  return (
    <>
      <LandingNavbar />
      <div id="smooth-wrapper-pricing" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-pricing" className="bg-white text-black font-sans">

          <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-12">
            <h1 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight mb-8 max-w-4xl">
              Precios <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>simples</span>
            </h1>
            <p className="text-lg font-light text-gray-500 max-w-2xl">
              Elige el plan que mejor se adapte a tu marca. Sin sorpresas, sin permanencia.
            </p>
          </section>

          <section className="pb-32 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`flex flex-col rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                    plan.highlighted
                      ? "bg-black text-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
                      : "bg-[#F5F5F8] text-black"
                  }`}
                >
                  <h3 className="text-2xl font-normal mb-2">{plan.name}</h3>
                  <p className={`text-sm font-light mb-6 ${plan.highlighted ? "text-gray-300" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-normal">{plan.price}</span>
                    <span className={`text-sm font-light ${plan.highlighted ? "text-gray-300" : "text-gray-500"}`}>
                      {plan.period}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="text-sm font-light flex items-center gap-2">
                        <span className={plan.highlighted ? "text-white" : "text-black"}>✦</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/login"
                    className={`text-center px-6 py-3 rounded-full text-sm font-light transition-transform duration-300 hover:-translate-y-1 ${
                      plan.highlighted ? "bg-white text-black" : "bg-black text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <footer className="py-16 px-6 text-center text-xs text-gray-400">
            © Miiles, todos los derechos reservados, 2026
          </footer>
        </div>
      </div>
    </>
  );
};

export default Pricing;

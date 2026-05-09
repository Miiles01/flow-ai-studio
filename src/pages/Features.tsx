import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import logotipoSvg from "@/assets/miiles/logotipo.svg";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const features = [
  { title: "Encuentra colaboraciones", description: "Descubre marcas que buscan tu perfil único." },
  { title: "Vende en todo el mundo", description: "Conecta con vendedores globales en un solo lugar." },
  { title: "Analítica inteligente", description: "Toma decisiones basadas en datos, no en intuición." },
  { title: "Automatización IA", description: "Ahorra horas con flujos generados automáticamente." },
  { title: "Pagos integrados", description: "Cobra en cualquier divisa sin fricción." },
  { title: "Soporte 24/7", description: "Estamos contigo cuando lo necesites." },
];

const Features = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-features",
      content: "#smooth-content-features",
      smooth: 1.4,
      effects: true,
    });

    const splits: SplitText[] = [];
    const run = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content-features h1, #smooth-content-features h2, #smooth-content-features h3").forEach((el) => {
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
      {/* NAV + MENU DESPLEGABLE */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95vw] md:w-max z-50 flex flex-col gap-2">
        <nav className="w-full flex items-center justify-between gap-4 md:gap-16 px-6 md:px-8 py-2.5 bg-white/40 backdrop-blur-2xl border border-white/20 rounded-full">
          <Link to="/" className="flex items-center shrink-0">
            <img src={logotipoSvg} alt="Miiles" className="h-5 w-auto" />
          </Link>
          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-sm font-normal hover:opacity-50 transition-opacity tracking-tight"
            >
              {isMenuOpen ? "Cerrar" : "Menu"}
            </button>
            <Link
              to="/login"
              className="text-xs font-normal px-5 py-2.5 rounded-full bg-black text-white hover:scale-105 transition-transform duration-300"
            >
              Unirse
            </Link>
          </div>
        </nav>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="flex flex-col gap-6 text-left">
                {[
                  { to: "/", label: "Inicio" },
                  { to: "/acerca-de", label: "Acerca de" },
                  { to: "/precios", label: "Precios" },
                  { to: "/funciones", label: "Funciones" },
                ].map((item, i) => (
                  <div key={item.label} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.9, ease: [0.625, 0.05, 0, 1], delay: i * 0.08 }}
                    >
                      <Link
                        to={item.to}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-3xl md:text-4xl font-normal text-white hover:opacity-50 transition-opacity tracking-tight"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/5"
          />
        )}
      </AnimatePresence>

      <div id="smooth-wrapper-features" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-features" className="bg-white text-black font-sans">
          <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-12">
            <h1 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight mb-8 max-w-4xl">
              Todas las{" "}
              <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>funciones</span>
            </h1>
            <p className="text-lg font-light text-gray-500 max-w-2xl">
              Todo lo que necesitas para hacer crecer tu marca, en una sola plataforma.
            </p>
          </section>

          <section className="pb-32 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-[#F5F5F8] rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
                >
                  <h3 className="text-2xl font-normal mb-3 leading-tight">{f.title}</h3>
                  <p className="text-sm font-light text-gray-500 leading-relaxed">{f.description}</p>
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

export default Features;

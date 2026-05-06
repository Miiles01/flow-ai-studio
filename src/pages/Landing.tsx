import { useEffect, useRef, useState } from "react";
import videoHome from "@/assets/miiles/videohome.mp4";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import logoImg from "@/assets/logo.png";
import logotipoSvg from "@/assets/miiles/logotipo.svg";
import brand1 from "@/assets/miiles/brands/brand1.svg";
import brand2 from "@/assets/miiles/brands/brand2.svg";
import brand3 from "@/assets/miiles/brands/brand3.svg";
import brand4 from "@/assets/miiles/brands/brand4.svg";
import brand5 from "@/assets/miiles/brands/brand5.svg";
import brand6 from "@/assets/miiles/brands/brand6.svg";

const brandLogos = [brand1, brand2, brand3, brand4, brand5, brand6];

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.4,
      effects: true,
    });

    // Video expand on scroll
    if (videoWrapRef.current) {
      gsap.fromTo(
        videoWrapRef.current,
        { width: "65%" },
        {
          width: "80%",
          ease: "none",
          scrollTrigger: {
            trigger: videoWrapRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: true,
          },
        }
      );
    }

    // Animaciones para descripciones (no headings)
    const animated: HTMLElement[] = [];
    const animate = (selector: string, y: number, duration: number) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        animated.push(el);
        gsap.fromTo(el, { opacity: 0, y }, {
          opacity: 1, y: 0, duration, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    };
    animate("[data-anim-heading]", 40, 0.8);
    animate("[data-split]", 15, 0.5);

    // SplitText line reveal en h1/h2/h3
    const splits: SplitText[] = [];
    const runSplit = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content h1, #smooth-content h2, #smooth-content h3").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
        splits.push(split);
        gsap.fromTo(
          split.lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "osmo-ease",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      });
    };
    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
    if (fontsReady) fontsReady.then(runSplit);
    else runSplit();

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      splits.forEach((s) => s.revert());
      gsap.set(animated, { clearProps: "all" });
    };
  }, []);

  return (
    <>
      {/* WRAPPER PARA NAV Y MENÚ */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-max z-50 flex flex-col gap-2">
        {/* NAV — flotante estilo glass */}
        <nav className="w-full flex items-center justify-between gap-16 px-8 py-2.5 bg-white/40 backdrop-blur-2xl border border-white/20 rounded-full">
          <Link to="/" className="flex items-center shrink-0">
            <img src={logotipoSvg} alt="Miiles" className="h-5 w-auto" />
          </Link>

          <div className="flex items-center gap-6 shrink-0">
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

        {/* MENU DESPLEGABLE — estilo glass negro */}
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
                <div className="overflow-hidden">
                  <motion.div initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, ease: [0.625, 0.05, 0, 1] }}>
                    <Link 
                      to="/" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-3xl md:text-4xl font-normal text-white hover:opacity-50 transition-opacity tracking-tight"
                    >
                      Inicio
                    </Link>
                  </motion.div>
                </div>
                <div className="overflow-hidden">
                  <motion.div initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, ease: [0.625, 0.05, 0, 1], delay: 0.08 }}>
                    <Link 
                      to="/" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-3xl md:text-4xl font-normal text-white hover:opacity-50 transition-opacity tracking-tight"
                    >
                      Acerca de
                    </Link>
                  </motion.div>
                </div>
                <div className="overflow-hidden">
                  <motion.div initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, ease: [0.625, 0.05, 0, 1], delay: 0.16 }}>
                    <Link 
                      to="/" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-3xl md:text-4xl font-normal text-white hover:opacity-50 transition-opacity tracking-tight"
                    >
                      Precios
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay para cerrar al hacer clic fuera */}
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

      <div id="smooth-wrapper" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content" className="bg-white text-black font-sans overflow-x-visible">

          {/* HERO */}
          <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-10 relative">
          <div className="max-w-4xl mx-auto">
            <h1
              data-split-heading
              className="text-5xl md:text-6xl lg:text-7xl font-normal leading-tight tracking-tight mb-8"
            >
              <span className="block">Trabaja más</span>
              <span className="block" style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic", color: "#000" }}>
                inteligente
              </span>
            </h1>

            <p
              data-split
              className="text-sm md:text-base font-light text-gray-500 max-w-xl mx-auto mb-12"
            >
              En Miiles encontrarás oportunidades únicas para impulsar tu marca y hacer que otros vendedores en todo el mundo también ofrezcan lo tuyo.
            </p>

            <div data-anim-heading className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/login"
                className="px-8 py-4 rounded-full bg-black text-white text-sm font-light hover:-translate-y-2 transition-transform duration-300"
              >
                Prueba gratis
              </Link>
              <a
                href="#funciones"
                className="px-8 py-4 rounded-full border border-gray-200 text-sm font-light hover:-translate-y-2 transition-transform duration-300"
              >
                Ver funciones →
              </a>
            </div>
          </div>

          {/* gradient blob con parallax */}
          <div
            data-speed="0.8"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none -z-10"
            style={{ background: "linear-gradient(135deg, #FCB5B9 0%, #B8A4F8 50%, #4059F1 100%)" }}
          />
        </section>

        {/* BRAND CAROUSEL */}
        <section className="py-8 px-[10%] md:px-[20%] overflow-hidden">
          <div className="relative w-full" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
            <div className="flex w-max animate-marquee gap-20 items-center">
              {[...brandLogos, ...brandLogos].map((logo, i) => (
                <img key={i} src={logo} alt="" className="h-6 md:h-7 w-auto opacity-70 shrink-0" />
              ))}
            </div>
          </div>
        </section>

        {/* VIDEO */}
        <section className="py-24 flex justify-center items-center overflow-hidden">
          <div
            ref={videoWrapRef}
            style={{ width: "65%" }}
            className="rounded-2xl overflow-hidden"
          >
            <video
              src={videoHome}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* VALUE PROP + 2 COLUMNS */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight text-center mb-20">
              <span data-split-heading className="block">Un sistema.</span>
              <span data-split-heading className="block">
                Más&nbsp;<span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>ganancias.</span>
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* COL 1 — Encuentra colaboraciones */}
              <div data-anim-heading className="flex flex-col bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="rounded-2xl overflow-hidden bg-[#F5F5F8] mb-8">
                  <img
                    src="https://wearemiiles.com/wp-content/uploads/2026/01/3232-932x1024.png"
                    alt="Encuentra colaboraciones"
                    className="w-full object-cover"
                  />
                </div>
                <h3 data-split-heading className="text-3xl md:text-4xl font-normal text-center mb-4 leading-tight">
                  Encuentra colaboraciones
                </h3>
                <p data-split className="text-sm font-light text-gray-500 text-center leading-relaxed max-w-sm mx-auto">
                  En Miiles encontrarás oportunidades únicas para impulsar tu marca.
                </p>
              </div>

              {/* COL 2 — Haz que tu idea suene */}
              <div data-anim-heading className="flex flex-col bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="rounded-2xl overflow-hidden bg-[#F5F5F8] mb-8">
                  <img
                    src="https://wearemiiles.com/wp-content/uploads/2026/01/new233-933x1024.png"
                    alt="Haz que tu idea suene"
                    className="w-full object-cover"
                  />
                </div>
                <h3 data-split-heading className="text-3xl md:text-4xl font-normal text-center mb-4 leading-tight">
                  Haz que tu idea suene con fuerza de ventas
                </h3>
                <p data-split className="text-sm font-light text-gray-500 text-center leading-relaxed max-w-sm mx-auto">
                  Si tu marca vende servicios o productos, haz que otros vendedores en todo el mundo también los ofrezcan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section className="py-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p
              data-split-heading
              data-speed="0.95"
              className="text-3xl md:text-5xl font-normal leading-tight mb-10"
            >
              "Luce realmente asombroso"
            </p>
            <div data-anim-heading className="flex items-center justify-center gap-3">
              <img 
                src="https://wearemiiles.com/wp-content/uploads/2025/03/Frame-2085662063.png" 
                alt="Karol Wegner" 
                className="h-12 w-auto object-contain"
              />
              <div className="text-left">
                <p className="text-sm font-normal">Karol Wegner</p>
                <p className="text-xs font-light text-gray-400">CEO de BeeSpeaker</p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              data-split-heading
              className="text-5xl md:text-7xl font-normal leading-tight tracking-tight mb-10"
            >
              Vamos a construir tu nuevo negocio{" "}
              <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic", color: "#000" }}>
                automatizado
              </span>
            </h2>
            <div data-anim-heading>
              <Link
                to="/login"
                className="inline-block px-10 py-5 rounded-full bg-black text-white text-sm font-light hover:-translate-y-2 transition-transform duration-300"
              >
                Prueba Miiles gratis
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-24 pb-0">
          <div className="max-w-7xl mx-auto px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-24">
              {/* Left side */}
              <div className="flex flex-col justify-between h-full min-h-[200px]">
                <h2 className="text-3xl font-normal leading-tight max-w-xs">
                  Diseñado para mentes creativas
                </h2>
                <p className="text-[10px] md:text-xs font-light text-gray-400 mt-10 md:mt-0">
                  © Miiles, todos los derechos reservados, 2026
                </p>
              </div>

              {/* Right side */}
              <div className="flex gap-20 md:gap-40">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-normal text-gray-400 uppercase tracking-widest">Compañía</h4>
                  <div className="flex flex-col gap-4 text-sm font-light">
                    <Link to="/" className="hover:opacity-50 transition-opacity">Términos y condiciones</Link>
                    <Link to="/" className="hover:opacity-50 transition-opacity">Política de privacidad</Link>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-normal text-gray-400 uppercase tracking-widest">Redes Sociales</h4>
                  <div className="flex flex-col gap-4 text-sm font-light">
                    <a href="https://instagram.com/wearemiiles" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">Instagram</a>
                    <a href="https://tiktok.com/@wearemiiles" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">Tiktok</a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">Youtube</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* logotipo grande */}
          <div className="w-full px-4 md:px-10 flex justify-center">
            <img src={logotipoSvg} alt="miiles" className="w-full md:w-[95%] block mx-auto" />
          </div>
        </footer>

      </div>
    </div>
    </>
  );
};

export default Landing;

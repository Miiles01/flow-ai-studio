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
import LandingNavbar from "@/components/LandingNavbar";

const brandLogos = [brand1, brand2, brand3, brand4, brand5, brand6];

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const Landing = () => {
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
      <LandingNavbar />

      <div id="smooth-wrapper" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content" className="bg-white text-black font-sans overflow-hidden">

          {/* HERO */}
          <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-10 relative overflow-hidden">
            <div className="max-w-4xl mx-auto">
              <img 
                data-anim-heading 
                src={logoImg} 
                alt="Miiles" 
                className="w-14 h-14 mx-auto mb-6" 
              />
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-normal leading-tight tracking-tight mb-8"
              >
                <span className="block">Trabaja más</span>
                <span className="block" style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic", color: "#000" }}>
                  inteligente
                </span>
              </h1>

              <div data-anim-heading className="flex items-center justify-center gap-4 flex-wrap">
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-full bg-black text-white text-sm font-light hover:-translate-y-2 transition-transform duration-300 flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" />
                  </svg>
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
              className="rounded-2xl overflow-hidden shadow-2xl"
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

          {/* VALUE PROP + 2 COLUMNS (FUNCIONES) */}
          <section id="funciones" className="py-32 px-6 scroll-mt-24">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight text-center mb-20">
                <span className="block">Un sistema.</span>
                <span className="block">
                  Más&nbsp;<span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>ganancias.</span>
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* COL 1 — Encuentra colaboraciones */}
                <div data-anim-heading className="flex flex-col bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] group">
                  <div className="rounded-2xl overflow-hidden bg-[#F5F5F8] mb-8">
                    <img
                      src="https://wearemiiles.com/wp-content/uploads/2026/01/3232-932x1024.png"
                      alt="Encuentra colaboraciones"
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-normal text-center mb-4 leading-tight">
                    Encuentra colaboraciones
                  </h3>
                  <p data-split className="text-sm font-light text-gray-500 text-center leading-relaxed max-w-sm mx-auto">
                    En Miiles encontrarás oportunidades únicas para impulsar tu marca.
                  </p>
                </div>

                {/* COL 2 — Haz que tu idea suene */}
                <div data-anim-heading className="flex flex-col bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] group">
                  <div className="rounded-2xl overflow-hidden bg-[#F5F5F8] mb-8">
                    <img
                      src="https://wearemiiles.com/wp-content/uploads/2026/01/new233-933x1024.png"
                      alt="Haz que tu idea suene"
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-normal text-center mb-4 leading-tight">
                    Haz que tu idea suene con fuerza de ventas
                  </h3>
                  <p data-split className="text-sm font-light text-gray-500 text-center leading-relaxed max-w-sm mx-auto">
                    Si tu marca vende servicios o productos, haz que otros vendedores en todo el mundo también los ofrezcan.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* PRECIOS */}
          <section id="precios" className="py-32 px-6 scroll-mt-24">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-5xl md:text-7xl font-normal tracking-tight mb-6">Planes para <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>todos.</span></h2>
                <p data-anim-heading className="text-gray-500 font-light">Elige el plan que mejor se adapte a tu etapa actual.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Plan 1 */}
                <div data-anim-heading className="p-10 rounded-[2.5rem] bg-white border border-gray-100 flex flex-col h-full hover:shadow-2xl transition-all duration-500">
                  <h4 className="text-xl mb-2">Básico</h4>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-normal">$0</span>
                    <span className="text-xs text-gray-400 font-light">/mes</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1 text-sm font-light text-gray-500">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-black" /> 5 colaboraciones/mes</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-black" /> Acceso a comunidad</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-black" /> Soporte estándar</li>
                  </ul>
                  <Link to="/login" className="w-full py-4 rounded-full border border-gray-200 text-center text-sm font-light hover:bg-black hover:text-white transition-colors duration-300">Empezar gratis</Link>
                </div>

                {/* Plan 2 - Pro */}
                <div data-anim-heading className="p-10 rounded-[2.5rem] bg-black text-white flex flex-col h-full shadow-2xl scale-105 relative overflow-hidden">
                  <div className="absolute top-6 right-8 text-[10px] uppercase tracking-widest opacity-50">Popular</div>
                  <h4 className="text-xl mb-2">Pro</h4>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-normal">$29</span>
                    <span className="text-xs opacity-50 font-light">/mes</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1 text-sm font-light opacity-80">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-white" /> Colaboraciones ilimitadas</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-white" /> IA Matching Avanzado</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-white" /> Estadísticas en tiempo real</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-white" /> Soporte prioritario 24/7</li>
                  </ul>
                  <Link to="/login" className="w-full py-4 rounded-full bg-white text-black text-center text-sm font-light hover:opacity-90 transition-opacity duration-300">Suscribirse</Link>
                </div>

                {/* Plan 3 */}
                <div data-anim-heading className="p-10 rounded-[2.5rem] bg-white border border-gray-100 flex flex-col h-full hover:shadow-2xl transition-all duration-500">
                  <h4 className="text-xl mb-2">Empresa</h4>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-normal">$99</span>
                    <span className="text-xs text-gray-400 font-light">/mes</span>
                  </div>
                  <ul className="space-y-4 mb-10 flex-1 text-sm font-light text-gray-500">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-black" /> Todo lo de Pro</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-black" /> White label</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-black" /> API personalizada</li>
                  </ul>
                  <Link to="/login" className="w-full py-4 rounded-full border border-gray-200 text-center text-sm font-light hover:bg-black hover:text-white transition-colors duration-300">Contactar ventas</Link>
                </div>
              </div>
            </div>
          </section>

          {/* TESTIMONIAL */}
          <section className="py-32 px-6">
            <div className="max-w-3xl mx-auto text-center">
              <p
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
            <div className="w-full max-w-7xl mx-auto px-4 md:px-10 flex justify-center">
              <img src={logotipoSvg} alt="miiles" className="w-full object-contain object-center block mx-auto" />
            </div>
          </footer>

        </div>
      </div>
    </>
  );
};

export default Landing;

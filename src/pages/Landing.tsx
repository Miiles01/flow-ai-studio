import { useEffect, useRef } from "react";
import videoHome from "@/assets/miiles/videohome.mp4";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import logoImg from "@/assets/logo.png";
import logotipoSvg from "@/assets/miiles/logotipo.svg";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

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

    // Animaciones simples (sin SplitText) para evitar conflictos con React
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
    animate("[data-split-heading]", 40, 0.8);
    animate("[data-split]", 15, 0.5);

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.set(animated, { clearProps: "all" });
    };
  }, []);

  return (
    <div id="smooth-wrapper" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
      <div id="smooth-content" className="bg-white text-black font-sans overflow-x-visible">

        {/* NAV — fuera del scroll para que quede fixed sobre el smoother */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="Miiles" className="w-7 h-7" />
            <span className="font-normal text-base tracking-tight">Miiles</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-light">
            <Link to="/" className="hover:opacity-60 transition-opacity">Inicio</Link>
            <a href="#funciones" className="hover:opacity-60 transition-opacity">Funciones IA</a>
            <a href="#sobre" className="hover:opacity-60 transition-opacity">Sobre</a>
            <a href="#blog" className="hover:opacity-60 transition-opacity">Blog</a>
          </div>

          <Link
            to="/login"
            className="text-sm font-light px-5 py-2 rounded-full bg-black text-white hover:-translate-y-1 transition-transform duration-200"
          >
            Prueba gratis
          </Link>
        </nav>

        {/* HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 relative">
          <div className="max-w-4xl mx-auto">
            <h1
              data-split-heading
              className="text-6xl md:text-8xl lg:text-9xl font-normal leading-none tracking-tight mb-8"
            >
              Trabaja más{" "}
              <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic", color: "#000" }}>
                inteligente
              </span>
            </h1>

            <p
              data-split
              className="text-lg font-light text-gray-500 max-w-xl mx-auto mb-12"
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
                Más <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>ganancias.</span>
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
              <div className="w-10 h-10 rounded-full" style={{ background: "linear-gradient(135deg, #FCB5B9, #B8A4F8)" }} />
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
        <footer className="pt-10 pb-0">
          {/* top row */}
          <div className="flex items-center justify-between px-10 pb-8">
            {/* social icons */}
            <div className="flex items-center gap-5">
              <a href="https://www.threads.net/@wearemiiles" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">
                {/* Threads */}
                <svg width="20" height="20" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.23c8.248.054 14.474 2.452 18.502 7.13 2.932 3.405 4.893 8.11 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.372-39.134 15.265-38.105 34.569.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.35-22.809-.169-40.06-7.483-51.275-21.741C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.206 17.11 97.015 16.941c22.975.17 40.526 7.52 52.171 21.848 5.71 7.025 9.986 15.81 12.787 26.151l16.21-4.36c-3.44-12.68-8.853-23.606-16.232-32.668C147.35 9.956 125.465.195 97.109 0h-.113C68.685.195 47.08 9.99 32.534 29.11 19.63 46.21 12.999 70.546 12.75 96.04v.92c.249 25.494 6.88 49.83 19.784 66.94C47.08 182.01 68.685 191.805 96.996 192h.113c24.925-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.762-24.553Zm-43.181 40.871c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.113 3.895-.169 5.79-.169 6.235 0 12.068.606 17.37 1.765-1.978 24.702-13.58 28.713-23.801 29.274Z" fill="#000"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/wearemiiles" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">
                {/* Instagram */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" fill="#000"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@wearemiiles" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">
                {/* TikTok */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08Z" fill="#000"/>
                </svg>
              </a>
            </div>

            {/* términos */}
            <a href="#" className="text-sm font-light text-gray-400 hover:text-black transition-colors">
              Términos y condiciones
            </a>

            {/* copyright */}
            <span className="text-sm font-light text-gray-400">© 2025 Miiles</span>
          </div>

          {/* logotipo grande */}
          <div className="w-full px-6">
            <img src={logotipoSvg} alt="miiles" className="w-full block" />
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Landing;

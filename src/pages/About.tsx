import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);

if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const About = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    // Inicializar ScrollSmoother
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-about",
      content: "#smooth-content-about",
      smooth: 1.4,
      effects: true,
    });

    // Animación de revelación de líneas (SplitText)
    const runSplit = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content-about h1, #smooth-content-about h2, #smooth-content-about h3, #smooth-content-about .reveal-text").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
        gsap.fromTo(split.lines, { yPercent: 110 }, {
          yPercent: 0, 
          duration: 1.1, 
          stagger: 0.1, 
          ease: "osmo-ease",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
    };

    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
    if (fontsReady) fontsReady.then(runSplit);
    else runSplit();

    // Animación de bloques de imagen/tarjetas
    gsap.fromTo(".fade-up", 
      { opacity: 0, y: 40 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        stagger: 0.2, 
        ease: "power3.out",
        scrollTrigger: { trigger: ".fade-up", start: "top 85%", once: true }
      }
    );

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <LandingNavbar />
      
      <div id="smooth-wrapper-about" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-about" className="bg-white text-black font-sans pb-0">
          
          {/* HERO SECTION */}
          <section className="min-h-[85vh] md:min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
            <div className="max-w-4xl mx-auto flex flex-col items-center w-full">
              <div className="fade-up w-full max-w-5xl rounded-[2rem] overflow-hidden mb-12">
                <video 
                  src="https://wearemiiles.com/wp-content/uploads/2026/01/11-4.mp4" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-auto object-cover"
                />
              </div>
              
              <span className="fade-up text-lg md:text-xl font-normal text-gray-400 mb-6">
                Sobre nosotros
              </span>
              
              <p className="fade-up text-lg md:text-xl font-light text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Somos una empresa dedicada al desarrollo de procesos creativos con inteligencia artificial.
              </p>
            </div>
          </section>

          {/* NUESTRA MISIÓN */}
          <section className="pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-7xl font-normal tracking-tighter mb-12">Nuestra misión</h2>
              <div className="fade-up space-y-4 text-xl md:text-2xl font-light text-gray-500">
                <p>Miiles construye sistemas de productividad con IA para que recuperes el control de tu tiempo.</p>
              </div>
            </div>
          </section>

          {/* QUÉ HACEMOS */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-7xl font-normal tracking-tighter mb-12">Qué hacemos</h2>
              <div className="fade-up space-y-4 text-xl md:text-2xl font-light text-gray-500">
                <p>Creamos las herramientas que hacen más simple arrancar y operar un negocio.</p>
              </div>
            </div>
          </section>

          {/* HISTORIA (STORY) */}
          <section className="py-32 px-6 bg-white">
            <div className="max-w-5xl mx-auto flex flex-col gap-16 items-center">
              <div className="w-full aspect-video rounded-[2rem] overflow-hidden fade-up shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200" 
                  alt="Equipo Miiles" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col max-w-3xl">
                <div className="fade-up space-y-6 text-lg font-light text-gray-600 leading-normal text-center md:text-left">
                  <p>
                    <span className="text-black font-normal">Miiles nació en 2019 como Miiles Creative Studio</span>, un pequeño estudio en la Ciudad de México fundado por Miiles Horton con una idea clara: ayudar a negocios locales a construir marcas que compitieran en serio. Imagen, diseño, posicionamiento. Nada más, nada menos.
                  </p>
                  <p>
                    El portafolio fue creciendo. ERPxtender, TikTok, BeeSpeaker, Naabi Kanabi. Cada cliente sumó perspectiva sobre cómo los negocios realmente operan y dónde se atascan.
                  </p>
                  <p>
                    En 2024 Miiles lanzó Auto-flex, una apuesta por negocios automatizados y flexibles, y con eso pisó por primera vez el territorio de la IA. No fue un pivot de marketing. Fue el inicio de una transformación que meses después daría forma a Miiles AI.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="py-40 px-6">
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
              <h2 className="text-5xl md:text-8xl font-normal tracking-tighter mb-12">
                Únete al <span className="pr-2 md:pr-4" style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>cambio</span>
              </h2>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-12 py-6 rounded-full bg-black text-white text-lg font-light hover:-translate-y-2 transition-transform duration-300 shadow-2xl"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" />
                </svg>
                Únete en miiles.app
              </Link>
            </div>
          </section>

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default About;

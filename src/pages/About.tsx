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
          <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-8xl font-normal leading-[0.9] tracking-tighter mb-12">
                <span className="block">El networking no es</span>
                <span className="block" style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>club privado.</span>
              </h1>
              <p className="reveal-text text-xl md:text-2xl font-light text-gray-500 max-w-3xl mx-auto leading-relaxed">
                Miiles es el espacio donde los emprendedores encuentran a las personas con quienes construir algo real.
              </p>
            </div>
          </section>

          {/* CÓMO EMPEZÓ (STORY) */}
          <section className="py-32 px-6 bg-[#F5F5F8]">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div className="rounded-[3rem] overflow-hidden aspect-[4/5] fade-up shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" 
                  alt="Equipo Miiles" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-8">
                <h2 className="text-4xl md:text-6xl font-normal tracking-tight">Cómo empezó</h2>
                <div className="reveal-text space-y-6 text-lg font-light text-gray-600 leading-relaxed">
                  <p>
                    En 2019, <span className="text-black font-normal">Miiles Horton</span> fundó Miiles como un estudio creativo. Construyó marcas, trabajó con emprendedores y descubrió el mismo problema en todos: no les faltaba talento ni visión.
                  </p>
                  <p className="text-2xl md:text-3xl text-black font-semibold leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    "Les faltaba el equipo correcto. Eso lo cambió todo."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* QUÉ CONSTRUIMOS */}
          <section className="py-40 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row gap-12 md:gap-24 mb-32 items-start">
                <h2 className="text-4xl md:text-7xl font-normal tracking-tighter flex-1">Qué construimos</h2>
                <p className="reveal-text text-xl md:text-2xl font-light text-gray-500 flex-1 leading-relaxed">
                  Herramientas con IA para que el networking deje de ser un juego de suerte. Encuentras socios, colaboradores y talento en un solo lugar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "Sociedad", desc: "Encuentra al co-founder que complementa tu visión." },
                  { title: "Rol Fijo", desc: "Talento comprometido para escalar tus operaciones." },
                  { title: "Comisión", desc: "Fuerza de ventas motivada por resultados reales." }
                ].map((item, i) => (
                  <div key={i} className="fade-up p-10 bg-[#F5F5F8] rounded-[2.5rem] hover:-translate-y-2 transition-transform duration-500">
                    <h3 className="text-2xl font-normal mb-4">{item.title}</h3>
                    <p className="text-sm font-light text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-20 text-center reveal-text">
                <p className="text-lg md:text-xl font-light text-gray-400">
                  Sin eventos aburridos. Sin mensajes en frío. Sin esperar a que alguien te presente.
                </p>
              </div>
            </div>
          </section>

          {/* MISIÓN, VISIÓN, VALORES */}
          <section className="py-40 px-6 bg-black text-white rounded-[4rem] mx-4 mb-32">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-32 mb-40">
                <div className="space-y-8">
                  <h2 className="text-sm uppercase tracking-widest text-gray-500">Misión</h2>
                  <p className="text-4xl md:text-5xl font-normal leading-tight">
                    Convertir cada conversación en una <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>colaboración real.</span>
                  </p>
                </div>
                <div className="space-y-8">
                  <h2 className="text-sm uppercase tracking-widest text-gray-500">Visión</h2>
                  <p className="text-4xl md:text-5xl font-normal leading-tight">
                    Ser el espacio global donde los negocios nacen de las <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>conexiones correctas.</span>
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-20">
                <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-20 text-center">Nuestros Valores</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                  {[
                    { t: "Colaboración", d: "Cada conexión existe para producir algo concreto." },
                    { t: "Accesibilidad", d: "El networking no debería depender de a quién ya conoces." },
                    { t: "Comunidad", d: "Su éxito es el nuestro." },
                    { t: "Innovación", d: "La IA debe ser para todos." }
                  ].map((v, i) => (
                    <div key={i} className="fade-up space-y-4">
                      <h4 className="text-xl font-normal">{v.t}</h4>
                      <p className="text-sm font-light text-gray-400 leading-relaxed">{v.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* PARA QUIÉN */}
          <section className="py-32 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-7xl font-normal tracking-tighter mb-12">Para quién es Miiles</h2>
              <div className="reveal-text space-y-6 text-xl md:text-2xl font-light text-gray-500">
                <p>Para el que tiene un proyecto y necesita a alguien con quien ejecutarlo.</p>
                <p>Para el que quiere construir sin esperar permiso.</p>
                <p className="text-black font-normal">Para los networkers listos para crear.</p>
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="py-40 px-6">
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
              <h2 className="text-5xl md:text-8xl font-normal tracking-tighter mb-12">
                Miiles ya está <span style={{ fontFamily: "'Welth Catritz', serif", fontStyle: "italic" }}>activo.</span>
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

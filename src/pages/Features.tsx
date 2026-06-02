import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import PricingTable from "@/components/PricingTable";
import { Check } from "lucide-react";
import funcionesHero from "@/assets/funciones-hero.webp.asset.json";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const featuresData = [
  {
    id: "ai-studio",
    badge: "Inteligencia Artificial",
    title: "Diseña flujos estratégicos con IA Studio",
    description: "Describe tu proceso de negocio, embudo de ventas o estructura organizativa y deja que nuestro generador inteligente estructure y alinee un diagrama completo en segundos.",
    bullets: [
      "Generación instantánea a partir de descripciones de texto natural.",
      "Alineación automática y espaciado simétrico en cuadrícula.",
      "Asistente interactivo que refina el flujo respondiendo a tus ideas."
    ],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "todos",
    badge: "Gestión de Actividades",
    title: "Tarjetas de tareas interactivas y responsivas",
    description: "Convierte cualquier nodo del diagrama de flujo en una lista de tareas dinámica. Las subtarjetas se adaptan en tamaño con campos de texto multilínea y auto-ajustables para no recortar tus ideas.",
    bullets: [
      "Campos multilínea con textareas que crecen con el contenido.",
      "Tachado dinámico de tareas completadas y reordenamiento intuitivo.",
      "Visualización impecable en el canvas y en el panel lateral."
    ],
    image: "https://images.unsplash.com/photo-1581291518655-9523c932ded7?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "collab",
    badge: "Colaboración en Vivo",
    title: "Co-creación y presencia en tiempo real",
    description: "Invita a tu equipo a trabajar en el mismo lienzo. Visualiza los avatares de los usuarios conectados y edita de forma concurrente sin conflictos de cambios.",
    bullets: [
      "Presencia visual interactiva mediante stack de avatares en el encabezado.",
      "Sincronización instantánea de movimientos, colores y conectores.",
      "Compartido rápido mediante URLs públicas para visualización."
    ],
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "canvas",
    badge: "Lienzo Avanzado",
    title: "Canvas infinito y personalización total",
    description: "Estructura tus ideas sin límites físicos. Conecta figuras de cualquier tipo mediante handles bidireccionales y muévete con un zoom ultra-amplio de 5% a 400%.",
    bullets: [
      "Líneas de conexión curvadas con etiquetas de texto editables en el centro.",
      "Desconexión rápida de nodos arrastrando desde su mitad izquierda.",
      "Figuras geométricas personalizables con colores vibrantes de marca."
    ],
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop"
  }
];

const Features = () => {
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-features",
      content: "#smooth-content-features",
      smooth: 1.4,
      effects: true,
    });

    const run = () => {
      document.querySelectorAll<HTMLElement>("#smooth-content-features h1, #smooth-content-features h2, #smooth-content-features h3").forEach((el) => {
        gsap.fromTo(el, { yPercent: 20, autoAlpha: 0 }, {
          yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "osmo-ease",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    };
    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
    if (fontsReady) fontsReady.then(run); else run();

    return () => {
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <LandingNavbar />
      <div id="smooth-wrapper-features" style={{ overflow: "hidden", position: "fixed", width: "100%", height: "100%", top: 0, left: 0 }}>
        <div id="smooth-content-features" className="bg-white text-black font-sans pb-0">
          <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-12">
            <h1 className="text-5xl md:text-7xl font-normal leading-tight tracking-tight mb-8 max-w-4xl">
              Presentamos a Miiles
            </h1>
            <p className="text-lg font-light text-gray-500 max-w-2xl">
              Un lugar pensado para crear negocios
            </p>
          </section>

          {/* Hero Image */}
          <section className="px-6 pb-24">
            <div className="max-w-6xl mx-auto rounded-[2rem] overflow-hidden shadow-xl border border-gray-100">
              <img
                src={funcionesHero.url}
                alt="Persona usando Miiles en una tablet, cómoda en su sofá"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </section>

          {/* Detailed Features Sections */}
          <section className="pb-32 px-6">
            <div className="max-w-6xl mx-auto flex flex-col gap-36">
              {featuresData.map((f) => (
                <div
                  key={f.id}
                  className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center animate-[fade-in_1s_ease-out]"
                >
                  {/* Left Column: Text Content */}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold tracking-wider text-miiles-blue uppercase mb-3 font-sans">
                      {f.badge}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-normal leading-tight tracking-tight text-black mb-6">
                      {f.title}
                    </h2>
                    <p className="text-md font-light text-gray-500 leading-relaxed mb-8">
                      {f.description}
                    </p>
                    <ul className="flex flex-col gap-4">
                      {f.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm font-light text-gray-600">
                          <div className="w-5 h-5 rounded-full bg-miiles-blue-light flex items-center justify-center shrink-0 mt-0.5 text-miiles-blue">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="leading-normal">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column: Large Square Image */}
                  <div className="w-full aspect-square rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 hover:scale-[1.02] transition-transform duration-500">
                    <img
                      src={f.image}
                      alt={f.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Section Title */}
          <section className="pt-12 pb-6 flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight mb-4 max-w-4xl">
              Nuestros planes
            </h2>
            <p className="text-md font-light text-gray-500 max-w-2xl">
              Elige el plan ideal para automatizar y escalar tu negocio.
            </p>
          </section>

          {/* Pricing Table Component */}
          <PricingTable />

          <LandingFooter />
        </div>
      </div>
    </>
  );
};

export default Features;

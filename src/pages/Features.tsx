import { useEffect, useRef, useState } from "react";
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
import { Check, MousePointer, Hand, Type, ListTodo, ImageIcon, SquareDashed } from "lucide-react";
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
    ]
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
    ]
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
    ]
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
    ]
  }
];

const TypewriterInput = () => {
  const phrases = [
    "Crea un embudo de ventas para mi curso online...",
    "Diseña una campaña de marketing en redes sociales...",
    "Estructura el flujo de onboarding de la app...",
    "Planifica la estrategia de contenido para Instagram...",
    "Organiza el proceso de soporte y tickets B2B..."
  ];

  const [currentText, setCurrentText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: any;
    const currentPhrase = phrases[phraseIdx];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(currentPhrase.substring(0, currentText.length - 1));
      }, 30);
    } else {
      timer = setTimeout(() => {
        setCurrentText(currentPhrase.substring(0, currentText.length + 1));
      }, 60);
    }

    if (!isDeleting && currentText === currentPhrase) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1800);
    }

    if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIdx]);

  return (
    <div className="w-full max-w-[320px] bg-black text-white rounded-[32px] pt-7 pb-4 px-5 text-center flex flex-col justify-between min-h-[145px] shadow-none hover:scale-[1.02] transition-transform duration-300 select-none">
      <div className="flex-1 flex items-center justify-center min-h-[50px] mb-3">
        <p className="text-[13px] text-white font-light leading-relaxed text-center w-full">
          {currentText}
          <span className="inline-block w-[1.5px] h-3.5 ml-0.5 bg-white animate-pulse align-middle" />
        </p>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 bg-white/10 h-8 px-3 rounded-full">
          <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="text-[11px] font-light text-white/70 tracking-wider">Apps</span>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
          currentText.length > 5 
            ? "bg-white/20 text-white" 
            : "bg-white/5 text-white/30"
        }`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const InteractiveCanvasMockup = () => {
  const [activeTool, setActiveTool] = useState<"select" | "pan" | "shapes" | "text" | "todo" | "image" | "section">("select");
  const [cursorPos, setCursorPos] = useState({ x: 180, y: 221, opacity: 0, scale: 1 });

  useEffect(() => {
    let timeouts: any[] = [];

    const runLoop = () => {
      // Step 0: Start off-screen to the right of the toolbar
      setCursorPos({ x: 180, y: 221, opacity: 0, scale: 1 });
      setActiveTool("select");

      // Step 1: Move to Shapes tool (button center relative to toolbar: x: 29, y: 143)
      timeouts.push(setTimeout(() => {
        setCursorPos({ x: 29, y: 143, opacity: 1, scale: 1 });
      }, 1000));

      // Step 2: Click Shapes tool
      timeouts.push(setTimeout(() => {
        setActiveTool("shapes");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 1800));

      // Step 2b: Unclick
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 2000));

      // Step 3: Move to Text tool (button center: x: 29, y: 193)
      timeouts.push(setTimeout(() => {
        setCursorPos({ x: 29, y: 193, opacity: 1, scale: 1 });
      }, 2800));

      // Step 4: Click Text tool
      timeouts.push(setTimeout(() => {
        setActiveTool("text");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 3600));

      // Step 4b: Unclick
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 3800));

      // Step 5: Move to Todo tool (button center: x: 29, y: 243)
      timeouts.push(setTimeout(() => {
        setCursorPos({ x: 29, y: 243, opacity: 1, scale: 1 });
      }, 4600));

      // Step 6: Click Todo tool
      timeouts.push(setTimeout(() => {
        setActiveTool("todo");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 5400));

      // Step 6b: Unclick
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 5600));

      // Step 7: Move to Image tool (button center: x: 29, y: 293)
      timeouts.push(setTimeout(() => {
        setCursorPos({ x: 29, y: 293, opacity: 1, scale: 1 });
      }, 6400));

      // Step 8: Click Image tool
      timeouts.push(setTimeout(() => {
        setActiveTool("image");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 7200));

      // Step 8b: Unclick
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 7400));

      // Step 9: Move to Section tool (button center: x: 29, y: 343)
      timeouts.push(setTimeout(() => {
        setCursorPos({ x: 29, y: 343, opacity: 1, scale: 1 });
      }, 8200));

      // Step 10: Click Section tool
      timeouts.push(setTimeout(() => {
        setActiveTool("section");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 9000));

      // Step 10b: Unclick
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 9200));

      // Step 11: Move to Select tool (button center: x: 29, y: 28)
      timeouts.push(setTimeout(() => {
        setCursorPos({ x: 29, y: 28, opacity: 1, scale: 1 });
      }, 10000));

      // Step 12: Click Select tool
      timeouts.push(setTimeout(() => {
        setActiveTool("select");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 10800));

      // Step 12b: Unclick
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 11000));

      // Step 13: Exit screen to the top-right of the toolbar
      timeouts.push(setTimeout(() => {
        setCursorPos({ x: 200, y: -20, opacity: 0, scale: 1 });
      }, 11800));
    };

    runLoop();
    const interval = setInterval(runLoop, 13200);

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="w-full h-full relative bg-white/70 backdrop-blur-sm rounded-[1.5rem] border border-neutral-200/50 overflow-hidden flex items-center justify-center select-none">
      {/* Large Toolbar in the center */}
      <div className="relative w-[58px] p-1.5 bg-white border border-neutral-200/80 rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex flex-col items-center gap-1.5">
        {/* Select Tool */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 ${
          activeTool === "select" ? "bg-black text-white" : "text-[#6B7280]"
        }`}>
          <MousePointer size={20} strokeWidth={1.5} />
        </div>

        {/* Pan Tool */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 ${
          activeTool === "pan" ? "bg-black text-white" : "text-[#6B7280]"
        }`}>
          <Hand size={20} strokeWidth={1.5} />
        </div>

        <div className="w-6 h-[1px] bg-neutral-200/60 my-0.5" />

        {/* Shapes Tool */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 ${
          activeTool === "shapes" ? "bg-black text-white" : "text-[#6B7280]"
        }`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <rect x="2" y="2" width="20" height="20" rx="3" />
          </svg>
        </div>

        {/* Text Tool */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 ${
          activeTool === "text" ? "bg-black text-white" : "text-[#6B7280]"
        }`}>
          <Type size={20} strokeWidth={1.5} />
        </div>

        {/* Todo Tool */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 ${
          activeTool === "todo" ? "bg-black text-white" : "text-[#6B7280]"
        }`}>
          <ListTodo size={20} strokeWidth={1.5} />
        </div>

        {/* Image Tool */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 ${
          activeTool === "image" ? "bg-black text-white" : "text-[#6B7280]"
        }`}>
          <ImageIcon size={20} strokeWidth={1.5} />
        </div>

        {/* Section Tool */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-200 ${
          activeTool === "section" ? "bg-black text-white" : "text-[#6B7280]"
        }`}>
          <SquareDashed size={20} strokeWidth={1.5} />
        </div>

        {/* Animated Mouse Cursor relative to the Toolbar */}
        <div 
          className="absolute z-50 pointer-events-none select-none transition-all duration-700 ease-out"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            opacity: cursorPos.opacity,
            transform: `scale(${cursorPos.scale})`,
          }}
        >
          <svg className="w-5.5 h-5.5 text-black filter drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 3v15.2l3.8-3.8 3.5 8.1 3-1.3-3.5-8.1 5.4.1z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

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
                    <span className="text-xs font-semibold tracking-wider text-miiles-blue mb-3 font-sans">
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

                  {/* Right Column: Large Square Container (Flat, No shadow, No photography images) */}
                  <div 
                    className="w-full aspect-square rounded-[2.5rem] overflow-hidden border border-neutral-100 flex items-center justify-center p-10 hover:scale-[1.01] transition-transform duration-500"
                    style={{
                      background: "linear-gradient(to bottom, #FDFDFD, #F8F9FD)"
                    }}
                  >
                    {f.id === "ai-studio" && (
                      <TypewriterInput />
                    )}

                    {f.id === "todos" && (
                      <div className="w-full h-full flex flex-col justify-start p-6 bg-white/70 backdrop-blur-sm rounded-[1.5rem] border border-neutral-200/50 text-left">
                        {/* Card Title */}
                        <div className="mb-5">
                          <div className="h-3 w-28 bg-neutral-800 rounded mb-1.5" />
                          <div className="h-2 w-36 bg-neutral-400 rounded" />
                        </div>
                        {/* Task Rows */}
                        <div className="flex flex-col gap-3">
                          {/* Row 1: Completed */}
                          <div className="flex items-start gap-2.5 py-1">
                            <div className="w-4.5 h-4.5 rounded bg-[#4059F1] text-white flex items-center justify-center shrink-0">
                              <Check size={10} strokeWidth={3} />
                            </div>
                            <span className="text-[11px] text-neutral-400 line-through font-light leading-snug">
                              Definir objetivos y KPIs principales
                            </span>
                          </div>
                          {/* Row 2: In Progress / Multiline */}
                          <div className="flex items-start gap-2.5 py-1">
                            <div className="w-4.5 h-4.5 rounded border border-neutral-300 bg-white shrink-0" />
                            <span className="text-[11px] text-neutral-850 font-light leading-snug">
                              Campaña de teaser en TikTok e Instagram para el lanzamiento
                            </span>
                          </div>
                          {/* Row 3: Add Task */}
                          <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg border border-dashed border-neutral-300 text-neutral-400 text-[10px] font-light mt-1">
                            + Nueva Tarea...
                          </div>
                        </div>
                      </div>
                    )}

                    {f.id === "collab" && (
                      <div className="w-full h-full relative p-5 bg-white/70 backdrop-blur-sm rounded-[1.5rem] border border-neutral-200/50 overflow-hidden">
                        {/* Header: Avatars Presence Stack */}
                        <div className="flex justify-end gap-1 mb-6">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[9px] font-semibold flex items-center justify-center border-2 border-white ring-1 ring-neutral-100">
                            M
                          </div>
                          <div className="w-6 h-6 rounded-full bg-pink-500 text-white text-[9px] font-semibold flex items-center justify-center border-2 border-white ring-1 ring-neutral-100 -ml-2">
                            S
                          </div>
                          <div className="w-6 h-6 rounded-full bg-green-500 text-white text-[9px] font-semibold flex items-center justify-center border-2 border-white ring-1 ring-neutral-100 -ml-2">
                            +1
                          </div>
                        </div>

                        {/* Canvas content */}
                        <div className="flex flex-col items-center gap-2 mt-4">
                          <div className="w-40 py-2 px-3 bg-white border border-neutral-200 rounded-xl flex items-center justify-between">
                            <div className="h-2.5 w-18 bg-neutral-200 rounded" />
                            <div className="w-2 h-2 rounded-full bg-[#4059F1]" />
                          </div>
                        </div>

                        {/* Mock Cursors */}
                        {/* Cursor 1: Mateo */}
                        <div className="absolute left-[20%] top-[45%] flex flex-col items-start gap-1 select-none pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#4059F1">
                            <path d="M4.5 3v15.2l3.8-3.8 3.5 8.1 3-1.3-3.5-8.1 5.4.1z" />
                          </svg>
                          <div className="bg-[#4059F1] text-white text-[8px] px-1.5 py-0.5 rounded font-medium">
                            Mateo
                          </div>
                        </div>
                        {/* Cursor 2: Sofía */}
                        <div className="absolute right-[25%] bottom-[25%] flex flex-col items-start gap-1 select-none pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#EC4899">
                            <path d="M4.5 3v15.2l3.8-3.8 3.5 8.1 3-1.3-3.5-8.1 5.4.1z" />
                          </svg>
                          <div className="bg-[#EC4899] text-white text-[8px] px-1.5 py-0.5 rounded font-medium">
                            Sofía
                          </div>
                        </div>
                      </div>
                    )}

                    {f.id === "canvas" && (
                      <InteractiveCanvasMockup />
                    )}
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

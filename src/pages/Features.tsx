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
import avatar1 from "@/assets/avatar1.png";
import avatar2 from "@/assets/avatar2.png";
import avatar3 from "@/assets/avatar3.png";
import avatar4 from "@/assets/avatar4.png";
import starBadge from "@/assets/star-badge.png";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, CustomEase);
if (!CustomEase.get("osmo-ease")) {
  CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
}

const featuresData = [
  {
    id: "ai-studio",
    badge: "Inteligencia Artificial",
    title: "Diseña modelos de negocios con la potencia de la IA",
    description: "Describe tu idea y desarrolla toda una estructura de negocio y descubre nuevas oportunidades para desarrollar proyectos escalables.",
    bullets: [
      "Generación instantánea de estructuras comerciales a partir de tu visión.",
      "Visualización clara de tu cadena de valor y flujos de ingresos.",
      "Sugerencias inteligentes de la IA para validar y escalar tu proyecto."
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
  const [activeShape, setActiveShape] = useState<"square" | "circle" | "diamond" | "triangle" | "hexagon" | "star">("square");
  const [cursorPos, setCursorPos] = useState({ x: 180, y: 221, opacity: 0, scale: 1 });
  const [hoveredTool, setHoveredTool] = useState<"select" | "pan" | "shapes" | "text" | "todo" | "image" | "section" | null>(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [hoveredFlyoutItem, setHoveredFlyoutItem] = useState<string | null>(null);

  useEffect(() => {
    let timeouts: any[] = [];

    const runLoop = () => {
      // Step 0: Start off-screen
      setCursorPos({ x: 180, y: 221, opacity: 0, scale: 1 });
      setActiveTool("select");
      setActiveShape("square");
      setHoveredTool(null);
      setIsFlyoutOpen(false);
      setHoveredFlyoutItem(null);

      // Step 1: Move to Pan tool Y center is 74px, X is 28px
      timeouts.push(setTimeout(() => {
        setCursorPos({ x: 28, y: 74, opacity: 1, scale: 1 });
      }, 800));

      // Step 1b: Hover Pan tool (fades in while moving)
      timeouts.push(setTimeout(() => {
        setHoveredTool("pan");
      }, 900));

      // Step 1c: Click Pan tool (arrived at 1400)
      timeouts.push(setTimeout(() => {
        setActiveTool("pan");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 1400));

      // Step 1d: Unclick Pan
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 1600));

      // Step 2: Move to Shapes tool Y center is 129px
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 28, y: 129, opacity: 1, scale: 1 });
      }, 2200));

      // Step 2b: Hover Shapes tool (opens shapes flyout)
      timeouts.push(setTimeout(() => {
        setHoveredTool("shapes");
        setIsFlyoutOpen(true);
      }, 2300));

      // Step 2c: Click Shapes tool (arrived at 2800)
      timeouts.push(setTimeout(() => {
        setActiveTool("shapes");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 2800));

      // Step 2d: Unclick Shapes
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 3000));

      // Step 3: Move to Círculo button in the flyout (x: 138, y: 85)
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 138, y: 85, opacity: 1, scale: 1 });
      }, 3600));

      // Step 3b: Hover flyout item
      timeouts.push(setTimeout(() => {
        setHoveredFlyoutItem("circle");
      }, 3700));

      // Step 3c: Click Círculo shape (arrived at 4200)
      timeouts.push(setTimeout(() => {
        setActiveShape("circle");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 4200));

      // Step 3d: Unclick and close flyout
      timeouts.push(setTimeout(() => {
        setIsFlyoutOpen(false);
        setHoveredFlyoutItem(null);
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 4400));

      // Step 4: Move to Text tool (Y: 175px)
      timeouts.push(setTimeout(() => {
        setCursorPos({ x: 28, y: 175, opacity: 1, scale: 1 });
      }, 5000));

      // Step 4b: Hover Text tool
      timeouts.push(setTimeout(() => {
        setHoveredTool("text");
      }, 5100));

      // Step 4c: Click Text tool (arrived at 5600)
      timeouts.push(setTimeout(() => {
        setActiveTool("text");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 5600));

      // Step 4d: Unclick Text
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 5800));

      // Step 5: Move to Todo tool (Y: 221px)
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 28, y: 221, opacity: 1, scale: 1 });
      }, 6400));

      // Step 5b: Hover Todo tool
      timeouts.push(setTimeout(() => {
        setHoveredTool("todo");
      }, 6500));

      // Step 5c: Click Todo tool (arrived at 7000)
      timeouts.push(setTimeout(() => {
        setActiveTool("todo");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 7000));

      // Step 5d: Unclick Todo
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 7200));

      // Step 6: Move to Image tool (Y: 267px)
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 28, y: 267, opacity: 1, scale: 1 });
      }, 7800));

      // Step 6b: Hover Image tool
      timeouts.push(setTimeout(() => {
        setHoveredTool("image");
      }, 7900));

      // Step 6c: Click Image tool (arrived at 8400)
      timeouts.push(setTimeout(() => {
        setActiveTool("image");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 8400));

      // Step 6d: Unclick Image
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 8600));

      // Step 7: Move to Section tool (Y: 313px)
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 28, y: 313, opacity: 1, scale: 1 });
      }, 9200));

      // Step 7b: Hover Section tool
      timeouts.push(setTimeout(() => {
        setHoveredTool("section");
      }, 9300));

      // Step 7c: Click Section tool (arrived at 9800)
      timeouts.push(setTimeout(() => {
        setActiveTool("section");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 9800));

      // Step 7d: Unclick Section
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 10000));

      // Step 8: Move to Select tool (Y: 28px)
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 28, y: 28, opacity: 1, scale: 1 });
      }, 10600));

      // Step 8b: Hover Select tool
      timeouts.push(setTimeout(() => {
        setHoveredTool("select");
      }, 10700));

      // Step 8c: Click Select tool (arrived at 11200)
      timeouts.push(setTimeout(() => {
        setActiveTool("select");
        setCursorPos(prev => ({ ...prev, scale: 0.85 }));
      }, 11200));

      // Step 8d: Unclick Select
      timeouts.push(setTimeout(() => {
        setCursorPos(prev => ({ ...prev, scale: 1 }));
      }, 11400));

      // Step 9: Exit screen to the top-right
      timeouts.push(setTimeout(() => {
        setHoveredTool(null);
        setCursorPos({ x: 200, y: -20, opacity: 0, scale: 1 });
      }, 12000));
    };

    runLoop();
    const interval = setInterval(runLoop, 12800);

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const shouldShowTooltip = (tool: string) => {
    // Tooltip should ONLY show when hovered, and NOT when flyout is open for shapes
    if (tool === "shapes" && isFlyoutOpen) return false;
    return hoveredTool === tool;
  };

  return (
    <div className="w-full h-full relative bg-white/70 backdrop-blur-sm rounded-[1.5rem] border border-neutral-200/50 overflow-hidden flex items-center justify-center select-none">
      {/* Main Container to relative position the floating details relative to the toolbar */}
      <div className="relative scale-[0.75] sm:scale-90 md:scale-100 origin-center">
        {/* Large Toolbar in the center */}
        <div className="relative w-14 p-2 bg-white rounded-[30px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col items-center gap-1.5 z-20">
          {/* Select Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "select" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <MousePointer size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("select") && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Seleccionar
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pan Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "pan" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <Hand size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("pan") && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Navegar
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-6 h-[1px] bg-[#E5E7EB] my-1" />

          {/* Shapes Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "shapes" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            {activeShape === "square" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <rect x="2" y="2" width="20" height="20" rx="3" />
              </svg>
            )}
            {activeShape === "circle" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <circle cx="12" cy="12" r="10" />
              </svg>
            )}
            {activeShape === "diamond" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <polygon points="12,2 22,12 12,22 2,12" />
              </svg>
            )}
            {activeShape === "triangle" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <polygon points="12,2 22,22 2,22" />
              </svg>
            )}
            {activeShape === "hexagon" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
              </svg>
            )}
            {activeShape === "star" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            )}

            {/* Shapes Flyout Menu display */}
            <AnimatePresence>
              {isFlyoutOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.96 }}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                  className="absolute left-[calc(100%+10px)] -top-[52px] bg-[#111] p-2 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.3)] grid grid-cols-2 gap-1 z-50 pointer-events-none"
                >
                  {/* Rectangulo */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "square" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "square" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <rect x="2" y="2" width="20" height="20" rx="3" />
                    </svg>
                  </div>
                  {/* Circulo */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "circle" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "circle" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  {/* Rombo */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "diamond" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "diamond" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <polygon points="12,2 22,12 12,22 2,12" />
                    </svg>
                  </div>
                  {/* Triángulo */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "triangle" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "triangle" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <polygon points="12,2 22,22 2,22" />
                    </svg>
                  </div>
                  {/* Hexágono */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "hexagon" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "hexagon" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
                    </svg>
                  </div>
                  {/* Estrella */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${activeShape === "star" ? "bg-white text-black shadow-sm" : hoveredFlyoutItem === "star" ? "text-white bg-[#222]" : "text-[#777] bg-transparent"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[18px] h-[18px]">
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Formas Tooltip */}
            <AnimatePresence>
              {shouldShowTooltip("shapes") && !isFlyoutOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Formas
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "text" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <Type size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("text") && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Texto
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Todo Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "todo" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <ListTodo size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("todo") && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Lista de Tareas
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Image Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "image" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <ImageIcon size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("image") && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Imagen
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section Tool */}
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTool === "section" ? "bg-black text-white shadow-md" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
          }`}>
            <SquareDashed size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {shouldShowTooltip("section") && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-black text-white text-[13px] font-light py-1.5 px-3 rounded-full whitespace-nowrap shadow-lg z-30 pointer-events-none"
                >
                  Sección
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Animated Mouse Cursor relative to the Toolbar */}
          <div 
            className="absolute z-50 pointer-events-none select-none"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              opacity: cursorPos.opacity,
              transform: `scale(${cursorPos.scale})`,
              transition: "left 0.6s cubic-bezier(0.16, 1, 0.3, 1), top 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, transform 0.1s ease",
            }}
          >
            <svg className="w-5.5 h-5.5 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)]" viewBox="0 0 24 24">
              <path 
                d="M4 3l16 8-8 2-6 7z" 
                fill="#222222" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeLinejoin="round" 
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const CollaborationMockup = () => {
  return (
    <div className="w-full h-full relative bg-white/70 backdrop-blur-sm rounded-[1.5rem] border border-neutral-200/50 overflow-hidden flex items-center justify-center select-none">
      {/* Central Canvas Mockup containing avatars */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        
        {/* Avatars Stack Row */}
        <div className="flex items-center justify-center mt-4">
          {/* Avatar 1 */}
          <motion.div
            className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden"
            animate={{ y: [0, 0, -25, 0, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.6, 0.75, 0.9, 1],
              delay: 0,
            }}
          >
            <img src={avatar1} alt="Colaborador 1" className="w-full h-full object-cover" />
          </motion.div>

          {/* Avatar 2 */}
          <motion.div
            className="relative z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden -ml-5 sm:-ml-6"
            animate={{ y: [0, 0, -25, 0, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.6, 0.75, 0.9, 1],
              delay: 0.2,
            }}
          >
            <img src={avatar2} alt="Colaborador 2" className="w-full h-full object-cover" />
          </motion.div>

          {/* Avatar 3 */}
          <motion.div
            className="relative z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden -ml-5 sm:-ml-6"
            animate={{ y: [0, 0, -25, 0, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.6, 0.75, 0.9, 1],
              delay: 0.4,
            }}
          >
            <img src={avatar3} alt="Colaborador 3" className="w-full h-full object-cover" />
          </motion.div>

          {/* Avatar 4 */}
          <motion.div
            className="relative z-40 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden -ml-5 sm:-ml-6"
            animate={{ y: [0, 0, -25, 0, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.6, 0.75, 0.9, 1],
              delay: 0.6,
            }}
          >
            <img src={avatar4} alt="Colaborador 4" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {/* Collaborative Presence Cursors */}
        {/* Mateo Cursor (Blue) - Stays in the top area, moves and pauses, never collides with avatars */}
        <motion.div 
          className="absolute left-1/4 top-[20%] z-45 pointer-events-none flex items-start"
          animate={{ 
            x: [-60, 40, 40, -20, -20, -60], 
            y: [-10, 15, 15, -15, -15, -10] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 0.85, 1],
            delay: 0.2
          }}
        >
          <svg className="w-6 h-6 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)] rotate-[-10deg] shrink-0" viewBox="0 0 24 24">
            <path 
              d="M4 3l16 8-8 2-6 7z" 
              fill="#4059F1" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round" 
            />
          </svg>
          <div className="bg-[#4059F1] text-white py-1 px-3.5 rounded-full shadow-[0_4px_12px_rgba(64,89,241,0.25)] -ml-1.5 mt-4">
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide">Mateo</span>
          </div>
        </motion.div>

        {/* Sofía Cursor (Pink) - Stays in the bottom area, moves and pauses, never collides with avatars */}
        <motion.div 
          className="absolute right-1/4 bottom-[20%] z-45 pointer-events-none flex items-start"
          animate={{ 
            x: [60, -40, -40, 20, 20, 60], 
            y: [15, -10, -10, 20, 20, 15] 
          }}
          transition={{ 
            duration: 9.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            times: [0, 0.28, 0.5, 0.72, 0.88, 1],
            delay: 1.5 
          }}
        >
          <svg className="w-6 h-6 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)] rotate-[-10deg] shrink-0" viewBox="0 0 24 24">
            <path 
              d="M4 3l16 8-8 2-6 7z" 
              fill="#FCB5B9" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round" 
            />
          </svg>
          <div className="bg-[#FCB5B9] text-neutral-800 py-1 px-3.5 rounded-full shadow-[0_4px_12px_rgba(252,181,185,0.3)] -ml-1.5 mt-4">
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide">Sofía</span>
          </div>
        </motion.div>

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

    const ctx = gsap.context(() => {
      // 1. Reveal headers
      document.querySelectorAll<HTMLElement>("#smooth-content-features h1, #smooth-content-features h2, #smooth-content-features h3").forEach((el) => {
        gsap.fromTo(el, { yPercent: 20, autoAlpha: 0 }, {
          yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "osmo-ease",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // 2. Responsive ScrollTrigger for horizontal scroll
      let mm = gsap.matchMedia();
      
      mm.add("(min-width: 768px)", () => {
        const track = document.querySelector(".horizontal-track") as HTMLElement;
        if (!track) return;

        gsap.to(".horizontal-track", {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: ".horizontal-section-wrapper",
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
          },
        });
      });
    });

    return () => {
      smootherRef.current?.kill();
      ctx.revert();
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
          <section className="horizontal-section-wrapper md:h-screen md:overflow-hidden md:relative pb-32 md:pb-0">
            <div className="horizontal-track flex flex-col md:flex-row md:flex-nowrap md:w-[400vw] md:h-full gap-36 md:gap-0">
              {featuresData.map((f) => (
                <div
                  key={f.id}
                  className={`horizontal-slide w-full md:w-[100vw] md:h-full md:flex-shrink-0 md:flex md:items-center md:justify-center px-6 ${
                    f.id === "ai-studio" ? "md:pl-32 md:pr-20 lg:pl-44 lg:pr-20" : "md:px-20"
                  }`}
                >
                  <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Text Content */}
                    <div className={`flex flex-col text-left ${f.id === "ai-studio" ? "md:pl-6 lg:pl-12" : ""}`}>
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
                          <li key={idx} className="flex items-start gap-3 text-sm font-light text-gray-600 text-left">
                            <div className="w-5 h-5 rounded-full bg-miiles-blue-light flex items-center justify-center shrink-0 mt-0.5 text-miiles-blue">
                              <Check size={12} strokeWidth={3} />
                            </div>
                            <span className="leading-normal">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column: Mockup Container (Responsive Aspect Ratio and Padding for Mobile) */}
                    <div 
                      className="w-full aspect-[4/5] md:aspect-square rounded-[2.5rem] overflow-hidden border border-neutral-100 flex items-center justify-center p-6 md:p-10 hover:scale-[1.01] transition-transform duration-500"
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
                          <CollaborationMockup />
                        )}

                        {f.id === "canvas" && (
                          <InteractiveCanvasMockup />
                        )}
                      </div>
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

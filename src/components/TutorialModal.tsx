import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import avatar3 from "@/assets/avatar3.png";

// React Flow Imports
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ShapeNode from "@/components/nodes/ShapeNode";
import TodoNode from "@/components/nodes/TodoNode";

import brand1 from "@/assets/miiles/brands/brand1.svg";
import brand2 from "@/assets/miiles/brands/brand2.svg";
import brand3 from "@/assets/miiles/brands/brand3.svg";
import brand4 from "@/assets/miiles/brands/brand4.svg";
import brand5 from "@/assets/miiles/brands/brand5.svg";
import brand6 from "@/assets/miiles/brands/brand6.svg";

const BRANDS = [
  { name: "TikTok", logo: brand1 },
  { name: "L'Oréal", logo: brand2 },
  { name: "Amazon", logo: brand3 },
  { name: "Airbnb", logo: brand4 },
  { name: "Shopify", logo: brand5 },
  { name: "Zara", logo: brand6 },
];

const brandsRow1 = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS];
const brandsRow2 = [...BRANDS.slice().reverse(), ...BRANDS.slice().reverse(), ...BRANDS.slice().reverse(), ...BRANDS.slice().reverse()];;

type Step = {
  key: string;
  title: string;
  description: string;
  media?: string;
};

const STEPS: Step[] = [
  {
    key: "colaboraciones",
    title: "Colaboraciones",
    description:
      "Encuentra marcas líderes y colabora con ellas en proyectos creativos para redes sociales y estrategias digitales de alto impacto.",
  },
  {
    key: "modelos_ia",
    title: "Generador de modelos de negocio",
    description:
      "Crea tableros interactivos y modela tus flujos de trabajo con inteligencia artificial para acelerar el crecimiento de tus ideas.",
  },
  {
    key: "perfil",
    title: "Gestiona tu portafolio",
    description:
      "Gestiona tu perfil profesional, diseña un portafolio que capte la atención de las marcas y recibe invitaciones a colaboraciones especiales.",
  },
];

const STORAGE_PREFIX = "miiles_tutorial_seen";

type Props = {
  userId?: string | null;
  /** Increment this number to force-open the modal (e.g. from a banner click). */
  triggerOpen?: number;
};

export default function TutorialModal({ userId, triggerOpen }: Props) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const storageKey = userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;

  useEffect(() => {
    // Wait until we know which user we are dealing with
    if (userId === undefined) return;
    try {
      const seen = localStorage.getItem(storageKey);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [userId, storageKey]);

  // Allow opening the modal on demand (banner click)
  useEffect(() => {
    if (triggerOpen && triggerOpen > 0) {
      setActive(0);
      setOpen(true);
    }
  }, [triggerOpen]);

  function close() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function next() {
    if (active < STEPS.length - 1) {
      setActive((a) => a + 1);
    } else {
      close();
    }
  }

  const step = STEPS[active];
  const isLast = active === STEPS.length - 1;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop — igual al overlay del menú de la landing */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* Card — bg-[#7E7E7E] igual al menú desplegable de la landing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] md:max-h-none md:h-[580px] overflow-hidden rounded-[28px] shadow-2xl flex flex-col md:grid md:grid-cols-[40%_60%]"
            style={{ background: isDark ? "#000000" : "#7E7E7E" }}
          >
            {/* Close button — Movido como hijo directo para que quede fijo en mobile */}
            <button
              onClick={close}
              className="absolute right-4 top-4 md:right-5 md:top-5 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            {/* Left panel — title + steps */}
            <div className="p-6 pb-2 md:p-10 flex flex-col flex-shrink-0">
              <h2 className="text-2xl md:text-4xl font-normal leading-tight text-white pr-10 md:pr-0">
                Bienvenido a Miiles
              </h2>

              <nav className="mt-4 md:mt-10 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
                {STEPS.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => setActive(i)}
                    className={`shrink-0 block text-left px-4 py-2 rounded-xl text-xs md:text-sm transition-colors w-auto md:w-full ${
                      i === active
                        ? "bg-white/15 text-white font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right panel — media + content */}
            <div className="flex flex-col flex-grow overflow-y-auto md:overflow-visible min-h-0" style={{ background: isDark ? "#000000" : "#7E7E7E" }}>
              {/* Media area */}
              <div className="relative m-4 mb-0 h-40 md:h-64 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 overflow-hidden flex items-center justify-center flex-shrink-0 select-none">
                {/* Grid Pattern Background */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    maskImage: "radial-gradient(ellipse, black 25%, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse, black 25%, transparent 75%)"
                  }}
                >
                  <defs>
                    <pattern
                      id="tut-grid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#tut-grid)" />
                </svg>

                {/* Illustration Content */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  {active === 0 && (
                    <div className="w-full flex flex-col items-center justify-center gap-4 py-2">
                      {/* Row 1: Left to right marquee */}
                      <div className="w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
                        <div className="flex w-max gap-3.5 animate-marquee">
                          {brandsRow1.map((b, idx) => (
                            <div key={idx} className={`flex items-center justify-center px-6 sm:px-8 h-15 sm:h-20 rounded-[20px] border backdrop-blur-md shrink-0 ${
                              isDark 
                                ? "bg-black/60 border-white/5 text-white" 
                                : "bg-white/85 border-neutral-200/60 text-neutral-900 shadow-sm"
                            }`}>
                              <img 
                                src={b.logo} 
                                alt={b.name} 
                                className={`h-6 sm:h-8 w-auto object-contain shrink-0 ${
                                  isDark ? "invert opacity-90" : "opacity-70"
                                }`} 
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Row 2: Right to left marquee */}
                      <div className="w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
                        <div className="flex w-max gap-3.5 animate-marquee" style={{ animationDirection: "reverse" }}>
                          {brandsRow2.map((b, idx) => (
                            <div key={idx} className={`flex items-center justify-center px-6 sm:px-8 h-15 sm:h-20 rounded-[20px] border backdrop-blur-md shrink-0 ${
                              isDark 
                                ? "bg-black/60 border-white/5 text-white" 
                                : "bg-white/85 border-neutral-200/60 text-neutral-900 shadow-sm"
                            }`}>
                              <img 
                                src={b.logo} 
                                alt={b.name} 
                                className={`h-6 sm:h-8 w-auto object-contain shrink-0 ${
                                  isDark ? "invert opacity-90" : "opacity-70"
                                }`} 
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {active === 1 && (
                    <div className="relative w-full h-full select-none z-10 flex items-center justify-center">
                      <ReactFlowProvider>
                        <ReactFlow
                          key={isMobile ? "mobile" : "desktop"}
                          nodes={[
                            {
                              id: "node-start",
                              type: "shapeNode",
                              position: isMobile ? { x: 10, y: 40 } : { x: 20, y: 50 },
                              style: isMobile ? { width: 80, height: 80 } : { width: 100, height: 100 },
                              data: {
                                shape: "circle",
                                label: "1. Brainstorm",
                                fillColor: "#FFFFFF",
                                strokeColor: "#10B981",
                                textColor: "#111827",
                                bold: true,
                                fontSize: isMobile ? 10 : 14,
                              },
                            },
                            {
                              id: "node-left",
                              type: "shapeNode",
                              position: isMobile ? { x: 105, y: 45 } : { x: 160, y: 55 },
                              style: isMobile ? { width: 100, height: 70 } : { width: 130, height: 90 },
                              data: {
                                shape: "square",
                                label: "2. Analizar Idea",
                                fillColor: "#FFFFFF",
                                strokeColor: "#4059F1",
                                textColor: "#111827",
                                bold: true,
                                fontSize: isMobile ? 10 : 14,
                              },
                            },
                            {
                              id: "node-right",
                              type: "todoNode",
                              position: isMobile ? { x: 220, y: 10 } : { x: 330, y: 15 },
                              style: isMobile ? { width: 175, height: 190 } : { width: 250, height: 250 },
                              data: {
                                title: "Lista de Tareas",
                                subtitle: "Tareas de Lanzamiento",
                                fontSize: isMobile ? 10 : 14,
                                tasks: [
                                  { id: "t1", text: "Definir propuesta de valor", completed: true },
                                  { id: "t2", text: "Diseñar landing page", completed: true },
                                ],
                              },
                            },
                            {
                              id: "node-end",
                              type: "shapeNode",
                              position: isMobile ? { x: 410, y: 35 } : { x: 600, y: 45 },
                              style: isMobile ? { width: 90, height: 90 } : { width: 110, height: 110 },
                              data: {
                                shape: "diamond",
                                label: "4. Lanzamiento 🚀",
                                fillColor: "#FFFFFF",
                                textColor: "#111827",
                                bold: true,
                                fontSize: isMobile ? 10 : 14,
                              },
                            }
                          ]}
                          edges={[
                            {
                              id: "edge-1",
                              source: "node-start",
                              sourceHandle: "right",
                              target: "node-left",
                              targetHandle: "left",
                              animated: true,
                              style: { stroke: "#10B981", strokeWidth: 2, strokeDasharray: "4 4" },
                            },
                            {
                              id: "edge-2",
                              source: "node-left",
                              sourceHandle: "right",
                              target: "node-right",
                              targetHandle: "left",
                              animated: false,
                              style: { stroke: "#4059F1", strokeWidth: 2, strokeDasharray: "4 4" },
                            },
                            {
                              id: "edge-3",
                              source: "node-right",
                              sourceHandle: "right",
                              target: "node-end",
                              targetHandle: "left",
                              animated: false,
                              style: { stroke: "#8B5CF6", strokeWidth: 2, strokeDasharray: "4 4" },
                            }
                          ]}
                          nodeTypes={{
                            shapeNode: ShapeNode,
                            todoNode: TodoNode,
                          }}
                          fitView
                          fitViewOptions={{ padding: 0.08 }}
                          panOnDrag={false}
                          zoomOnScroll={false}
                          zoomOnPinch={false}
                          zoomOnDoubleClick={false}
                          nodesDraggable={false}
                          nodesConnectable={false}
                          elementsSelectable={false}
                          proOptions={{ hideAttribution: true }}
                          style={{ width: "100%", height: "100%", background: "transparent" }}
                        />
                      </ReactFlowProvider>

                      {/* Cursors */}
                      <div className="hidden md:flex absolute left-[24%] top-[30%] z-50 pointer-events-none items-start">
                        <svg className="w-5 h-5 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)] rotate-[-10deg] shrink-0" viewBox="0 0 24 24">
                          <path d="M4 3l16 8-8 2-6 7z" fill="#4059F1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="bg-[#4059F1] text-white py-1.5 px-3 rounded-full shadow-[0_4px_10px_rgba(64,89,241,0.3)] -ml-1.5 mt-3.5 flex items-center justify-center">
                          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-center leading-none">Mateo</span>
                        </div>
                      </div>

                      <div className="hidden md:flex absolute right-[16%] bottom-[18%] z-50 pointer-events-none items-start">
                        <svg className="w-5 h-5 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)] rotate-[-10deg] shrink-0" viewBox="0 0 24 24">
                          <path d="M4 3l16 8-8 2-6 7z" fill="#FCB5B9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="bg-[#FCB5B9] text-neutral-800 py-1.5 px-3 rounded-full shadow-[0_4px_10px_rgba(252,181,185,0.3)] -ml-1.5 mt-3.5 flex items-center justify-center">
                          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-center leading-none">Sofía</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {active === 2 && (
                    <div className="flex items-center justify-center w-full px-4 sm:px-6">
                      {/* Profile Card */}
                      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center gap-2 sm:gap-2.5 shrink-0 shadow-lg ${
                        isDark ? "bg-black/80 border-white/10" : "bg-white border-neutral-200"
                      }`} style={{ width: "160px" }}>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#4059F1]">
                          <img src={avatar3} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center">
                          <div className={`text-[12px] sm:text-[13px] font-semibold ${isDark ? "text-white" : "text-neutral-800"}`}>Laura Morales</div>
                          <div className="text-[8px] sm:text-[9px] text-[#4059F1] font-semibold bg-[#4059F1]/10 px-2 py-0.5 rounded-full mt-1 inline-block">Creador Pro</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-10 flex flex-col flex-grow">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3 className="text-xl md:text-2xl font-normal text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 md:mt-3 text-xs md:text-sm font-light leading-relaxed text-white/70">
                      {step.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Step dots */}
                <div className="flex gap-1.5 mt-5 md:mt-6">
                  {STEPS.map((s, i) => (
                    <span
                      key={s.key}
                      className={`h-1.5 rounded-full transition-all ${
                        i === active ? "w-6 bg-white" : "w-1.5 bg-white/30"
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-6 md:mt-auto pt-6 md:pt-8 flex items-center justify-end gap-3">
                  <button
                    onClick={close}
                    className="rounded-full bg-black text-white px-5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm hover:bg-zinc-900 transition-colors"
                  >
                    Probar ahora
                  </button>
                  <button
                    onClick={next}
                    className="rounded-full bg-white text-black px-5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm hover:bg-gray-100 transition-colors"
                  >
                    {isLast ? "Listo" : "Siguiente"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

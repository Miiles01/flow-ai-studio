import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer, Hand, Type, ListTodo, ImageIcon, SquareDashed, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";

type ToolbarProps = {
  onAddNode: (type: string) => void;
  interactionMode: "edit" | "pan";
  setInteractionMode: (mode: "edit" | "pan") => void;
  activeDrawShape: string | null;
  setActiveDrawShape: (shape: string | null) => void;
};

const SHAPES = [
  {
    id: "square",
    label: "Rectángulo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <rect x="2" y="2" width="20" height="20" rx="3" />
      </svg>
    ),
  },
  {
    id: "circle",
    label: "Círculo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    id: "diamond",
    label: "Rombo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <polygon points="12,2 22,12 12,22 2,12" />
      </svg>
    ),
  },
  {
    id: "triangle",
    label: "Triángulo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <polygon points="12,2 22,22 2,22" />
      </svg>
    ),
  },
  {
    id: "hexagon",
    label: "Hexágono",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
      </svg>
    ),
  },
  {
    id: "star",
    label: "Estrella",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
      </svg>
    ),
  },
];

/* Física de resorte orgánica con estiramiento elástico (overshoot natural estilo iOS/Figma) */
const elasticSpring = {
  type: "spring" as const,
  stiffness: 350,
  damping: 22,
  mass: 0.55,
};

const Toolbar = ({
  onAddNode,
  interactionMode,
  setInteractionMode,
  activeDrawShape,
  setActiveDrawShape,
}: ToolbarProps) => {
  const [selectedShape, setSelectedShape] = useState("square");
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isNear, setIsNear] = useState(false);

  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const shapesButtonRef = useRef<HTMLButtonElement>(null);
  const { isDark } = useTheme();

  /* Detección de proximidad suave para expandir antes de tocar el borde exacto */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!barRef.current) return;
      const rect = barRef.current.getBoundingClientRect();
      const proximityMargin = 70; // px alrededor de la barra

      const isInsideProximity =
        e.clientX >= rect.left - proximityMargin &&
        e.clientX <= rect.right + proximityMargin &&
        e.clientY >= rect.top - proximityMargin &&
        e.clientY <= rect.bottom + proximityMargin;

      setIsNear(isInsideProximity);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (!flyoutOpen) {
        setIsHovered(false);
      }
    }, 200);
  };

  const updateFlyoutPosition = () => {
    if (shapesButtonRef.current) {
      const rect = shapesButtonRef.current.getBoundingClientRect();
      setFlyoutPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 16,
      });
    }
  };

  const openFlyout = () => {
    if (flyoutTimer.current) clearTimeout(flyoutTimer.current);
    updateFlyoutPosition();
    setFlyoutOpen(true);
    setIsHovered(true);
  };

  const closeFlyout = () => {
    flyoutTimer.current = setTimeout(() => {
      setFlyoutOpen(false);
    }, 160);
  };

  useEffect(() => {
    return () => {
      if (flyoutTimer.current) clearTimeout(flyoutTimer.current);
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  const currentShape = SHAPES.find((s) => s.id === selectedShape) || SHAPES[0];
  const isDrawingToolActive = activeDrawShape !== null;
  const isExpanded = isNear || isHovered || flyoutOpen || isDrawingToolActive;

  return (
    <>
      <motion.div
        ref={barRef}
        layout
        transition={elasticSpring}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`absolute inset-y-0 my-auto h-fit left-6 z-10 flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] font-sans select-none origin-center overflow-hidden ${
          isDark
            ? "bg-black text-white ring-1 ring-white/10"
            : "bg-white text-black ring-1 ring-gray-200"
        }`}
      >
        {/* 1. Seleccionar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setInteractionMode("edit");
                setActiveDrawShape(null);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 ${
                interactionMode === "edit" && activeDrawShape === null
                  ? isDark
                    ? "bg-white text-black scale-100"
                    : "bg-black text-white scale-100"
                  : isDark
                  ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white"
                  : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
              }`}
            >
              <MousePointer size={18} strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
          >
            Seleccionar
          </TooltipContent>
        </Tooltip>

        {/* 2. Navegar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setInteractionMode("pan");
                setActiveDrawShape(null);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 ${
                interactionMode === "pan"
                  ? isDark
                    ? "bg-white text-black scale-100"
                    : "bg-black text-white scale-100"
                  : isDark
                  ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white"
                  : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
              }`}
            >
              <Hand size={18} strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
          >
            Navegar
          </TooltipContent>
        </Tooltip>

        {/* 3. Separador */}
        <motion.div
          layout
          transition={elasticSpring}
          className={`w-6 h-[1px] my-0.5 shrink-0 ${isDark ? "bg-white/10" : "bg-[#E5E7EB]"}`}
        />

        {/* 4. Sección de Herramientas Dinámicas con contención estricta */}
        <motion.div layout transition={elasticSpring} className="flex flex-col items-center gap-1.5 w-full overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            {!isExpanded ? (
              /* Estado Colapsado: Botón Plus con morphing elástico */
              <motion.div
                key="collapsed-plus"
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.12 } }}
                transition={elasticSpring}
                className="flex items-center justify-center shrink-0"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsHovered(true)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                        isDrawingToolActive
                          ? isDark
                            ? "bg-white text-black "
                            : "bg-black text-white "
                          : isDark
                          ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white"
                          : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                      }`}
                      aria-label="Elementos y formas"
                    >
                      <Plus size={19} strokeWidth={1.75} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
                  >
                    Elementos y formas
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ) : (
              /* Estado Expandido: Formas y Elementos */
              <motion.div
                key="expanded-tools"
                layout
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4, transition: { duration: 0.12 } }}
                transition={elasticSpring}
                className="flex flex-col items-center gap-1.5 w-full"
              >
                {/* Formas con botón referenciado para flyout */}
                <div
                  className="relative flex items-center shrink-0"
                  onMouseEnter={openFlyout}
                  onMouseLeave={closeFlyout}
                >
                  <Tooltip open={flyoutOpen ? false : undefined}>
                    <TooltipTrigger asChild>
                      <button
                        ref={shapesButtonRef}
                        onClick={() => {
                          if (activeDrawShape === selectedShape) {
                            setActiveDrawShape(null);
                          } else {
                            setActiveDrawShape(selectedShape);
                            setInteractionMode("edit");
                          }
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                          activeDrawShape !== null &&
                          activeDrawShape !== "text" &&
                          activeDrawShape !== "todo" &&
                          activeDrawShape !== "image" &&
                          activeDrawShape !== "frame"
                            ? isDark
                              ? "bg-white text-black hover:bg-white/90"
                              : "bg-black text-white hover:bg-black/90"
                            : isDark
                            ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white"
                            : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                        }`}
                      >
                        {currentShape.icon}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={12}
                      className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
                    >
                      Formas
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Texto */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (activeDrawShape === "text") {
                          setActiveDrawShape(null);
                        } else {
                          setActiveDrawShape("text");
                          setInteractionMode("edit");
                        }
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 ${
                        activeDrawShape === "text"
                          ? isDark
                            ? "bg-white text-black "
                            : "bg-black text-white "
                          : isDark
                          ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white"
                          : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                      }`}
                    >
                      <Type size={18} strokeWidth={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
                  >
                    Texto
                  </TooltipContent>
                </Tooltip>

                {/* Lista de Tareas */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (activeDrawShape === "todo") {
                          setActiveDrawShape(null);
                        } else {
                          setActiveDrawShape("todo");
                          setInteractionMode("edit");
                        }
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 ${
                        activeDrawShape === "todo"
                          ? isDark
                            ? "bg-white text-black "
                            : "bg-black text-white "
                          : isDark
                          ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white"
                          : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                      }`}
                    >
                      <ListTodo size={18} strokeWidth={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
                  >
                    Lista de Tareas
                  </TooltipContent>
                </Tooltip>

                {/* Image Block */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (activeDrawShape === "image") {
                          setActiveDrawShape(null);
                        } else {
                          setActiveDrawShape("image");
                          setInteractionMode("edit");
                        }
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 ${
                        activeDrawShape === "image"
                          ? isDark
                            ? "bg-white text-black "
                            : "bg-black text-white "
                          : isDark
                          ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white"
                          : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                      }`}
                    >
                      <ImageIcon size={18} strokeWidth={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
                  >
                    Imagen
                  </TooltipContent>
                </Tooltip>

                {/* Frame / Section */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (activeDrawShape === "frame") {
                          setActiveDrawShape(null);
                        } else {
                          setActiveDrawShape("frame");
                          setInteractionMode("edit");
                        }
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 ${
                        activeDrawShape === "frame"
                          ? isDark
                            ? "bg-white text-black "
                            : "bg-black text-white "
                          : isDark
                          ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white"
                          : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                      }`}
                    >
                      <SquareDashed size={18} strokeWidth={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
                  >
                    Sección
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Flyout flotante montado via Portal (nunca recortado por overflow-hidden) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {flyoutOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.94 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                onMouseEnter={openFlyout}
                onMouseLeave={closeFlyout}
                className={`fixed w-[128px] rounded-2xl p-2.5 z-[9999] select-none shadow-[0_16px_48px_rgba(0,0,0,0.12)] ${
                  isDark ? "bg-black ring-1 ring-white/10 text-white shadow-[0_16px_48px_rgba(0,0,0,0.4)]" : "bg-white border border-[#E5E7EB] text-black "
                }`}
                style={{
                  top: `${flyoutPos.top}px`,
                  left: `${flyoutPos.left}px`,
                  transform: "translateY(-50%)",
                }}
              >
                <div className="grid grid-cols-2 gap-1.5">
                  {SHAPES.map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => {
                        setSelectedShape(shape.id);
                        setActiveDrawShape(shape.id);
                        setInteractionMode("edit");
                        setFlyoutOpen(false);
                      }}
                      title={shape.label}
                      className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
                        selectedShape === shape.id
                          ? isDark
                            ? "bg-white text-black "
                            : "bg-black text-white "
                          : isDark
                          ? "text-[#9CA3AF] hover:bg-white/10 hover:text-white"
                          : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
                      }`}
                    >
                      {shape.icon}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default Toolbar;

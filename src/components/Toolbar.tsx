import { useState, useRef, useEffect, useCallback } from "react";
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

/** Distancia mínima del punto (px, py) al borde del rect. 0 si está dentro. */
function distToRect(px: number, py: number, rect: DOMRect): number {
  const dx = Math.max(rect.left - px, 0, px - rect.right);
  const dy = Math.max(rect.top - py, 0, py - rect.bottom);
  return Math.sqrt(dx * dx + dy * dy);
}

/** Zona de proximidad en píxeles */
const PROXIMITY_THRESHOLD = 90;

const springPhysics = {
  type: "spring" as const,
  stiffness: 350,
  damping: 22,
  mass: 0.5,
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
  const [isNearby, setIsNearby] = useState(false);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isDark } = useTheme();

  /* ── Proximidad: escucha mousemove en el window ── */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!toolbarRef.current) return;
    const rect = toolbarRef.current.getBoundingClientRect();
    const dist = distToRect(e.clientX, e.clientY, rect);
    setIsNearby(dist < PROXIMITY_THRESHOLD);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  /* ── Flyout helpers ── */
  const openFlyout = () => {
    if (flyoutTimer.current) clearTimeout(flyoutTimer.current);
    setFlyoutOpen(true);
  };

  const closeFlyout = () => {
    flyoutTimer.current = setTimeout(() => setFlyoutOpen(false), 180);
  };

  useEffect(() => {
    return () => {
      if (flyoutTimer.current) clearTimeout(flyoutTimer.current);
    };
  }, []);

  const currentShape = SHAPES.find((s) => s.id === selectedShape) || SHAPES[0];

  const isShapeActive =
    activeDrawShape !== null &&
    activeDrawShape !== "text" &&
    activeDrawShape !== "todo" &&
    activeDrawShape !== "image" &&
    activeDrawShape !== "frame";

  /* ── Clases de botón ── */
  const btnCls = (isActive: boolean) =>
    `w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
      isActive
        ? isDark
          ? "bg-white text-black shadow-sm"
          : "bg-black text-white shadow-sm"
        : isDark
        ? "hover:bg-white/10 text-gray-400 hover:text-white"
        : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
    }`;

  return (
    <motion.div
      ref={toolbarRef}
      initial={{ x: -40, opacity: 0 }}
      animate={{
        x: 0,
        opacity: 1,
        translateX: isNearby ? 4 : 0,
        scale: isNearby ? 1.04 : 1,
        boxShadow: isNearby
          ? isDark
            ? "0 12px 40px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.3)"
            : "0 12px 40px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)"
          : "0 8px 30px rgba(0,0,0,0.06)",
      }}
      transition={{
        x: { type: "spring", stiffness: 380, damping: 30, mass: 0.7 },
        opacity: { duration: 0.3 },
        translateX: springPhysics,
        scale: springPhysics,
        boxShadow: { duration: 0.25 },
      }}
      className={`absolute inset-y-0 my-auto h-fit left-6 z-10 flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-[28px] font-sans select-none ${
        isDark ? "bg-[#1C1C1E] border border-white/10 text-white" : "bg-white border border-black/[0.06] text-black"
      }`}
    >
      {/* ── Estado colapsado: solo el Plus con fade simple ── */}
      <AnimatePresence mode="popLayout">
        {!isNearby && (
          <motion.div
            key="collapsed-plus"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                    isDark
                      ? "hover:bg-white/10 text-gray-400 hover:text-white"
                      : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                  }`}
                  aria-label="Herramientas"
                >
                  <Plus size={19} strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
                Herramientas
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}

        {/* ── Estado expandido: todas las herramientas con fade simple ── */}
        {isNearby && (
          <motion.div
            key="expanded-tools"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5"
          >
            {/* 1. Seleccionar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setInteractionMode("edit");
                    setActiveDrawShape(null);
                  }}
                  className={btnCls(interactionMode === "edit" && activeDrawShape === null)}
                >
                  <MousePointer size={18} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
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
                  className={btnCls(interactionMode === "pan")}
                >
                  <Hand size={18} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
                Navegar
              </TooltipContent>
            </Tooltip>

            {/* Separador */}
            <div className={`w-6 h-[1px] my-0.5 shrink-0 ${isDark ? "bg-white/10" : "bg-[#E5E7EB]"}`} />

            {/* 3. Formas (con flyout) */}
            <div className="relative flex items-center" onMouseEnter={openFlyout} onMouseLeave={closeFlyout}>
              <Tooltip open={flyoutOpen ? false : undefined}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (activeDrawShape === selectedShape) {
                        setActiveDrawShape(null);
                      } else {
                        setActiveDrawShape(selectedShape);
                        setInteractionMode("edit");
                      }
                    }}
                    className={btnCls(isShapeActive)}
                  >
                    {currentShape.icon}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className={`text-[13px] border-none rounded-full px-3 py-1.5 font-light ${
                    isDark ? "bg-white text-black" : "bg-black text-white"
                  }`}
                >
                  Formas
                </TooltipContent>
              </Tooltip>

              <AnimatePresence>
                {flyoutOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -8, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -8, scale: 0.96 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    onMouseEnter={openFlyout}
                    onMouseLeave={closeFlyout}
                    className={`absolute left-[calc(100%+16px)] w-[128px] rounded-2xl p-3 shadow-[0_16px_48px_rgb(0,0,0,0.3)] z-50 ${
                      isDark ? "bg-[#2C2C2E] border border-white/10" : "bg-[#111]"
                    }`}
                    style={{ top: "20px", transform: "translateY(-50%)" }}
                  >
                    <div className="grid grid-cols-2 gap-2">
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
                          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                            selectedShape === shape.id
                              ? "bg-white text-black"
                              : isDark
                              ? "text-gray-400 hover:bg-white/10 hover:text-white"
                              : "text-[#777] hover:bg-[#222] hover:text-white"
                          }`}
                        >
                          {shape.icon}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Texto */}
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
                  className={btnCls(activeDrawShape === "text")}
                >
                  <Type size={18} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
                Texto
              </TooltipContent>
            </Tooltip>

            {/* 5. Lista de tareas */}
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
                  className={btnCls(activeDrawShape === "todo")}
                >
                  <ListTodo size={18} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
                Lista de tareas
              </TooltipContent>
            </Tooltip>

            {/* 6. Imagen */}
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
                  className={btnCls(activeDrawShape === "image")}
                >
                  <ImageIcon size={18} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
                Imagen
              </TooltipContent>
            </Tooltip>

            {/* 7. Sección */}
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
                  className={btnCls(activeDrawShape === "frame")}
                >
                  <SquareDashed size={18} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
                Sección
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Toolbar;

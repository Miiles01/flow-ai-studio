import { useState, useRef, useEffect } from "react";
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

<<<<<<< HEAD
const spring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
  mass: 0.5,
};

const PROXIMITY = 130; // px de radio alrededor del toolbar

=======
const springTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
  mass: 0.6,
};

>>>>>>> b41dece (feat: restore fluid collapsible animated Toolbar with proximity hover and creation tools)
const Toolbar = ({
  onAddNode,
  interactionMode,
  setInteractionMode,
  activeDrawShape,
  setActiveDrawShape,
}: ToolbarProps) => {
  const [selectedShape, setSelectedShape] = useState("square");
  const [flyoutOpen, setFlyoutOpen] = useState(false);
<<<<<<< HEAD
  const [isNear, setIsNear] = useState(false);
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
=======
  const [isHovered, setIsHovered] = useState(false);
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
>>>>>>> b41dece (feat: restore fluid collapsible animated Toolbar with proximity hover and creation tools)
  const { isDark } = useTheme();

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
    }, 180);
  };

  const openFlyout = () => {
    if (flyoutTimer.current) clearTimeout(flyoutTimer.current);
    setFlyoutOpen(true);
    setIsHovered(true);
  };

  const closeFlyout = () => {
    flyoutTimer.current = setTimeout(() => {
      setFlyoutOpen(false);
    }, 150);
  };

<<<<<<< HEAD
  /* Detección de proximidad del cursor */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = barRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      setIsNear(Math.hypot(dx, dy) < PROXIMITY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const isCreating =
    activeDrawShape !== null && activeDrawShape !== undefined;
  const expanded = isNear || flyoutOpen || isCreating;

=======
  useEffect(() => {
    return () => {
      if (flyoutTimer.current) clearTimeout(flyoutTimer.current);
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

>>>>>>> b41dece (feat: restore fluid collapsible animated Toolbar with proximity hover and creation tools)
  const currentShape = SHAPES.find((s) => s.id === selectedShape) || SHAPES[0];
  const isExpanded = isHovered || flyoutOpen || activeDrawShape !== null;
  const isDrawingToolActive = activeDrawShape !== null;

  const toolItem = {
    initial: { opacity: 0, y: -8, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.8 },
  };

  return (
<<<<<<< HEAD
    <motion.div
      ref={barRef}
      layout
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={spring}
      className={`absolute inset-y-0 my-auto h-fit left-6 z-10 flex flex-col items-center gap-1.5 px-2 py-3 rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] font-sans ${isDark ? 'bg-[#1C1C1E] border border-white/10 text-white' : 'bg-white'}`}
    >

      {/* Seleccionar */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              setInteractionMode("edit");
              setActiveDrawShape(null);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              interactionMode === "edit" && activeDrawShape === null
                ? isDark ? "bg-white text-black shadow-md" : "bg-black text-white shadow-md"
                : isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
            }`}
          >
            <MousePointer size={18} strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
          Seleccionar
        </TooltipContent>
      </Tooltip>

      {/* Navegar */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              setInteractionMode("pan");
              setActiveDrawShape(null);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              interactionMode === "pan"
                ? isDark ? "bg-white text-black shadow-md" : "bg-black text-white shadow-md"
                : isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
            }`}
          >
            <Hand size={18} strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
          Navegar
        </TooltipContent>
      </Tooltip>

      <motion.div layout className={`w-6 h-[1px] my-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

      {/* Botón Plus (estado colapsado) */}
      <AnimatePresence initial={false}>
        {!expanded && (
          <motion.button
            key="plus"
            layout
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={spring}
            onClick={() => setActiveDrawShape(selectedShape)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
            }`}
            aria-label="Más herramientas"
          >
            <Plus size={18} strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Herramientas de creación (estado expandido) */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="tools"
            layout
            initial={{ opacity: 0, scaleY: 0.85 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.85 }}
            transition={spring}
            className="flex flex-col items-center gap-1.5 origin-top"
          >
      {/* Formas con flyout */}

      <div className="relative flex items-center" onMouseEnter={openFlyout} onMouseLeave={closeFlyout}>
        <Tooltip open={flyoutOpen ? false : undefined}>
=======
    <div
      className="absolute inset-y-0 my-auto h-fit left-3 z-10 p-3"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        layout
        transition={springTransition}
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] font-sans select-none overflow-visible ${
          isDark
            ? "bg-[#1C1C1E] border border-white/10 text-white"
            : "bg-white border border-black/[0.04] text-black"
        }`}
      >
        {/* 1. Seleccionar */}
        <Tooltip>
>>>>>>> b41dece (feat: restore fluid collapsible animated Toolbar with proximity hover and creation tools)
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setInteractionMode("edit");
                setActiveDrawShape(null);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                interactionMode === "edit" && activeDrawShape === null
                  ? isDark
                    ? "bg-white text-black shadow-md"
                    : "bg-black text-white shadow-md"
                  : isDark
                  ? "hover:bg-white/10 text-gray-400 hover:text-white"
                  : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
              }`}
            >
              <MousePointer size={18} strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
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
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                interactionMode === "pan"
                  ? isDark
                    ? "bg-white text-black shadow-md"
                    : "bg-black text-white shadow-md"
                  : isDark
                  ? "hover:bg-white/10 text-gray-400 hover:text-white"
                  : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
              }`}
            >
              <Hand size={18} strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
          >
            Navegar
          </TooltipContent>
        </Tooltip>

        {/* Separador */}
        <motion.div
          layout
          className={`w-6 h-[1px] my-1 shrink-0 ${isDark ? "bg-white/10" : "bg-[#E5E7EB]"}`}
        />

        {/* 3. Ícono Plus cuando está colapsado / Formas + Herramientas cuando está expandido */}
        <AnimatePresence mode="wait" initial={false}>
          {!isExpanded ? (
            <motion.div
              key="collapsed-plus"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsHovered(true)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                      isDrawingToolActive
                        ? isDark
                          ? "bg-white text-black shadow-md"
                          : "bg-black text-white shadow-md"
                        : isDark
                        ? "hover:bg-white/10 text-gray-400 hover:text-white"
                        : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                    }`}
                  >
                    <Plus size={18} strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
                >
                  Elementos y formas
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-tools"
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={springTransition}
              className="flex flex-col items-center gap-1.5"
            >
              {/* Formas con flyout */}
              <div
                className="relative flex items-center"
                onMouseEnter={openFlyout}
                onMouseLeave={closeFlyout}
              >
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
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                        activeDrawShape !== null &&
                        activeDrawShape !== "text" &&
                        activeDrawShape !== "todo" &&
                        activeDrawShape !== "image" &&
                        activeDrawShape !== "frame"
                          ? isDark
                            ? "bg-white text-black shadow-md hover:bg-white/90"
                            : "bg-black text-white shadow-md hover:bg-black/90"
                          : isDark
                          ? "hover:bg-white/10 text-gray-400 hover:text-white"
                          : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                      }`}
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
                                ? isDark
                                  ? "bg-white text-black"
                                  : "bg-white text-black"
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
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                      activeDrawShape === "text"
                        ? isDark
                          ? "bg-white text-black shadow-md"
                          : "bg-black text-white"
                        : isDark
                        ? "hover:bg-white/10 text-gray-400 hover:text-white"
                        : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                    }`}
                  >
                    <Type size={18} strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
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
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                      activeDrawShape === "todo"
                        ? isDark
                          ? "bg-white text-black shadow-md"
                          : "bg-black text-white"
                        : isDark
                        ? "hover:bg-white/10 text-gray-400 hover:text-white"
                        : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                    }`}
                  >
                    <ListTodo size={18} strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
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
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                      activeDrawShape === "image"
                        ? isDark
                          ? "bg-white text-black shadow-md"
                          : "bg-black text-white"
                        : isDark
                        ? "hover:bg-white/10 text-gray-400 hover:text-white"
                        : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                    }`}
                  >
                    <ImageIcon size={18} strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
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
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                      activeDrawShape === "frame"
                        ? isDark
                          ? "bg-white text-black shadow-md"
                          : "bg-black text-white"
                        : isDark
                        ? "hover:bg-white/10 text-gray-400 hover:text-white"
                        : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                    }`}
                  >
                    <SquareDashed size={18} strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light"
                >
                  Sección
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
<<<<<<< HEAD
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
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              activeDrawShape === "text"
                ? isDark ? "bg-white text-black shadow-md" : "bg-black text-white"
                : isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
            }`}
          >
            <Type size={18} strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
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
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              activeDrawShape === "todo"
                ? isDark ? "bg-white text-black shadow-md" : "bg-black text-white"
                : isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
            }`}
          >
            <ListTodo size={18} strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
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
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              activeDrawShape === "image"
                ? isDark ? "bg-white text-black shadow-md" : "bg-black text-white"
                : isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
            }`}
          >
            <ImageIcon size={18} strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="text-[13px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
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
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              activeDrawShape === "frame"
                ? isDark ? "bg-white text-black shadow-md" : "bg-black text-white"
                : isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
            }`}
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

=======
      </motion.div>
    </div>
>>>>>>> b41dece (feat: restore fluid collapsible animated Toolbar with proximity hover and creation tools)
  );
};

export default Toolbar;

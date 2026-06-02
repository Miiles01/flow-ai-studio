import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer, Hand, Type, ListTodo, ImageIcon, SquareDashed } from "lucide-react";
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

const Toolbar = ({
  onAddNode,
  interactionMode,
  setInteractionMode,
  activeDrawShape,
  setActiveDrawShape,
}: ToolbarProps) => {
  const [selectedShape, setSelectedShape] = useState("square");
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isDark } = useTheme();

  const openFlyout = () => {
    if (flyoutTimer.current) clearTimeout(flyoutTimer.current);
    setFlyoutOpen(true);
  };
  const closeFlyout = () => {
    flyoutTimer.current = setTimeout(() => setFlyoutOpen(false), 120);
  };

  const currentShape = SHAPES.find((s) => s.id === selectedShape) || SHAPES[0];

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
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

      <div className={`w-6 h-[1px] my-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

      {/* Formas con flyout */}
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
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                activeDrawShape !== null && activeDrawShape !== "text" && activeDrawShape !== "todo" && activeDrawShape !== "image" && activeDrawShape !== "frame"
                  ? isDark ? "bg-white text-black shadow-md hover:bg-white/90" : "bg-black text-white shadow-md hover:bg-black/90"
                  : isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
              }`}
            >
              {currentShape.icon}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className={`text-[13px] border-none rounded-full px-3 py-1.5 font-light ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
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
              className={`absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 w-[128px] rounded-2xl p-3 shadow-[0_16px_48px_rgb(0,0,0,0.3)] z-50 ${isDark ? 'bg-[#2C2C2E] border border-white/10' : 'bg-[#111]'}`}
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
                        ? isDark ? "bg-white text-black" : "bg-white text-black"
                        : isDark ? "text-gray-400 hover:bg-white/10 hover:text-white" : "text-[#777] hover:bg-[#222] hover:text-white"
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
  );
};

export default Toolbar;

import { memo, useState, useRef, useEffect, forwardRef } from "react";
import { Handle, Position, type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Square, Circle, Triangle, Hexagon, Star, Plus, Minus, Palette, Bold, Italic, Underline, Diamond, Trash2, Baseline, Check } from "lucide-react";

interface AutoResizingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

const AutoResizingTextarea = forwardRef<HTMLTextAreaElement, AutoResizingTextareaProps>(
  ({ value, onChange, className, style, rows = 1, ...props }, ref) => {
    const localRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
      const el = localRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    };

    // Sincroniza localRef con el ref prop de React (soportando ref objeto y ref callback)
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(localRef.current);
      } else {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = localRef.current;
      }
    }, [ref]);

    useEffect(() => {
      adjustHeight();
    }, [value]);

    useEffect(() => {
      const el = localRef.current;
      if (!el) return;
      const observer = new ResizeObserver(() => {
        adjustHeight();
      });
      observer.observe(el);
      return () => {
        observer.disconnect();
      };
    }, []);

    return (
      <textarea
        ref={localRef}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          adjustHeight();
        }}
        className={`${className} resize-none overflow-hidden`}
        rows={rows}
        style={style}
        {...props}
      />
    );
  }
);
AutoResizingTextarea.displayName = "AutoResizingTextarea";

export type ShapeNodeData = {
  shape: string;
  label?: string;
  fillColor?: string;
  strokeColor?: string;
  textColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

const SVG_SHAPES: Record<string, React.ReactNode> = {
  square: <rect x="0" y="0" width="100" height="100" rx="0" vectorEffect="non-scaling-stroke" />,
  circle: <ellipse cx="50" cy="50" rx="50" ry="50" vectorEffect="non-scaling-stroke" />,
  diamond: <polygon points="50,0 100,50 50,100 0,50" vectorEffect="non-scaling-stroke" />,
  triangle: <polygon points="50,0 100,100 0,100" vectorEffect="non-scaling-stroke" />,
  hexagon: <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" vectorEffect="non-scaling-stroke" />,
  star: <polygon points="50,0 61,35 100,35 69,58 81,95 50,73 19,95 31,58 0,35 39,35" vectorEffect="non-scaling-stroke" />,
};

const RAINBOW_COLORS = [
  { name: "Transparente", value: "transparent" },
  { name: "Rojo", value: "#EF4444" },
  { name: "Naranja", value: "#F97316" },
  { name: "Amarillo", value: "#FACC15" },
  { name: "Verde", value: "#22C55E" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Morado", value: "#A855F7" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Negro", value: "#1F2937" },
];

const TEXT_COLOR_PALETTE = [
  { name: "Negro", value: "#111827" },
  { name: "Gris", value: "#6B7280" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Azul", value: "#2563EB" },
  { name: "Verde", value: "#059669" },
  { name: "Rojo", value: "#DC2626" },
  { name: "Amarillo", value: "#FACC15" },
];

const handleClass =
  "!w-[10px] !h-[10px] !rounded-full !bg-white !border-[1.5px] !border-[#4059F1] transition-all duration-200 hover:!bg-[#4059F1] before:absolute before:-inset-3 before:content-[''] !z-50";

const isColorDark = (colorHex: string): boolean => {
  if (!colorHex || colorHex === "transparent") return false;
  const hex = colorHex.replace("#", "").trim();
  if (hex.toLowerCase() === "white") return false;
  if (hex.toLowerCase() === "black") return true;
  
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }
  return false;
};

const isWhiteColor = (color: string | undefined): boolean => {
  if (!color) return false;
  const cleaned = color.trim().toLowerCase();
  return cleaned === "#ffffff" || cleaned === "white" || cleaned === "#fff" || cleaned === "#fafafa" || cleaned === "#f3f4f6";
};

const isBlackColor = (color: string | undefined): boolean => {
  if (!color) return false;
  const cleaned = color.trim().toLowerCase();
  return cleaned === "#000000" || cleaned === "black" || cleaned === "#000" || cleaned === "#111827" || cleaned === "#1f2937" || cleaned === "#1c1c1e";
};

const ShapeNode = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as ShapeNodeData;
  const shape = nodeData.shape || "square";
  const [label, setLabel] = useState((nodeData.label || "").replace(/<br\s*\/?>/gi, "\n"));
  const [editing, setEditing] = useState(false);
  const [activePicker, setActivePicker] = useState<"fill" | "border" | "text" | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes, getNodes } = useReactFlow();
  const { zoom } = useViewport();
  const { isDark } = useTheme();

  const selectedNodes = getNodes().filter((n) => n.selected);
  const isSingleSelected = selected && selectedNodes.length === 1;

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  // Sync label local state if nodeData changes
  useEffect(() => {
    setLabel((nodeData.label || "").replace(/<br\s*\/?>/gi, "\n"));
  }, [nodeData.label]);

  const updateNodeData = (newData: Partial<ShapeNodeData>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, ...newData } }
          : n
      )
    );
  };

  const handleBlur = () => {
    setEditing(false);
    updateNodeData({ label });
  };

  // Reacción dinámica en modo oscuro: si tiene fondo blanco, se pone oscuro.
  const rawFill = nodeData.fillColor || (isDark ? "#2C2C2E" : "#FFFFFF");
  const isWhiteFill = isWhiteColor(rawFill);
  const fillColor = isDark && isWhiteFill ? "#2C2C2E" : rawFill;

  const isFillDark = fillColor === "transparent" ? isDark : isColorDark(fillColor);
  const defaultTextColor = isFillDark ? "#FFFFFF" : "#111827";

  // Reacción dinámica en modo oscuro: si tiene texto negro, se pone blanco.
  const rawTextColor = nodeData.textColor || defaultTextColor;
  const isBlackText = isBlackColor(rawTextColor);
  const textColor = isDark && (isBlackText || isWhiteFill) ? "#FFFFFF" : rawTextColor;

  const textStyle: React.CSSProperties = {
    fontSize: `${nodeData.fontSize || 14}px`,
    fontWeight: nodeData.bold ? "bold" : "normal",
    fontStyle: nodeData.italic ? "italic" : "normal",
    textDecoration: nodeData.underline ? "underline" : "none",
    color: textColor,
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ width: "100%", height: "100%" }}
      className="relative"
      onDoubleClick={() => setEditing(true)}
    >
      <NodeResizer isVisible={!!isSingleSelected} minWidth={60} minHeight={60} lineStyle={{ border: "none" }} />

      {/* ── Custom Shape Toolbar ── */}
      <AnimatePresence>
        {isSingleSelected && (
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto node-floating-toolbar"
            style={{
              whiteSpace: "nowrap",
              transform: `translate(-50%, 0) scale(${1 / zoom})`,
              transformOrigin: "bottom center",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <motion.div
              key="shape-toolbar"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className={`flex items-center gap-0.5 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] px-2 py-1.5 ${isDark ? 'bg-[#1C1C1E] border border-white/10' : 'bg-white border border-gray-100/50'}`}
            >
              {/* Shape Selector flyout */}
              <div className="flex items-center gap-0.5">
                {(["square", "circle", "diamond", "triangle", "hexagon", "star"] as const).map((s) => {
                  const isActive = shape === s;
                  return (
                    <button
                      key={s}
                      onClick={() => updateNodeData({ shape: s })}
                      className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                        isActive ? "bg-[#4059F1] text-white" : isDark ? "hover:bg-white/10 text-zinc-400 hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
                      }`}
                      title={`Cambiar a ${s}`}
                    >
                      {s === "square" && <Square size={12} />}
                      {s === "circle" && <Circle size={12} />}
                      {s === "diamond" && <Diamond size={12} />}
                      {s === "triangle" && <Triangle size={12} />}
                      {s === "hexagon" && <Hexagon size={12} />}
                      {s === "star" && <Star size={12} />}
                    </button>
                  );
                })}
              </div>

              <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

              {/* Color pickers */}
              <div className="relative flex items-center gap-1">
                {/* Fill Color */}
                <button
                  onClick={() => setActivePicker(activePicker === "fill" ? null : "fill")}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors relative ${isDark ? 'hover:bg-white/10' : 'hover:bg-[#F3F4F6]'}`}
                  title="Color de relleno"
                >
                  <Palette size={13} className="text-[#6B7280]" />
                  <div
                    className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white overflow-hidden"
                    style={{ backgroundColor: nodeData.fillColor === "transparent" ? "white" : (nodeData.fillColor || "white") }}
                  >
                    {nodeData.fillColor === "transparent" && (
                      <div className="absolute w-full h-[1px] bg-red-500 rotate-45" style={{ top: "45%" }} />
                    )}
                  </div>
                </button>

                {/* Border Color */}
                <button
                  onClick={() => setActivePicker(activePicker === "border" ? null : "border")}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors relative ${isDark ? 'hover:bg-white/10' : 'hover:bg-[#F3F4F6]'}`}
                  title="Color de borde"
                >
                  <Square size={13} className="text-[#6B7280]" />
                  <div
                    className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white overflow-hidden"
                    style={{ backgroundColor: nodeData.strokeColor === "transparent" ? "white" : (nodeData.strokeColor || "#D1D5DB") }}
                  >
                    {nodeData.strokeColor === "transparent" && (
                      <div className="absolute w-full h-[1px] bg-red-500 rotate-45" style={{ top: "45%" }} />
                    )}
                  </div>
                </button>

                {/* Text Color */}
                <button
                  onClick={() => setActivePicker(activePicker === "text" ? null : "text")}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-[#F3F4F6]'}`}
                  title="Color de texto"
                >
                  <Baseline size={13} style={{ color: nodeData.textColor || (isDark ? "#FFFFFF" : "#111827") }} className="stroke-[2.5]" />
                </button>

                {/* Fill Color Popover */}
                {activePicker === "fill" && (
                  <div className={`absolute bottom-full mb-2 left-0 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-2.5 grid grid-cols-5 gap-1.5 z-30 w-[150px] ${isDark ? 'bg-[#1C1C1E] border border-white/10' : 'bg-white border border-gray-100'}`}>
                    {RAINBOW_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => { updateNodeData({ fillColor: c.value }); setActivePicker(null); }}
                        className="w-6 h-6 rounded-full border border-gray-200/60 transition-transform hover:scale-110 flex items-center justify-center overflow-hidden relative shadow-sm cursor-pointer"
                        style={{ backgroundColor: c.value === "transparent" ? "white" : c.value }}
                        title={c.name}
                      >
                        {c.value === "transparent" && <div className="absolute w-full h-[1.5px] bg-red-500 rotate-45" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Border Color Popover */}
                {activePicker === "border" && (
                  <div className={`absolute bottom-full mb-2 left-0 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-2.5 grid grid-cols-5 gap-1.5 z-30 w-[150px] ${isDark ? 'bg-[#1C1C1E] border border-white/10' : 'bg-white border border-gray-100'}`}>
                    {RAINBOW_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => { updateNodeData({ strokeColor: c.value }); setActivePicker(null); }}
                        className="w-6 h-6 rounded-full border border-gray-200/60 transition-transform hover:scale-110 flex items-center justify-center overflow-hidden relative shadow-sm cursor-pointer"
                        style={{ backgroundColor: c.value === "transparent" ? "white" : c.value }}
                        title={c.name}
                      >
                        {c.value === "transparent" && <div className="absolute w-full h-[1.5px] bg-red-500 rotate-45" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Text Color Popover */}
                {activePicker === "text" && (
                  <div className={`absolute bottom-full mb-2 left-0 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-2.5 flex gap-1.5 z-30 ${isDark ? 'bg-[#1C1C1E] border border-white/10' : 'bg-white border border-gray-100'}`}>
                    {TEXT_COLOR_PALETTE.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => { updateNodeData({ textColor: c.value }); setActivePicker(null); }}
                        className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform flex items-center justify-center"
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      >
                        {(nodeData.textColor || "#111827") === c.value && (
                          <Check size={10} className={c.value === "#FFFFFF" || c.value === "#FACC15" ? "text-gray-800" : "text-white"} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

              {/* Text formatting options */}
              <div className="flex items-center gap-0.5">
                {/* Font Size selectors */}
                <button
                  onClick={() => {
                    const currentSize = nodeData.fontSize || 14;
                    updateNodeData({ fontSize: Math.max(10, currentSize - 1) });
                  }}
                  className={`w-6 h-6 flex items-center justify-center rounded-md text-[#6B7280] transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-[#F3F4F6]'}`}
                  title="Reducir letra"
                >
                  <Minus size={10} strokeWidth={2.5} />
                </button>
                <input
                  type="text"
                  value={nodeData.fontSize || 14}
                  onChange={(e) => {
                    const num = parseInt(e.target.value, 10);
                    if (!isNaN(num)) {
                      updateNodeData({ fontSize: Math.min(200, num) });
                    }
                  }}
                  className={`nodrag nopan text-[11px] font-normal w-6 text-center bg-transparent border-none outline-none rounded py-0.5 font-sans ${isDark ? 'text-white focus:bg-white/10' : 'text-black focus:bg-neutral-100'}`}
                  style={{ width: "20px" }}
                />
                <button
                  onClick={() => {
                    const currentSize = nodeData.fontSize || 14;
                    updateNodeData({ fontSize: Math.min(200, currentSize + 1) });
                  }}
                  className={`w-6 h-6 flex items-center justify-center rounded-md text-[#6B7280] transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-[#F3F4F6]'}`}
                  title="Aumentar letra"
                >
                  <Plus size={10} strokeWidth={2.5} />
                </button>

                <div className={`w-[1px] h-3 mx-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

                {/* Bold */}
                <button
                  onClick={() => updateNodeData({ bold: !nodeData.bold })}
                  className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                    nodeData.bold ? "bg-[#4059F1] text-white" : isDark ? "hover:bg-white/10 text-[#6B7280]" : "hover:bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                  title="Negrita"
                >
                  <Bold size={11} />
                </button>

                {/* Italic */}
                <button
                  onClick={() => updateNodeData({ italic: !nodeData.italic })}
                  className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                    nodeData.italic ? "bg-[#4059F1] text-white" : isDark ? "hover:bg-white/10 text-[#6B7280]" : "hover:bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                  title="Cursiva"
                >
                  <Italic size={11} />
                </button>

                {/* Underline */}
                <button
                  onClick={() => updateNodeData({ underline: !nodeData.underline })}
                  className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                    nodeData.underline ? "bg-[#4059F1] text-white" : isDark ? "hover:bg-white/10 text-[#6B7280]" : "hover:bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                  title="Subrayado"
                >
                  <Underline size={11} />
                </button>
              </div>

              <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

              {/* Delete node */}
              <button
                onClick={() => setNodes((nds) => nds.filter((n) => n.id !== id))}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-[#9CA3AF] hover:text-red-400' : 'hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444]'}`}
                title="Eliminar"
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SVG shape */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0"
        style={{
          fill: fillColor,
          stroke: nodeData.strokeColor || (isDark ? "#444446" : "#D1D5DB"),
          strokeWidth: selected ? 2 : 1.5,
          filter: selected ? "drop-shadow(0 0 6px rgba(64,89,241,0.15))" : "none",
          overflow: "visible",
        }}
      >
        {SVG_SHAPES[shape] || SVG_SHAPES.square}
      </svg>

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center z-10 px-3 pointer-events-none">
        {editing ? (
          <AutoResizingTextarea
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleBlur();
              }
            }}
            className="bg-transparent text-center outline-none w-full pointer-events-auto nodrag nopan font-sans whitespace-pre-wrap break-words resize-none overflow-hidden"
            style={textStyle}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            className="text-center select-none leading-snug whitespace-pre-wrap break-words font-sans"
            style={textStyle}
          >
            {label.replace(/<br\s*\/?>/gi, "\n")}
          </span>

        )}
      </div>

      {/* Handles — visible solo cuando está seleccionado (rendered last to stack on top) */}
      {(["top", "bottom", "left", "right"] as const).map((pos) => {
        const position =
          pos === "top" ? Position.Top :
          pos === "bottom" ? Position.Bottom :
          pos === "left" ? Position.Left : Position.Right;
        const className = `${handleClass} ${isSingleSelected ? "opacity-100" : "opacity-0 pointer-events-none"}`;

        return (
          <div key={pos}>
            <Handle
              type="target"
              position={position}
              id={pos}
              className={className}
            />
            <Handle
              type="source"
              position={position}
              id={pos}
              className={className}
            />
          </div>
        );
      })}
    </motion.div>
  );
};

export default memo(ShapeNode);

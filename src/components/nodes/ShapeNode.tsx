import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, NodeResizer, useReactFlow } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { Square, Circle, Triangle, Hexagon, Star, Plus, Minus, Palette, Bold, Italic, Underline, Diamond } from "lucide-react";

export type ShapeNodeData = {
  shape: string;
  label?: string;
  fillColor?: string;
  strokeColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

const SVG_SHAPES: Record<string, React.ReactNode> = {
  square: <rect x="0" y="0" width="100" height="100" rx="8" vectorEffect="non-scaling-stroke" />,
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

const handleClass =
  "!w-[10px] !h-[10px] !rounded-full !bg-white !border-[1.5px] !border-[#4059F1] transition-all duration-200 hover:!bg-[#4059F1] before:absolute before:-inset-3 before:content-[''] !z-50";

const ShapeNode = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as ShapeNodeData;
  const shape = nodeData.shape || "square";
  const [label, setLabel] = useState(nodeData.label || "");
  const [editing, setEditing] = useState(false);
  const [activePicker, setActivePicker] = useState<"fill" | "border" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNodes, getNodes } = useReactFlow();

  const selectedNodes = getNodes().filter((n) => n.selected);
  const isSingleSelected = selected && selectedNodes.length === 1;

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  // Sync label local state if nodeData changes
  useEffect(() => {
    setLabel(nodeData.label || "");
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

  const textStyle: React.CSSProperties = {
    fontSize: `${nodeData.fontSize || 14}px`,
    fontWeight: nodeData.bold ? "bold" : "normal",
    fontStyle: nodeData.italic ? "italic" : "normal",
    textDecoration: nodeData.underline ? "underline" : "none",
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ width: "100%", height: "100%" }}
      className="relative"
      onDoubleClick={() => setEditing(true)}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={60}
        lineStyle={{ border: "none" }}
      />

      {/* ── Custom Shape Toolbar ── */}
      <AnimatePresence>
        {isSingleSelected && (
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
            style={{ whiteSpace: "nowrap" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <motion.div
              key="shape-toolbar"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-0.5 bg-white rounded-xl shadow-[0_4px_24px_rgb(0,0,0,0.12)] px-2 py-1.5 border border-gray-100/50"
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
                        isActive ? "bg-[#4059F1] text-white" : "hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black"
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

              <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1" />

              {/* Color pickers */}
              <div className="relative flex items-center gap-1">
                {/* Fill Color */}
                <button
                  onClick={() => setActivePicker(activePicker === "fill" ? null : "fill")}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] transition-colors relative"
                  title="Color de relleno"
                >
                  <Palette size={13} className="text-[#6B7280]" />
                  <div
                    className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white"
                    style={{ backgroundColor: nodeData.fillColor || "white" }}
                  />
                </button>

                {/* Border Color */}
                <button
                  onClick={() => setActivePicker(activePicker === "border" ? null : "border")}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] transition-colors relative"
                  title="Color de borde"
                >
                  <Square size={13} className="text-[#6B7280]" />
                  <div
                    className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white"
                    style={{ backgroundColor: nodeData.strokeColor || "#D1D5DB" }}
                  />
                </button>

                {/* Fill Color Popover */}
                {activePicker === "fill" && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2.5 grid grid-cols-5 gap-1.5 z-30 w-[150px]">
                    {RAINBOW_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          updateNodeData({ fillColor: c.value });
                          setActivePicker(null);
                        }}
                        className="w-6 h-6 rounded-full border border-gray-200/60 transition-transform hover:scale-110 flex items-center justify-center overflow-hidden relative shadow-sm cursor-pointer"
                        style={{
                          backgroundColor: c.value === "transparent" ? "white" : c.value,
                        }}
                        title={c.name}
                      >
                        {c.value === "transparent" && (
                          <div className="absolute w-full h-[1.5px] bg-red-500 rotate-45" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Border Color Popover */}
                {activePicker === "border" && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2.5 grid grid-cols-5 gap-1.5 z-30 w-[150px]">
                    {RAINBOW_COLORS.filter(c => c.value !== "transparent").map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          updateNodeData({ strokeColor: c.value });
                          setActivePicker(null);
                        }}
                        className="w-6 h-6 rounded-full border border-gray-200/60 transition-transform hover:scale-110 shadow-sm cursor-pointer"
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1" />

              {/* Text formatting options */}
              <div className="flex items-center gap-0.5">
                {/* Font Size selectors */}
                <button
                  onClick={() => {
                    const currentSize = nodeData.fontSize || 14;
                    updateNodeData({ fontSize: Math.max(10, currentSize - 1) });
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
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
                  className="nodrag nopan text-[11px] font-normal text-black w-6 text-center bg-transparent border-none outline-none focus:bg-neutral-100 rounded py-0.5 font-sans"
                  style={{ width: "20px" }}
                />
                <button
                  onClick={() => {
                    const currentSize = nodeData.fontSize || 14;
                    updateNodeData({ fontSize: Math.min(200, currentSize + 1) });
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
                  title="Aumentar letra"
                >
                  <Plus size={10} strokeWidth={2.5} />
                </button>

                <div className="w-[1px] h-3 bg-[#E5E7EB] mx-1" />

                {/* Bold */}
                <button
                  onClick={() => updateNodeData({ bold: !nodeData.bold })}
                  className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                    nodeData.bold ? "bg-[#4059F1] text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                  title="Negrita"
                >
                  <Bold size={11} />
                </button>

                {/* Italic */}
                <button
                  onClick={() => updateNodeData({ italic: !nodeData.italic })}
                  className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                    nodeData.italic ? "bg-[#4059F1] text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                  title="Cursiva"
                >
                  <Italic size={11} />
                </button>

                {/* Underline */}
                <button
                  onClick={() => updateNodeData({ underline: !nodeData.underline })}
                  className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                    nodeData.underline ? "bg-[#4059F1] text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                  title="Subrayado"
                >
                  <Underline size={11} />
                </button>
              </div>
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
          fill: nodeData.fillColor || "white",
          stroke: nodeData.strokeColor || "#D1D5DB",
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
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === "Enter" && handleBlur()}
            className="bg-transparent text-center outline-none w-full text-black pointer-events-auto nodrag nopan font-sans"
            style={textStyle}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            className="text-center select-none leading-snug break-all font-sans"
            style={textStyle}
          >
            {label}
          </span>
        )}
      </div>

      {/* Handles — visible solo cuando está seleccionado (rendered last to stack on top) */}
      {(["top", "bottom", "left", "right"] as const).map((pos) => (
        <Handle
          key={pos}
          type="source"
          position={
            pos === "top" ? Position.Top :
            pos === "bottom" ? Position.Bottom :
            pos === "left" ? Position.Left : Position.Right
          }
          id={pos}
          className={`${handleClass} ${selected ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
        />
      ))}
    </motion.div>
  );
};

export default memo(ShapeNode);

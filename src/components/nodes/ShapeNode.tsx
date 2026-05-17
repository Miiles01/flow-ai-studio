import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, NodeResizer } from "@xyflow/react";
import { motion } from "framer-motion";

export type ShapeNodeData = {
  shape: string;
  label?: string;
};

const SVG_SHAPES: Record<string, React.ReactNode> = {
  square: <rect x="1.5" y="1.5" width="97" height="97" rx="8" />,
  circle: <ellipse cx="50" cy="50" rx="48.5" ry="48.5" />,
  diamond: <polygon points="50,1.5 98.5,50 50,98.5 1.5,50" />,
  triangle: <polygon points="50,2 98,97 2,97" />,
  hexagon: <polygon points="50,2 93,25.5 93,74.5 50,98 7,74.5 7,25.5" />,
  star: <polygon points="50,3 61,36 98,36 68,57 79,91 50,70 21,91 32,57 2,36 39,36" />,
};

const handleClass =
  "!w-[10px] !h-[10px] !rounded-full !bg-white !border-[1.5px] !border-[#4059F1] transition-all duration-200 hover:!bg-[#4059F1] before:absolute before:-inset-3 before:content-[''] !z-50";

const ShapeNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as ShapeNodeData;
  const shape = nodeData.shape || "square";
  const [label, setLabel] = useState(nodeData.label || "");
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ width: "100%", height: "100%", minWidth: 60, minHeight: 60 }}
      className="relative"
      onDoubleClick={() => setEditing(true)}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={60}
        lineStyle={{ borderColor: "#4059F1", borderWidth: 1, opacity: 0.4 }}
      />

      {/* SVG shape */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0"
        style={{
          fill: "white",
          stroke: selected ? "#4059F1" : "#D1D5DB",
          strokeWidth: selected ? 2 : 1.5,
          filter: selected ? "drop-shadow(0 0 6px rgba(64,89,241,0.15))" : "none",
        }}
      >
        {SVG_SHAPES[shape] || SVG_SHAPES.square}
      </svg>

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center z-10 px-3">
        {editing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
            className="bg-transparent text-center text-[13px] font-normal outline-none w-full text-black"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-[13px] font-normal text-black text-center select-none leading-snug">
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

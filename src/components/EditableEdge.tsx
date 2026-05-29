import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath, useReactFlow } from "@xyflow/react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { setEdges } = useReactFlow();
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(typeof label === "string" ? label : "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local text state when prop changes
  useEffect(() => {
    setLabelText(typeof label === "string" ? label : "");
  }, [label]);

  // Focus and select input text when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          return { ...edge, label: labelText.trim() };
        }
        return edge;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setLabelText(typeof label === "string" ? label : "");
    }
  };

  const hasLabel = labelText.trim().length > 0;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan select-none z-30"
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className={`px-2.5 py-1 text-xs font-normal rounded-lg shadow-lg border outline-none min-w-[80px] max-w-[150px] text-center font-sans ${
                isDark
                  ? "bg-[#1C1C1E] border-white/10 text-white focus:border-[#4059F1]"
                  : "bg-white border-[#E5E7EB] text-black focus:border-[#4059F1]"
              }`}
            />
          ) : hasLabel ? (
            <div
              onDoubleClick={handleStartEdit}
              onClick={handleStartEdit}
              className={`px-3 py-1.5 text-xs font-normal rounded-full border shadow-sm cursor-text hover:scale-105 hover:shadow-md transition-all font-sans select-none ${
                isDark
                  ? "bg-[#1C1C1E]/95 border-white/10 text-white/90"
                  : "bg-white/95 border-[#E5E7EB] text-gray-800"
              }`}
            >
              {labelText}
            </div>
          ) : selected ? (
            <button
              onClick={handleStartEdit}
              className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-sm hover:scale-110 hover:shadow-md transition-all text-xs font-medium cursor-pointer ${
                isDark
                  ? "bg-[#1C1C1E] border-white/10 text-white/60 hover:text-white"
                  : "bg-white border-[#E5E7EB] text-[#6B7280] hover:text-black"
              }`}
              title="Añadir texto"
            >
              +
            </button>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

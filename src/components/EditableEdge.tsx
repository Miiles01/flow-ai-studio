import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath, useReactFlow, useStore } from "@xyflow/react";
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
  data,
}: EdgeProps) {
  const { setEdges, getViewport } = useReactFlow();
  const { isDark } = useTheme();
  const userSelectionActive = useStore((s) => !!s.userSelectionRect);

  // Control points offsets for dragging the line
  const offsetX = (data?.offsetX as number) || 0;
  const offsetY = (data?.offsetY as number) || 0;

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const controlX = midX + offsetX;
  const controlY = midY + offsetY;

  // Custom path using quadratic bezier if offset is present, else standard bezier
  const customPath = `M ${sourceX},${sourceY} Q ${controlX},${controlY} ${targetX},${targetY}`;
  const customLabelX = midX + 0.5 * offsetX;
  const customLabelY = midY + 0.5 * offsetY;

  const [defaultPath, defaultLabelX, defaultLabelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgePath = (offsetX !== 0 || offsetY !== 0) ? customPath : defaultPath;
  const labelX = (offsetX !== 0 || offsetY !== 0) ? customLabelX : defaultLabelX;
  const labelY = (offsetX !== 0 || offsetY !== 0) ? customLabelY : defaultLabelY;

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; startOffsetX: number; startOffsetY: number } | null>(null);

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

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!selected) {
      // Let the event bubble up to React Flow so it can select the edge
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
  };

  useEffect(() => {
    if (!isDragging || !dragStartRef.current) return;

    const handlePointerMove = (e: PointerEvent) => {
      const start = dragStartRef.current;
      if (!start) return;

      const viewport = getViewport();
      const zoom = viewport.zoom;

      const dx = (e.clientX - start.pointerX) / zoom;
      const dy = (e.clientY - start.pointerY) / zoom;

      const nextOffsetX = start.startOffsetX + dx;
      const nextOffsetY = start.startOffsetY + dy;

      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              data: {
                ...edge.data,
                offsetX: nextOffsetX,
                offsetY: nextOffsetY,
              },
            };
          }
          return edge;
        })
      );
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, id, setEdges, getViewport]);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              offsetX: 0,
              offsetY: 0,
            },
          };
        }
        return edge;
      })
    );
  };

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

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (userSelectionActive && !selected) {
      setEdges((eds) => eds.map((edge) => edge.id === id ? { ...edge, selected: true } : edge));
    }
  };

  const hasLabel = labelText.trim().length > 0;

  return (
    <>
      <g onDoubleClick={handleReset}>
        <BaseEdge 
          path={edgePath} 
          markerEnd={markerEnd} 
          interactionWidth={80}
          style={{
            ...style,
            stroke: selected ? "#4059F1" : (style.stroke || (isDark ? "#555" : "#CCC")),
            strokeWidth: selected ? 3 : (style.strokeWidth || 2),
            transition: "stroke 0.15s, stroke-width 0.15s",
          }} 
        />
        
        {/* Invisible path for dragging control points (active ONLY when selected) */}
        {selected && (
          <path
            d={edgePath}
            fill="none"
            stroke="transparent"
            strokeWidth={80}
            className="cursor-pointer"
            pointerEvents="stroke"
            onPointerDown={handlePointerDown}
          />
        )}
        
        {/* Invisible path for sweep selection (active ONLY when marquee is active) */}
        {userSelectionActive && !selected && (
          <path
            d={edgePath}
            fill="none"
            stroke="transparent"
            strokeWidth={80}
            pointerEvents="stroke"
            onPointerEnter={handlePointerEnter}
          />
        )}
      </g>
      
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

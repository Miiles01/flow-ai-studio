import { EdgeLabelRenderer, type EdgeProps, useReactFlow } from "@xyflow/react";
import { Position } from "@xyflow/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const CRV = 0.25;

function controlPoint(
  ax: number, ay: number,
  bx: number, by: number,
  pos: Position,
): [number, number] {
  const dx = Math.abs(bx - ax);
  const dy = Math.abs(by - ay);
  switch (pos) {
    case Position.Left:   return [ax - dx * CRV, ay];
    case Position.Right:  return [ax + dx * CRV, ay];
    case Position.Top:    return [ax, ay - dy * CRV];
    default:              return [ax, ay + dy * CRV];
  }
}

export default function EditableEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style = {},
  markerEnd,
  label,
}: EdgeProps) {
  const { setEdges, getViewport } = useReactFlow();
  const { isDark } = useTheme();

  const bendX = (data?.bendX as number) ?? 0;
  const bendY = (data?.bendY as number) ?? 0;

  // Bezier control points shifted by the user's bend offset
  const [cp1x, cp1y] = controlPoint(sourceX, sourceY, targetX, targetY, sourcePosition);
  const [cp2x, cp2y] = controlPoint(targetX, targetY, sourceX, sourceY, targetPosition);
  const b1x = cp1x + bendX, b1y = cp1y + bendY;
  const b2x = cp2x + bendX, b2y = cp2y + bendY;

  const edgePath = `M ${sourceX},${sourceY} C ${b1x},${b1y} ${b2x},${b2y} ${targetX},${targetY}`;

  // Bezier midpoint at t=0.5 (for label placement)
  const midX = (sourceX + 3 * b1x + 3 * b2x + targetX) / 8;
  const midY = (sourceY + 3 * b1y + 3 * b2y + targetY) / 8;

  const s = style as React.CSSProperties;
  const strokeColor = selected
    ? "#4059F1"
    : (s.stroke as string) || (isDark ? "#4B4F63" : "#b1b1b7");
  const strokeWidth = selected ? 2 : ((s.strokeWidth as number) ?? 1.5);

  // ── Drag-to-bend ─────────────────────────────────────────────────────────
  const dragRef = useRef<{ x: number; y: number; bx: number; by: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!selected) return;
      e.stopPropagation();
      dragRef.current = { x: e.clientX, y: e.clientY, bx: bendX, by: bendY };

      const onMove = (ev: PointerEvent) => {
        const d = dragRef.current;
        if (!d) return;
        const { zoom } = getViewport();
        setEdges((eds) =>
          eds.map((edge) =>
            edge.id === id
              ? {
                  ...edge,
                  data: {
                    ...(edge.data ?? {}),
                    bendX: d.bx + (ev.clientX - d.x) / zoom,
                    bendY: d.by + (ev.clientY - d.y) / zoom,
                  },
                }
              : edge,
          ),
        );
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [selected, id, bendX, bendY, setEdges, getViewport],
  );

  // ── Label ────────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(typeof label === "string" ? label : "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabelText(typeof label === "string" ? label : "");
  }, [label]);

  useEffect(() => {
    if (isEditing) setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 50);
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    setEdges((eds) =>
      eds.map((edge) => (edge.id === id ? { ...edge, label: labelText.trim() } : edge)),
    );
  };

  return (
    <>
      {/* Wide transparent hit area — gives click tolerance without showing anything */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: selected ? "grab" : "pointer" }}
        onPointerDown={onPointerDown}
      />

      {/* Visible edge stroke */}
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={markerEnd}
        style={{ pointerEvents: "none", transition: "stroke 0.15s, stroke-width 0.15s" }}
      />

      {/* Label (only when one exists — never shows a "+" dot) */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${midX}px,${midY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan select-none"
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setLabelText(typeof label === "string" ? label : "");
                }
              }}
              className={`px-2.5 py-1 text-xs font-normal rounded-lg shadow-lg border outline-none min-w-[80px] max-w-[150px] text-center font-sans ${
                isDark
                  ? "bg-[#1C1C1E] border-white/10 text-white focus:border-[#4059F1]"
                  : "bg-white border-[#E5E7EB] text-black focus:border-[#4059F1]"
              }`}
            />
          ) : labelText.trim() ? (
            <div
              onDoubleClick={() => setIsEditing(true)}
              className={`px-3 py-1.5 text-xs font-normal rounded-full border shadow-sm cursor-text hover:scale-105 transition-all font-sans select-none ${
                isDark
                  ? "bg-[#1C1C1E]/95 border-white/10 text-white/90"
                  : "bg-white/95 border-[#E5E7EB] text-gray-800"
              }`}
            >
              {labelText}
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

import { memo, useState, useRef } from "react";
import { type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import { Trash2, Palette, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type FrameNodeData = {
  label?: string;
  fillColor?: string;
  strokeColor?: string;
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

const FrameNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes, getNodes } = useReactFlow();
  const { zoom } = useViewport();
  const nodeData = data as FrameNodeData;
  const isSingleSelected = selected && getNodes().filter((n) => n.selected).length === 1;

  const [label, setLabel] = useState(nodeData.label ?? "Sección");
  const [editing, setEditing] = useState(false);
  const [activePicker, setActivePicker] = useState<"fill" | "border" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateNodeData = (newData: Partial<FrameNodeData>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...newData } } : n))
    );
  };

  const updateLabel = (val: string) => {
    setLabel(val);
    updateNodeData({ label: val });
  };

  const fillColor = nodeData.fillColor ?? "rgba(249, 250, 251, 0.35)";
  const strokeColor = nodeData.strokeColor ?? (selected ? "#4059F1" : "#D1D5DB");

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "visible" }}>
      {/* Resize handles */}
      <NodeResizer
        isVisible={!!isSingleSelected}
        minWidth={120}
        minHeight={80}
        lineStyle={{ border: "none" }}
      />

      {/* Editable label — top-left, above the frame */}
      <div
        className="absolute pointer-events-auto"
        style={{ top: -26, left: 0 }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
          setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 30);
        }}
      >
        {editing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => updateLabel(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" || e.key === "Escape") setEditing(false);
            }}
            className="nodrag nopan text-[12px] font-medium text-[#6B7280] bg-transparent border-none outline-none"
            style={{ minWidth: 60, maxWidth: 240 }}
          />
        ) : (
          <span className="text-[12px] font-medium text-[#9CA3AF] cursor-text hover:text-[#6B7280] transition-colors select-none">
            {label || "Sección"}
          </span>
        )}
      </div>

      {/* Floating toolbar */}
      <AnimatePresence>
        {isSingleSelected && (
          <div
            className="absolute -top-14 left-1/2 z-[1000] pointer-events-auto node-floating-toolbar"
            style={{
              transform: `translate(-50%, 0) scale(${1 / zoom})`,
              transformOrigin: "bottom center",
              whiteSpace: "nowrap",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1 px-2 py-1.5 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#F3F4F6] relative"
            >
              {/* Fill Color Picker */}
              <button
                onClick={() => setActivePicker(activePicker === "fill" ? null : "fill")}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors relative"
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

              {/* Border Color Picker */}
              <button
                onClick={() => setActivePicker(activePicker === "border" ? null : "border")}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors relative"
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

              {/* Fill Color Popover */}
              {activePicker === "fill" && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2.5 grid grid-cols-5 gap-1.5 z-50 w-[150px]">
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
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2.5 grid grid-cols-5 gap-1.5 z-50 w-[150px]">
                  {RAINBOW_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        updateNodeData({ strokeColor: c.value });
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

              <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1" />

              <button
                onClick={() =>
                  setNodes((nds) =>
                    nds
                      .filter((n) => n.id !== id)
                      // Detach children before deleting
                      .map((n) =>
                        n.parentId === id
                          ? { ...n, parentId: undefined, extent: undefined }
                          : n
                      )
                  )
                }
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                title="Eliminar sección"
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visual frame border — pointer-events none so children are clickable */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none transition-colors duration-200"
        style={{
          border: `1.5px dashed ${strokeColor === "transparent" ? "transparent" : strokeColor}`,
          backgroundColor: fillColor === "transparent" ? "transparent" : fillColor,
        }}
      />
    </div>
  );
};

export default memo(FrameNode);

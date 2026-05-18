import { memo, useState, useRef } from "react";
import { type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type FrameNodeData = {
  label?: string;
};

const FrameNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes, getNodes } = useReactFlow();
  const { zoom } = useViewport();
  const nodeData = data as FrameNodeData;
  const isSingleSelected = selected && getNodes().filter((n) => n.selected).length === 1;

  const [label, setLabel] = useState(nodeData.label ?? "Frame");
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateLabel = (val: string) => {
    setLabel(val);
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: val } } : n))
    );
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "visible" }}>
      {/* Resize handles */}
      <NodeResizer
        isVisible={!!selected}
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
            {label || "Frame"}
          </span>
        )}
      </div>

      {/* Floating toolbar */}
      <AnimatePresence>
        {isSingleSelected && (
          <div
            className="absolute -top-14 left-1/2 z-[1000] pointer-events-auto"
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
              className="flex items-center gap-1 px-2 py-1.5 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#F3F4F6]"
            >
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
                title="Eliminar frame"
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visual frame border — pointer-events none so children are clickable */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          border: selected ? "1.5px dashed #4059F1" : "1.5px dashed #D1D5DB",
          backgroundColor: "rgba(249, 250, 251, 0.35)",
        }}
      />
    </div>
  );
};

export default memo(FrameNode);

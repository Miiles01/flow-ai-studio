import { memo, useState, useRef, useCallback } from "react";
import { Handle, Position, type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import { ImageIcon, Link2, Maximize2, Minimize2, AlertTriangle, RotateCcw, Trash2, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export type ImageNodeData = {
  imageUrl?: string;
  objectFit?: "cover" | "contain";
};

const HANDLE_CLASS =
  "!w-[10px] !h-[10px] !rounded-full !bg-white !border-[1.5px] !border-[#4059F1] transition-all duration-200 hover:!bg-[#4059F1] before:absolute before:-inset-3 before:content-[''] !z-50";

// ── ImageNode ────────────────────────────────────────────────────
const ImageNode = ({ id, data, selected }: NodeProps) => {
  const { getNodes, setNodes } = useReactFlow();
  const { zoom } = useViewport();
  const { isDark } = useTheme();
  const nodeData = data as ImageNodeData;
  const selectedNodes = getNodes().filter((n) => n.selected);
  const isSingleSelected = selected && selectedNodes.length === 1;

  const [imageUrl, setImageUrl] = useState(nodeData.imageUrl ?? "");
  const [inputValue, setInputValue] = useState(nodeData.imageUrl ?? "");
  const [objectFit, setObjectFit] = useState<"cover" | "contain">(nodeData.objectFit ?? "cover");
  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(!!nodeData.imageUrl);
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateNodeData = useCallback((patch: Partial<ImageNodeData>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))
    );
  }, [id, setNodes]);

  const handleConfirmUrl = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setImageUrl(trimmed);
    setIsLoading(true);
    setIsError(false);
    setShowInput(false);
    updateNodeData({ imageUrl: trimmed });
  }, [inputValue, updateNodeData]);

  const handleToggleFit = useCallback(() => {
    const next = objectFit === "cover" ? "contain" : "cover";
    setObjectFit(next);
    updateNodeData({ objectFit: next });
  }, [objectFit, updateNodeData]);

  const handleDelete = useCallback(() => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  }, [id, setNodes]);

  const handleOpenInput = useCallback(() => {
    setInputValue(imageUrl);
    setShowInput(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [imageUrl]);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ width: "100%", height: "100%" }}
      className="relative"
    >
      {/* Resize handles */}
      <NodeResizer
        isVisible={!!isSingleSelected}
        minWidth={80}
        minHeight={60}
        lineStyle={{ border: "none" }}
      />

      {/* Connection handles — only visible when selected */}
      {isSingleSelected && (
        <>
          <Handle type="target" position={Position.Top}    id="top" className={HANDLE_CLASS} style={{ top: "0%",  left: "50%", transform: "translate(-50%, -50%)" }} />
          <Handle type="source" position={Position.Top}    id="top" className={HANDLE_CLASS} style={{ top: "0%",  left: "50%", transform: "translate(-50%, -50%)" }} />
          
          <Handle type="target" position={Position.Bottom} id="bottom" className={HANDLE_CLASS} style={{ bottom: "0%", left: "50%", transform: "translate(-50%, 50%)" }} />
          <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLASS} style={{ bottom: "0%", left: "50%", transform: "translate(-50%, 50%)" }} />
          
          <Handle type="target" position={Position.Left}   id="left" className={HANDLE_CLASS} style={{ left: "0%",  top: "50%",  transform: "translate(-50%, -50%)" }} />
          <Handle type="source" position={Position.Left}   id="left" className={HANDLE_CLASS} style={{ left: "0%",  top: "50%",  transform: "translate(-50%, -50%)" }} />
          
          <Handle type="target" position={Position.Right}  id="right" className={HANDLE_CLASS} style={{ right: "0%", top: "50%",  transform: "translate(50%, -50%)" }} />
          <Handle type="source" position={Position.Right}  id="right" className={HANDLE_CLASS} style={{ right: "0%", top: "50%",  transform: "translate(50%, -50%)" }} />
        </>
      )}

      {/* ── Floating Toolbar ── */}
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
              className={`flex items-center gap-1 px-2 py-1.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border ${isDark ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-[#F3F4F6]'}`}
            >
              {/* URL button */}
              <button
                onClick={handleOpenInput}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  imageUrl
                    ? isDark ? "hover:bg-white/10 text-zinc-400" : "hover:bg-[#F3F4F6] text-[#6B7280]"
                    : isDark ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/20" : "bg-[#EEF2FF] text-[#4059F1]"
                }`}
                title="Pegar URL de imagen"
              >
                <Link2 size={13} strokeWidth={2} />
              </button>

              <div className={`w-[1px] h-4 mx-0.5 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

              {/* Object fit toggle */}
              <button
                onClick={handleToggleFit}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  isDark ? "hover:bg-white/10 text-zinc-400" : "hover:bg-[#F3F4F6] text-[#6B7280]"
                }`}
                title={objectFit === "cover" ? "Cambiar a Contain" : "Cambiar a Cover"}
              >
                {objectFit === "cover"
                  ? <Maximize2 size={13} strokeWidth={2} />
                  : <Minimize2 size={13} strokeWidth={2} />
                }
              </button>

              <div className={`w-[1px] h-4 mx-0.5 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

              {/* Delete */}
              <button
                onClick={handleDelete}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-red-500/20 text-[#9CA3AF] hover:text-red-400'
                    : 'hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444]'
                }`}
                title="Eliminar imagen"
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── URL Input Popover ── */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            key="url-input"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className={`absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.03)] px-3 py-2.5 border ${isDark ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-[#F3F4F6]'}`}
            style={{ minWidth: 300 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Link2 size={13} className="text-[#6B7280] shrink-0" />
            <input
              ref={inputRef}
              type="url"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") handleConfirmUrl();
                if (e.key === "Escape") setShowInput(false);
              }}
              placeholder="https://ejemplo.com/imagen.jpg"
              className={`flex-1 text-[12px] font-light outline-none border-none bg-transparent placeholder-gray-400 nodrag nopan ${isDark ? 'text-white' : 'text-black'}`}
            />
            <button
              onClick={handleConfirmUrl}
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#4059F1] hover:bg-[#3348d4] transition-colors"
              title="Confirmar URL"
            >
              <Check size={11} className="text-white stroke-[2.5]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Image Container ── */}
      <div
        className={`w-full h-full overflow-hidden rounded-lg relative transition-all ${
          selected
            ? "ring-[1.5px] ring-[#4059F1] ring-offset-0"
            : `ring-[1px] ${isDark ? 'ring-white/10' : 'ring-[#E5E7EB]'}`
        }`}
      >
        {/* Empty state */}
        {!imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed rounded-lg transition-all ${
              isDark
                ? 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                : 'bg-[#F9FAFB] border-[#E5E7EB] hover:border-[#4059F1]/40 hover:bg-[#EEF2FF]/20'
            }`}
            onClick={handleOpenInput}
          >
            <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <ImageIcon size={18} className="text-[#9CA3AF]" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className={`text-[12px] font-medium ${isDark ? 'text-zinc-300' : 'text-[#6B7280]'}`}>Añadir imagen</p>
              <p className="text-[10px] text-[#9CA3AF] font-light">Pega una URL de imagen</p>
            </div>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {imageUrl && isLoading && !isError && (
          <div className={`w-full h-full rounded-lg overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-[#F3F4F6]'}`}>
            <div className="w-full h-full relative overflow-hidden">
              <motion.div
                className="absolute inset-0"
                style={{
                  background: isDark
                    ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)"
                    : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                }}
                animate={{ backgroundPositionX: ["200%", "-200%"] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        )}

        {/* Error state */}
        {imageUrl && isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`w-full h-full flex flex-col items-center justify-center gap-3 rounded-lg cursor-pointer ${
              isDark
                ? 'bg-red-950/20 border border-red-900/35'
                : 'bg-[#FEF2F2] border border-[#FECACA]'
            }`}
            onClick={handleOpenInput}
          >
            <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <AlertTriangle size={18} className="text-[#EF4444]" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-[12px] font-medium text-[#EF4444]">URL inválida</p>
              <p className="text-[10px] text-[#9CA3AF] font-light flex items-center gap-1">
                <RotateCcw size={9} /> Clic para reintentar
              </p>
            </div>
          </motion.div>
        )}

        {/* Loaded image */}
        {imageUrl && !isError && (
          <img
            key={imageUrl}
            src={imageUrl}
            alt="Canvas image"
            className="w-full h-full rounded-lg absolute inset-0"
            style={{
              objectFit,
              objectPosition: "center",
              opacity: isLoading ? 0 : 1,
              transition: "opacity 0.2s ease",
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setIsError(true);
            }}
            draggable={false}
          />
        )}
      </div>
    </motion.div>
  );
};

export default memo(ImageNode);

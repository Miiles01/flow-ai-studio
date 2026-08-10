import { memo, useState, useRef, useCallback } from "react";
import { Handle, Position, type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import { Globe, Link2, ExternalLink, Trash2, Check, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export type EmbedNodeData = {
  url?: string;
};

const HANDLE_CLASS =
  "!w-[10px] !h-[10px] !rounded-full !bg-white !border-[1.5px] !border-[#4059F1] transition-all duration-200 hover:!bg-[#4059F1] before:absolute before:-inset-3 before:content-[''] !z-50";

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const EmbedNode = ({ id, data, selected }: NodeProps) => {
  const { getNodes, setNodes } = useReactFlow();
  const { zoom } = useViewport();
  const { isDark } = useTheme();
  const nodeData = data as EmbedNodeData;
  const selectedNodes = getNodes().filter((n) => n.selected);
  const isSingleSelected = selected && selectedNodes.length === 1;

  const initialUrl = nodeData.url ? normalizeUrl(nodeData.url) : "";
  const [url, setUrl] = useState(initialUrl);
  const [inputValue, setInputValue] = useState(initialUrl);
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateNodeData = useCallback((patch: Partial<EmbedNodeData>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))
    );
  }, [id, setNodes]);

  const handleConfirmUrl = useCallback(() => {
    const normalized = normalizeUrl(inputValue);
    if (!normalized) {
      setShowInput(false);
      return;
    }
    setUrl(normalized);
    setShowInput(false);
    updateNodeData({ url: normalized });
  }, [inputValue, updateNodeData]);

  const handleDelete = useCallback(() => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  }, [id, setNodes]);

  const handleToggleInput = useCallback(() => {
    if (showInput) {
      setShowInput(false);
    } else {
      setInputValue(url);
      setShowInput(true);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [showInput, url]);

  const hostname = (() => {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
  })();

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ width: "100%", height: "100%" }}
      className="relative"
    >
      <NodeResizer
        isVisible={!!isSingleSelected}
        minWidth={240}
        minHeight={180}
        lineStyle={{ border: "none" }}
      />

      {/* Connection handles — always in DOM to allow connections, visually hidden when not selected */}
      <div className={isSingleSelected ? "opacity-100 transition-opacity duration-200" : "opacity-0 pointer-events-none transition-opacity duration-200"}>
        <Handle type="target" position={Position.Top}    id="top" className={HANDLE_CLASS} style={{ top: "0%",  left: "50%", transform: "translate(-50%, -50%)" }} />
        <Handle type="source" position={Position.Top}    id="top" className={HANDLE_CLASS} style={{ top: "0%",  left: "50%", transform: "translate(-50%, -50%)" }} />
        <Handle type="target" position={Position.Bottom} id="bottom" className={HANDLE_CLASS} style={{ bottom: "0%", left: "50%", transform: "translate(-50%, 50%)" }} />
        <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLASS} style={{ bottom: "0%", left: "50%", transform: "translate(-50%, 50%)" }} />
        <Handle type="target" position={Position.Left}   id="left" className={HANDLE_CLASS} style={{ left: "0%",  top: "50%",  transform: "translate(-50%, -50%)" }} />
        <Handle type="source" position={Position.Left}   id="left" className={HANDLE_CLASS} style={{ left: "0%",  top: "50%",  transform: "translate(-50%, -50%)" }} />
        <Handle type="target" position={Position.Right}  id="right" className={HANDLE_CLASS} style={{ right: "0%", top: "50%",  transform: "translate(50%, -50%)" }} />
        <Handle type="source" position={Position.Right}  id="right" className={HANDLE_CLASS} style={{ right: "0%", top: "50%",  transform: "translate(50%, -50%)" }} />
      </div>

      {/* Floating toolbar */}
      <AnimatePresence>
        {isSingleSelected && (
          <div
            className="absolute -top-14 left-1/2 z-[1000] pointer-events-auto node-floating-toolbar shadow-sm"
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
              className={`flex items-center gap-1 px-2 py-1.5 rounded-2xl border ${isDark ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-[#F3F4F6]'}`}
            >
              <button
                onClick={handleToggleInput}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  url
                    ? isDark ? "hover:bg-white/10 text-zinc-400" : "hover:bg-[#F3F4F6] text-[#6B7280]"
                    : isDark ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/20" : "bg-[#EEF2FF] text-[#4059F1] border border-gray-200 "
                }`}
                title="Pegar URL del sitio"
              >
                <Link2 size={13} strokeWidth={2} />
              </button>

              {url && (
                <>
                  <div className={`w-[1px] h-4 mx-0.5 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-white/10 text-zinc-400" : "hover:bg-[#F3F4F6] text-[#6B7280]"}`}
                    title="Abrir en nueva pestaña"
                  >
                    <ExternalLink size={13} strokeWidth={2} />
                  </a>
                </>
              )}

              <div className={`w-[1px] h-4 mx-0.5 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />
              <button
                onClick={handleDelete}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  isDark ? 'hover:bg-red-500/20 text-[#9CA3AF] hover:text-red-400' : 'hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444]'
                }`}
                title="Eliminar"
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* URL input popover */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            key="url-input"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className={`absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl px-3 py-2.5 border ${isDark ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-[#F3F4F6]'} shadow-sm`}
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
              placeholder="https://ejemplo.com"
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

      {/* Embed container */}
      <div
        className={`w-full h-full overflow-hidden rounded-lg relative transition-all flex flex-col ${
          selected
            ? "ring-[1.5px] ring-[#4059F1] ring-offset-0"
            : `ring-[1px] ${isDark ? 'ring-white/10' : 'ring-[#E5E7EB]'}`
        } ${isDark ? 'bg-[#1C1C1E]' : 'bg-white border border-gray-200 '}`}
      >
        {!url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed rounded-lg transition-all ${
              isDark ? 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10' : 'bg-[#F9FAFB] border-[#E5E7EB] hover:border-[#4059F1]/40 hover:bg-[#EEF2FF]/20'
            }`}
            onClick={handleToggleInput}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-white border border-gray-200 '}`}>
              <Globe size={18} className="text-[#9CA3AF]" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className={`text-[12px] font-medium ${isDark ? 'text-zinc-300' : 'text-[#6B7280]'}`}>Embeber sitio web</p>
              <p className="text-[10px] text-[#9CA3AF] font-light">Pega una URL</p>
            </div>
          </motion.div>
        )}

        {url && (
          <>
            {/* Top bar with hostname + fallback link (sites that block embedding) */}
            <div className={`flex items-center gap-2 px-3 py-1.5 shrink-0 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-[#F3F4F6] bg-[#F9FAFB]'}`}>
              <Globe size={11} className="text-[#9CA3AF] shrink-0" />
              <span className={`text-[10px] font-light truncate flex-1 ${isDark ? 'text-zinc-400' : 'text-[#6B7280]'}`}>{hostname}</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-light text-[#4059F1] hover:underline flex items-center gap-1 shrink-0 nodrag"
                title="Abrir sitio en nueva pestaña"
                onMouseDown={(e) => e.stopPropagation()}
              >
                Abrir <ExternalLink size={9} />
              </a>
            </div>
            <iframe
              key={url}
              src={url}
              title={hostname}
              className="w-full flex-1 border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

export default memo(EmbedNode);

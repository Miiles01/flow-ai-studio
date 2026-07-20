import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Handle, Position, type NodeProps, NodeResizer, useReactFlow, useViewport } from "@xyflow/react";
import {
  Bold, Italic, Underline, Link2, AlignLeft, AlignCenter, AlignRight,
  ExternalLink, Trash2, Minus, Plus, Baseline, Check,
} from "lucide-react";
import NodeExtendHandles from "@/components/nodes/NodeExtendHandles";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useAutoGrowNode } from "@/hooks/useAutoGrowNode";

export type TextNodeData = {
  html?: string;
  fontSize?: number;
  align?: "left" | "center" | "right";
  textColor?: string;
};

const TEXT_COLOR_PALETTE = [
  { name: "Negro", value: "#111827" },
  { name: "Gris", value: "#6B7280" },
  { name: "Azul", value: "#2563EB" },
  { name: "Verde", value: "#059669" },
  { name: "Rojo", value: "#DC2626" },
  { name: "Púrpura", value: "#7C3AED" },
  { name: "Blanco", value: "#FFFFFF" },
];

const HANDLE_CLASS =
  "!w-[10px] !h-[10px] !rounded-full !bg-white !border-[1.5px] !border-[#4059F1] transition-all duration-200 hover:!bg-[#4059F1] before:absolute before:-inset-3 before:content-[''] !z-50";

// ─── Link Popover ───────────────────────────────────────────────
function LinkPopover({
  anchor,
  onEdit,
  onRemove,
}: {
  anchor: HTMLAnchorElement;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const href = anchor.getAttribute("href") || "";
  const display = href.length > 32 ? href.slice(0, 30) + "…" : href;
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.12 }}
      className={`absolute -bottom-11 left-0 flex items-center gap-1.5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] px-2.5 py-1.5 z-30 pointer-events-auto ${isDark ? 'bg-[#1C1C1E] border border-white/10' : 'bg-white'}`}
      style={{ whiteSpace: "nowrap" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Link2 size={11} className="text-[#4059F1] shrink-0" />
      <span className="text-[11px] text-[#4059F1] underline max-w-[140px] truncate">{display}</span>
      <div className="w-[1px] h-3 bg-[#E5E7EB] mx-0.5" />
      <button
        onClick={(e) => { e.stopPropagation(); window.open(href, "_blank"); }}
        className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
        title="Abrir"
      >
        <ExternalLink size={11} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className={`text-[11px] font-normal hover:underline px-0.5 transition-colors ${isDark ? 'text-white' : 'text-black'}`}
        title="Editar"
      >
        Editar
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
        title="Quitar link"
      >
        <Trash2 size={11} />
      </button>
    </motion.div>
  );
}

const isBlackColor = (color: string | undefined): boolean => {
  if (!color) return false;
  const cleaned = color.trim().toLowerCase();
  return cleaned === "#000000" || cleaned === "black" || cleaned === "#000" || cleaned === "#111827" || cleaned === "#1f2937" || cleaned === "#1c1c1e";
};

// ─── TextNode ───────────────────────────────────────────────────
const TextNode = ({ id, data, selected }: NodeProps) => {
  const { getNodes, setNodes } = useReactFlow();
  const { zoom } = useViewport();
  const { isDark } = useTheme();
  const selectedNodes = getNodes().filter((n) => n.selected);
  const isSingleSelected = selected && selectedNodes.length === 1;
  const nodeData = data as TextNodeData;
  const [fontSize, setFontSize] = useState<number>(nodeData.fontSize ?? 15);
  const [align, setAlign] = useState<"left" | "center" | "right">(nodeData.align ?? "left");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [activeLink, setActiveLink] = useState<HTMLAnchorElement | null>(null);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [activePicker, setActivePicker] = useState<"text" | null>(null);
  

  const editorRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const htmlSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-grow node height when the editor content is larger than the node.
  useAutoGrowNode(id, editorRef, 0, 50);

  // Persist patches into this node's data via React Flow
  const commitData = useCallback((patch: Partial<TextNodeData>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))
    );
  }, [id, setNodes]);

  // Debounced HTML commit while typing
  const scheduleHtmlCommit = useCallback(() => {
    if (htmlSaveTimer.current) clearTimeout(htmlSaveTimer.current);
    htmlSaveTimer.current = setTimeout(() => {
      if (editorRef.current) commitData({ html: editorRef.current.innerHTML });
    }, 250);
  }, [commitData]);

  // Flush html on blur for immediate save
  const flushHtml = useCallback(() => {
    if (htmlSaveTimer.current) clearTimeout(htmlSaveTimer.current);
    if (editorRef.current) commitData({ html: editorRef.current.innerHTML });
  }, [commitData]);

  // Style all anchor tags in the editor
  const styleLinks = useCallback(() => {
    editorRef.current?.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
      a.style.color = "#4059F1";
      a.style.textDecoration = "underline";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
  }, []);

  // Detect if selection/cursor is inside a link
  const detectLink = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { setActiveLink(null); return; }
    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeName === "A") { setActiveLink(node as HTMLAnchorElement); return; }
      node = node.parentNode;
    }
    setActiveLink(null);
  }, []);

  // Apply exec command keeping focus
  const applyFormat = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value ?? undefined);
    scheduleHtmlCommit();
  }, [scheduleHtmlCommit]);

  // Open link dialog — save current selection
  const openLinkInput = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) setSavedRange(sel.getRangeAt(0).cloneRange());
    setLinkUrl(activeLink?.getAttribute("href") ?? "");
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 50);
  }, [activeLink]);

  // Confirm link
  const confirmLink = useCallback(() => {
    if (!savedRange) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRange);
    if (linkUrl.trim()) {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      document.execCommand("createLink", false, url);
    } else {
      document.execCommand("unlink");
    }
    styleLinks();
    flushHtml();
    setShowLinkInput(false);
    setLinkUrl("");
    setSavedRange(null);
  }, [savedRange, linkUrl, styleLinks, flushHtml]);

  // Remove active link
  const removeLink = useCallback(() => {
    if (!activeLink) return;
    editorRef.current?.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(activeLink);
    sel?.removeAllRanges();
    sel?.addRange(range);
    document.execCommand("unlink");
    setActiveLink(null);
    flushHtml();
  }, [activeLink, flushHtml]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === "b") { e.preventDefault(); applyFormat("bold"); }
    if (mod && e.key === "i") { e.preventDefault(); applyFormat("italic"); }
    if (mod && e.key === "u") { e.preventDefault(); applyFormat("underline"); }
    if (mod && e.key === "k") { e.preventDefault(); openLinkInput(); }
    if (e.key === "Escape") { setShowLinkInput(false); editorRef.current?.focus(); }
  }, [applyFormat, openLinkInput]);

  // Font size: apply to whole editor + persist
  useEffect(() => {
    if (editorRef.current) editorRef.current.style.fontSize = `${fontSize}px`;
    if (fontSize > 0 && fontSize !== nodeData.fontSize) commitData({ fontSize });
  }, [fontSize, nodeData.fontSize, commitData]);

  // Text alignment: apply to whole editor + persist
  useEffect(() => {
    if (editorRef.current) editorRef.current.style.textAlign = align;
    if (align !== (nodeData.align ?? "left")) commitData({ align });
  }, [align, nodeData.align, commitData]);

  // Sync external fontSize and alignment updates (e.g., from group resizing) to local state
  useEffect(() => {
    if (nodeData.fontSize !== undefined && nodeData.fontSize !== fontSize) {
      setFontSize(nodeData.fontSize);
    }
  }, [nodeData.fontSize]);

  useEffect(() => {
    const defaultAlign = nodeData.align ?? "left";
    if (defaultAlign !== align) {
      setAlign(defaultAlign);
    }
  }, [nodeData.align]);

  // Reacción dinámica en modo oscuro: si tiene texto negro, se pone blanco.
  const rawTextColor = nodeData.textColor ?? (isDark ? "#FFFFFF" : "#111827");
  const isBlackText = isBlackColor(rawTextColor);
  const textColor = isDark && isBlackText ? "#FFFFFF" : rawTextColor;

  // Text color: apply to whole editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.color = textColor;
    }
  }, [textColor]);

  // Close color picker on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActivePicker(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Seed initial content; re-seed if remote html changes while not focused
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const isFocused = document.activeElement === el;
    const incoming = nodeData.html ?? "Texto";
    if (!el.innerHTML) {
      el.innerHTML = incoming;
      styleLinks();
    } else if (!isFocused && el.innerHTML !== incoming) {
      el.innerHTML = incoming;
      styleLinks();
    }
  }, [nodeData.html, styleLinks]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ width: "100%", height: "100%", minWidth: 140, minHeight: 50 }}
      className="relative"
    >
      <NodeResizer isVisible={!!isSingleSelected} minWidth={140} minHeight={40} />

      {/* ── Formatting Toolbar ── */}
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
              key="toolbar"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              <div className={`flex items-center gap-0.5 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] px-2 py-1.5 ${isDark ? 'bg-[#1C1C1E] border border-white/10' : 'bg-white'}`}>
                {/* Font size */}
                <button
                  onClick={() => setFontSize((f) => Math.max(10, f - 1))}
                  className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-[#9CA3AF] hover:text-white' : 'hover:bg-[#F3F4F6] text-[#6B7280]'}`}
                >
                  <Minus size={10} strokeWidth={2.5} />
                </button>
                <input
                  type="text"
                  value={fontSize === 0 ? "" : fontSize}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setFontSize(0);
                      return;
                    }
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      setFontSize(Math.min(200, num));
                    }
                  }}
                  onBlur={() => {
                    setFontSize((f) => Math.max(10, f || 15));
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  className={`nodrag nopan text-[11px] font-normal w-6 text-center bg-transparent border-none outline-none rounded select-all py-0.5 font-sans ${isDark ? 'text-white focus:bg-white/10' : 'text-black focus:bg-neutral-100'}`}
                  style={{ width: "24px" }}
                />
                <button
                  onClick={() => setFontSize((f) => Math.min(200, f + 1))}
                  className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-[#9CA3AF] hover:text-white' : 'hover:bg-[#F3F4F6] text-[#6B7280]'}`}
                >
                  <Plus size={10} strokeWidth={2.5} />
                </button>

                <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

                {/* Bold */}
                <button
                  onMouseDown={(e) => { e.preventDefault(); applyFormat("bold"); }}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors font-semibold text-[13px] ${isDark ? 'hover:bg-white/10 text-[#9CA3AF] hover:text-white' : 'hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black'}`}
                  title="Negrita (Ctrl+B)"
                >
                  B
                </button>

                {/* Italic */}
                <button
                  onMouseDown={(e) => { e.preventDefault(); applyFormat("italic"); }}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors italic text-[13px] ${isDark ? 'hover:bg-white/10 text-[#9CA3AF] hover:text-white' : 'hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black'}`}
                  title="Cursiva (Ctrl+I)"
                >
                  I
                </button>

                {/* Underline */}
                <button
                  onMouseDown={(e) => { e.preventDefault(); applyFormat("underline"); }}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors underline text-[13px] ${isDark ? 'hover:bg-white/10 text-[#9CA3AF] hover:text-white' : 'hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black'}`}
                  title="Subrayado (Ctrl+U)"
                >
                  U
                </button>

                <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

                {/* Align left */}
                <button
                  onClick={() => setAlign("left")}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                    align === "left" 
                      ? (isDark ? "bg-white text-black" : "bg-black text-white") 
                      : (isDark ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]")
                  }`}
                  title="Alinear izquierda"
                >
                  <AlignLeft size={13} strokeWidth={2} />
                </button>

                {/* Align center */}
                <button
                  onClick={() => setAlign("center")}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                    align === "center" 
                      ? (isDark ? "bg-white text-black" : "bg-black text-white") 
                      : (isDark ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]")
                  }`}
                  title="Centrar"
                >
                  <AlignCenter size={13} strokeWidth={2} />
                </button>

                {/* Align right */}
                <button
                  onClick={() => setAlign("right")}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                    align === "right" 
                      ? (isDark ? "bg-white text-black" : "bg-black text-white") 
                      : (isDark ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]")
                  }`}
                  title="Alinear derecha"
                >
                  <AlignRight size={13} strokeWidth={2} />
                </button>

                <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

                {/* Link */}
                <button
                  onMouseDown={(e) => { e.preventDefault(); openLinkInput(); }}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                    activeLink 
                      ? (isDark ? "bg-white text-black" : "bg-[#EEF2FF] text-[#4059F1]") 
                      : (isDark ? "hover:bg-white/10 text-[#9CA3AF] hover:text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]")
                  }`}
                  title="Link (Ctrl+K)"
                >
                  <Link2 size={13} strokeWidth={2} />
                </button>

                <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-[#E5E7EB]'}`} />

                {/* Text Color Picker */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePicker(activePicker === "text" ? null : "text");
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-[#F3F4F6]'}`}
                    title="Color del Texto"
                  >
                    <Baseline size={13} style={{ color: textColor }} className="stroke-[2.5]" />
                  </button>
                  {activePicker === "text" && (
                    <div className={`absolute top-8 left-1/2 -translate-x-1/2 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.04)] p-2.5 flex gap-1.5 z-50 ${isDark ? 'bg-[#1C1C1E] border border-white/10' : 'bg-white border border-[#E5E7EB]'}`}>
                      {TEXT_COLOR_PALETTE.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => {
                            commitData({ textColor: c.value });
                            setActivePicker(null);
                          }}
                          className="w-5.5 h-5.5 rounded-full border border-gray-200 hover:scale-110 transition-transform flex items-center justify-center"
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        >
                          {textColor === c.value && (
                            <Check size={10} className={c.value === "#FFFFFF" ? "text-gray-800" : "text-white"} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
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
              </div>

              <AnimatePresence>
                {showLinkInput && (
                  <motion.div
                    key="link-input"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className={`absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.03)] px-3 py-2 z-40 ${isDark ? 'bg-[#1C1C1E] border border-white/10' : 'bg-white'}`}
                    style={{ minWidth: 280 }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Link2 size={13} className="text-[#9CA3AF] shrink-0" />
                    <input
                      ref={linkInputRef}
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); confirmLink(); }
                        if (e.key === "Escape") { e.preventDefault(); setShowLinkInput(false); }
                      }}
                      placeholder="https://..."
                      className={`flex-1 text-[13px] font-normal outline-none placeholder:text-[#D1D5DB] bg-transparent ${isDark ? 'text-white' : 'text-black'}`}
                    />
                    <button
                      onClick={confirmLink}
                      className={`px-3 py-1 rounded-lg text-[12px] font-normal transition-colors shrink-0 ${isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/80'}`}
                    >
                      {linkUrl.trim() ? "Aplicar" : "Quitar"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Link Popover (on selected link) ── */}
      <AnimatePresence>
        {selected && activeLink && !showLinkInput && (
          <LinkPopover
            anchor={activeLink}
            onEdit={openLinkInput}
            onRemove={removeLink}
          />
        )}
      </AnimatePresence>

      {/* ── Editor ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={detectLink}
        onKeyUp={detectLink}
        onInput={() => { styleLinks(); scheduleHtmlCommit(); }}
        onBlur={flushHtml}
        style={{
          fontSize,
          textAlign: align,
          minHeight: "100%",
          outline: "none",
          cursor: "text",
          lineHeight: 1.5,
          padding: "8px 10px",
          wordBreak: "break-word",
        }}
        className={`nodrag nopan w-full h-full font-sans font-light focus:outline-none [&_a]:text-[#4059F1] [&_a]:underline [&_a]:cursor-pointer ${isDark ? 'text-white' : 'text-black'}`}
      />

      {/* Handles — visible solo cuando está seleccionado (rendered last to stack on top) */}
      {(["top", "bottom", "left", "right"] as const).map((pos) => {
        const position =
          pos === "top" ? Position.Top :
          pos === "bottom" ? Position.Bottom :
          pos === "left" ? Position.Left : Position.Right;
        const className = `${HANDLE_CLASS} ${isSingleSelected ? "opacity-100" : "opacity-0 pointer-events-none"}`;

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

      <NodeExtendHandles nodeId={id} />
    </motion.div>
  );
};

export default memo(TextNode);

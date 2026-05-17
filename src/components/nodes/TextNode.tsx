import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Handle, Position, type NodeProps, NodeResizer } from "@xyflow/react";
import {
  Bold, Italic, Underline, Link2, AlignLeft, AlignCenter, AlignRight,
  ExternalLink, Trash2, Minus, Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type TextNodeData = {
  html?: string;
  fontSize?: number;
};

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.12 }}
      className="absolute -bottom-11 left-0 flex items-center gap-1.5 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.14)] px-2.5 py-1.5 z-30 pointer-events-auto"
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
        className="text-[11px] font-normal text-black hover:underline px-0.5 transition-colors"
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

// ─── TextNode ───────────────────────────────────────────────────
const TextNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as TextNodeData;
  const [fontSize, setFontSize] = useState(nodeData.fontSize ?? 15);
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [activeLink, setActiveLink] = useState<HTMLAnchorElement | null>(null);
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

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
  }, []);

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
    setShowLinkInput(false);
    setLinkUrl("");
    setSavedRange(null);
  }, [savedRange, linkUrl, styleLinks]);

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
  }, [activeLink]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === "b") { e.preventDefault(); applyFormat("bold"); }
    if (mod && e.key === "i") { e.preventDefault(); applyFormat("italic"); }
    if (mod && e.key === "u") { e.preventDefault(); applyFormat("underline"); }
    if (mod && e.key === "k") { e.preventDefault(); openLinkInput(); }
    if (e.key === "Escape") { setShowLinkInput(false); editorRef.current?.focus(); }
  }, [applyFormat, openLinkInput]);

  // Font size: apply to whole editor
  useEffect(() => {
    if (editorRef.current) editorRef.current.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // Text alignment: apply to whole editor
  useEffect(() => {
    if (editorRef.current) editorRef.current.style.textAlign = align;
  }, [align]);

  // Seed initial content once
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = nodeData.html || "Texto";
      styleLinks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ width: "100%", height: "100%", minWidth: 140, minHeight: 50 }}
      className="relative"
    >
      <NodeResizer
        isVisible={selected}
        minWidth={140}
        minHeight={40}
        lineStyle={{ borderColor: "#4059F1", borderWidth: 1, opacity: 0.4 }}
      />

      {/* ── Formatting Toolbar ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="toolbar"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-13 left-0 z-20 pointer-events-auto"
            style={{ whiteSpace: "nowrap" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-0.5 bg-white rounded-xl shadow-[0_4px_24px_rgb(0,0,0,0.12)] px-2 py-1.5">
              {/* Font size */}
              <button
                onClick={() => setFontSize((f) => Math.max(10, f - 1))}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
              >
                <Minus size={10} strokeWidth={2.5} />
              </button>
              <span className="text-[11px] font-normal text-black w-6 text-center tabular-nums select-none">{fontSize}</span>
              <button
                onClick={() => setFontSize((f) => Math.min(72, f + 1))}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
              >
                <Plus size={10} strokeWidth={2.5} />
              </button>

              <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1" />

              {/* Bold */}
              <button
                onMouseDown={(e) => { e.preventDefault(); applyFormat("bold"); }}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black transition-colors font-semibold text-[13px]"
                title="Negrita (Ctrl+B)"
              >
                B
              </button>

              {/* Italic */}
              <button
                onMouseDown={(e) => { e.preventDefault(); applyFormat("italic"); }}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black transition-colors italic text-[13px]"
                title="Cursiva (Ctrl+I)"
              >
                I
              </button>

              {/* Underline */}
              <button
                onMouseDown={(e) => { e.preventDefault(); applyFormat("underline"); }}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black transition-colors underline text-[13px]"
                title="Subrayado (Ctrl+U)"
              >
                U
              </button>

              <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1" />

              {/* Align left */}
              <button
                onClick={() => setAlign("left")}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${align === "left" ? "bg-black text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]"}`}
                title="Alinear izquierda"
              >
                <AlignLeft size={13} strokeWidth={2} />
              </button>

              {/* Align center */}
              <button
                onClick={() => setAlign("center")}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${align === "center" ? "bg-black text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]"}`}
                title="Centrar"
              >
                <AlignCenter size={13} strokeWidth={2} />
              </button>

              {/* Align right */}
              <button
                onClick={() => setAlign("right")}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${align === "right" ? "bg-black text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]"}`}
                title="Alinear derecha"
              >
                <AlignRight size={13} strokeWidth={2} />
              </button>

              <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1" />

              {/* Link */}
              <button
                onMouseDown={(e) => { e.preventDefault(); openLinkInput(); }}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${activeLink ? "bg-[#EEF2FF] text-[#4059F1]" : "hover:bg-[#F3F4F6] text-[#6B7280]"}`}
                title="Link (Ctrl+K)"
              >
                <Link2 size={13} strokeWidth={2} />
              </button>
            </div>

            {/* Link input popover */}
            <AnimatePresence>
              {showLinkInput && (
                <motion.div
                  key="link-input"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-[calc(100%+6px)] left-0 flex items-center gap-2 bg-white rounded-xl shadow-[0_8px_32px_rgb(0,0,0,0.14)] px-3 py-2 z-40"
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
                    className="flex-1 text-[13px] font-normal outline-none text-black placeholder:text-[#D1D5DB]"
                  />
                  <button
                    onClick={confirmLink}
                    className="px-3 py-1 rounded-lg bg-black text-white text-[12px] font-normal hover:bg-black/80 transition-colors shrink-0"
                  >
                    {linkUrl.trim() ? "Aplicar" : "Quitar"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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
        onMouseUp={detectLink}
        onKeyUp={detectLink}
        onInput={styleLinks}
        style={{
          fontSize,
          textAlign: align,
          minHeight: "100%",
          outline: "none",
          cursor: "text",
          lineHeight: 1.5,
          padding: "8px 10px",
          wordBreak: "break-word",
          color: "#000",
        }}
        className="w-full h-full font-sans font-light focus:outline-none [&_a]:text-[#4059F1] [&_a]:underline [&_a]:cursor-pointer"
      />

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
          className={`${HANDLE_CLASS} ${selected ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
        />
      ))}
    </motion.div>
  );
};

export default memo(TextNode);

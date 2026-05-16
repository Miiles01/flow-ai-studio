import { memo, useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, NodeResizer } from "@xyflow/react";
import { Bold, Italic, Underline, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type TextNodeData = {
  text?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

const MIN_FONT = 10;
const MAX_FONT = 72;

const handleClass =
  "!w-[10px] !h-[10px] !rounded-full !bg-white !border-[1.5px] !border-[#4059F1] transition-all duration-200 hover:!bg-[#4059F1] before:absolute before:-inset-3 before:content-['']";

const TextNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as TextNodeData;
  const [text, setText] = useState(nodeData.text || "Texto");
  const [fontSize, setFontSize] = useState(nodeData.fontSize || 16);
  const [bold, setBold] = useState(nodeData.bold || false);
  const [italic, setItalic] = useState(nodeData.italic || false);
  const [underline, setUnderline] = useState(nodeData.underline || false);
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const textStyle: React.CSSProperties = {
    fontSize,
    fontWeight: bold ? 600 : 300,
    fontStyle: italic ? "italic" : "normal",
    textDecoration: underline ? "underline" : "none",
    lineHeight: 1.4,
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ width: "100%", height: "100%", minWidth: 120, minHeight: 60 }}
      className="relative"
    >
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={40}
        lineStyle={{ borderColor: "#4059F1", borderWidth: 1, opacity: 0.4 }}
        handleStyle={{
          width: 8,
          height: 8,
          backgroundColor: "white",
          borderColor: "#4059F1",
          borderWidth: 1.5,
          borderRadius: "50%",
        }}
      />

      {/* Handles */}
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

      {/* Formatting bar — aparece arriba cuando está seleccionado */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-12 left-0 flex items-center gap-0.5 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.12)] px-2 py-1.5 z-20 pointer-events-auto"
            style={{ whiteSpace: "nowrap" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Font size */}
            <button
              onClick={() => setFontSize((f) => Math.max(MIN_FONT, f - 2))}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
            >
              <Minus size={11} strokeWidth={2} />
            </button>
            <span className="text-[12px] font-normal text-black w-7 text-center tabular-nums">{fontSize}</span>
            <button
              onClick={() => setFontSize((f) => Math.min(MAX_FONT, f + 2))}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
            >
              <Plus size={11} strokeWidth={2} />
            </button>

            <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1" />

            {/* Bold */}
            <button
              onClick={() => setBold((v) => !v)}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${bold ? "bg-black text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]"}`}
            >
              <Bold size={13} strokeWidth={2.5} />
            </button>

            {/* Italic */}
            <button
              onClick={() => setItalic((v) => !v)}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${italic ? "bg-black text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]"}`}
            >
              <Italic size={13} strokeWidth={2} />
            </button>

            {/* Underline */}
            <button
              onClick={() => setUnderline((v) => !v)}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${underline ? "bg-black text-white" : "hover:bg-[#F3F4F6] text-[#6B7280]"}`}
            >
              <Underline size={13} strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text area */}
      <div
        className="w-full h-full flex items-center justify-start px-2 py-1"
        onDoubleClick={() => setEditing(true)}
      >
        {editing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => setEditing(false)}
            style={{ ...textStyle, resize: "none", width: "100%", height: "100%" }}
            className="bg-transparent outline-none border-none text-black"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span style={textStyle} className="text-black break-words w-full">
            {text}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default memo(TextNode);

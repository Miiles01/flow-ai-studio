import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export type FlowNodeData = {
  label: string;
  description?: string;
  type?: "process" | "decision" | "start" | "end" | "action";
};

const typeStyles: Record<string, string> = {
  process: "border-node-border",
  decision: "border-amber-500/40 rotate-0",
  start: "border-emerald-500/40",
  end: "border-rose-500/40",
  action: "border-primary/40",
};

const typeAccents: Record<string, string> = {
  process: "bg-miiles-blue",
  decision: "bg-miiles-gray-400",
  start: "bg-miiles-blue",
  end: "bg-miiles-pink",
  action: "bg-miiles-blue",
};

const FlowNode = ({ data, selected }: NodeProps) => {
  const { isDark } = useTheme();
  const nodeData = data as FlowNodeData;
  const nodeType = nodeData.type || "process";

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        relative px-6 py-4 rounded-[16px] min-w-[180px] max-w-[260px] ${isDark ? 'bg-[#1C1C1E]' : 'bg-white'}
        transition-all duration-300 font-sans border-[1.5px]
        ${selected ? "border-[#4F46E5] shadow-sm" : isDark ? "border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.1)]" : "border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.015)]"}
      `}
    >
      {/* ─── Fully Bidirectional Connection Handles ─── */}
      {(["top", "bottom", "left", "right"] as const).map((pos) => {
        const position =
          pos === "top" ? Position.Top :
          pos === "bottom" ? Position.Bottom :
          pos === "left" ? Position.Left : Position.Right;
        
        const className = `!w-[11px] !h-[11px] !rounded-full !border-[1.5px] !border-[#4F46E5] transition-all duration-200 hover:!bg-[#4F46E5] before:absolute before:-inset-4 before:content-[''] !z-50 ${
          selected ? "opacity-100" : "opacity-0 hover:opacity-100"
        } ${isDark ? '!bg-[#1C1C1E]' : '!bg-white'} ${
          pos === "top" ? "!-top-[6px]" :
          pos === "bottom" ? "!-bottom-[6px]" :
          pos === "left" ? "!-left-[6px]" : "!-right-[6px]"
        }`;

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
      
      <div className="flex flex-col gap-2 relative z-20 pointer-events-none">
        <div className="flex items-center justify-between gap-3">
          <p className={`text-[15px] font-normal truncate tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            {nodeData.label}
          </p>
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${typeAccents[nodeType] || "bg-[#4F46E5]"}`} />
        </div>
        {nodeData.description && (
          <p className="text-[13px] font-light text-miiles-gray-400 leading-relaxed">
            {nodeData.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default memo(FlowNode);

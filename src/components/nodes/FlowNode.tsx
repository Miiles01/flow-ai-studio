import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";

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
  const nodeData = data as FlowNodeData;
  const nodeType = nodeData.type || "process";

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        relative px-6 py-4 rounded-[16px] bg-white min-w-[180px] max-w-[260px]
        transition-all duration-300 font-sans border-[1.5px]
        ${selected ? "border-[#4F46E5] shadow-sm" : "border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)]"}
      `}
    >
      {/* Top Handle Zone */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="!w-full !h-8 !bg-transparent !border-none !rounded-none !transform-none !left-0 !top-[-16px] flex items-center justify-center group/top z-10"
      >
        <div className={`w-[11px] h-[11px] bg-white border-[1.5px] border-[#4F46E5] rounded-full transition-all duration-200 group-hover/top:bg-[#4F46E5] ${selected ? "opacity-100" : "opacity-0 group-hover/top:opacity-100"}`} />
      </Handle>

      {/* Bottom Handle Zone */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-full !h-8 !bg-transparent !border-none !rounded-none !transform-none !left-0 !bottom-[-16px] !top-auto flex items-center justify-center group/bottom z-10"
      >
        <div className={`w-[11px] h-[11px] bg-white border-[1.5px] border-[#4F46E5] rounded-full transition-all duration-200 group-hover/bottom:bg-[#4F46E5] ${selected ? "opacity-100" : "opacity-0 group-hover/bottom:opacity-100"}`} />
      </Handle>

      {/* Left Handle Zone */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!w-8 !h-full !bg-transparent !border-none !rounded-none !transform-none !left-[-16px] !top-0 flex items-center justify-center group/left z-10"
      >
        <div className={`w-[11px] h-[11px] bg-white border-[1.5px] border-[#4F46E5] rounded-full transition-all duration-200 group-hover/left:bg-[#4F46E5] ${selected ? "opacity-100" : "opacity-0 group-hover/left:opacity-100"}`} />
      </Handle>

      {/* Right Handle Zone */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-8 !h-full !bg-transparent !border-none !rounded-none !transform-none !right-[-16px] !left-auto !top-0 flex items-center justify-center group/right z-10"
      >
        <div className={`w-[11px] h-[11px] bg-white border-[1.5px] border-[#4F46E5] rounded-full transition-all duration-200 group-hover/right:bg-[#4F46E5] ${selected ? "opacity-100" : "opacity-0 group-hover/right:opacity-100"}`} />
      </Handle>
      
      <div className="flex flex-col gap-2 relative z-20 pointer-events-none">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] font-normal text-black truncate tracking-tight">
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

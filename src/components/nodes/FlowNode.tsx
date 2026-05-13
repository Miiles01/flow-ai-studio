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
        transition-all duration-300 font-sans group border-[1.5px]
        ${selected ? "border-[#4F46E5] shadow-sm" : "border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)]"}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-[11px] !h-[11px] !bg-white !border-[1.5px] !border-[#4F46E5] !-top-1.5 transition-all duration-200 hover:!bg-[#4F46E5] ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      />
      
      <div className="flex flex-col gap-2">
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

      <Handle
        type="source"
        position={Position.Bottom}
        className={`!w-[11px] !h-[11px] !bg-white !border-[1.5px] !border-[#4F46E5] !-bottom-1.5 transition-all duration-200 hover:!bg-[#4F46E5] ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      />
    </motion.div>
  );
};

export default memo(FlowNode);

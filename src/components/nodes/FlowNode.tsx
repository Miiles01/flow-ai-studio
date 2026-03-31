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
  process: "bg-node-border",
  decision: "bg-amber-500",
  start: "bg-emerald-500",
  end: "bg-rose-500",
  action: "bg-primary",
};

const FlowNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as FlowNodeData;
  const nodeType = nodeData.type || "process";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        relative px-5 py-3.5 rounded-xl bg-node-bg border-2 min-w-[160px] max-w-[240px]
        backdrop-blur-sm transition-all duration-200
        ${typeStyles[nodeType]}
        ${selected ? "border-node-selected shadow-[0_0_24px_hsl(var(--glow-primary))]" : "shadow-lg shadow-black/30"}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!-top-1"
      />
      
      <div className="flex items-start gap-2.5">
        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeAccents[nodeType]}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {nodeData.label}
          </p>
          {nodeData.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {nodeData.description}
            </p>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!-bottom-1"
      />
    </motion.div>
  );
};

export default memo(FlowNode);

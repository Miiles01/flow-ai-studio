import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Eye, EyeOff } from "lucide-react";

export type TrendNodeKind = "start" | "phase" | "decision" | "fail" | "success" | "strategy" | "detail";

export type TrendNodeData = {
  label: string;
  sublabel?: string;
  tag?: string;
  kind?: TrendNodeKind;
  hasDetails?: boolean;
  expanded?: boolean;
  onToggle?: (id: string) => void;
};

const KIND_STYLES: Record<TrendNodeKind, { card: string; tag: string }> = {
  start: {
    card: "bg-black text-white dark:bg-white dark:text-black border-transparent",
    tag: "bg-white/15 text-white/70 dark:bg-black/10 dark:text-black/60",
  },
  phase: {
    card: "bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white border-[#E5E7EB] dark:border-white/10",
    tag: "bg-[#F3F4F6] dark:bg-white/10 text-[#6B7280] dark:text-white/60",
  },
  decision: {
    card: "bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white border-[#4059F1]/50 dark:border-[#7C8CF8]/40",
    tag: "bg-[#E8ECFE] dark:bg-[#4059F1]/20 text-[#4059F1] dark:text-[#9DA9F9]",
  },
  fail: {
    card: "bg-[#FEF2F2] dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20",
    tag: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-300",
  },
  success: {
    card: "bg-[#E8ECFE] dark:bg-[#4059F1]/15 text-[#28316e] dark:text-[#C5CDFB] border-[#4059F1]/30 dark:border-[#4059F1]/30",
    tag: "bg-white/70 dark:bg-white/10 text-[#4059F1] dark:text-[#9DA9F9]",
  },
  strategy: {
    card: "bg-[#FEEDED] dark:bg-[#FCB5B9]/10 text-[#7c3f43] dark:text-[#FCD4D6] border-[#FCB5B9]/60 dark:border-[#FCB5B9]/20",
    tag: "bg-white/70 dark:bg-white/10 text-[#E0787E] dark:text-[#FCB5B9]",
  },
  detail: {
    card: "bg-[#F7F7F8] dark:bg-white/5 text-gray-700 dark:text-white/80 border-dashed border-[#D9DBE3] dark:border-white/15",
    tag: "bg-white dark:bg-white/10 text-[#9499AE] dark:text-white/50",
  },
};

const HIDDEN_HANDLE = "!w-1 !h-1 !min-w-0 !min-h-0 !opacity-0 !pointer-events-none !border-none !bg-transparent";

const TrendFlowNode = ({ id, data }: NodeProps) => {
  const d = data as TrendNodeData;
  const kind = d.kind ?? "phase";
  const s = KIND_STYLES[kind];
  const isDetail = kind === "detail";

  return (
    <div
      className={`relative rounded-2xl border shadow-[0_4px_14px_rgba(0,0,0,0.05)] px-4 font-sans select-none ${
        isDetail ? "py-2.5 w-[210px]" : "py-3.5 w-[240px]"
      } ${s.card}`}
    >
      {d.tag && (
        <span className={`inline-block text-[9px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5 ${s.tag}`}>
          {d.tag}
        </span>
      )}
      <p className={`${isDetail ? "text-[11.5px]" : "text-[13px]"} font-normal leading-snug whitespace-pre-line`}>
        {d.label}
      </p>
      {d.sublabel && (
        <p className={`${isDetail ? "text-[10.5px]" : "text-[11px]"} font-light leading-snug mt-1 opacity-70 whitespace-pre-line`}>
          {d.sublabel}
        </p>
      )}

      {/* Ojo: expandir/colapsar las "raíces" del nodo */}
      {d.hasDetails && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            d.onToggle?.(id);
          }}
          title={d.expanded ? "Ocultar detalle" : "Ver más detalle"}
          className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center border shadow-md transition-all cursor-pointer z-10 ${
            d.expanded
              ? "bg-[#4059F1] text-white border-[#4059F1]"
              : "bg-white dark:bg-[#1C1C1E] text-[#4059F1] dark:text-[#9DA9F9] border-[#E5E7EB] dark:border-white/15 hover:scale-110"
          }`}
        >
          {d.expanded ? <EyeOff size={13} strokeWidth={2} /> : <Eye size={13} strokeWidth={2} />}
        </button>
      )}

      <Handle id="t" type="target" position={Position.Top} className={HIDDEN_HANDLE} />
      <Handle id="b" type="source" position={Position.Bottom} className={HIDDEN_HANDLE} />
      <Handle id="l-t" type="target" position={Position.Left} className={HIDDEN_HANDLE} />
      <Handle id="l-s" type="source" position={Position.Left} className={HIDDEN_HANDLE} />
      <Handle id="r-t" type="target" position={Position.Right} className={HIDDEN_HANDLE} />
      <Handle id="r-s" type="source" position={Position.Right} className={HIDDEN_HANDLE} />
    </div>
  );
};

export default memo(TrendFlowNode);

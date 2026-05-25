import { memo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";

export type SkeletonNodeData = {
  label?: string;
};

const SkeletonNode = ({ data, selected }: { data: SkeletonNodeData; selected?: boolean }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`relative w-[280px] h-[160px] rounded-2xl flex flex-col items-center justify-center p-6 shadow-lg transition-all duration-300
        ${isDark ? "bg-[#1C1C1E] border border-white/10" : "bg-white border border-gray-100"}
        ${selected ? "ring-2 ring-[#4059F1]" : ""}
      `}
    >
      {/* Background skeleton pulses */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 animate-pulse opacity-20 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
      </div>

      <Loader2 className={`w-8 h-8 animate-spin mb-4 ${isDark ? "text-white/40" : "text-gray-400"}`} />
      
      <div className={`h-4 w-3/4 rounded animate-pulse mb-3 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
      <div className={`h-3 w-1/2 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
      
      <p className={`absolute bottom-4 text-[11px] font-medium tracking-wide uppercase ${isDark ? "text-[#4059F1]/80" : "text-[#4059F1]"}`}>
        {data.label || "Generando flujo con IA..."}
      </p>
    </div>
  );
};

export default memo(SkeletonNode);

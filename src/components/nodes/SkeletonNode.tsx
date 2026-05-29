import { memo, useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

export type SkeletonNodeData = {
  label?: string;
};

const SkeletonNode = ({ selected }: { data: SkeletonNodeData; selected?: boolean }) => {
  const { isDark } = useTheme();
  const [stage, setStage] = useState(1);

  // Smooth progressive growth over time simulating AI thinking/building
  useEffect(() => {
    const t1 = setTimeout(() => setStage(2), 1500);
    const t2 = setTimeout(() => setStage(3), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Compute layout dimensions per stage
  const width = stage === 1 ? 280 : stage === 2 ? 460 : 700;
  const height = stage === 1 ? 160 : stage === 2 ? 240 : 360;

  return (
    <motion.div
      animate={{ width, height }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className={`relative rounded-2xl flex flex-col p-5 shadow-xl border overflow-hidden transition-colors duration-300
        ${
          isDark
            ? "bg-[#1C1C1E] border-white/10 text-white"
            : "bg-white border-gray-100 text-black"
        }
        ${selected ? "ring-2 ring-[#4059F1]" : ""}
      `}
      style={{ originX: 0.5, originY: 0.5 }}
    >
      {/* Background skeleton shimmer pulse */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute inset-0 animate-pulse opacity-30 ${
            isDark
              ? "bg-gradient-to-r from-transparent via-white/5 to-transparent"
              : "bg-gradient-to-r from-transparent via-gray-200 to-transparent"
          }`}
          style={{
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* Header loading indicator "Generando..." */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#4059F1] animate-ping" />
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider animate-pulse ${
            isDark ? "text-white/60" : "text-gray-500"
          }`}
        >
          Generando...
        </span>
      </div>

      {/* Symmetrical progressive wireframe display */}
      <div className="flex-1 flex flex-col justify-center relative">
        {stage === 1 && (
          <div className="space-y-3">
            <div className={`h-4 w-3/4 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-100"}`} />
            <div className={`h-3 w-1/2 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-100"}`} />
          </div>
        )}

        {stage === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between gap-4 h-full"
          >
            {/* 2 Aligned card mockups */}
            <div className={`flex-1 h-32 rounded-xl p-3 flex flex-col justify-between border border-dashed ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50/50 border-gray-200"}`}>
              <div className={`h-3 w-2/3 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
              <div className={`h-2.5 w-1/2 rounded animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
            </div>
            <div className="text-gray-300 dark:text-zinc-700 animate-pulse text-lg">➔</div>
            <div className={`flex-1 h-32 rounded-xl p-3 flex flex-col justify-between border border-dashed ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50/50 border-gray-200"}`}>
              <div className={`h-3 w-3/4 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
              <div className={`h-2.5 w-1/3 rounded animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
            </div>
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 h-full justify-between py-1"
          >
            {/* Symmetrical branching row layout */}
            <div className="flex items-center justify-between gap-2">
              <div className={`flex-1 h-16 rounded-lg p-2 flex flex-col justify-between border border-dashed ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50/30 border-gray-150"}`}>
                <div className={`h-2.5 w-4/5 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                <div className={`h-1.5 w-1/2 rounded animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
              </div>
              <div className="text-gray-300 dark:text-zinc-700 text-xs">➔</div>
              <div className={`flex-1 h-16 rounded-lg p-2 flex flex-col justify-between border border-dashed ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50/30 border-gray-150"}`}>
                <div className={`h-2.5 w-3/4 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                <div className={`h-1.5 w-1/3 rounded animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
              </div>
              <div className="text-gray-300 dark:text-zinc-700 text-xs">➔</div>
              <div className={`flex-1 h-16 rounded-lg p-2 flex flex-col justify-between border border-dashed ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50/30 border-gray-150"}`}>
                <div className={`h-2.5 w-2/3 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                <div className={`h-1.5 w-3/4 rounded animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
              </div>
            </div>

            {/* Bottom lane branched card mockup */}
            <div className="flex items-center justify-start gap-2 pl-[35%]">
              <div className="text-gray-300 dark:text-zinc-700 text-xs rotate-90 transform -translate-y-2">➔</div>
              <div className={`w-[45%] h-16 rounded-lg p-2 flex flex-col justify-between border border-dashed ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50/30 border-gray-150"}`}>
                <div className={`h-2.5 w-3/4 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                <div className={`h-1.5 w-1/2 rounded animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default memo(SkeletonNode);

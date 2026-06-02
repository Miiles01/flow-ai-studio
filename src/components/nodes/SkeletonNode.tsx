import { memo, useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

export type SkeletonNodeData = {
  label?: string;
  /** Real bounding-box dimensions of the flow being generated.
   *  Set by Index.tsx as soon as the AI response arrives so the
   *  skeleton can animate to the exact final size before being
   *  replaced by the real nodes. */
  targetWidth?: number;
  targetHeight?: number;
};

const SkeletonNode = ({
  data,
  selected,
}: {
  data: SkeletonNodeData;
  selected?: boolean;
}) => {
  const { isDark } = useTheme();
  const [stage, setStage] = useState(1);

  // Progressive growth while waiting for the AI response
  useEffect(() => {
    const t1 = setTimeout(() => setStage(2), 1500);
    const t2 = setTimeout(() => setStage(3), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Default sizes per stage (used until we know the real dimensions)
  const defaultW = stage === 1 ? 280 : stage === 2 ? 460 : 700;
  const defaultH = stage === 1 ? 160 : stage === 2 ? 240 : 360;

  // Once the real flow size arrives, jump straight to it
  const width  = data.targetWidth  ?? defaultW;
  const height = data.targetHeight ?? defaultH;

  return (
    <motion.div
      animate={{ width, height }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`relative rounded-2xl flex flex-col p-5 shadow-xl border overflow-hidden transition-colors duration-300
        ${
          isDark
            ? "bg-[#1C1C1E] border-white/10 text-white"
            : "bg-white border-gray-100 text-black"
        }
        ${selected ? "ring-2 ring-[#4059F1]" : ""}
      `}
      style={{ originX: 0, originY: 0 }}
    >
      {/* Shimmer sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-r from-transparent via-white/5 to-transparent"
              : "bg-gradient-to-r from-transparent via-gray-200/60 to-transparent"
          }`}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 shrink-0 relative z-10">
        <div className="w-2 h-2 rounded-full bg-[#4059F1] animate-ping" />
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider animate-pulse ${
            isDark ? "text-white/60" : "text-gray-500"
          }`}
        >
          Generando...
        </span>
      </div>

      {/* Progressive wireframe content */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        {stage === 1 && (
          <div className="space-y-3">
            <div className={`h-4 w-3/4 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-100"}`} />
            <div className={`h-3 w-1/2 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-100"}`} />
          </div>
        )}

        {stage >= 2 && !data.targetWidth && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-3 h-full"
          >
            {/* Top row: 2-3 card skeletons */}
            <div className="flex items-stretch gap-3 flex-1">
              {[0.65, 0.5, 0.75].map((w, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-xl p-3 flex flex-col gap-2 border border-dashed ${
                    isDark ? "bg-white/5 border-white/10" : "bg-gray-50/50 border-gray-200"
                  }`}
                >
                  <div
                    className={`h-2.5 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`}
                    style={{ width: `${w * 100}%` }}
                  />
                  <div
                    className={`h-2 rounded animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                    style={{ width: `${(w * 0.7) * 100}%` }}
                  />
                </div>
              ))}
            </div>

            {stage === 3 && (
              <div className="flex items-stretch gap-3 flex-1">
                {[0.8, 0.55, 0.7, 0.45].map((w, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-xl p-3 flex flex-col gap-2 border border-dashed ${
                      isDark ? "bg-white/5 border-white/10" : "bg-gray-50/50 border-gray-200"
                    }`}
                  >
                    <div
                      className={`h-2.5 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`}
                      style={{ width: `${w * 100}%` }}
                    />
                    <div
                      className={`h-2 rounded animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                      style={{ width: `${(w * 0.6) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* When real dimensions arrive: fill the whole space with a richer grid skeleton */}
        {data.targetWidth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-3 h-full"
          >
            {[1, 2, 3].map((row) => (
              <div key={row} className="flex gap-3 flex-1">
                {[0.7, 0.5, 0.65, 0.8].slice(0, row === 2 ? 4 : 3).map((w, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-xl p-3 flex flex-col gap-2 border border-dashed ${
                      isDark ? "bg-white/5 border-white/10" : "bg-gray-50/50 border-gray-200"
                    }`}
                  >
                    <div
                      className={`h-2.5 rounded animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`}
                      style={{ width: `${w * 100}%` }}
                    />
                    <div
                      className={`h-2 rounded animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                      style={{ width: `${(w * 0.65) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default memo(SkeletonNode);

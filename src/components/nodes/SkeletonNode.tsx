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
      className={`relative rounded-2xl flex items-center justify-center p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border overflow-hidden transition-colors duration-300
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

      {/* Centered Loading Text */}
      <div className="flex items-center justify-center relative z-10">
        <span
          className={`text-[13px] font-medium animate-pulse ${
            isDark ? "text-white/60" : "text-gray-500"
          }`}
        >
          Generando...
        </span>
      </div>
    </motion.div>
  );
};

export default memo(SkeletonNode);

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import type { ClarifyResult } from "@/lib/clarifyFlow";

type ClarifyPanelProps = {
  result: ClarifyResult;
  isDark: boolean;
  isGenerating: boolean;
  onConfirm: (answers: Record<string, string[]>) => void;
  onSkip: () => void;
  onClose: () => void;
};

const ClarifyPanel = ({ result, isDark, isGenerating, onConfirm, onSkip, onClose }: ClarifyPanelProps) => {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const toggleOption = (q: ClarifyResult["questions"][number], option: string) => {
    setAnswers((prev) => {
      const current = prev[q.id] ?? [];
      if (q.allow_multiple) {
        return current.includes(option)
          ? { ...prev, [q.id]: current.filter((o) => o !== option) }
          : { ...prev, [q.id]: [...current, option] };
      }
      return { ...prev, [q.id]: current.includes(option) ? [] : [option] };
    });
  };

  const isSelected = (qId: string, option: string) => (answers[qId] ?? []).includes(option);

  return (
    <div className="absolute top-6 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
      <motion.div
        initial={{ y: -24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -24, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
        className={`pointer-events-auto w-full max-w-xl rounded-[24px] p-5 shadow-2xl border ${
          isDark
            ? "bg-[hsl(222,20%,11%)] border-white/10 text-white"
            : "bg-white border-[#F3F4F6] text-black"
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-miiles-blue/15 flex items-center justify-center shrink-0">
              <Sparkles size={15} className="text-miiles-blue" />
            </div>
            <p className={`text-sm font-normal ${isDark ? "text-white" : "text-black"}`}>
              Afinemos tu idea
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-black/5 text-miiles-gray-400"
            }`}
            aria-label="Cerrar"
          >
            <X size={15} />
          </button>
        </div>

        {result.intent && (
          <p className={`text-xs font-light mb-4 ${isDark ? "text-white/60" : "text-miiles-gray-400"}`}>
            {result.intent}
          </p>
        )}

        <div className="space-y-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
          {result.questions.map((q) => (
            <div key={q.id}>
              <p className={`text-sm font-normal mb-2 ${isDark ? "text-white" : "text-black"}`}>
                {q.question}
              </p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((option) => {
                  const selected = isSelected(q.id, option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleOption(q, option)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-light transition-colors border ${
                        selected
                          ? "bg-miiles-blue text-white border-miiles-blue"
                          : isDark
                          ? "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                          : "bg-miiles-gray-50 text-miiles-gray-600 border-[#F3F4F6] hover:bg-miiles-gray-100"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-5">
          <button
            onClick={onSkip}
            disabled={isGenerating}
            className={`text-xs font-light transition-colors disabled:opacity-40 ${
              isDark ? "text-white/50 hover:text-white/80" : "text-miiles-gray-400 hover:text-miiles-gray-600"
            }`}
          >
            Generar de todos modos
          </button>
          <button
            onClick={() => onConfirm(answers)}
            disabled={isGenerating}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-normal transition-colors disabled:opacity-50 ${
              isDark
                ? "bg-black text-white border border-white/10 hover:bg-zinc-900"
                : "bg-black text-white hover:bg-miiles-pink"
            }`}
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                Generar flujo
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ClarifyPanel;

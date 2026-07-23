import { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Check, Loader2, Target } from "lucide-react";
import type { PlanResult } from "@/lib/planFlow";

type PlanPanelProps = {
  plan: PlanResult;
  isDark: boolean;
  isGenerating: boolean;
  onApprove: () => void;
  onClose: () => void;
};

const PlanPanel = ({ plan, isDark, isGenerating, onApprove, onClose }: PlanPanelProps) => {
  const [canScrollTop, setCanScrollTop] = useState(false);
  return (
    <div className="absolute bottom-[210px] inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
        className={`pointer-events-auto w-full max-w-xl rounded-[24px] p-5 shadow-[0_24px_50px_rgba(0,0,0,0.18)] border ${
          isDark ? "bg-[#1C1C1E] border-white/10 text-white" : "bg-white border-[#F3F4F6] text-black"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4059F1]/10 flex items-center justify-center">
              <Sparkles size={15} className="text-[#4059F1]" />
            </div>
            <div>
              <p className={`text-[14px] font-medium leading-tight ${isDark ? "text-white" : "text-black"}`}>
                {plan.title || "Plan estratégico"}
              </p>
              <p className={`text-[11px] font-light ${isDark ? "text-white/40" : "text-[#6B7280]"}`}>
                Revisa el plan antes de generar el flujo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-black/5 text-[#6B7280]"
            }`}
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="relative w-full">
          {/* Gradient overlay for when scrolled down */}
          <div 
            className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b ${isDark ? 'from-[#1C1C1E] to-[#1C1C1E]/0' : 'from-white to-white/0'} pointer-events-none transition-opacity duration-300 z-10 ${canScrollTop ? 'opacity-100' : 'opacity-0'}`}
          />
          <div 
            className="max-h-[320px] overflow-y-auto panel-scrollbar space-y-4 pr-1"
            onScroll={(e) => setCanScrollTop(e.currentTarget.scrollTop > 5)}
          >
          {plan.objective && (
            <div className="flex items-start gap-2">
              <Target size={14} className="text-[#4059F1] mt-0.5 shrink-0" />
              <p className={`text-[13px] font-normal leading-relaxed ${isDark ? "text-white/90" : "text-black/90"}`}>
                {plan.objective}
              </p>
            </div>
          )}

          {plan.summary && (
            <p className={`text-[12.5px] font-light leading-relaxed ${isDark ? "text-white/65" : "text-[#4B4F63]"}`}>
              {plan.summary}
            </p>
          )}

          {plan.phases.length > 0 && (
            <div className="space-y-2.5">
              {plan.phases.map((p, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#4059F1] text-white text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className={`text-[12.5px] font-medium ${isDark ? "text-white" : "text-black"}`}>{p.name}</p>
                    <p className={`text-[11.5px] font-light leading-relaxed ${isDark ? "text-white/55" : "text-[#6B7280]"}`}>
                      {p.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-dashed border-neutral-200/10">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className={`text-xs font-light transition-colors disabled:opacity-40 cursor-pointer ${
              isDark ? "text-white/50 hover:text-white/80" : "text-[#6B7280] hover:text-black"
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={onApprove}
            disabled={isGenerating}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium transition-all duration-300 disabled:opacity-40 cursor-pointer shadow-md ${
              isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
            }`}
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Aprobar y generar</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PlanPanel;

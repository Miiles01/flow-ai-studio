import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [customOpen, setCustomOpen] = useState<Record<string, boolean>>({});
  const [customText, setCustomText] = useState<Record<string, string>>({});

  const q = result.questions[currentStep];
  const totalSteps = result.questions.length;

  /** Merges selected options with any custom "Otro" text for confirmation. */
  const buildAnswers = (): Record<string, string[]> => {
    const merged: Record<string, string[]> = {};
    for (const question of result.questions) {
      const selected = [...(answers[question.id] ?? [])];
      const extra = (customText[question.id] ?? "").trim();
      if (extra) selected.push(extra);
      if (selected.length > 0) merged[question.id] = selected;
    }
    return merged;
  };

  const toggleOption = (option: string) => {
    if (!q) return;
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

  const isSelected = (option: string) => {
    if (!q) return false;
    return (answers[q.id] ?? []).includes(option);
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onConfirm(buildAnswers());
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const hasAnswerSelected = q ? (answers[q.id] ?? []).length > 0 : false;


  if (!q) return null;

  return (
    <div className="absolute bottom-[210px] inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
        className={`pointer-events-auto w-full max-w-xl rounded-[24px] p-5 shadow-[0_24px_50px_rgba(0,0,0,0.06)] border ${
          isDark
            ? "bg-[#1C1C1E] border-white/10 text-white"
            : "bg-white border-[#F3F4F6] text-black"
        }`}
      >
        {/* Header Area */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <p className={`text-[13px] font-normal ${isDark ? "text-white/95" : "text-black/95"}`}>
              Cuéntame más sobre tu idea
            </p>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-light border ${
              isDark ? "bg-white/5 border-white/10 text-white/50" : "bg-[#F3F4F6] border-neutral-200/50 text-[#6B7280]"
            }`}>
              Pregunta {currentStep + 1} de {totalSteps}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-black/5 text-[#6B7280]"
                }`}
                title="Atrás"
              >
                <ArrowLeft size={14} />
              </button>
            )}
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
        </div>

        {/* Question Slide Area */}
        <div className="overflow-hidden min-h-[110px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-3"
            >
              <p className={`text-[15px] font-medium leading-relaxed ${isDark ? "text-white" : "text-black"}`}>
                {q.question}
                {q.allow_multiple && (
                  <span className="text-[11px] font-light text-[#6B7280] ml-1.5">(Selecciona varias si deseas)</span>
                )}
              </p>
              
              <div className="flex flex-wrap gap-2 pt-1">
                {q.options.map((option) => {
                  const selected = isSelected(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleOption(option)}
                      className={`px-3.5 py-2 rounded-full text-xs font-light transition-all border cursor-pointer select-none ${
                        selected
                          ? "bg-[#4059F1] text-white border-[#4059F1] shadow-[0_4px_12px_rgba(64,89,241,0.06)] hover:scale-102"
                          : isDark
                          ? "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                          : "bg-[#F3F4F8] text-[#374151] border-transparent hover:bg-neutral-200"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}

                {(() => {
                  const open = customOpen[q.id] ?? false;
                  const hasText = (customText[q.id] ?? "").trim().length > 0;
                  const active = open || hasText;
                  return (
                    <button
                      onClick={() => setCustomOpen((prev) => ({ ...prev, [q.id]: !open }))}
                      className={`px-3.5 py-2 rounded-full text-xs font-light transition-all border cursor-pointer select-none ${
                        active
                          ? "bg-[#4059F1] text-white border-[#4059F1] shadow-[0_4px_12px_rgba(64,89,241,0.06)]"
                          : isDark
                          ? "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                          : "bg-[#F3F4F8] text-[#374151] border-transparent hover:bg-neutral-200"
                      }`}
                    >
                      Otro
                    </button>
                  );
                })()}
              </div>

              <AnimatePresence>
                {(customOpen[q.id] ?? false) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <input
                      autoFocus
                      value={customText[q.id] ?? ""}
                      onChange={(e) =>
                        setCustomText((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleNext();
                        }
                      }}
                      placeholder="Cuéntame más para afinar tu respuesta…"
                      className={`mt-1 w-full rounded-2xl px-4 py-2.5 text-[13px] font-light outline-none transition-colors border ${
                        isDark
                          ? "bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#4059F1]"
                          : "bg-[#F7F7F8] border-neutral-200/60 text-black placeholder:text-[#9499AE] focus:border-[#4059F1]"
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-dashed border-neutral-200/10">
          
          
          <button
            onClick={handleNext}
            disabled={isGenerating}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium transition-all duration-300 disabled:opacity-40 cursor-pointer shadow-md ${
              isDark
                ? "bg-white text-black hover:bg-white/90"
                : "bg-black text-white hover:bg-black/90"
            }`}
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : currentStep < totalSteps - 1 ? (
              <>
                Siguiente
                <ArrowRight size={14} />
              </>
            ) : (
              "Generar flujo"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ClarifyPanel;

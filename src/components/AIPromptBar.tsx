import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2, EyeOff } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useTheme } from "@/contexts/ThemeContext";
import AppsMenu from "@/components/AppsMenu";

type AIPromptBarProps = {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  forceOpen?: boolean;
  extendLabel?: string | null;
  onCancelExtend?: () => void;
};

const AIPromptBar = ({ onGenerate, isGenerating, forceOpen, extendLabel, onCancelExtend }: AIPromptBarProps) => {
  const [prompt, setPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { isDark } = useTheme();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (forceOpen) {
      setIsExpanded(true);
      // enfoca el input al activar el modo ampliación
      setTimeout(() => textareaRef.current?.focus(), 60);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim());
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showHideButton = isHovered || isFocused;

  return (
    <div className="absolute bottom-12 inset-x-0 flex flex-col items-center justify-end z-10 pointer-events-none">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
            className="pointer-events-auto"
          >
            <button
              onClick={() => setIsExpanded(true)}
              className={`w-[52px] h-[52px] bg-black rounded-[18px] flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 transition-transform duration-300 ${isDark ? 'ring-1 ring-white/10' : ''}`}
              aria-label="Abrir asistente IA"
            >
              <img src={logoImg} alt="AI" className="w-7 h-7" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className="relative w-full max-w-[calc(100vw-130px)] md:max-w-2xl pointer-events-auto flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Hide button sliding from behind */}
            <div className="absolute top-0 left-0 right-0 h-0 flex justify-center pointer-events-none">
              <AnimatePresence>
                {showHideButton && (
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.8 }}
                    animate={{ y: -56, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
                    className="z-0 pointer-events-auto"
                  >
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black/80 transition-colors"
                      title="Ocultar asistente"
                    >
                      <EyeOff size={16} strokeWidth={1.5} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Main Prompt Bar */}
            <div className={`bg-black rounded-[40px] pt-8 pb-4 px-6 shadow-2xl transition-all duration-300 relative z-10 w-full ${isDark ? 'ring-1 ring-white/10' : ''}`}>
              {extendLabel && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4059F1]/20 text-[#9DB0FF] text-[11px] font-light">
                    {extendLabel}
                    <button
                      onClick={() => onCancelExtend?.()}
                      className="text-white/60 hover:text-white transition-colors"
                      title="Cancelar ampliación"
                    >
                      <X size={12} strokeWidth={2} />
                    </button>
                  </span>
                </div>
              )}
              <textarea
                ref={textareaRef}
                rows={1}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={extendLabel ? "¿Qué quieres generar a partir de aquí?" : "Describe tu flujo o idea..."}
                className="w-full bg-transparent text-white font-light text-[15px] placeholder:text-white/40 outline-none resize-none overflow-hidden min-h-[44px] leading-relaxed text-center placeholder:text-center"
                disabled={isGenerating}
              />
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <AppsMenu isDark={isDark} />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSubmit()}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 transition-all duration-300 hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:transform-none"
                  >
                    {isGenerating ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ArrowUp size={18} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIPromptBar;

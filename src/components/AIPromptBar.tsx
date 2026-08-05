import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2, EyeOff, X, Mic, LayoutTemplate } from "lucide-react";
import logoImg from "@/assets/logo.webp";
import { useTheme } from "@/contexts/ThemeContext";
import AppsMenu from "@/components/AppsMenu";
import WidgetsPicker from "@/components/widgets/WidgetsPicker";
import type { WidgetDef } from "@/components/widgets/registry";

type AIPromptBarProps = {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  forceOpen?: boolean;
  extendLabel?: string | null;
  onCancelExtend?: () => void;
  onAddWidget?: (widget: WidgetDef) => void;
};

const AIPromptBar = ({ onGenerate, isGenerating, forceOpen, extendLabel, onCancelExtend, onAddWidget }: AIPromptBarProps) => {

  const [prompt, setPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const { isDark } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [canScrollTop, setCanScrollTop] = useState(false);


  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");
  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const stopRecording = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (!speechSupported) return;
    if (isRecording) {
      stopRecording();
      return;
    }
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;
    baseTextRef.current = prompt ? prompt.trim() + " " : "";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setPrompt(baseTextRef.current + transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

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
    stopRecording();
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

  const springPhysics = {
    type: "spring",
    stiffness: 400,
    damping: 28,
    mass: 0.6,
  };

  const hasText = prompt.trim().length > 0;

  return (
    <div className="absolute bottom-12 inset-x-0 flex flex-col items-center justify-end z-10 pointer-events-none">
      <AnimatePresence mode="wait" initial={false}>
        {!isExpanded ? (
          <motion.div
            key="collapsed-ai-btn"
            initial={{ scale: 0.8, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 15 }}
            transition={springPhysics}
            className="pointer-events-auto"
          >
            <button
              onClick={() => setIsExpanded(true)}
              className={`w-[52px] h-[52px] bg-black rounded-[20px] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all duration-200 ${
                isDark ? "ring-1 ring-white/15" : "border border-white/10"
              }`}
              aria-label="Abrir asistente IA"
            >
              <img src={logoImg} alt="AI" className="w-7 h-7 select-none" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded-ai-bar"
            initial={{ y: 20, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.94 }}
            transition={springPhysics}
            className="relative w-full max-w-[calc(100vw-130px)] md:max-w-2xl pointer-events-auto flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Hide button sliding from behind */}
            <div className="absolute top-0 left-0 right-0 h-0 flex justify-center pointer-events-none">
              <AnimatePresence>
                {showHideButton && (
                  <motion.div
                    initial={{ y: 15, opacity: 0, scale: 0.8 }}
                    animate={{ y: -52, opacity: 1, scale: 1 }}
                    exit={{ y: 15, opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 450, damping: 26 }}
                    className="z-0 pointer-events-auto"
                  >
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-neutral-800 active:scale-95 transition-all border border-white/10"
                      title="Ocultar asistente"
                    >
                      <EyeOff size={15} strokeWidth={1.5} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Main Prompt Bar */}
            <motion.div
              layout
              transition={springPhysics}
              className={`bg-black rounded-[36px] pt-7 pb-4 px-6 shadow-2xl relative z-10 w-full select-none ${
                isDark ? "ring-1 ring-white/10" : "border border-white/10"
              }`}
            >
              {extendLabel && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center justify-center gap-2 mb-3"
                >
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
                </motion.div>
              )}
              <div className="relative w-full">
                {/* Gradient overlay for when scrolled down */}
                <div
                  className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black to-transparent pointer-events-none transition-opacity duration-300 rounded-t-[10px] z-10 ${
                    canScrollTop ? "opacity-100" : "opacity-0"
                  }`}
                />
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onScroll={(e) => setCanScrollTop(e.currentTarget.scrollTop > 5)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={extendLabel ? "¿Qué quieres generar a partir de aquí?" : "Describe tu flujo o idea..."}
                  className="w-full bg-transparent text-white font-light text-[15px] placeholder:text-white/40 outline-none resize-none overflow-y-auto max-h-[160px] min-h-[44px] leading-relaxed text-center placeholder:text-center panel-scrollbar select-text"
                  disabled={isGenerating}
                />
              </div>

              <div className="flex items-center justify-between mt-2 pt-1">
                <div className="flex items-center gap-2">
                  <AppsMenu isDark={isDark} />
                  {onAddWidget && (
                    <button
                      type="button"
                      onClick={() => setWidgetsOpen(true)}
                      className="flex items-center gap-2 bg-white h-9 px-3.5 rounded-full cursor-pointer hover:bg-white/90 hover:scale-105 active:scale-95 transition-all group"
                    >
                      <LayoutTemplate size={14} strokeWidth={1.5} className="text-black" />
                      <span className="text-[12px] font-medium text-black">Widgets</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleRecording}
                      disabled={isGenerating}
                      aria-label={isRecording ? "Detener dictado" : "Dictar por voz"}
                      title={isRecording ? "Detener dictado" : "Dictar por voz"}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 ${
                        isRecording
                          ? "bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-400/50"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <Mic size={16} strokeWidth={1.5} />
                    </button>
                  )}
                  <button
                    onClick={() => handleSubmit()}
                    disabled={!hasText || isGenerating}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isGenerating
                        ? "bg-white/20 text-white cursor-wait"
                        : hasText
                        ? "bg-white text-black shadow-md scale-105 hover:scale-110 active:scale-95 cursor-pointer"
                        : "bg-white/10 text-white/30 cursor-default"
                    }`}
                  >
                    {isGenerating ? (
                      <Loader2 size={16} className="animate-spin text-white" />
                    ) : (
                      <ArrowUp size={16} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {onAddWidget && (
        <WidgetsPicker open={widgetsOpen} onClose={() => setWidgetsOpen(false)} onPick={onAddWidget} />
      )}
    </div>
  );
};

export default AIPromptBar;

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

/* Spring physics ultra-fluido y elástico (alineado con Toolbar) */
const elasticSpring = {
  type: "spring" as const,
  stiffness: 350,
  damping: 22,
  mass: 0.55,
};

const AIPromptBar = ({
  onGenerate,
  isGenerating,
  forceOpen,
  extendLabel,
  onCancelExtend,
  onAddWidget,
}: AIPromptBarProps) => {
  const [prompt, setPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const { isDark } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [canScrollTop, setCanScrollTop] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [forceOpen]);

  /* Colapso fluido al hacer clic fuera de la barra */
  useEffect(() => {
    if (!isExpanded) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (containerRef.current?.contains(target)) return;
      // Ignorar menús/portales flotantes (Apps, Widgets, dialogs)
      if (
        widgetsOpen ||
        target.closest("[data-radix-popper-content-wrapper]") ||
        target.closest("[role='dialog']") ||
        target.closest("[role='menu']")
      )
        return;
      if (isRecording || isGenerating || prompt.trim().length > 0 || extendLabel) return;
      setIsExpanded(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isExpanded, widgetsOpen, isRecording, isGenerating, prompt, extendLabel]);

  /* Auto-resize textarea */
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
    setIsFocused(false);
    setIsHovered(false);
    textareaRef.current?.blur();
    // Contracción fluida de vuelta al squircle
    setTimeout(() => setIsExpanded(false), 120);
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const expand = () => {
    setIsExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 80);
  };

  const hasText = prompt.trim().length > 0;
  const showHideButton = isHovered || isFocused;

  return (
    <div className="absolute bottom-12 inset-x-0 flex flex-col items-center justify-end z-10 pointer-events-none">
      {/* Botón ocultar asistente (flota arriba de la barra) */}
      <div className="relative flex justify-center w-full max-w-[calc(100vw-130px)] md:max-w-2xl">
        <AnimatePresence>
          {isExpanded && showHideButton && (
            <motion.div
              initial={{ y: 14, opacity: 0, scale: 0.75 }}
              animate={{ y: -14, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.75 }}
              transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.4 }}
              className="absolute -top-10 z-20 pointer-events-auto"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-neutral-800 active:scale-95 transition-all border border-white/10"
                title="Ocultar asistente"
              >
                <EyeOff size={14} strokeWidth={1.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Contenedor único con morphing layout fluido ── */}
      <motion.div
        ref={containerRef}
        layout
        transition={elasticSpring}
        onClick={!isExpanded ? expand : undefined}
        onMouseEnter={() => isExpanded && setIsHovered(true)}
        onMouseLeave={() => isExpanded && setIsHovered(false)}
        className={`pointer-events-auto bg-black text-white relative z-10 select-none overflow-hidden transition-shadow duration-300 ${
          isDark ? "ring-1 ring-white/15" : "border border-white/10"
        } ${
          isExpanded
            ? "w-full max-w-[calc(100vw-130px)] md:max-w-2xl rounded-[36px] pt-7 pb-4 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col justify-between"
            : "w-[52px] h-[52px] rounded-[20px] p-0 flex items-center justify-center cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.22)] hover:scale-105 active:scale-95"
        }`}
        aria-label={!isExpanded ? "Abrir asistente IA" : undefined}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {!isExpanded ? (
            /* Estado colapsado: Isotipo / Logo con Fade Suave y Escala Elástica */
            <motion.div
              key="collapsed-logo"
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
              transition={elasticSpring}
              className="w-full h-full flex items-center justify-center"
            >
              <img src={logoImg} alt="AI" className="w-7 h-7 select-none pointer-events-none" />
            </motion.div>
          ) : (
            /* Estado expandido: Campo de texto y herramientas */
            <motion.div
              key="expanded-content"
              layout
              initial={{ opacity: 0, scale: 0.96, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 4, transition: { duration: 0.12 } }}
              transition={elasticSpring}
              className="w-full flex flex-col"
            >
              {/* Tag de ampliación de contexto */}
              <AnimatePresence>
                {extendLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={elasticSpring}
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
              </AnimatePresence>

              {/* Textarea */}
              <div className="relative w-full">
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

              {/* Controles inferiores */}
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
                  <motion.button
                    onClick={() => handleSubmit()}
                    disabled={!hasText || isGenerating}
                    layout
                    animate={{
                      scale: hasText ? 1.07 : 1,
                      backgroundColor: isGenerating
                        ? "rgba(255,255,255,0.18)"
                        : hasText
                        ? "#ffffff"
                        : "rgba(255,255,255,0.1)",
                    }}
                    transition={elasticSpring}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isGenerating
                        ? "text-white cursor-wait"
                        : hasText
                        ? "text-black shadow-md cursor-pointer hover:scale-110 active:scale-95"
                        : "text-white/30 cursor-default"
                    }`}
                  >
                    {isGenerating ? (
                      <Loader2 size={16} className="animate-spin text-white" />
                    ) : (
                      <ArrowUp size={16} strokeWidth={2} />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {onAddWidget && (
        <WidgetsPicker open={widgetsOpen} onClose={() => setWidgetsOpen(false)} onPick={onAddWidget} />
      )}
    </div>
  );
};

export default AIPromptBar;

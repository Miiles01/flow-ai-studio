import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2, EyeOff, X, Mic, LayoutTemplate, Boxes } from "lucide-react";
import isotipoImg from "@/assets/isotipo.webp";
import { useTheme } from "@/contexts/ThemeContext";
import AppsMenu from "@/components/AppsMenu";
import WidgetsPicker from "@/components/widgets/WidgetsPicker";
import type { WidgetDef } from "@/components/widgets/registry";
import { useUserApps } from "@/hooks/useUserApps";
import { logoForApp } from "@/lib/appCatalog";

type MentionApp = { id: string; name: string; logo: string | null };

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


type AIPromptBarProps = {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  forceOpen?: boolean;
  extendLabel?: string | null;
  onCancelExtend?: () => void;
  onAddWidget?: (widget: WidgetDef) => void;
};

/* Spring physics ultra-fluido y orgánico */
const spring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
  mass: 0.5,
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");
  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  /* ---------- Menciones de apps conectadas ---------- */
  const { customApps } = useUserApps();
  const mentionApps: MentionApp[] = useMemo(
    () =>
      customApps
        .filter((a) => a.enabled)
        .map((a) => ({ id: a.id, name: a.name.trim(), logo: logoForApp(a.name, a.url) })),
    [customApps]
  );
  const [suggestions, setSuggestions] = useState<MentionApp[]>([]);
  const [mentionQuery, setMentionQuery] = useState<{ start: number; end: number } | null>(null);

  const mentionRegex = useMemo(() => {
    if (!mentionApps.length) return null;
    const names = [...mentionApps]
      .sort((a, b) => b.name.length - a.name.length)
      .map((a) => escapeRe(a.name));
    return new RegExp(`@(${names.join("|")})`, "gi");
  }, [mentionApps]);

  const findApp = (name: string) =>
    mentionApps.find((a) => a.name.toLowerCase() === name.trim().toLowerCase()) ?? null;

  const updateSuggestions = (text: string, caret: number) => {
    if (!mentionApps.length) {
      setSuggestions([]);
      setMentionQuery(null);
      return;
    }
    const before = text.slice(0, caret);
    const m = before.match(/(^|\s)(@?)([\p{L}\p{N}._-]{2,30})$/u);
    if (!m) {
      setSuggestions([]);
      setMentionQuery(null);
      return;
    }
    const word = m[3];
    const start = caret - word.length - (m[2] ? 1 : 0);
    // Si ya es una mención completa insertada, no sugerir
    if (m[2] && findApp(word)) {
      setSuggestions([]);
      setMentionQuery(null);
      return;
    }
    const matches = mentionApps.filter((a) => a.name.toLowerCase().startsWith(word.toLowerCase()));
    setSuggestions(matches.slice(0, 4));
    setMentionQuery(matches.length ? { start, end: caret } : null);
  };

  const insertMention = (app: MentionApp) => {
    const range = mentionQuery ?? { start: prompt.length, end: prompt.length };
    const next = `${prompt.slice(0, range.start)}@${app.name} ${prompt.slice(range.end)}`;
    setPrompt(next);
    setSuggestions([]);
    setMentionQuery(null);
    const caret = range.start + app.name.length + 2;
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(caret, caret);
    });
  };

  const removeMention = (index: number, length: number) => {
    const next = (prompt.slice(0, index) + prompt.slice(index + length)).replace(/\s{2,}/g, " ");
    setPrompt(next);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  /** Segmentos para el overlay: texto plano + tags de apps */
  const segments = useMemo(() => {
    const out: Array<{ text: string; app?: MentionApp; index: number }> = [];
    if (!mentionRegex) return [{ text: prompt, index: 0 }];
    let last = 0;
    mentionRegex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = mentionRegex.exec(prompt))) {
      const app = findApp(m[1]);
      if (!app) continue;
      if (m.index > last) out.push({ text: prompt.slice(last, m.index), index: last });
      out.push({ text: m[0], app, index: m.index });
      last = m.index + m[0].length;
    }
    if (last < prompt.length) out.push({ text: prompt.slice(last), index: last });
    return out;
  }, [prompt, mentionRegex, mentionApps]);

  const hasMentions = segments.some((s) => s.app);


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
    if (e.key === "Escape" && suggestions.length) {
      e.preventDefault();
      setSuggestions([]);
      setMentionQuery(null);
      return;
    }
    if (e.key === "Tab" && suggestions.length) {
      e.preventDefault();
      insertMention(suggestions[0]);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (suggestions.length) {
        insertMention(suggestions[0]);
        return;
      }
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
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* Estado 1: Botón colapsado */
          <motion.div
            key="collapsed"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.45 }}
            className="pointer-events-auto"
          >
            <button
              onClick={expand}
              className={`w-[52px] h-[52px] bg-black rounded-[20px] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.22)] hover:scale-105 active:scale-95 transition-transform duration-200 ${
                isDark ? "ring-1 ring-white/15" : "border border-white/10"
              }`}
              aria-label={isGenerating ? "Generando…" : "Abrir asistente IA"}
            >
              {isGenerating ? (
                <Loader2 size={22} className="animate-spin text-white" />
              ) : (
                <img src={isotipoImg} alt="AI" className="w-7 h-7 object-contain select-none pointer-events-none" />
              )}
            </button>

          </motion.div>
        ) : (
          /* Estado 2: Barra expandida (animación de entrada y salida original y limpia) */
          <motion.div
            key="expanded"
            ref={containerRef}
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.45 }}
            className="relative w-full max-w-[calc(100vw-130px)] md:max-w-2xl pointer-events-auto flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Botón ocultar asistente (flota arriba de la barra) */}
            <div className="absolute top-0 left-0 right-0 h-0 flex justify-center pointer-events-none">
              <AnimatePresence>
                {showHideButton && (
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.8 }}
                    animate={{ y: -50, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.35 }}
                    className="z-20 pointer-events-auto"
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

            {/* Contenedor principal de la barra */}
            <div
              className={`bg-black text-white rounded-[32px] pt-7 pb-4 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] relative z-10 w-full min-h-[145px] flex flex-col justify-between select-none ${
                isDark ? "ring-1 ring-white/15" : "border border-white/10"
              }`}
            >
              {/* Tag de ampliación de contexto */}
              <AnimatePresence>
                {extendLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
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

              {/* Sugerencias de apps conectadas */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full z-30 flex flex-wrap justify-center gap-2 px-2"
                  >
                    {suggestions.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insertMention(app)}
                        className={`inline-flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 text-[12px] font-medium shadow-lg transition-colors ${
                          isDark
                            ? "bg-white text-black hover:bg-white/90 ring-1 ring-black/10"
                            : "bg-black text-white hover:bg-neutral-800 ring-1 ring-white/10"
                        }`}
                        title={`Usar ${app.name}`}
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 overflow-hidden">
                          {app.logo ? (
                            <img
                              src={app.logo}
                              alt=""
                              className="h-3.5 w-3.5 object-contain"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          ) : (
                            <Boxes size={11} className="text-black/60" />
                          )}
                        </span>
                        {app.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Textarea */}
              <div className="relative w-full flex-1 flex flex-col justify-center min-h-[50px] mb-2">
                <div
                  className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black to-transparent pointer-events-none transition-opacity duration-300 rounded-t-[10px] z-10 ${
                    canScrollTop ? "opacity-100" : "opacity-0"
                  }`}
                />
                {/* Overlay con tags de apps (espejo del textarea) */}
                {hasMentions && (
                  <div
                    ref={overlayRef}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 overflow-hidden font-light text-[15px] leading-relaxed text-center text-white whitespace-pre-wrap break-words"
                  >
                    {segments.map((seg, i) =>
                      seg.app ? (
                        <span
                          key={`${seg.index}-${i}`}
                          className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full pl-1 pr-1.5 py-[1px] align-baseline mx-[1px] ${
                            isDark ? "bg-white/15 text-white" : "bg-white/15 text-white"
                          }`}
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/90 overflow-hidden">
                            {seg.app.logo ? (
                              <img
                                src={seg.app.logo}
                                alt=""
                                className="h-3 w-3 object-contain"
                                onError={(e) => (e.currentTarget.style.display = "none")}
                              />
                            ) : (
                              <Boxes size={9} className="text-black/60" />
                            )}
                          </span>
                          <span className="text-[13px]">{seg.app.name}</span>
                          <button
                            type="button"
                            onClick={() => removeMention(seg.index, seg.text.length)}
                            className="text-white/50 hover:text-white transition-colors"
                            title="Quitar app"
                          >
                            <X size={10} strokeWidth={2.5} />
                          </button>
                        </span>
                      ) : (
                        <span key={`${seg.index}-${i}`}>{seg.text}</span>
                      )
                    )}
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    updateSuggestions(e.target.value, e.target.selectionStart ?? e.target.value.length);
                  }}
                  onClick={(e) => updateSuggestions(prompt, e.currentTarget.selectionStart ?? 0)}
                  onScroll={(e) => {
                    setCanScrollTop(e.currentTarget.scrollTop > 5);
                    if (overlayRef.current) overlayRef.current.scrollTop = e.currentTarget.scrollTop;
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    setTimeout(() => setSuggestions([]), 120);
                  }}
                  placeholder={extendLabel ? "¿Qué quieres generar a partir de aquí?" : "Describe tu flujo o idea..."}
                  className={`relative z-[1] w-full bg-transparent font-light text-[15px] placeholder:text-white/40 outline-none resize-none overflow-y-auto max-h-[160px] min-h-[44px] leading-relaxed text-center placeholder:text-center panel-scrollbar select-text ${
                    hasMentions ? "text-transparent caret-white" : "text-white"
                  }`}
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
                    animate={{
                      scale: hasText ? 1.07 : 1,
                      backgroundColor: isGenerating
                        ? "rgba(255,255,255,0.18)"
                        : hasText
                        ? "#ffffff"
                        : "rgba(255,255,255,0.1)",
                    }}
                    transition={{ duration: 0.2 }}
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
            </div>
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

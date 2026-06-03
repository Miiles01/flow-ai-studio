import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, LayoutDashboard, Search, Users, Zap } from "lucide-react";

const STEPS = [
  {
    key: "bienvenida",
    tag: "01 — Bienvenida",
    title: "Bienvenido\na",
    italic: "Miiles",
    body: "Tu espacio para crear flujos visuales con IA, descubrir programas de marcas y colaborar con otros emprendedores.",
    icon: Zap,
    color: "#FFD878",
  },
  {
    key: "tableros",
    tag: "02 — Tableros",
    title: "Organiza\ntus ideas",
    italic: "visualmente",
    body: "Crea tableros infinitos con nodos, textos, imágenes y marcos. Todo en tiempo real, desde cualquier dispositivo.",
    icon: LayoutDashboard,
    color: "#A8FF78",
  },
  {
    key: "programas",
    tag: "03 — Programas",
    title: "Descubre\noportunidades",
    italic: "para ti",
    body: "Explora programas de marcas que buscan colaboraciones. Postúlate en segundos y lleva tu carrera al siguiente nivel.",
    icon: Search,
    color: "#78C8FF",
  },
  {
    key: "colaboraciones",
    tag: "04 — Colaboraciones",
    title: "Tu mejor\nversión,",
    italic: "siempre visible",
    body: "Construye un perfil profesional con tus redes, portafolio y videos. Que las marcas te encuentren a ti.",
    icon: Users,
    color: "#FF78C8",
  },
];

const STORAGE_PREFIX = "miiles_tutorial_seen";

type Props = {
  userId?: string | null;
  /** Incrementar este número fuerza la apertura del modal (ej. desde el banner). */
  triggerOpen?: number;
};

export default function TutorialModal({ userId, triggerOpen }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const storageKey = userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;

  // Auto-abrir para nuevos usuarios
  useEffect(() => {
    if (userId === undefined) return;
    try {
      const seen = localStorage.getItem(storageKey);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [userId, storageKey]);

  // Abrir desde el banner
  useEffect(() => {
    if (triggerOpen && triggerOpen > 0) {
      setStep(0);
      setOpen(true);
    }
  }, [triggerOpen]);

  function close() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch { /* ignore */ }
    setOpen(false);
  }

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const next = () => {
    if (step < STEPS.length - 1) goTo(step + 1);
    else close();
  };

  const prev = () => {
    if (step > 0) goTo(step - 1);
  };

  const current = STEPS[step];
  const Icon = current.icon;

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay — igual al de la landing navbar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-[4px] cursor-pointer"
          />

          {/* Modal — mismo bg #7E7E7E que el menú desplegable de la landing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 md:inset-[5%] z-[100] rounded-[32px] md:rounded-[40px] border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col"
            style={{ background: "#7E7E7E" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 md:px-12 pt-8 md:pt-10 flex-shrink-0">
              <span className="text-white/60 text-xs font-light tracking-widest uppercase">
                Cómo funciona Miiles
              </span>
              <button
                onClick={close}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Cerrar"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Slide content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              {/* Left — main content */}
              <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-8 md:py-0 relative overflow-hidden">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Tag */}
                    <div className="overflow-hidden">
                      <motion.span
                        initial={{ y: "110%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                        className="inline-block text-white/50 text-xs font-light tracking-widest uppercase"
                      >
                        {current.tag}
                      </motion.span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-0">
                      <div className="overflow-hidden">
                        <motion.h2
                          initial={{ y: "110%" }}
                          animate={{ y: "0%" }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
                          className="text-white font-medium leading-[1.1] whitespace-pre-line"
                          style={{
                            fontSize: "clamp(36px, 5vw, 68px)",
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        >
                          {current.title}
                        </motion.h2>
                      </div>
                      <div className="overflow-hidden">
                        <motion.p
                          initial={{ y: "110%" }}
                          animate={{ y: "0%" }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                          className="text-white italic leading-[1.1]"
                          style={{
                            fontSize: "clamp(32px, 4.5vw, 62px)",
                            fontFamily: "'Georgia', serif",
                            fontWeight: 400,
                          }}
                        >
                          {current.italic}
                        </motion.p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="overflow-hidden">
                      <motion.p
                        initial={{ y: "110%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
                        className="text-white/70 font-light leading-relaxed max-w-sm"
                        style={{ fontSize: "clamp(14px, 1.5vw, 17px)" }}
                      >
                        {current.body}
                      </motion.p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right — icon panel */}
              <div className="hidden md:flex w-[38%] flex-shrink-0 items-center justify-center border-l border-white/10 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div
                      className="w-24 h-24 rounded-3xl flex items-center justify-center"
                      style={{ background: current.color + "22", border: `1.5px solid ${current.color}44` }}
                    >
                      <Icon size={40} style={{ color: current.color }} strokeWidth={1.5} />
                    </div>
                    <span
                      className="font-medium leading-none select-none"
                      style={{
                        fontSize: "clamp(80px, 10vw, 140px)",
                        color: "rgba(255,255,255,0.06)",
                        fontFamily: "'Poppins', sans-serif",
                        lineHeight: 1,
                      }}
                    >
                      0{step + 1}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer — nav */}
            <div className="flex items-center justify-between px-8 md:px-12 pb-8 md:pb-10 flex-shrink-0">
              {/* Dots */}
              <div className="flex gap-2">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? "w-6 bg-white" : "w-1.5 bg-white/30"
                    }`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex items-center gap-3">
                {step > 0 && (
                  <button
                    onClick={prev}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft size={16} className="text-white" />
                  </button>
                )}
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-normal hover:bg-white/90 transition-colors"
                >
                  {step < STEPS.length - 1 ? "Siguiente" : "Empezar"}
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

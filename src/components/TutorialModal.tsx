import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type Step = {
  key: string;
  title: string;
  description: string;
  media?: string;
};

const STEPS: Step[] = [
  {
    key: "colaboraciones",
    title: "Colaboraciones",
    description:
      "Encuentra marcas líderes y colabora con ellas en proyectos creativos para redes sociales y estrategias digitales de alto impacto.",
  },
  {
    key: "modelos_ia",
    title: "Modelos de Negocio con IA",
    description:
      "Crea tableros interactivos y modela tus flujos de trabajo con inteligencia artificial para acelerar el crecimiento de tus ideas.",
  },
  {
    key: "perfil",
    title: "Perfil y Portafolio",
    description:
      "Gestiona tu perfil profesional, diseña un portafolio que capte la atención de las marcas y recibe invitaciones a colaboraciones especiales.",
  },
];

const STORAGE_PREFIX = "miiles_tutorial_seen";

type Props = {
  userId?: string | null;
  /** Increment this number to force-open the modal (e.g. from a banner click). */
  triggerOpen?: number;
};

export default function TutorialModal({ userId, triggerOpen }: Props) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const storageKey = userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;

  useEffect(() => {
    // Wait until we know which user we are dealing with
    if (userId === undefined) return;
    try {
      const seen = localStorage.getItem(storageKey);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [userId, storageKey]);

  // Allow opening the modal on demand (banner click)
  useEffect(() => {
    if (triggerOpen && triggerOpen > 0) {
      setActive(0);
      setOpen(true);
    }
  }, [triggerOpen]);

  function close() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function next() {
    if (active < STEPS.length - 1) {
      setActive((a) => a + 1);
    } else {
      close();
    }
  }

  const step = STEPS[active];
  const isLast = active === STEPS.length - 1;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop — igual al overlay del menú de la landing */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* Card — bg-[#7E7E7E] igual al menú desplegable de la landing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] md:max-h-none md:h-[520px] overflow-hidden rounded-[28px] shadow-2xl flex flex-col md:grid md:grid-cols-[40%_60%]"
            style={{ background: isDark ? "#333333" : "#7E7E7E" }}
          >
            {/* Close button — Movido como hijo directo para que quede fijo en mobile */}
            <button
              onClick={close}
              className="absolute right-4 top-4 md:right-5 md:top-5 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            {/* Left panel — title + steps */}
            <div className="p-6 pb-2 md:p-10 flex flex-col flex-shrink-0">
              <h2 className="text-2xl md:text-4xl font-normal leading-tight text-white pr-10 md:pr-0">
                Bienvenido a Miiles
              </h2>

              <nav className="mt-4 md:mt-10 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
                {STEPS.map((s, i) => (
                  <button
                    key={s.key}
                    onClick={() => setActive(i)}
                    className={`shrink-0 block text-left px-4 py-2 rounded-xl text-xs md:text-sm transition-colors w-auto md:w-full ${
                      i === active
                        ? "bg-white/15 text-white font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right panel — media + content */}
            <div className="flex flex-col flex-grow overflow-y-auto md:overflow-visible min-h-0" style={{ background: isDark ? "#333333" : "#7E7E7E" }}>
              {/* Media area */}
              <div className="m-4 mb-0 h-32 md:h-56 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-full h-full opacity-60"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="tut-grid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#tut-grid)" />
                </svg>
              </div>

              {/* Content */}
              <div className="p-6 md:p-10 flex flex-col flex-grow">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3 className="text-xl md:text-2xl font-normal text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 md:mt-3 text-xs md:text-sm font-light leading-relaxed text-white/70">
                      {step.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Step dots */}
                <div className="flex gap-1.5 mt-5 md:mt-6">
                  {STEPS.map((s, i) => (
                    <span
                      key={s.key}
                      className={`h-1.5 rounded-full transition-all ${
                        i === active ? "w-6 bg-white" : "w-1.5 bg-white/30"
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-6 md:mt-auto pt-6 md:pt-8 flex items-center justify-end gap-3">
                  <button
                    onClick={close}
                    className="rounded-full bg-black text-white px-5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm hover:bg-zinc-900 transition-colors"
                  >
                    Probar ahora
                  </button>
                  <button
                    onClick={next}
                    className="rounded-full bg-white text-black px-5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm hover:bg-gray-100 transition-colors"
                  >
                    {isLast ? "Listo" : "Siguiente"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

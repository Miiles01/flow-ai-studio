import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import avatar3 from "@/assets/avatar3.png";

// SVG Logos for Brands (Colaboraciones)
const tiktokSvg = (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.23-.45-.47-.64-.73v6.52c-.03 2.1-.6 4.26-1.95 5.85-1.54 1.88-4.07 2.85-6.42 2.53-2.44-.22-4.83-1.84-5.72-4.19-.97-2.45-.63-5.46.99-7.53 1.45-1.93 3.97-2.92 6.36-2.5v4.03c-1.34-.23-2.82.26-3.6 1.35-.85 1.05-.88 2.65-.13 3.73.66 1.04 1.95 1.61 3.19 1.46 1.13-.1 2.18-.89 2.48-2 .16-.54.14-1.12.14-1.68V.02z" />
  </svg>
);

const mercadoLibreSvg = (
  <svg className="w-4 h-4 text-[#001E62] dark:text-[#FFF159] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const skincareSvg = (
  <svg className="w-4 h-4 text-pink-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 007-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 007 7z" />
  </svg>
);

const nikeSvg = (
  <svg className="w-4 h-4 text-black dark:text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 7.23c-.34 0-.69.04-1.04.12-1.92.48-4.22 1.94-6.4 4.02-2.12 2-4.06 4.38-5.38 6.42-.58.91-.98 1.76-1.16 2.45-.07.28-.09.52-.05.7.04.16.14.28.3.34.11.04.25.04.42 0 .42-.1 1.05-.44 1.83-.99 2.5-1.78 5.76-5.06 8.35-8.39 1.95-2.52 3.19-4.58 3.52-5.74.08-.29.08-.54 0-.7-.08-.16-.25-.26-.39-.26z" />
  </svg>
);

const adidasSvg = (
  <svg className="w-4 h-4 text-black dark:text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 19h3.5l3-9H5l-3 9zm6.5 0h3.5l4-12h-3.5l-4 12zm7 0H19l5-15h-3.5l-5 15z" />
  </svg>
);

const starbucksSvg = (
  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

const BRANDS = [
  { name: "TikTok", logo: tiktokSvg },
  { name: "Mercado Libre", logo: mercadoLibreSvg },
  { name: "CeraVe", logo: skincareSvg },
  { name: "Nike", logo: nikeSvg },
  { name: "Adidas", logo: adidasSvg },
  { name: "Starbucks", logo: starbucksSvg },
];

const brandsRow1 = [...BRANDS, ...BRANDS];
const brandsRow2 = [...BRANDS.slice(3), ...BRANDS.slice(0, 3), ...BRANDS.slice(3), ...BRANDS.slice(0, 3)];

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
    title: "Gestiona tu portafolio",
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
            style={{ background: isDark ? "#000000" : "#7E7E7E" }}
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
            <div className="flex flex-col flex-grow overflow-y-auto md:overflow-visible min-h-0" style={{ background: isDark ? "#000000" : "#7E7E7E" }}>
              {/* Media area */}
              <div className="relative m-4 mb-0 h-32 md:h-56 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 overflow-hidden flex items-center justify-center flex-shrink-0 select-none">
                {/* Grid Pattern Background */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    maskImage: "radial-gradient(ellipse, black 25%, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse, black 25%, transparent 75%)"
                  }}
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

                {/* Illustration Content */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  {active === 0 && (
                    <div className="w-full flex flex-col gap-3 justify-center py-2">
                      {/* Row 1: Left to right marquee */}
                      <div className="w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
                        <div className="flex w-max gap-4 animate-marquee">
                          {brandsRow1.map((b, idx) => (
                            <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shrink-0 ${
                              isDark ? "bg-black/60 border-white/5 text-white" : "bg-white/80 border-neutral-200/50 text-neutral-800"
                            }`}>
                              {b.logo}
                              <span className="text-[11px] font-medium tracking-tight">{b.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Row 2: Left to right (alternate sequence/speed) */}
                      <div className="w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
                        <div className="flex w-max gap-4 animate-marquee" style={{ animationDirection: "reverse", animationDuration: "18s" }}>
                          {brandsRow2.map((b, idx) => (
                            <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shrink-0 ${
                              isDark ? "bg-black/60 border-white/5 text-white" : "bg-white/80 border-neutral-200/50 text-neutral-800"
                            }`}>
                              {b.logo}
                              <span className="text-[11px] font-medium tracking-tight">{b.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {active === 1 && (
                    <div className="relative w-full h-full max-w-2xl mx-auto flex items-center justify-center">
                      
                      {/* Connection Line */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M 38 50 C 43 50, 43 50, 48 50" 
                          fill="none" 
                          stroke="#4059F1" 
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>

                      {/* Left Node: ShapeNode */}
                      <div className="absolute left-[6%] top-[25%] w-[32%] h-[50%] rounded-2xl border-2 border-[#4059F1] bg-[#4059F1]/10 flex flex-col items-center justify-center p-3 text-center shadow-md select-none z-10">
                        {/* Connection Handles */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-[-4px] w-2 h-2 rounded-full bg-white border border-[#4059F1]" />
                        <div className="absolute top-1/2 -translate-y-1/2 right-[-4px] w-2 h-2 rounded-full bg-white border border-[#4059F1]" />
                        <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border border-[#4059F1]" />
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border border-[#4059F1]" />

                        <span className="text-[8px] sm:text-[9px] text-[#4059F1] font-semibold bg-[#4059F1]/20 px-2 py-0.5 rounded-full mb-1 sm:mb-1.5">IA Generativa</span>
                        <div className="text-[10px] sm:text-[12px] font-semibold text-[#4059F1] leading-tight">Analizar Idea</div>
                      </div>

                      {/* Right Node: TodoNode */}
                      <div className={`absolute right-[6%] top-[12%] w-[46%] h-[76%] p-3 sm:p-4 rounded-2xl border flex flex-col justify-between shadow-lg select-none z-10 ${
                        isDark ? "bg-[#1E1E1E] border-white/10 text-white" : "bg-white border-neutral-200 text-neutral-800"
                      }`}>
                        {/* Connection Handles */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-[-4px] w-2 h-2 rounded-full bg-white border border-[#4059F1]" />
                        <div className="absolute top-1/2 -translate-y-1/2 right-[-4px] w-2 h-2 rounded-full bg-white border border-[#4059F1]" />
                        <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border border-[#4059F1]" />
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border border-[#4059F1]" />

                        {/* Arrowhead pointing to Right Node left handle */}
                        <div className="absolute left-[-11px] top-1/2 -translate-y-1/2 w-2 h-2 border-t-[2px] border-r-[2px] border-[#4059F1] transform rotate-45 pointer-events-none" />

                        {/* Header */}
                        <div>
                          <div className="text-[11px] sm:text-[13px] font-bold leading-tight text-left">Estructura Canvas</div>
                          <div className="text-[8px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 font-light mt-0.5 text-left leading-none">Generador de Flujos</div>
                        </div>

                        {/* Tasks */}
                        <div className="flex flex-col gap-1 sm:gap-1.5">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-emerald-500 bg-emerald-500 text-white flex items-center justify-center text-[8px] sm:text-[9px] shrink-0 font-bold">✓</span>
                            <span className="text-[9px] sm:text-[10px] text-neutral-400 line-through text-left truncate">Propuesta de Valor</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-emerald-500 bg-emerald-500 text-white flex items-center justify-center text-[8px] sm:text-[9px] shrink-0 font-bold">✓</span>
                            <span className="text-[9px] sm:text-[10px] text-neutral-400 line-through text-left truncate">Modelo de Ingresos</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full border shrink-0 ${isDark ? 'border-white/20' : 'border-neutral-300'}`} />
                            <span className="text-[9px] sm:text-[10px] font-medium leading-none text-left truncate">Plan de Canales</span>
                          </div>
                        </div>
                      </div>

                      {/* Cursors */}
                      <div className="absolute left-[20%] top-[10%] z-20 pointer-events-none flex items-start">
                        <svg className="w-5 h-5 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)] rotate-[-10deg] shrink-0" viewBox="0 0 24 24">
                          <path d="M4 3l16 8-8 2-6 7z" fill="#4059F1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="bg-[#4059F1] text-white py-0.5 px-1.5 rounded-full -ml-1 mt-3">
                          <span className="text-[9px] font-semibold leading-none">Mateo</span>
                        </div>
                      </div>

                      <div className="absolute right-[12%] bottom-[15%] z-20 pointer-events-none flex items-start">
                        <svg className="w-5 h-5 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)] rotate-[-10deg] shrink-0" viewBox="0 0 24 24">
                          <path d="M4 3l16 8-8 2-6 7z" fill="#FCB5B9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="bg-[#FCB5B9] text-neutral-800 py-0.5 px-1.5 rounded-full -ml-1 mt-3">
                          <span className="text-[9px] font-semibold leading-none">Sofía</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {active === 2 && (
                    <div className="flex items-center justify-center w-full px-4 sm:px-6">
                      {/* Profile Card */}
                      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center gap-2 sm:gap-2.5 shrink-0 shadow-lg ${
                        isDark ? "bg-black/80 border-white/10" : "bg-white border-neutral-200"
                      }`} style={{ width: "160px" }}>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#4059F1]">
                          <img src={avatar3} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center">
                          <div className={`text-[12px] sm:text-[13px] font-semibold ${isDark ? "text-white" : "text-neutral-800"}`}>Laura Morales</div>
                          <div className="text-[8px] sm:text-[9px] text-[#4059F1] font-semibold bg-[#4059F1]/10 px-2 py-0.5 rounded-full mt-1 inline-block">Creador Pro</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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

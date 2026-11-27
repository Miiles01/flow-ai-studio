import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { X, LayoutTemplate, Blocks, Clapperboard, Network, LayoutGrid } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { pickLang } from "@/i18n";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ShapeNode from "@/components/nodes/ShapeNode";
import TodoNode from "@/components/nodes/TodoNode";
import { STUDIO_COMPONENTS } from "@/lib/studioComponents";

type L = { es: string; en: string; pt: string; fr: string };

type StepKey = "plantillas" | "componentes" | "escenas" | "arquitectura" | "tableros";

const STEPS: { key: StepKey; icon: typeof X; title: L; description: L }[] = [
  {
    key: "plantillas",
    icon: LayoutTemplate,
    title: { es: "Plantillas", en: "Templates", pt: "Modelos", fr: "Modèles" },
    description: {
      es: "Elige una plantilla de portafolio o de página de ventas, adáptala con tu asistente de IA y publícala en wearemiiles.com con tu nombre.",
      en: "Pick a portfolio or sales page template, adapt it with your AI assistant and publish it on wearemiiles.com under your name.",
      pt: "Escolha um modelo de portfólio ou de página de vendas, adapte com seu assistente de IA e publique em wearemiiles.com com seu nome.",
      fr: "Choisissez un modèle de portfolio ou de page de vente, adaptez-le avec votre assistant IA et publiez-le sur wearemiiles.com à votre nom.",
    },
  },
  {
    key: "componentes",
    icon: Blocks,
    title: { es: "Componentes", en: "Components", pt: "Componentes", fr: "Composants" },
    description: {
      es: "Carruseles, galerías, textos animados y transiciones listos para copiar: pega el prompt en tu asistente y suma cada pieza a tu página.",
      en: "Carousels, galleries, animated text and transitions ready to copy: paste the prompt into your assistant and add each piece to your page.",
      pt: "Carrosséis, galerias, textos animados e transições prontos para copiar: cole o prompt no seu assistente e adicione cada peça à sua página.",
      fr: "Carrousels, galeries, textes animés et transitions prêts à copier : collez le prompt dans votre assistant et ajoutez chaque pièce à votre page.",
    },
  },
  {
    key: "escenas",
    icon: Clapperboard,
    title: { es: "Escenas", en: "Scenes", pt: "Cenas", fr: "Scènes" },
    description: {
      es: "Escenas de video para tus Reels y TikToks: captions al ritmo de tu voz, gráficas y transiciones que puedes adaptar a tu propio video.",
      en: "Video scenes for your Reels and TikToks: captions timed to your voice, charts and transitions you can adapt to your own video.",
      pt: "Cenas de vídeo para seus Reels e TikToks: legendas no ritmo da sua voz, gráficos e transições que você adapta ao seu vídeo.",
      fr: "Des scènes vidéo pour vos Reels et TikToks : sous-titres au rythme de votre voix, graphiques et transitions à adapter à votre vidéo.",
    },
  },
  {
    key: "arquitectura",
    icon: Network,
    title: { es: "Arquitectura algorítmica", en: "Algorithmic architecture", pt: "Arquitetura algorítmica", fr: "Architecture algorithmique" },
    description: {
      es: "Entiende cómo TikTok, Instagram, YouTube y Facebook deciden qué mostrar, paso por paso, y qué estrategias usan los creadores que crecen.",
      en: "Understand how TikTok, Instagram, YouTube and Facebook decide what to show, step by step, and which strategies growing creators use.",
      pt: "Entenda como TikTok, Instagram, YouTube e Facebook decidem o que mostrar, passo a passo, e quais estratégias os criadores que crescem usam.",
      fr: "Comprenez comment TikTok, Instagram, YouTube et Facebook décident quoi montrer, étape par étape, et quelles stratégies utilisent les créateurs qui grandissent.",
    },
  },
  {
    key: "tableros",
    icon: LayoutGrid,
    title: { es: "Tableros", en: "Boards", pt: "Quadros", fr: "Tableaux" },
    description: {
      es: "Crea tableros interactivos y modela tus flujos de trabajo con inteligencia artificial para acelerar el crecimiento de tus ideas. Suma widgets de tareas, campañas, clientes, contratos e ingresos.",
      en: "Create interactive boards and model your workflows with artificial intelligence to speed up the growth of your ideas. Add widgets for tasks, campaigns, clients, contracts and revenue.",
      pt: "Crie quadros interativos e modele seus fluxos de trabalho com inteligência artificial para acelerar o crescimento das suas ideias. Adicione widgets de tarefas, campanhas, clientes, contratos e receitas.",
      fr: "Créez des tableaux interactifs et modélisez vos flux de travail avec l'intelligence artificielle pour accélérer la croissance de vos idées. Ajoutez des widgets de tâches, campagnes, clients, contrats et revenus.",
    },
  },
];

const UI = {
  welcome: { es: "Bienvenido a Miiles", en: "Welcome to Miiles", pt: "Bem-vindo ao Miiles", fr: "Bienvenue sur Miiles" },
  tryNow: { es: "Probar ahora", en: "Try it now", pt: "Experimentar", fr: "Essayer" },
  next: { es: "Siguiente", en: "Next", pt: "Próximo", fr: "Suivant" },
  done: { es: "Listo", en: "Done", pt: "Pronto", fr: "Terminé" },
  close: { es: "Cerrar", en: "Close", pt: "Fechar", fr: "Fermer" },
};

const STORAGE_PREFIX = "miiles_tutorial_seen";

type Props = {
  userId?: string | null;
  /** Increment this number to force-open the modal (e.g. from a banner click). */
  triggerOpen?: number;
  /** Only auto-open for brand-new users (no boards yet). Undefined = still loading. */
  isNewUser?: boolean;
};

/** Colores del modal: blanco en modo claro, negro en modo oscuro. */
function palette(isDark: boolean) {
  return isDark
    ? { bg: "#000000", stage: "#111111", card: "#1C1C1E", line: "rgba(255,255,255,0.10)", fg: "#FFFFFF", muted: "rgba(255,255,255,0.55)", soft: "rgba(255,255,255,0.08)", ink: "#FFFFFF", inkFg: "#000000" }
    : { bg: "#FFFFFF", stage: "#F5F5F4", card: "#FFFFFF", line: "rgba(0,0,0,0.08)", fg: "#111111", muted: "rgba(0,0,0,0.5)", soft: "rgba(0,0,0,0.05)", ink: "#111111", inkFg: "#FFFFFF" };
}
type P = ReturnType<typeof palette>;

export default function TutorialModal({ userId, triggerOpen, isNewUser }: Props) {
  const { i18n } = useTranslation();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const t = (o: L) => pickLang(o, i18n.language);
  const c = palette(isDark);

  const storageKey = userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;

  useEffect(() => {
    // Wait until we know which user we are dealing with and whether they are new
    if (userId === undefined || isNewUser === undefined) return;
    // Only auto-show to brand-new users with no boards
    if (!isNewUser) return;
    try {
      const seen = localStorage.getItem(storageKey);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [userId, storageKey, isNewUser]);

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
    if (active < STEPS.length - 1) setActive((a) => a + 1);
    else close();
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] md:max-h-none md:h-[600px] overflow-hidden rounded-[28px] shadow-2xl flex flex-col md:grid md:grid-cols-[38%_62%]"
            style={{ background: c.bg, color: c.fg, border: `1px solid ${c.line}` }}
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 md:right-5 md:top-5 z-50 flex h-9 w-9 items-center justify-center rounded-full transition-opacity opacity-60 hover:opacity-100"
              aria-label={t(UI.close)}
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {/* Panel izquierdo: título + funciones */}
            <div className="p-6 pb-2 md:p-10 flex flex-col flex-shrink-0">
              <h2 className="text-2xl md:text-4xl font-normal leading-tight pr-10 md:pr-0">{t(UI.welcome)}</h2>

              <nav className="mt-4 md:mt-10 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const on = i === active;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setActive(i)}
                      className="relative shrink-0 flex items-center gap-2.5 text-left px-3.5 py-2.5 rounded-xl text-xs md:text-sm transition-colors w-auto md:w-full"
                      style={{ color: on ? c.fg : c.muted }}
                    >
                      {on && (
                        <motion.span layoutId="tut-active" className="absolute inset-0 rounded-xl" style={{ background: c.soft }} transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                      )}
                      <Icon size={16} strokeWidth={1.6} className="relative shrink-0" />
                      <span className={`relative whitespace-nowrap ${on ? "font-medium" : ""}`}>{t(s.title)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Panel derecho: ilustración + texto */}
            <div className="flex flex-col flex-grow overflow-y-auto md:overflow-visible min-h-0">
              <div
                className="relative m-4 mb-0 h-48 md:h-72 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 select-none"
                style={{
                  // mismo fondo que Arquitectura algorítmica: degradado + puntos
                  background: isDark ? "linear-gradient(180deg, #121212 0%, #0A0A0A 100%)" : "linear-gradient(180deg, #FDFDFD 0%, #F8F9FD 100%)",
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isDark
                      ? "radial-gradient(circle at center, #2A2A2A 0%, rgba(140, 134, 162, 0.15) 59%, #121212 100%)"
                      : "radial-gradient(circle at center, #FFFFFF 0%, rgba(140, 134, 162, 0.15) 59%, #FFFFFF 100%)",
                    maskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
                    maskSize: "20px 20px",
                    WebkitMaskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
                    WebkitMaskSize: "20px 20px",
                  }}
                />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.key}
                    className="relative z-10 w-full h-full flex items-center justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step.key === "plantillas" && <Plantillas c={c} />}
                    {step.key === "componentes" && <Videos c={c} slugs={COMPONENT_SLUGS} />}
                    {step.key === "escenas" && <Videos c={c} slugs={SCENE_SLUGS} />}
                    {step.key === "arquitectura" && <Arquitectura c={c} isDark={isDark} />}
                    {step.key === "tableros" && <Tableros lang={i18n.language} isDark={isDark} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-6 md:px-10 md:pt-8 md:pb-8 flex flex-col flex-grow">
                {/* puntos de navegación: arriba del título y la descripción */}
                <div className="flex gap-1.5 mb-4">
                  {STEPS.map((s, i) => (
                    <span
                      key={s.key}
                      className={`h-1.5 rounded-full transition-all ${i === active ? "w-6" : "w-1.5"}`}
                      style={{ background: i === active ? c.fg : c.line }}
                    />
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3 className="text-xl md:text-2xl font-normal">{t(step.title)}</h3>
                    <p className="mt-2.5 text-xs md:text-sm font-light leading-relaxed" style={{ color: c.muted }}>{t(step.description)}</p>
                  </motion.div>
                </AnimatePresence>


                <div className="mt-6 md:mt-auto pt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={close}
                    className="rounded-full px-5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm transition-colors"
                    style={{ border: `1px solid ${c.line}`, color: c.fg }}
                  >
                    {t(UI.tryNow)}
                  </button>
                  <button
                    onClick={next}
                    className="rounded-full px-5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm transition-opacity hover:opacity-85"
                    style={{ background: c.ink, color: c.inkFg }}
                  >
                    {isLast ? t(UI.done) : t(UI.next)}
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

/* ---------------------------------------------------------------------------
   Imágenes hechas con la interfaz real de Miiles: miniaturas de plantillas de Studio,
   videos de vista previa de componentes y escenas, tarjetas de Descubrimientos y
   nodos reales del tablero (React Flow).
   ------------------------------------------------------------------------- */

const TEMPLATE_THUMBS = ["ugc-v22", "ugc-v25", "ugc-v21"].map((v) => `https://wearemiiles.com/studio/thumbs/${v}.jpg`);
const COMPONENT_SLUGS = ["carrusel-circular", "palabras-que-se-deslizan", "tarjetas-que-se-apilan"];
const SCENE_SLUGS = ["escena-split-rebote", "escena-grafica-curva", "escena-libro"];
const previewOf = (slug: string) => STUDIO_COMPONENTS.find((x) => x.slug === slug);

function Plantillas({ c }: { c: P }) {
  return (
    <div className="relative w-[280px] h-[170px] md:w-[400px] md:h-[240px]">
      {TEMPLATE_THUMBS.map((src, i) => {
        const r = [-8, 0, 8][i];
        return (
          <motion.img
            key={src}
            src={src}
            alt=""
            loading="eager"
            className="absolute top-1/2 left-1/2 w-[58%] aspect-[16/10] object-cover object-top rounded-xl"
            style={{ border: `1px solid ${c.line}`, boxShadow: "0 18px 40px rgba(0,0,0,0.09)", zIndex: i === 1 ? 3 : 1 }}
            initial={{ x: "-50%", y: "-50%", rotate: 0 }}
            animate={{ x: `calc(-50% + ${r * 9}px)`, y: i === 1 ? "-54%" : "-46%", rotate: r }}
            transition={{ delay: 0.05 + i * 0.06, type: "spring", stiffness: 160, damping: 18 }}
          />
        );
      })}
    </div>
  );
}

function Videos({ c, slugs }: { c: P; slugs: string[] }) {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      {slugs.map((slug, i) => {
        const v = previewOf(slug);
        if (!v) return null;
        const mid = i === 1;
        return (
          <motion.div
            key={slug}
            className={`rounded-2xl overflow-hidden aspect-[9/16] ${mid ? "h-[150px] md:h-[230px]" : "h-[125px] md:h-[190px]"}`}
            style={{ border: `1px solid ${c.line}`, boxShadow: "0 18px 40px rgba(0,0,0,0.09)", background: c.card }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.08 }}
          >
            <video src={v.preview_video_url} poster={v.poster_url ?? undefined} autoPlay muted loop playsInline preload="metadata" className="w-full h-full object-cover" />
          </motion.div>
        );
      })}
    </div>
  );
}

function Arquitectura({ c, isDark }: { c: P; isDark: boolean }) {
  const cards = [2, 1, 3].map((n) => (isDark ? `/discoveries/card${n}-dark.png` : `/discoveries/card${n}.png`));
  return (
    <div className="relative w-full h-full">
      {cards.map((src, i) => (
        <motion.div
          key={src}
          className="absolute rounded-2xl overflow-hidden"
          style={{
            background: c.card, border: `1px solid ${c.line}`, boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
            width: i === 0 ? "62%" : "42%", aspectRatio: "1104 / 693",
            left: i === 0 ? "19%" : i === 1 ? "-14%" : "72%", top: i === 0 ? "14%" : "26%", zIndex: i === 0 ? 2 : 1, opacity: i === 0 ? 1 : 0.55,
          }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: i === 0 ? 1 : 0.55, scale: 1 }}
          transition={{ delay: 0.05 + i * 0.08 }}
        >
          <img src={src} alt="" className="w-full h-full object-contain" />
        </motion.div>
      ))}
    </div>
  );
}

function Tableros({ lang, isDark }: { lang: string; isDark: boolean }) {
  const ink = isDark ? "#FFFFFF" : "#111111";
  const paper = isDark ? "#1C1C1E" : "#FFFFFF";
  const t = (o: L) => pickLang(o, lang);
  const shape = (id: string, x: number, y: number, s: string, label: L, w: number, h: number) => ({
    id, type: "shapeNode", position: { x, y }, style: { width: w, height: h },
    data: { shape: s, label: t(label), fillColor: paper, strokeColor: ink, textColor: ink, bold: true, fontSize: 13 },
  });
  const nodes = [
    shape("idea", 0, 70, "circle", { es: "Idea", en: "Idea", pt: "Ideia", fr: "Idée" }, 96, 96),
    shape("plan", 150, 75, "square", { es: "Plan", en: "Plan", pt: "Plano", fr: "Plan" }, 120, 86),
    {
      id: "tareas", type: "todoNode", position: { x: 320, y: 20 }, style: { width: 230, height: 210 },
      data: {
        title: t({ es: "Lista de tareas", en: "Task list", pt: "Lista de tarefas", fr: "Liste de tâches" }),
        subtitle: t({ es: "Lanzamiento", en: "Launch", pt: "Lançamento", fr: "Lancement" }),
        fontSize: 13,
        tasks: [
          { id: "t1", text: t({ es: "Definir propuesta de valor", en: "Define value proposition", pt: "Definir proposta de valor", fr: "Définir la proposition de valeur" }), completed: true },
          { id: "t2", text: t({ es: "Grabar 3 videos", en: "Film 3 videos", pt: "Gravar 3 vídeos", fr: "Tourner 3 vidéos" }), completed: true },
          { id: "t3", text: t({ es: "Enviar contrato", en: "Send contract", pt: "Enviar contrato", fr: "Envoyer le contrat" }), completed: false },
        ],
      },
    },
    shape("lanza", 610, 70, "diamond", { es: "Lanzar", en: "Launch", pt: "Lançar", fr: "Lancer" }, 104, 104),
  ];
  const edge = (id: string, source: string, target: string) => ({
    id, source, sourceHandle: "right", target, targetHandle: "left", animated: false,
    style: { stroke: ink, strokeOpacity: 0.45, strokeWidth: 1.5, strokeDasharray: "4 4" },
  });
  return (
    <div className="relative w-full h-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={[edge("e1", "idea", "plan"), edge("e2", "plan", "tareas"), edge("e3", "tareas", "lanza")]}
          nodeTypes={{ shapeNode: ShapeNode, todoNode: TodoNode }}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      </ReactFlowProvider>
      {/* Cursor de colaboración, como en el tablero real (imagen fija, sin movimiento) */}
      <div className="absolute left-[20%] top-[64%] flex items-start pointer-events-none z-50">
        <svg className="w-5 h-5 rotate-[-10deg]" viewBox="0 0 24 24"><path d="M4 3l16 8-8 2-6 7z" fill="#4059F1" stroke="white" strokeWidth="2" strokeLinejoin="round" /></svg>
        <span className="-ml-1.5 mt-4 rounded-full px-3 py-1 text-[10px] font-semibold bg-[#4059F1] text-white">Sofía</span>
      </div>
    </div>
  );
}

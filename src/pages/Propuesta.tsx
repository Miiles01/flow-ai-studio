import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import i18n from "@/i18n";
import { usePageSeo } from "@/hooks/usePageSeo";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import { LayoutTemplate, LayoutDashboard, TrendingUp, Clapperboard, Crown, Globe, Zap, Percent, HandCoins } from "lucide-react";

// Íconos de los beneficios, en el mismo orden que los textos
const FEATURE_ICONS = [LayoutTemplate, LayoutDashboard, TrendingUp, Clapperboard];
const BULLET_ICONS = [Crown, Globe, Zap, Percent, HandCoins];

// Propuesta UGC: página tipo blog, sencilla, siempre en modo claro y en español o inglés (selector arriba).
// Los videos de las plantillas se sirven desde wearemiiles.com para que miiles.app no cargue su peso.
type Lang = "es" | "en";

const PREVIEWS = [
  { name: "Sunny", n: 22 },
  { name: "Signature", n: 8 },
  { name: "Breeze", n: 17 },
];

const COPY = {
  es: {
    seoTitle: "Propuesta UGC · Miiles",
    seoDesc: "Nuestra propuesta para creadores UGC: acceso permanente a Miiles Pro, tu portafolio publicado y comisiones como afiliado.",
    tag: "Propuesta UGC",
    navTitle: "Contenido",
    nav: ["Inicio", "Fase 1", "Fase 2"],
    kicker: "Para creadores de contenido UGC",
    title: "Programa",
    phase1: "Fase 1",
    phase1Title: "Iniciación",
    phase1Text: "Tienes acceso permanente a Miiles en su plan Pro. No es una prueba: la herramienta es tuya mientras formes parte del programa.",
    portfolioTitle: "Tu portafolio, siempre en línea",
    portfolioText: "Con Miiles diseñas tu portafolio como una página web. Para empezar, nuestro equipo te diseña uno de muestra con tus fotos y videos. Al ser una página web, tu portafolio queda visible siempre y lo compartes con un solo enlace. Estos son algunos estilos que puedes usar:",
    previewLabel: "Vista previa de la plantilla",
    earlyTitle: "Acceso anticipado a herramientas, skills y componentes",
    earlyText: "Usas todas las funciones de Miiles desde el primer día y pruebas antes que nadie las que vienen en camino.",
    features: [
      { title: "Diseño web", text: "Tu portafolio desde plantillas" },
      { title: "Canvas de organización", text: "Ideas, guiones y entregas en un lugar" },
      { title: "Sección de algoritmos", text: "Qué funciona en cada red" },
      { title: "Próximamente", text: "Componentes para editar tu contenido" },
    ],
    affTitle: "Tu enlace de afiliado",
    affText: "Compartes tu enlace y recibes una comisión cada vez que alguien compra el plan Pro con él. Sin límite de ventas.",
    phase2: "Fase 2",
    phase2Title: "Crecimiento",
    phase2Text: "Mantienes todos los beneficios de la fase 1 y se suman bonos negociables: pagos adicionales que definimos contigo según lo que construyamos juntos.",
    bullets: ["Plan Pro permanente", "Tu portafolio publicado", "Acceso anticipado a todas las funciones", "25% de comisión sin límite", "Bonos negociables"],
    ctaTitle: "¿Empezamos?",
    ctaText: "Crea tu cuenta y te ayudamos a armar tu primer portafolio.",
    cta: "Crear mi cuenta",
  },
  en: {
    seoTitle: "UGC Proposal · Miiles",
    seoDesc: "Our proposal for UGC creators: permanent access to Miiles Pro, your portfolio published and affiliate commissions.",
    tag: "UGC Proposal",
    navTitle: "Contents",
    nav: ["Start", "Phase 1", "Phase 2"],
    kicker: "For UGC content creators",
    title: "Program",
    phase1: "Phase 1",
    phase1Title: "Onboarding",
    phase1Text: "You get permanent access to Miiles on the Pro plan. It is not a trial: the tool is yours for as long as you are part of the program.",
    portfolioTitle: "Your portfolio, always online",
    portfolioText: "With Miiles you design your portfolio as a website. To get you started, our team designs a sample one with your photos and videos. Since it is a website, your portfolio stays online and you share it with a single link. These are some of the styles you can use:",
    previewLabel: "Template preview",
    earlyTitle: "Early access to tools, skills and components",
    earlyText: "You use every Miiles feature from day one and try the upcoming ones before anyone else.",
    features: [
      { title: "Web design", text: "Your portfolio from templates" },
      { title: "Organization canvas", text: "Ideas, scripts and deliverables in one place" },
      { title: "Algorithms section", text: "What works on each platform" },
      { title: "Coming soon", text: "Components to edit your content" },
    ],
    affTitle: "Your affiliate link",
    affText: "Share your link and earn a commission every time someone buys the Pro plan with it. No sales limit.",
    phase2: "Phase 2",
    phase2Title: "Growth",
    phase2Text: "You keep every benefit from phase 1 and add negotiable bonuses: extra payments we define with you based on what we build together.",
    bullets: ["Permanent Pro plan", "Your portfolio published", "Early access to every feature", "25% commission, no limit", "Negotiable bonuses"],
    ctaTitle: "Shall we start?",
    ctaText: "Create your account and we will help you build your first portfolio.",
    cta: "Create my account",
  },
} as const;

export default function Propuesta() {
  const params = useParams();
  const [lang, setLang] = useState<Lang>(() => {
    if (params.lang === "en" || params.lang === "es") return params.lang;
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "en" || q === "es") return q;
    return (i18n.language || "es").startsWith("en") ? "en" : "es";
  });
  const c = COPY[lang];

  // Índice lateral (desktop y tablet): marca la sección que está a la vista y lleva a ella al hacer clic
  const SECTIONS = ["inicio", "fase-1", "fase-2"];
  const [active, setActive] = useState("inicio");
  useEffect(() => {
    // Activa la última sección cuyo inicio ya pasó el 35% de la pantalla
    const onScroll = () => {
      let current = SECTIONS[0];
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  usePageSeo({ title: c.seoTitle, description: c.seoDesc, robots: "noindex, nofollow" });

  return (
    <div className="min-h-screen bg-white text-black" lang={lang}>
      <LandingNavbar />

      <div className="mx-auto max-w-5xl px-6 pb-24 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:gap-12 lg:gap-16">
        {/* Índice fijo a la izquierda: solo desktop y tablet */}
        <div className="hidden pt-48 md:block">
          <aside className="sticky top-32">
            <p className="mb-3 px-2 text-xs font-light text-miiles-gray-400">{c.navTitle}</p>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => goTo(id)}
                  aria-current={active === id ? "true" : undefined}
                  className={`rounded-xl px-3 py-2 text-left text-sm transition-all duration-300 ${active === id ? "translate-x-1 bg-miiles-blue-light/60 font-normal text-miiles-blue" : "font-light text-miiles-gray-600 hover:translate-x-1 hover:text-black"}`}
                >
                  {c.nav[i]}
                </button>
              ))}
            </nav>
          </aside>
        </div>

      <main className="min-w-0">
        <section id="inicio" className="scroll-mt-32 pt-40 md:pt-48">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-light text-miiles-gray-400">{c.kicker}</p>
            <div className="flex rounded-full bg-miiles-gray-50 p-1" role="group" aria-label="Idioma / Language">
              {(["es", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`rounded-full px-3 py-1 text-xs font-normal transition-colors ${lang === l ? "bg-black text-white" : "text-miiles-gray-400 hover:text-black"}`}
                >
                  {l === "es" ? "ES" : "EN"}
                </button>
              ))}
            </div>
          </div>
          <h1 className="mt-3 text-4xl font-normal leading-[1.05] tracking-tight md:text-6xl">{c.title}</h1>
        </section>

        <section id="fase-1" className="mt-20 scroll-mt-32">
          <span className="inline-flex rounded-full bg-miiles-blue-light px-3 py-1 text-xs font-normal text-miiles-blue">{c.phase1}</span>
          <h2 className="mt-4 text-2xl font-normal tracking-tight md:text-4xl">{c.phase1Title}</h2>
          <p className="mt-5 text-base font-light leading-relaxed text-miiles-gray-600">{c.phase1Text}</p>

          <h3 className="mt-12 text-lg font-normal">{c.portfolioTitle}</h3>
          <p className="mt-3 text-base font-light leading-relaxed text-miiles-gray-600">{c.portfolioText}</p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PREVIEWS.map((p) => (
              <figure key={p.name} className="m-0">
                <div className="overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,#FDFDFD_0%,#F8F9FD_100%)] p-3">
                  <video
                    src={`https://wearemiiles.com/studio/previews/ugc-v${p.n}.mp4`}
                    poster={`https://wearemiiles.com/studio/thumbs/ugc-v${p.n}.jpg`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={c.previewLabel}
                    className="block aspect-[4/3] w-full rounded-[10px] object-cover"
                  />
                </div>
              </figure>
            ))}
          </div>

          <h3 className="mt-14 text-lg font-normal">{c.earlyTitle}</h3>
          <p className="mt-3 text-base font-light leading-relaxed text-miiles-gray-600">{c.earlyText}</p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {c.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
              <li key={f.title} className="flex items-center gap-3 rounded-2xl bg-[linear-gradient(180deg,#FDFDFD_0%,#F8F9FD_100%)] p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-sm"><Icon size={17} strokeWidth={1.5} /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-normal">{f.title}</span>
                  <span className="block text-xs font-light text-miiles-gray-600">{f.text}</span>
                </span>
              </li>
              );
            })}
          </ul>

          <h3 className="mt-14 text-lg font-normal">{c.affTitle}</h3>
          <div className="mt-5 flex flex-col gap-6 rounded-[24px] bg-black p-8 text-white md:flex-row md:items-center md:justify-between">
            <p className="max-w-sm text-base font-light leading-relaxed text-white/80">{c.affText}</p>
            <p className="shrink-0 text-6xl font-normal tracking-tight md:text-7xl">25%</p>
          </div>
        </section>

        <section id="fase-2" className="mt-20 scroll-mt-32">
          <span className="inline-flex rounded-full bg-miiles-pink-light px-3 py-1 text-xs font-normal text-black">{c.phase2}</span>
          <h2 className="mt-4 text-2xl font-normal tracking-tight md:text-4xl">{c.phase2Title}</h2>
          <p className="mt-5 text-base font-light leading-relaxed text-miiles-gray-600">{c.phase2Text}</p>
          <ul className="mt-6 flex flex-col gap-3 text-base font-light text-miiles-gray-600">
            {c.bullets.map((b, i) => {
              const Icon = BULLET_ICONS[i];
              return (
                <li key={b} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-miiles-gray-50 text-black"><Icon size={16} strokeWidth={1.5} /></span>
                  <span>{b}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-24 flex flex-col items-center rounded-[24px] bg-[linear-gradient(180deg,#FDFDFD_0%,#F8F9FD_100%)] p-8 text-center md:p-12">
          <h2 className="text-2xl font-normal tracking-tight md:text-3xl">{c.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-lg text-base font-light leading-relaxed text-miiles-gray-600">{c.ctaText}</p>
          <Link to="/register" className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-normal text-white transition-colors hover:bg-miiles-pink">
            {c.cta}
          </Link>
        </section>
      </main>
      </div>
      <LandingFooter />
    </div>
  );
}

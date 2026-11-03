import { useState } from "react";
import { Link } from "react-router-dom";
import i18n from "@/i18n";
import { usePageSeo } from "@/hooks/usePageSeo";

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
    kicker: "Para creadores de contenido UGC",
    title: "Crece con Miiles en dos fases",
    intro: "Queremos trabajar contigo. Nuestra campaña tiene dos fases: en la primera te damos acceso completo a la herramienta y un portafolio listo; en la segunda sumamos bonos que acordamos juntos.",
    phase1: "Fase 1",
    phase1Title: "Iniciación",
    phase1Text: "Tienes acceso permanente a Miiles en su plan Pro. No es una prueba: la herramienta es tuya mientras formes parte del programa.",
    portfolioTitle: "Tu portafolio, siempre en línea",
    portfolioText: "Con Miiles diseñas tu portafolio como una página web. Para empezar, nuestro equipo te diseña uno de muestra con tus fotos y videos. Al ser una página web, tu portafolio queda visible siempre y lo compartes con un solo enlace. Estos son algunos estilos que puedes usar:",
    previewLabel: "Vista previa de la plantilla",
    earlyTitle: "Acceso anticipado a todo",
    earlyText: "Usas todas las funciones de Miiles desde el primer día y pruebas antes que nadie las que vienen en camino.",
    features: [
      { title: "Diseño web", text: "Crea y publica tu portafolio desde plantillas pensadas para creadores." },
      { title: "Canvas de organización", text: "Ordena ideas, guiones y entregas de cada campaña en un solo lugar." },
      { title: "Sección de algoritmos", text: "Entiende qué está funcionando en cada red y por qué." },
      { title: "Próximamente", text: "Componentes para editar contenido para redes sociales, con acceso antes que nadie." },
    ],
    affTitle: "Tu enlace de afiliado",
    affText: "Compartes tu enlace y recibes una comisión cada vez que alguien compra el plan Pro con él. Sin límite de ventas.",
    phase2: "Fase 2",
    phase2Title: "Crecimiento",
    phase2Text: "Mantienes todos los beneficios de la fase 1 y se suman bonos negociables: pagos adicionales que definimos contigo según lo que construyamos juntos.",
    bullets: ["Plan Pro permanente", "Tu portafolio publicado", "Acceso anticipado a todas las funciones", "24% de comisión sin límite", "Bonos negociables"],
    ctaTitle: "¿Empezamos?",
    ctaText: "Crea tu cuenta y te ayudamos a armar tu primer portafolio.",
    cta: "Crear mi cuenta",
  },
  en: {
    seoTitle: "UGC Proposal · Miiles",
    seoDesc: "Our proposal for UGC creators: permanent access to Miiles Pro, your portfolio published and affiliate commissions.",
    tag: "UGC Proposal",
    kicker: "For UGC content creators",
    title: "Grow with Miiles in two phases",
    intro: "We want to work with you. Our campaign has two phases: in the first one you get full access to the tool and a ready-made portfolio; in the second one we add bonuses that we agree on together.",
    phase1: "Phase 1",
    phase1Title: "Onboarding",
    phase1Text: "You get permanent access to Miiles on the Pro plan. It is not a trial: the tool is yours for as long as you are part of the program.",
    portfolioTitle: "Your portfolio, always online",
    portfolioText: "With Miiles you design your portfolio as a website. To get you started, our team designs a sample one with your photos and videos. Since it is a website, your portfolio stays online and you share it with a single link. These are some of the styles you can use:",
    previewLabel: "Template preview",
    earlyTitle: "Early access to everything",
    earlyText: "You use every Miiles feature from day one and try the upcoming ones before anyone else.",
    features: [
      { title: "Web design", text: "Create and publish your portfolio from templates made for creators." },
      { title: "Organization canvas", text: "Keep ideas, scripts and deliverables for every campaign in one place." },
      { title: "Algorithms section", text: "Understand what is working on each platform and why." },
      { title: "Coming soon", text: "Components to edit content for social media, with access before anyone else." },
    ],
    affTitle: "Your affiliate link",
    affText: "Share your link and earn a commission every time someone buys the Pro plan with it. No sales limit.",
    phase2: "Phase 2",
    phase2Title: "Growth",
    phase2Text: "You keep every benefit from phase 1 and add negotiable bonuses: extra payments we define with you based on what we build together.",
    bullets: ["Permanent Pro plan", "Your portfolio published", "Early access to every feature", "24% commission, no limit", "Negotiable bonuses"],
    ctaTitle: "Shall we start?",
    ctaText: "Create your account and we will help you build your first portfolio.",
    cta: "Create my account",
  },
} as const;

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-[3px] shrink-0">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12.5L10.5 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Propuesta() {
  const [lang, setLang] = useState<Lang>(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "en" || q === "es") return q;
    return (i18n.language || "es").startsWith("en") ? "en" : "es";
  });
  const c = COPY[lang];

  usePageSeo({ title: c.seoTitle, description: c.seoDesc, robots: "noindex, nofollow" });

  return (
    <div className="min-h-screen bg-white text-black" lang={lang}>
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8">
        <Link to="/" aria-label="Miiles">
          <img src="/logotipo.svg" alt="Miiles" className="h-5 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs font-light text-miiles-gray-400 sm:inline">{c.tag}</span>
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
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24">
        <section className="pt-10 md:pt-16">
          <p className="text-sm font-light text-miiles-gray-400">{c.kicker}</p>
          <h1 className="mt-3 text-4xl font-normal leading-[1.05] tracking-tight md:text-6xl">{c.title}</h1>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-miiles-gray-600 md:text-lg">{c.intro}</p>
        </section>

        <section className="mt-20">
          <span className="inline-flex rounded-full bg-miiles-blue-light px-3 py-1 text-xs font-normal text-miiles-blue">{c.phase1}</span>
          <h2 className="mt-4 text-2xl font-normal tracking-tight md:text-4xl">{c.phase1Title}</h2>
          <p className="mt-5 text-base font-light leading-relaxed text-miiles-gray-600">{c.phase1Text}</p>

          <h3 className="mt-12 text-lg font-normal">{c.portfolioTitle}</h3>
          <p className="mt-3 text-base font-light leading-relaxed text-miiles-gray-600">{c.portfolioText}</p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PREVIEWS.map((p) => (
              <figure key={p.name} className="m-0">
                <div className="overflow-hidden rounded-[20px] bg-miiles-gray-50 p-3">
                  <video
                    src={`https://wearemiiles.com/studio/previews/ugc-v${p.n}.mp4`}
                    poster={`https://wearemiiles.com/studio/thumbs/ugc-v${p.n}.jpg`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`${c.previewLabel} ${p.name}`}
                    className="block aspect-[4/3] w-full rounded-[10px] object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-sm font-normal">{p.name}</figcaption>
              </figure>
            ))}
          </div>

          <h3 className="mt-14 text-lg font-normal">{c.earlyTitle}</h3>
          <p className="mt-3 text-base font-light leading-relaxed text-miiles-gray-600">{c.earlyText}</p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {c.features.map((f) => (
              <li key={f.title} className="rounded-2xl bg-miiles-gray-50 p-5">
                <p className="text-sm font-normal">{f.title}</p>
                <p className="mt-1 text-sm font-light leading-relaxed text-miiles-gray-600">{f.text}</p>
              </li>
            ))}
          </ul>

          <h3 className="mt-14 text-lg font-normal">{c.affTitle}</h3>
          <div className="mt-5 flex flex-col gap-6 rounded-[24px] bg-black p-8 text-white md:flex-row md:items-center md:justify-between">
            <p className="max-w-sm text-base font-light leading-relaxed text-white/80">{c.affText}</p>
            <p className="shrink-0 text-6xl font-normal tracking-tight md:text-7xl">24%</p>
          </div>
        </section>

        <section className="mt-20">
          <span className="inline-flex rounded-full bg-miiles-pink-light px-3 py-1 text-xs font-normal text-black">{c.phase2}</span>
          <h2 className="mt-4 text-2xl font-normal tracking-tight md:text-4xl">{c.phase2Title}</h2>
          <p className="mt-5 text-base font-light leading-relaxed text-miiles-gray-600">{c.phase2Text}</p>
          <ul className="mt-6 flex flex-col gap-3 text-base font-light text-miiles-gray-600">
            {c.bullets.map((b) => (
              <li key={b} className="flex gap-3"><Check /><span>{b}</span></li>
            ))}
          </ul>
        </section>

        <section className="mt-24 rounded-[24px] bg-miiles-gray-50 p-8 md:p-10">
          <h2 className="text-2xl font-normal tracking-tight md:text-3xl">{c.ctaTitle}</h2>
          <p className="mt-3 max-w-lg text-base font-light leading-relaxed text-miiles-gray-600">{c.ctaText}</p>
          <Link to="/register" className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-normal text-white transition-colors hover:bg-miiles-pink">
            {c.cta}
          </Link>
        </section>
      </main>
    </div>
  );
}

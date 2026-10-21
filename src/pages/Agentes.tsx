import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import {
  CheckCircle2,
  ChevronDown,
  Palette,
  Globe,
  PenTool,
  Share2,
  Package,
  Megaphone,
  Filter,
  FolderOpen,
  Clock,
  AtSign,
  Layers,
  Bot,
} from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import BrandCarousel from "@/components/BrandCarousel";
import SlideArrowButton from "@/components/SlideArrowButton";
import AdVideo from "@/components/AdVideo";
import StickyCta from "@/components/StickyCta";
import { openWhatsApp } from "@/lib/whatsapp";
import agenteDisenoVideo from "@/assets/agente-diseno.mp4.asset.json";
import agenteDisenoPoster from "@/assets/agente-diseno-poster.jpg.asset.json";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const Agentes = () => {
  const { t } = useTranslation();
  const localePath = useLocalePath();
  const copy = t("agents.copy", { returnObjects: true }) as string[];

const WHATSAPP_MESSAGE = copy[0];
const WHATSAPP_DEMO_MESSAGE = copy[1];

const AGENTS = [
  {
    key: "disenador",
    icon: Palette,
    name: copy[2],
    tagline: copy[3],
    features: [
      { icon: PenTool, text: copy[4] },
      { icon: Globe, text: copy[5] },
      { icon: Share2, text: copy[6] },
      { icon: Package, text: copy[7] },
      { icon: Megaphone, text: copy[8] },
      { icon: AtSign, text: copy[9] },
    ],
  },
  {
    key: "embudo",
    icon: Filter,
    name: copy[10],
    tagline: copy[11],
    features: [
      { icon: Filter, text: copy[12] },
      { icon: Bot, text: copy[13] },
      { icon: FolderOpen, text: copy[14] },
      { icon: Clock, text: copy[15] },
    ],
  },
];

const FAQS = [
  {
    question: copy[16],
    answer:
      copy[17],
  },
  {
    question: copy[18],
    answer:
      copy[19],
  },
  {
    question: copy[20],
    answer:
      copy[21],
  },
  {
    question: copy[22],
    answer:
      copy[23],
  },
  {
    question: copy[24],
    answer:
      copy[25],
  },
];


  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-agentes",
      content: "#smooth-content-agentes",
      smooth: 1.4,
      effects: true,
    });

    // Entrada de los títulos h2 palabra por palabra y de los párrafos con subida
    const animCtx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("h2[data-split-title]").forEach((el) => {
        if (el.querySelector('[style*="Welth"]')) return;
        const split = SplitText.create(el, { type: "words" });
        gsap.from(split.words, {
          opacity: 0,
          y: 15,
          stagger: 0.06,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("p[data-fade-p]").forEach((el) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    });

    document.title =
      copy[26];

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        copy[27]
      );
    }

    const schemaScript = document.createElement("script");
    schemaScript.type = "application/ld+json";
    schemaScript.id = "schema-agentes-comerciales";
    schemaScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: "Miiles",
          url: "https://miiles.app/",
          logo: "https://miiles.app/favicon.png",
          description:
            copy[28],
        },
        {
          "@type": "Product",
          name: copy[29],
          description:
            copy[30],
          offers: {
            "@type": "Offer",
            price: "2000",
            priceCurrency: copy[50],
            availability: "https://schema.org/InStock",
          },
        },
        {
          "@type": "Product",
          name: copy[31],
          description:
            copy[32],
          offers: {
            "@type": "Offer",
            price: "2000",
            priceCurrency: copy[50],
            availability: "https://schema.org/InStock",
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        },
      ],
    });

    document.head.appendChild(schemaScript);

    return () => {
      animCtx.revert();
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      const existing = document.getElementById("schema-agentes-comerciales");
      if (existing) existing.remove();
    };
  }, [t]);

  return (
    <>
      <LandingNavbar />

      {/* Smooth Scroll Wrapper */}
      <div
        id="smooth-wrapper-agentes"
        style={{
          overflow: "hidden",
          position: "fixed",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }}
      >
        <div
          id="smooth-content-agentes"
          className="bg-white dark:bg-black text-black dark:text-white font-sans pb-0 transition-colors duration-300"
        >
          {/* ─── HERO ─── */}
          <header className="relative pt-32 md:pt-48 pb-12 md:pb-24 px-6 md:px-12 max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-400/20 mb-6"
            >
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              <span className="text-[11px] font-normal tracking-wide text-blue-900 dark:text-blue-200">
                {copy[33]}
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-balance text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-black dark:text-white leading-[1.08] max-w-4xl mx-auto mb-12 md:mb-14"
            >
              {copy[34]}{" "}
              <span
                style={{
                  fontFamily: "'Welth Catritz', serif",
                  fontStyle: "italic",
                }}
              >
                {copy[35]}
              </span>
              <span className="block mt-4 text-2xl sm:text-3xl md:text-4xl text-blue-600 dark:text-blue-300 font-normal tracking-tight">
                {copy[36]}
              </span>
            </motion.h1>

            {/* Carrusel "Elegido por" */}
            <div className="mb-14 md:mb-16">
              <BrandCarousel />
            </div>

            {/* Video debajo del título */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="max-w-full md:max-w-md mx-auto mb-6 md:mb-8 rounded-[32px] overflow-hidden bg-black"
            >
              <AdVideo src={agenteDisenoVideo.url} poster={agenteDisenoPoster.url} />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.15 }}
              className="flex justify-center mb-8 md:mb-10"
            >
              <SlideArrowButton onClick={() => openWhatsApp(WHATSAPP_DEMO_MESSAGE)}>
                {copy[37]}
              </SlideArrowButton>
            </motion.div>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl font-light text-miiles-gray-600 dark:text-white/85 max-w-3xl mx-auto leading-relaxed mb-10"
            >
              {copy[38]} <strong>{copy[39]}</strong>{" "}
              {copy[40]} <strong>{copy[41]}</strong> {copy[42]}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-10 md:mt-14 pt-8 md:pt-10 border-t border-miiles-gray-100 dark:border-white/10"
            >
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-400/20">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-300 shrink-0" />
                <span className="text-base md:text-lg font-normal text-blue-900 dark:text-blue-200">
                  {copy[43]}
                </span>
              </div>
            </motion.div>
          </header>

          {/* ─── EL RETO (con fondo punteado) ─── */}
          <section className="relative overflow-hidden md:min-h-[80vh] flex items-center justify-center py-14 md:py-20 px-6 md:px-12">
            <div
              className="absolute inset-0 pointer-events-none z-0 dark:hidden"
              style={{
                background:
                  "radial-gradient(circle at center, #FFFFFF 0%, rgba(140, 134, 162, 0.15) 59%, #FFFFFF 100%)",
                maskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
                WebkitMaskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
                maskSize: "16px 16px",
                WebkitMaskSize: "16px 16px",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
              style={{
                background:
                  "radial-gradient(circle at center, #000000 0%, rgba(255, 255, 255, 0.22) 59%, #000000 100%)",
                maskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
                WebkitMaskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
                maskSize: "16px 16px",
                WebkitMaskSize: "16px 16px",
              }}
            />
            <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
              <span className="text-sm font-normal text-blue-600 dark:text-blue-300">
                {copy[44]}
              </span>
              <h2
                data-split-title
                className="text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.08] text-black dark:text-white"
              >
                {copy[45]}
              </h2>
              <p
                data-fade-p
                className="text-sm md:text-base font-light text-miiles-gray-600 dark:text-white/85 max-w-2xl mx-auto"
              >
                {copy[46]}
              </p>
            </div>
          </section>

          {/* ─── QUÉ INCLUYE ─── */}
          <section className="py-14 md:py-24 px-6 md:px-12 max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 space-y-3">
              <span className="text-xs font-normal tracking-widest text-blue-600 dark:text-blue-300">
                {copy[47]}
              </span>
              <h2
                data-split-title
                className="text-balance text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-black dark:text-white"
              >
                {copy[48]}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {AGENTS.map(({ key, icon: AgentIcon, name, tagline, features }) => (
                <div
                  key={key}
                  className="flex flex-col rounded-[2.5rem] bg-black dark:bg-neutral-900 text-white p-8 sm:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.2)] dark:shadow-none transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="flex flex-col items-start gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <AgentIcon className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-normal">{name}</h3>
                  </div>
                  <p className="text-xs font-light text-white/70 mb-6">{tagline}</p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-normal tracking-tight">{copy[49]}</span>
                    <span className="text-xs font-light text-white/70">{copy[50]}</span>
                  </div>

                  <ul className="space-y-4">
                    {features.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-white shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span className="text-sm font-medium">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ─── PREGUNTAS FRECUENTES ─── */}
          <section className="py-14 md:py-20 px-6 md:px-12 max-w-4xl mx-auto space-y-8 md:space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-normal tracking-widest text-blue-600 dark:text-blue-300">
                {copy[51]}
              </span>
              <h2
                data-split-title
                className="text-balance text-3xl md:text-4xl font-normal tracking-tight text-black dark:text-white"
              >
                {copy[52]}
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-[20px] bg-[#F5F5F8] dark:bg-white/5 p-6 transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left gap-4 text-sm md:text-base font-normal text-black dark:text-white"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-miiles-gray-400 dark:text-white/70 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-black dark:text-white" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-4 pt-4 border-t border-miiles-gray-100 dark:border-white/10 text-xs md:text-sm font-light text-miiles-gray-600 dark:text-white/85 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── CIERRE ─── */}
          <section className="py-14 md:py-24 px-6 md:px-12 max-w-5xl mx-auto text-center space-y-4 md:space-y-6">
            <h2
              data-split-title
              className="text-balance text-3xl sm:text-4xl md:text-6xl font-normal text-black dark:text-white tracking-tight leading-tight"
            >
              {copy[53]}
            </h2>
            <p
              data-fade-p
              className="text-base sm:text-lg font-light text-miiles-gray-600 dark:text-white/85 max-w-xl mx-auto"
            >
              {copy[54]}
            </p>
          </section>

          {/* En oscuro se invierte el footer compartido (blanco fijo) sin tocar otras páginas */}
          <div className="dark:[filter:invert(1)_brightness(2)]">
            <LandingFooter />
          </div>
        </div>
      </div>

      {/* CTA pegado (fuera del smooth wrapper para que quede fijo) */}
      <StickyCta label={copy[55]} onClick={() => openWhatsApp(WHATSAPP_MESSAGE)} />
    </>
  );
};

export default Agentes;

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
} from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import BrandCarousel from "@/components/BrandCarousel";
import SlideArrowButton from "@/components/SlideArrowButton";
import StickyCta from "@/components/StickyCta";
import { openWhatsApp } from "@/lib/whatsapp";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const WHATSAPP_MESSAGE = "Hola, quiero activar un agente para mi negocio.";
const WHATSAPP_DEMO_MESSAGE = "Hola, quiero solicitar una demo de los agentes para mi negocio.";

const AGENTS = [
  {
    key: "disenador",
    icon: Palette,
    name: "Agente Diseñador",
    tagline: "Identidad y recursos visuales para vender con autoridad",
    features: [
      { icon: PenTool, text: "Refinamiento de marca: logotipo, tipografías y paleta" },
      { icon: Share2, text: "Publicaciones para Instagram, TikTok y campañas de venta" },
      { icon: Package, text: "Empaques, etiquetas y mockups de producto" },
      { icon: Megaphone, text: "Anuncios, letreros y papelería personalizada" },
    ],
  },
  {
    key: "embudo",
    icon: Globe,
    name: "Agente de Embudo Comercial",
    tagline: "Tu vendedor incansable y tu plataforma web",
    features: [
      { icon: Globe, text: "Sitio web completo, rápido y responsive" },
      { icon: Filter, text: "Embudo de conversión para agendar llamadas o pedir cotizaciones" },
      { icon: FolderOpen, text: "Catálogo y portafolio de tus servicios" },
      { icon: Clock, text: "Automatizaciones que atienden a tus clientes 24/7" },
      { icon: AtSign, text: "Incluye espacio para dominio" },
    ],
  },
];

const FAQS = [
  {
    question: "¿Qué incluye exactamente el Agente Diseñador por $2,000 MXN?",
    answer:
      "Incluye todo el soporte visual que tu negocio necesita para vender: diseño o refinamiento de tu identidad de marca, logotipo oficial, aplicaciones para redes sociales (posts, carruseles, portadas), diseño de empaques, letreros, anuncios publicitarios y papelería personalizada. Es un pago único sin mensualidades sorpresa.",
  },
  {
    question: "¿Qué hace el Agente de Embudo Comercial y por qué necesito una web?",
    answer:
      "Tu Agente Vendedor aterriza tu modelo de negocio en internet: monta tu sitio web de alta conversión, estructura tu embudo comercial, configura automatizaciones para que tus clientes agenden citas o compren directo y presenta tu portafolio. Funciona 24/7 para que no pierdas ventas ni dependas de responder mensajes manualmente.",
  },
  {
    question: "¿Cómo funciona el pago del dominio .com?",
    answer:
      "El desarrollo y configuración de tu sitio web y embudo está 100% cubierto por el pago único de $2,000 MXN. El nombre de dominio personalizado (.com o .mx) es un costo anual independiente que puedes adquirir tú mismo o solicitar que lo gestionemos como un adicional para dejarlo enlazado.",
  },
  {
    question: "¿Por qué trabajar con ambos agentes?",
    answer:
      "El Diseñador crea los activos visuales con estética de marca sólida y el Vendedor los integra en una página web y embudo que convierte visitantes en clientes. Tu negocio queda listo para competir con los líderes de tu industria en cuestión de días.",
  },
  {
    question: "¿Tengo una clínica o consultorio, qué servicio me corresponde?",
    answer:
      "Para el sector salud contamos con el Asistente para Clínicas: una solución especializada bajo suscripción de $500 MXN/mes que automatiza la agenda de pacientes 24/7, responde dudas frecuentes y reduce el ausentismo.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const Agentes = () => {
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
      "Agentes de IA para Escalar tu Negocio | Diseñador y Embudo Comercial | Miiles";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Escala tu negocio con los agentes de Miiles: tu Diseñador de marca y recursos visuales ($2,000 MXN) y tu Agente de Embudo Comercial con web incluida ($2,000 MXN). Pago único, soluciones llave en mano."
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
            "Agentes de inteligencia artificial para diseño de marca, automatización de ventas y escalabilidad de negocios.",
        },
        {
          "@type": "Product",
          name: "Agente Diseñador — Identidad y Recursos Visuales",
          description:
            "Agente dedicado para refinar tu marca, crear logotipos, publicaciones para redes sociales, empaques, letreros y anuncios.",
          offers: {
            "@type": "Offer",
            price: "2000",
            priceCurrency: "MXN",
            availability: "https://schema.org/InStock",
          },
        },
        {
          "@type": "Product",
          name: "Agente de Embudo Comercial — Web y Captación",
          description:
            "Agente vendedor que monta tu sitio web, automatiza la captación de prospectos y agenda de citas.",
          offers: {
            "@type": "Offer",
            price: "2000",
            priceCurrency: "MXN",
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
  }, []);

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
                Especializado para negocios
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-balance text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-black dark:text-white leading-[1.08] max-w-4xl mx-auto mb-12 md:mb-14"
            >
              Un diseñador y un vendedor que hacen crecer tu{" "}
              <span
                style={{
                  fontFamily: "'Welth Catritz', serif",
                  fontStyle: "italic",
                }}
              >
                negocio
              </span>
              <span className="block mt-4 text-2xl sm:text-3xl md:text-4xl text-blue-600 dark:text-blue-300 font-normal tracking-tight">
                — pago único, sin mensualidades
              </span>
            </motion.h1>

            {/* Carrusel "Elegido por" */}
            <div className="mb-14 md:mb-16">
              <BrandCarousel />
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.15 }}
              className="flex justify-center mb-8 md:mb-10"
            >
              <SlideArrowButton onClick={() => openWhatsApp(WHATSAPP_DEMO_MESSAGE)}>
                Solicitar demo
              </SlideArrowButton>
            </motion.div>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl font-light text-miiles-gray-600 dark:text-white/85 max-w-3xl mx-auto leading-relaxed mb-10"
            >
              Para escalar de verdad necesitas dos cosas: <strong>recursos visuales de alto nivel</strong>{" "}
              que justifiquen tus precios y <strong>una web con embudo automatizado</strong> que venda
              por ti mientras atiendes tu negocio.
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
                  Sin contratos forzosos ni comisiones
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
                El reto de escalar un negocio
              </span>
              <h2
                data-split-title
                className="text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.08] text-black dark:text-white"
              >
                Si tu marca no inspira confianza y tu web no vende, el cliente se va con otro
              </h2>
              <p
                data-fade-p
                className="text-sm md:text-base font-light text-miiles-gray-600 dark:text-white/85 max-w-2xl mx-auto"
              >
                Sin recursos visuales de alto nivel ni un embudo que atienda por ti, pasas el día
                persiguiendo clientes a mano y perdiendo ventas que ya tenías cerca.
              </p>
            </div>
          </section>

          {/* ─── LOS AGENTES ─── */}
          <section className="py-14 md:py-24 px-6 md:px-12 max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 space-y-3">
              <span className="text-xs font-normal tracking-widest text-blue-600 dark:text-blue-300">
                Los agentes
              </span>
              <h2
                data-split-title
                className="text-balance text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-black dark:text-white"
              >
                Elige el agente que tu negocio necesita
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
                    <span className="text-5xl font-normal tracking-tight">$2,000</span>
                    <span className="text-xs font-light text-white/70">MXN / pago único</span>
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
                Preguntas frecuentes
              </span>
              <h2
                data-split-title
                className="text-balance text-3xl md:text-4xl font-normal tracking-tight text-black dark:text-white"
              >
                Claridad total sobre cómo operan nuestros agentes
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
              Escala tu negocio con tu diseñador y tu vendedor
            </h2>
            <p
              data-fade-p
              className="text-base sm:text-lg font-light text-miiles-gray-600 dark:text-white/85 max-w-xl mx-auto"
            >
              Por $2,000 MXN de pago único por agente, tu marca y tu web quedan listas para vender.
            </p>
          </section>

          {/* En oscuro se invierte el footer compartido (blanco fijo) sin tocar otras páginas */}
          <div className="dark:[filter:invert(1)_brightness(2)]">
            <LandingFooter />
          </div>
        </div>
      </div>

      {/* CTA pegado (fuera del smooth wrapper para que quede fijo) */}
      <StickyCta label="Activar agente" onClick={() => openWhatsApp(WHATSAPP_MESSAGE)} />
    </>
  );
};

export default Agentes;

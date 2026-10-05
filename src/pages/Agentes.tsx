import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import {
  Sparkles,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Globe,
  Send,
  Palette,
  Stethoscope,
  X,
} from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

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
      "Para el sector salud contamos con el Asistente para Clínicas: una solución especializada bajo suscripción de $500 MXN/mes que automatiza la agenda de pacientes 24/7, responde dudas médicas frecuentes y reduce el ausentismo.",
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("disenador");
  const [formData, setFormData] = useState({
    businessName: "",
    contact: "",
    needs: "",
    includeDomain: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    // Inicializar ScrollSmoother oficial de Miiles
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-agentes",
      content: "#smooth-content-agentes",
      smooth: 1.4,
      effects: true,
    });

    document.title =
      "Agentes de IA para Escalar tu Negocio | Diseñador & Embudo Comercial | Miiles";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Escala tu negocio con los agentes de Miiles: Tu Diseñador personal de marca y recursos visuales ($2,000 MXN) y tu Agente Vendedor de embudo comercial y web ($2,000 MXN). Soluciones llave en mano."
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
          name: "Agente Diseñador — Identidad & Recursos Visuales",
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
          name: "Agente de Embudo Comercial — Web & Captación",
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
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      const existing = document.getElementById("schema-agentes-comerciales");
      if (existing) existing.remove();
    };
  }, []);

  const handleOpenModal = (agentType?: string) => {
    if (agentType) setSelectedAgent(agentType);
    setIsSubmitted(false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const scrollToSection = (id: string) => {
    if (smootherRef.current) {
      smootherRef.current.scrollTo(id, true);
    } else {
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Navbar Oficial de Miiles (Limpio y estándar) */}
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
        <div id="smooth-content-agentes" className="bg-white text-black font-sans pb-0">
          {/* ─── HERO SECTION: EL PROBLEMA REAL PARA ESCALAR UN NEGOCIO ─── */}
          <header className="relative pt-36 md:pt-48 pb-16 md:pb-24 px-6 md:px-12 max-w-5xl mx-auto text-center">
            {/* Badge Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-miiles-gray-50 border border-miiles-gray-200 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-miiles-blue animate-pulse" />
              <span className="text-[11px] font-normal tracking-wide text-miiles-gray-600">
                Escalamiento Empresarial: Automatización & Presencia
              </span>
            </motion.div>

            {/* H1 Principal con acento editorial */}
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-black leading-[1.08] max-w-4xl mx-auto mb-6"
            >
              ¿Cómo escalar mi negocio?{" "}
              <span
                style={{
                  fontFamily: "'Welth Catritz', serif",
                  fontStyle: "italic",
                }}
                className="font-normal block sm:inline text-black"
              >
                Automatiza tu venta y luce profesional.
              </span>
            </motion.h1>

            {/* Párrafo Directo del Problema (AEO Optimizado) */}
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl font-light text-miiles-gray-600 max-w-3xl mx-auto leading-relaxed mb-10"
            >
              Para que un negocio escale de verdad necesita romper dos grandes barreras:{" "}
              <strong>automatizar las tareas comerciales repetitivas</strong> para no perder tiempo
              persiguiendo clientes a mano, y contar con el respaldo de{" "}
              <strong>recursos visuales de alto nivel y una web impecable</strong> que justifique tus
              precios y proyecte autoridad indiscutible.
            </motion.p>

            {/* CTAs Principales */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => handleOpenModal("disenador")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-normal bg-black text-white hover:bg-miiles-pink hover:text-black transition-all duration-300 hover:scale-105 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Escalar mi negocio hoy</span>
              </button>
              <button
                onClick={() => scrollToSection("#agentes-catalogo")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-normal bg-miiles-gray-50 text-black border border-miiles-gray-200 hover:bg-miiles-gray-100 transition-all duration-300"
              >
                <span>Ver nuestros 2 agentes clave</span>
                <ChevronDown className="w-4 h-4 text-miiles-gray-600" />
              </button>
            </motion.div>

            {/* Badges de Confianza */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-14 pt-10 border-t border-miiles-gray-100 text-xs font-light text-miiles-gray-600"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-miiles-blue shrink-0" />
                <span>Pago único de $2,000 MXN por agente</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-miiles-blue shrink-0" />
                <span>Sin contratos forzosos ni comisiones</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-miiles-blue shrink-0" />
                <span>Entrega ágil lista para operar</span>
              </div>
            </motion.div>
          </header>

          {/* ─── BANNER DESTACADO PARA CLÍNICAS (SOLUCIÓN ESPECIALIZADA) ─── */}
          <section className="px-6 md:px-12 max-w-5xl mx-auto mb-16">
            <div className="rounded-[24px] bg-gradient-to-r from-blue-50/80 via-white to-blue-50/50 border border-blue-200/70 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-normal tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Servicio Especializado
                    </span>
                    <span className="text-xs font-normal text-blue-700">$500 MXN / mes</span>
                  </div>
                  <h3 className="text-lg font-normal text-black mt-1">
                    ¿Tienes un consultorio o clínica de salud?
                  </h3>
                  <p className="text-xs md:text-sm font-light text-miiles-gray-600 max-w-xl">
                    Automatiza tu agenda de pacientes las 24 horas, responde dudas sobre tratamientos y
                    reduce cancelaciones con nuestro Asistente especializado para Clínicas.
                  </p>
                </div>
              </div>
              <Link
                to="/clinicas"
                className="shrink-0 inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-blue-600 text-white text-xs font-normal hover:bg-black transition-all duration-300 hover:scale-105"
              >
                <span>Ver Asistente para Clínicas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* ─── SECCIÓN: LOS 2 AGENTES COMERCIALES ─── */}
          <section
            id="agentes-catalogo"
            className="py-20 px-6 md:px-12 max-w-6xl mx-auto border-t border-miiles-gray-100"
          >
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-normal tracking-widest uppercase text-miiles-blue">
                Nuestros Agentes Principales
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-black">
                El equipo que tu negocio necesita para vender sin frenos.
              </h2>
              <p className="text-base font-light text-miiles-gray-600">
                Un diseñador dedicado para que tu marca luzca impecable y un vendedor experto que monta
                tu web y embudo automatizado.
              </p>
            </div>

            {/* Tarjetas de los 2 Agentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* AGENTE 1: TU DISEÑADOR */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5 }}
                className="rounded-[28px] border border-miiles-gray-200 bg-white p-8 sm:p-10 flex flex-col justify-between hover:border-black/30 hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden"
              >
                <div className="space-y-6">
                  {/* Header Card */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-normal text-2xl shadow-sm">
                        <Palette className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-normal text-black">Tu Diseñador</h3>
                        <p className="text-xs font-light text-miiles-gray-400">
                          Identidad, Posicionamiento & Recursos Visuales
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-normal text-black">$2,000</span>
                      <span className="text-xs text-miiles-gray-400 block font-light">MXN / Pago único</span>
                    </div>
                  </div>

                  {/* Subtítulo persuasivo */}
                  <p className="text-sm font-normal text-amber-700">
                    Todo lo que necesites visualmente para que tu negocio venda con autoridad.
                  </p>

                  <p className="text-sm font-light text-miiles-gray-600 leading-relaxed">
                    Este agente se encarga de ayudarte a refinar tu marca, crear una imagen sólida y darte
                    todos los recursos visuales necesarios para competir en grande. Desde el logotipo y
                    publicaciones para redes sociales, hasta empaque, papelería personalizada, letreros o
                    anuncios de alto impacto.
                  </p>

                  {/* Qué hace por ti */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-normal uppercase tracking-wider text-miiles-gray-400">
                      Lo que diseña y entrega para tu marca:
                    </p>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm font-light text-miiles-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Refinamiento de marca:</strong> Identidad, logotipo, tipografías y paleta.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm font-light text-miiles-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Publicaciones para redes:</strong> Diseños para Instagram, TikTok y campañas de venta.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm font-light text-miiles-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Empaques & Mockups:</strong> Etiquetas, packaging y presentación física de producto.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm font-light text-miiles-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Anuncios y letreros:</strong> Banners, material publicitario y papel personalizado.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* CTA Card */}
                <div className="pt-8 mt-6 border-t border-miiles-gray-100 flex items-center justify-between">
                  <span className="text-xs font-light text-miiles-gray-400">
                    Soporte visual continuo
                  </span>
                  <button
                    onClick={() => handleOpenModal("disenador")}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-normal bg-black text-white hover:bg-miiles-pink hover:text-black transition-all duration-300 hover:scale-105"
                  >
                    <span>Contratar Diseñador</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* AGENTE 2: AGENTE DE EMBUDO COMERCIAL */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-[28px] border border-miiles-blue/40 bg-white p-8 sm:p-10 flex flex-col justify-between hover:border-miiles-blue hover:shadow-[0_24px_60px_rgba(64,89,241,0.08)] transition-all duration-300 relative overflow-hidden"
              >
                <div className="space-y-6">
                  {/* Header Card */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-miiles-blue-light text-miiles-blue flex items-center justify-center font-normal text-2xl shadow-sm">
                        <Globe className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-normal text-black">Agente de Embudo</h3>
                        <p className="text-xs font-light text-miiles-gray-400">
                          Tu Agente Vendedor & Plataforma Web
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-normal text-black">$2,000</span>
                      <span className="text-xs text-miiles-gray-400 block font-light">MXN / Pago único</span>
                    </div>
                  </div>

                  {/* Subtítulo persuasivo */}
                  <p className="text-sm font-normal text-miiles-blue">
                    Monta tu página web, automatiza la captación y aterriza tu modelo de negocio.
                  </p>

                  <p className="text-sm font-light text-miiles-gray-600 leading-relaxed">
                    Este es tu vendedor incansable: se encarga de pulir tu propuesta comercial, montar tu
                    sitio web oficial y estructurar el embudo para que los clientes vean tus servicios,
                    revisen tu portafolio y agenden directamente contigo sin fricciones. Trabaja de la mano
                    con el diseñador para que tu presencia digital cierre ventas todos los días.
                  </p>

                  {/* Qué hace por ti */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-normal uppercase tracking-wider text-miiles-gray-400">
                      Lo que construye e implementa para ti:
                    </p>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm font-light text-miiles-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-miiles-blue shrink-0 mt-0.5" />
                        <span><strong>Tu sitio web completo:</strong> Rápido, responsive y enfocado en captación.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm font-light text-miiles-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-miiles-blue shrink-0 mt-0.5" />
                        <span><strong>Embudo de conversión:</strong> Flujos para agendar llamadas o solicitar cotizaciones.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm font-light text-miiles-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-miiles-blue shrink-0 mt-0.5" />
                        <span><strong>Catálogo y portafolio:</strong> Muestra tus casos de éxito y soluciones de forma convincente.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-xs sm:text-sm font-light text-miiles-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-miiles-blue shrink-0 mt-0.5" />
                        <span><strong>Dominio .com listo:</strong> Soporte de integración con tu dominio propio (costo de dominio .com adicional opcional).</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* CTA Card */}
                <div className="pt-8 mt-6 border-t border-miiles-gray-100 flex items-center justify-between">
                  <span className="text-xs font-light text-miiles-gray-400">
                    Tu máquina de ventas lista
                  </span>
                  <button
                    onClick={() => handleOpenModal("embudo")}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-normal bg-miiles-blue text-white hover:bg-black transition-all duration-300 hover:scale-105"
                  >
                    <span>Contratar Agente Vendedor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ─── PREGUNTAS FRECUENTES (AEO / PAA OPTIMIZADO) ─── */}
          <section className="py-20 px-6 md:px-12 bg-miiles-gray-50 border-t border-miiles-gray-200/60">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="text-xs font-normal tracking-widest uppercase text-miiles-blue">
                  Preguntas Frecuentes
                </span>
                <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-black">
                  Claridad total sobre cómo operan nuestros agentes.
                </h2>
                <p className="text-sm font-light text-miiles-gray-600">
                  Respuestas concretas para que comiences hoy mismo con total tranquilidad.
                </p>
              </div>

              <div className="space-y-4">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-[20px] border border-miiles-gray-200 bg-white p-6 transition-all shadow-sm"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left gap-4 text-sm md:text-base font-normal text-black"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-miiles-gray-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-black" : ""
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
                          >
                            <p className="mt-4 pt-4 border-t border-miiles-gray-100 text-xs md:text-sm font-light text-miiles-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ─── CALL TO ACTION FINAL ─── */}
          <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-normal text-black tracking-tight leading-tight">
              Deja de postergar la profesionalización de tu empresa.
            </h2>
            <p className="text-base sm:text-lg font-light text-miiles-gray-600 max-w-xl mx-auto">
              Por solo $2,000 MXN obtienes el respaldo visual o comercial que tardarías meses en construir
              por tu cuenta.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleOpenModal("disenador")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 text-sm font-normal bg-black text-white hover:bg-miiles-pink hover:text-black transition-all duration-300 hover:scale-105 shadow-md"
              >
                <span>Activar mi agente ahora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/clinicas"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-normal bg-white text-black border border-miiles-gray-200 hover:bg-miiles-gray-50 transition-all duration-300"
              >
                Ver Asistente para Clínicas ($500/mes)
              </Link>
            </div>
          </section>

          {/* Footer Oficial Miiles */}
          <LandingFooter />
        </div>
      </div>

      {/* ─── MODAL DE CONTRATACIÓN Y CONTACTO DIRECTO (FUERA DE SMOOTH WRAPPER) ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-white rounded-[28px] border border-miiles-gray-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-miiles-gray-100 transition-colors text-miiles-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              {isSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-normal text-black">
                    ¡Solicitud de Agente Recibida!
                  </h3>
                  <p className="text-sm font-light text-miiles-gray-600 max-w-md mx-auto">
                    Te contactaremos inmediatamente por WhatsApp para afinar los detalles de tu
                    marca y comenzar a trabajar en tus entregables sin demoras.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-xs font-normal bg-black text-white hover:bg-miiles-pink hover:text-black transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <span className="text-[10px] font-normal uppercase tracking-wider text-miiles-blue">
                      Activación Inmediata
                    </span>
                    <h3 className="text-2xl font-normal text-black mt-1">
                      Contratar tus Agentes Miiles
                    </h3>
                    <p className="text-xs font-light text-miiles-gray-600 mt-1">
                      Paga solo lo que necesitas: $2,000 MXN pago único por agente.
                    </p>
                  </div>

                  {/* Selección de agente */}
                  <div className="space-y-2">
                    <label className="text-xs font-normal text-black">
                      ¿Qué agente deseas activar?
                    </label>
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 p-3 bg-white focus:outline-none focus:border-black"
                    >
                      <option value="disenador">
                        Tu Diseñador — Identidad y Recursos Visuales ($2,000 MXN)
                      </option>
                      <option value="embudo">
                        Agente de Embudo Comercial — Web & Captación ($2,000 MXN)
                      </option>
                    </select>
                  </div>

                  {/* Nombre del negocio */}
                  <div className="space-y-2">
                    <label className="text-xs font-normal text-black">
                      Nombre de tu negocio o proyecto:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Estudio Dental, Tienda de Ropa, Consultoría..."
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({ ...formData, businessName: e.target.value })
                      }
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 p-3 focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Qué necesitas específicamente */}
                  <div className="space-y-2">
                    <label className="text-xs font-normal text-black">
                      ¿Qué necesitas principalmente?
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Ej. Necesito el logotipo, empaque para mis productos y una web para que agenden citas..."
                      value={formData.needs}
                      onChange={(e) =>
                        setFormData({ ...formData, needs: e.target.value })
                      }
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 p-3 focus:outline-none focus:border-black resize-none"
                    />
                  </div>

                  {/* Checkbox Dominio .com */}
                  {selectedAgent !== "disenador" && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-miiles-gray-50 border border-miiles-gray-200">
                      <input
                        type="checkbox"
                        id="includeDomain"
                        checked={formData.includeDomain}
                        onChange={(e) =>
                          setFormData({ ...formData, includeDomain: e.target.checked })
                        }
                        className="mt-0.5 rounded border-gray-300 text-miiles-blue focus:ring-miiles-blue"
                      />
                      <label htmlFor="includeDomain" className="text-xs font-light text-miiles-gray-800">
                        <strong>Incluir gestión de dominio .com adicional:</strong> Deseo que me
                        ayuden a tramitar y conectar mi propio dominio personalizado (.com o .mx).
                      </label>
                    </div>
                  )}

                  {/* Contacto */}
                  <div className="space-y-2">
                    <label className="text-xs font-normal text-black">
                      WhatsApp o Teléfono para contactarte:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+52 55... (o tu correo)"
                      value={formData.contact}
                      onChange={(e) =>
                        setFormData({ ...formData, contact: e.target.value })
                      }
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 p-3 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-full text-xs font-normal text-miiles-gray-600 hover:text-black transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-black text-white text-xs font-normal hover:bg-miiles-pink hover:text-black transition-all duration-300 hover:scale-105"
                    >
                      <span>Confirmar y Comenzar</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Agentes;

import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import {
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  ChevronDown,
  Globe,
  BellRing,
  Check,
  X,
  Send,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  LayoutDashboard,
  Workflow,
  AtSign,
  SlidersHorizontal,
} from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";
import SlideArrowButton from "@/components/SlideArrowButton";
import StickyCta from "@/components/StickyCta";
import { openWhatsApp } from "@/lib/whatsapp";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const WHATSAPP_MESSAGE = "Hola, quiero activar el asistente para mi clínica.";
const WHATSAPP_DEMO_MESSAGE = "Hola, quiero solicitar una demo del asistente para mi clínica.";

const CLINIC_FAQS = [
  {
    question: "¿Cómo funciona el Asistente para Clínicas por $500 MXN al mes?",
    answer:
      "Es una suscripción mensual completa que dota a tu clínica o consultorio de un asistente inteligente 24/7 y una página web médica profesional. El asistente atiende pacientes por mensaje y web, responde dudas frecuentes, agenda citas en tu calendario y envía recordatorios automáticos para que ningún paciente falte a su consulta.",
  },
  {
    question: "¿Qué pasa si un paciente tiene una duda médica delicada o una emergencia?",
    answer:
      "El asistente está entrenado para reconocer límites éticos y médicos. Resuelve dudas operativas (costos de consulta, ubicación, preparación para estudios, horarios) y, ante cualquier síntoma crítico o solicitud médica específica, canaliza inmediatamente al paciente a la línea directa de emergencias o al contacto directo del médico responsable.",
  },
  {
    question: "¿Cómo se gestiona el dominio .com de la página web?",
    answer:
      "La página web de tu clínica está 100% incluida y alojada dentro del servicio. Si deseas que tu web funcione bajo tu propio nombre de dominio personalizado (por ejemplo www.tucapaclinicamedica.com o .mx), este registro tiene un costo anual adicional opcional que podemos gestionar y conectar por ti.",
  },
  {
    question: "¿Hay plazos forzosos o penalizaciones por cancelación?",
    answer:
      "No. La suscripción es mensual y puedes cancelarla en cualquier momento sin penalizaciones. Estamos convencidos del valor que aporta a tu consulta: con una sola cita que el asistente rescate fuera de horario, la mensualidad de $500 MXN se paga sola múltiples veces.",
  },
  {
    question: "¿Para qué tipo de clínicas o consultorios está pensado?",
    answer:
      "Está optimizado para clínicas dentales, consultorios dermatológicos, clínicas de fisioterapia, consultorios de ginecología, nutrición, psicología, pediatría, medicina estética y policlínicas que buscan orden y mayor captación de pacientes.",
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

const formatTime = (t: number) => {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const sec = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const ClinicVideo = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    // Si está en silencio con volumen 0, restaura a un volumen audible
    if (v.muted && v.volume === 0) {
      v.volume = 1;
      setVolume(1);
    }
    v.muted = !v.muted;
  };

  const changeVolume = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
  };

  const seek = (val: number) => {
    const v = videoRef.current;
    if (v) v.currentTime = val;
  };

  const fullscreen = () => {
    const el = boxRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  const btn =
    "w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0";
  const range =
    "h-1 appearance-none rounded-full bg-white/30 cursor-pointer accent-white";

  return (
    <div ref={boxRef} className="relative group bg-black">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto block cursor-pointer"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => {
          setMuted(e.currentTarget.muted);
          setVolume(e.currentTarget.volume);
        }}
      />

      {!playing && (
        <button
          onClick={toggle}
          aria-label="Reproducir"
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/90 text-black flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Play className="w-6 h-6 fill-current" />
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10 bg-gradient-to-t from-black/70 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Progreso del video"
          className={`${range} w-full block mb-2`}
        />
        <div className="flex items-center gap-1 text-white">
          <button onClick={toggle} aria-label={playing ? "Pausar" : "Reproducir"} className={btn}>
            {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <button onClick={toggleMute} aria-label={muted ? "Activar sonido" : "Silenciar"} className={btn}>
            {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volumen"
            className={`${range} w-16 sm:w-20`}
          />
          <span className="ml-2 text-[11px] font-light tabular-nums text-white/80">
            {formatTime(time)} / {formatTime(duration)}
          </span>
          <button onClick={fullscreen} aria-label="Pantalla completa" className={`${btn} ml-auto`}>
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Clinicas = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: "",
    specialty: "dental",
    contact: "",
    includeDomain: false,
    estimatedDoctors: "1-3",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cycle, setCycle] = useState<"monthly" | "annually">("monthly");

  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    // Inicializar ScrollSmoother oficial de Miiles
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-clinicas",
      content: "#smooth-content-clinicas",
      smooth: 1.4,
      effects: true,
    });

    // Entrada de los títulos h2 palabra por palabra (los que usan Welth Catritz quedan fuera)
    const titlesCtx = gsap.context(() => {
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
      "Asistente Inteligente para Clínicas y Consultorios Médicos | Miiles";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Llena la agenda de tu clínica o consultorio con el Asistente de IA de Miiles. Citas 24/7, recordatorios automáticos y web médica por solo $500 MXN al mes."
      );
    }

    const schemaScript = document.createElement("script");
    schemaScript.type = "application/ld+json";
    schemaScript.id = "schema-clinicas-asistente";
    schemaScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          name: "Asistente Inteligente para Clínicas y Consultorios",
          description:
            "Asistente de IA para agendamiento de pacientes 24/7, recordatorios automáticos y portal web médico.",
          offers: {
            "@type": "Offer",
            price: "500",
            priceCurrency: "MXN",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "500",
              priceCurrency: "MXN",
              unitCode: "MON",
            },
            availability: "https://schema.org/InStock",
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: CLINIC_FAQS.map((faq) => ({
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
      titlesCtx.revert();
      smootherRef.current?.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      const existing = document.getElementById("schema-clinicas-asistente");
      if (existing) existing.remove();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <>
      {/* Navbar Oficial de Miiles (Limpio y estándar) */}
      <LandingNavbar />

      {/* Smooth Scroll Wrapper */}
      <div
        id="smooth-wrapper-clinicas"
        style={{
          overflow: "hidden",
          position: "fixed",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }}
      >
        <div id="smooth-content-clinicas" className="bg-white dark:bg-black text-black dark:text-white font-sans pb-0 transition-colors duration-300">
          {/* ─── HERO SECTION: PROBLEMA DE AGENDA Y ATENCIÓN EN CLÍNICAS ─── */}
          <section className="relative overflow-hidden">
          <header className="relative pt-28 md:pt-48 pb-12 md:pb-24 px-6 md:px-12 max-w-5xl mx-auto text-center">
            {/* Badge Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-400/20 mb-6"
            >
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-normal tracking-wide text-blue-900 dark:text-blue-200">
                Especializado para clínicas
              </span>
            </motion.div>

            {/* H1 Principal con acento editorial */}
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-balance text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-black dark:text-white leading-[1.08] max-w-4xl mx-auto mb-10 md:mb-20"
            >
              El asistente{" "}
              <span
                style={{
                  fontFamily: "'Welth Catritz', serif",
                  fontStyle: "italic",
                }}
              >
                inteligente
              </span>{" "}
              que llena la{" "}
              <span
                style={{
                  fontFamily: "'Welth Catritz', serif",
                  fontStyle: "italic",
                }}
              >
                agenda
              </span>{" "}
              de tu clínica
              <span className="block mt-4 text-2xl sm:text-3xl md:text-4xl text-blue-600 dark:text-blue-300 font-normal tracking-tight">
                — 24 horas al día
              </span>
            </motion.h1>

            {/* Video debajo del título */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="max-w-full md:max-w-md mx-auto mb-6 md:mb-8 rounded-[32px] overflow-hidden bg-black"
            >
              <ClinicVideo src="/videos/clinicas-ad.mp4" />
            </motion.div>

            {/* Solicitar demo, debajo del video */}
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

            {/* Párrafo Direct Answer AEO */}
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl font-light text-miiles-gray-600 dark:text-white/85 max-w-3xl mx-auto leading-relaxed mb-10"
            >
              No dejes que los pacientes se vayan con otra clínica por no responder a tiempo. Tu
              asistente responde al instante, confirma citas en tu calendario oficial,
              resuelve dudas de tratamientos y envía recordatorios para eliminar los pacientes que no
              asisten.
            </motion.p>

            {/* Resumen de Condiciones Claras */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-10 md:mt-14 pt-8 md:pt-10 border-t border-miiles-gray-100 dark:border-white/10"
            >
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-400/20">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-300 shrink-0" />
                <span className="text-base md:text-lg font-normal text-blue-900 dark:text-blue-200">Cancela cuando quieras</span>
              </div>
            </motion.div>
          </header>
          </section>

          {/* ─── LOS 3 DOLORES QUE RESUELVE EN CONSULTORIOS Y CLÍNICAS ─── */}
          <section className="relative overflow-hidden md:min-h-[80vh] flex items-center justify-center py-14 md:py-20 px-6 md:px-12">
            {/* Fondo punteado (igual que el home de miiles.app) */}
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
                El reto diario en clínicas
              </span>
              <h2 data-split-title className="text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.08] text-black dark:text-white">
                El 40% de los pacientes potenciales se pierde por lentitud en la atención
              </h2>
              <p data-fade-p className="text-sm md:text-base font-light text-miiles-gray-600 dark:text-white/85 max-w-2xl mx-auto">
                Un consultorio con recepción ocupada o que no atiende noches ni fines de semana regala
                citas a clínicas competidoras todos los días.
              </p>
            </div>
          </section>

          {/* ─── EL PLAN ─── */}
          <section className="py-14 md:py-24 px-6 md:px-12 max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 space-y-3">
              <span className="text-xs font-normal tracking-widest text-blue-600 dark:text-blue-300">
                El plan
              </span>
              <h2 data-split-title className="text-balance text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-black dark:text-white">
                Todo lo que tu clínica necesita
              </h2>
            </div>

            {/* Selector mensual / anual */}
            <div className="flex justify-center mb-8 md:mb-10">
              <div className="relative flex w-64 p-1 bg-[#F5F5F8] dark:bg-white/10 rounded-full cursor-pointer border border-gray-100 dark:border-white/10">
                <motion.div
                  className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-black dark:bg-white rounded-full"
                  animate={{ x: cycle === "monthly" ? 0 : "100%" }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
                <button
                  onClick={() => setCycle("monthly")}
                  className={`relative z-10 flex-1 py-2.5 text-xs font-normal transition-colors duration-300 ${cycle === "monthly" ? "text-white dark:text-black" : "text-gray-500 dark:text-white/80"}`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setCycle("annually")}
                  className={`relative z-10 flex-1 py-2.5 text-xs font-normal transition-colors duration-300 ${cycle === "annually" ? "text-white dark:text-black" : "text-gray-500 dark:text-white/80"}`}
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    Anual
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        cycle === "annually"
                          ? "bg-white/20 dark:bg-black/10"
                          : "bg-blue-600/10 text-blue-600 dark:text-blue-300"
                      }`}
                    >
                      -10%
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <div className="rounded-[2.5rem] bg-black dark:bg-neutral-900 text-white p-8 sm:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.2)] dark:shadow-none transition-all duration-500 hover:-translate-y-2">
                <div className="flex flex-col items-start gap-4 mb-2">
                  <img src="/clinicas-star.png" alt="" className="w-10 h-10 shrink-0" />
                  <h3 className="text-2xl font-normal">Agente AI Clínico</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-normal tracking-tight">
                    {cycle === "monthly" ? "$500" : "$5,400"}
                  </span>
                  <span className="text-xs font-light text-white/70">
                    MXN {cycle === "monthly" ? "/ mes" : "/ año"}
                  </span>
                </div>
                {cycle === "annually" ? (
                  <p className="text-[11px] font-light mb-8 text-white/70">
                    ✦ Ahorras 10%: pagando al año te descontamos $600 MXN
                  </p>
                ) : (
                  <div className="mb-8" />
                )}

                <ul className="space-y-4">
                  {[
                    { icon: Globe, text: "Página web de clínica" },
                    { icon: Clock, text: "Tus clientes pueden agendar contigo 24/7" },
                    { icon: BellRing, text: "Recordatorios automáticos" },
                    { icon: LayoutDashboard, text: "Panel de gestión personal para administrar tu calendario de trabajo" },
                    { icon: Workflow, text: "Herramientas de trabajo para automatizar los procesos de tu clínica" },
                    { icon: SlidersHorizontal, text: "Plataforma 100% personalizable" },
                    { icon: AtSign, text: "Incluye espacio para dominio" },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-white shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-sm font-medium">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ─── PREGUNTAS FRECUENTES (AEO / PAA) ─── */}
          <section className="py-14 md:py-20 px-6 md:px-12 max-w-4xl mx-auto space-y-8 md:space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-normal tracking-widest text-blue-600 dark:text-blue-300">
                Preguntas frecuentes
              </span>
              <h2 data-split-title className="text-balance text-3xl md:text-4xl font-normal tracking-tight text-black dark:text-white">
                Todo lo que necesitas saber antes de activar tu clínica
              </h2>
            </div>

            <div className="space-y-4">
              {CLINIC_FAQS.map((faq, idx) => {
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

          {/* ─── CALL TO ACTION FINAL ─── */}
          <section className="py-14 md:py-24 px-6 md:px-12 max-w-5xl mx-auto text-center space-y-4 md:space-y-6">
            <h2 data-split-title className="text-balance text-3xl sm:text-4xl md:text-6xl font-normal text-black dark:text-white tracking-tight leading-tight">
              Moderniza la atención de tus pacientes hoy mismo
            </h2>
            <p data-fade-p className="text-base sm:text-lg font-light text-miiles-gray-600 dark:text-white/85 max-w-xl mx-auto">
              Por solo $500 MXN al mes tendrás el asistente que tu clínica necesita para nunca más perder
              una consulta.
            </p>
          </section>

          {/* Footer Oficial Miiles */}
          {/* En oscuro se invierte el footer compartido (blanco fijo) sin tocar otras páginas */}
          <div className="dark:[filter:invert(1)_brightness(2)]">
            <LandingFooter />
          </div>
        </div>
      </div>

      {/* CTA pegado (fuera del smooth wrapper para que quede fijo) */}
      <StickyCta label="Activar agente" onClick={() => openWhatsApp(WHATSAPP_MESSAGE)} />

      {/* ─── MODAL DE CONTRATACIÓN ASISTENTE PARA CLÍNICAS (FUERA DEL SMOOTH WRAPPER) ─── */}
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
              className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-[28px] shadow-[0_40px_80px_rgba(0,0,0,0.2)] p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-miiles-gray-100 dark:hover:bg-white/10 transition-colors text-miiles-gray-600 dark:text-white/85"
              >
                <X className="w-5 h-5" />
              </button>

              {isSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-normal text-black dark:text-white">
                    ¡Solicitud de Clínica Recibida!
                  </h3>
                  <p className="text-sm font-light text-miiles-gray-600 dark:text-white/85 max-w-md mx-auto">
                    Nos pondremos en contacto de inmediato para conectar los horarios de
                    tu consultorio y dejar activo tu asistente en menos de 48 horas.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-xs font-normal bg-blue-600 text-white hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all"
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <span className="text-[11px] font-normal text-blue-600 dark:text-blue-300">
                      {cycle === "monthly" ? "Suscripción mensual — $500 MXN / mes" : "Suscripción anual — $5,400 MXN / año"}
                    </span>
                    <h3 className="text-2xl font-normal text-black dark:text-white mt-1">
                      Activar Asistente para tu Clínica
                    </h3>
                    <p className="text-xs font-light text-miiles-gray-600 dark:text-white/85 mt-1">
                      Comienza a agendar pacientes 24/7 sin plazos forzosos.
                    </p>
                  </div>

                  {/* Nombre de la clínica */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-normal text-black dark:text-white">
                      Nombre de la Clínica o Consultorio:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Clínica Dental Sonrisas, Dr. Garza..."
                      value={formData.clinicName}
                      onChange={(e) =>
                        setFormData({ ...formData, clinicName: e.target.value })
                      }
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 dark:border-white/10 dark:bg-black p-3 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Especialidad */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-normal text-black dark:text-white">
                      Especialidad Médica Principal:
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({ ...formData, specialty: e.target.value })
                      }
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 dark:border-white/10 p-3 bg-white dark:bg-black focus:outline-none focus:border-blue-600"
                    >
                      <option value="dental">Dental / Odontología</option>
                      <option value="dermo">Dermatología / Medicina Estética</option>
                      <option value="fisio">Fisioterapia / Rehabilitación</option>
                      <option value="psico">Psicología / Psiquiatría</option>
                      <option value="nutri">Nutrición</option>
                      <option value="pediatria">Pediatría / Medicina General</option>
                      <option value="otra">Otra Especialidad</option>
                    </select>
                  </div>

                  {/* Número de médicos */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-normal text-black dark:text-white">
                      ¿Cuántos doctores o consultorios atienden?
                    </label>
                    <select
                      value={formData.estimatedDoctors}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedDoctors: e.target.value })
                      }
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 dark:border-white/10 p-3 bg-white dark:bg-black focus:outline-none focus:border-blue-600"
                    >
                      <option value="1">1 doctor / consultorio individual</option>
                      <option value="2-3">2 a 3 doctores</option>
                      <option value="4+">4 o más especialistas</option>
                    </select>
                  </div>

                  {/* Checkbox Dominio .com adicional */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                    <input
                      type="checkbox"
                      id="includeClinicDomain"
                      checked={formData.includeDomain}
                      onChange={(e) =>
                        setFormData({ ...formData, includeDomain: e.target.checked })
                      }
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <label htmlFor="includeClinicDomain" className="text-xs font-light text-miiles-gray-800">
                      <strong>Deseo dominio .com o .mx propio (adicional opcional):</strong> Ayúdenme a
                      registrar y conectar el dominio web oficial de mi clínica.
                    </label>
                  </div>

                  {/* Contacto */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-normal text-black dark:text-white">
                      Teléfono para contactarte:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+52 55... (o tu correo)"
                      value={formData.contact}
                      onChange={(e) =>
                        setFormData({ ...formData, contact: e.target.value })
                      }
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 dark:border-white/10 dark:bg-black p-3 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-full text-xs font-normal text-miiles-gray-600 dark:text-white/85 hover:text-black dark:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-blue-600 text-white text-xs font-normal hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all duration-300 hover:scale-105"
                    >
                      <span>Activar Clínica</span>
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

export default Clinicas;

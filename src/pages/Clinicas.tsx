import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
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
} from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const CLINIC_FAQS = [
  {
    question: "¿Cómo funciona el Asistente para Clínicas por $500 MXN al mes?",
    answer:
      "Es una suscripción mensual completa que dota a tu clínica o consultorio de un asistente inteligente 24/7 y una página web médica profesional. El asistente atiende pacientes por WhatsApp y web, responde dudas frecuentes, agenda citas en tu calendario y envía recordatorios automáticos para que ningún paciente falte a su consulta.",
  },
  {
    question: "¿Qué pasa si un paciente tiene una duda médica delicada o una emergencia?",
    answer:
      "El asistente está entrenado para reconocer límites éticos y médicos. Resuelve dudas operativas (costos de consulta, ubicación, preparación para estudios, horarios) y, ante cualquier síntoma crítico o solicitud médica específica, canaliza inmediatamente al paciente a la línea directa de emergencias o al WhatsApp del médico responsable.",
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

  const smootherRef = useRef<ScrollSmoother | null>(null);

  useEffect(() => {
    // Inicializar ScrollSmoother oficial de Miiles
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper-clinicas",
      content: "#smooth-content-clinicas",
      smooth: 1.4,
      effects: true,
    });

    document.title =
      "Asistente Inteligente para Clínicas y Consultorios Médicos | Miiles";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Llena la agenda de tu clínica o consultorio con el Asistente de IA de Miiles. Citas 24/7, recordatorios automáticos por WhatsApp y web médica por solo $500 MXN al mes."
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
            "Asistente de IA para agendamiento de pacientes 24/7, recordatorios por WhatsApp y portal web médico.",
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
        <div id="smooth-content-clinicas" className="bg-white text-black font-sans pb-0">
          {/* ─── HERO SECTION: PROBLEMA DE AGENDA Y ATENCIÓN EN CLÍNICAS ─── */}
          <header className="relative pt-36 md:pt-48 pb-16 md:pb-24 px-6 md:px-12 max-w-5xl mx-auto text-center">
            {/* Badge Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 mb-6"
            >
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-normal tracking-wide text-blue-900">
                Especializado para Clínicas, Consultorios y Profesionales de la Salud
              </span>
            </motion.div>

            {/* H1 Principal con acento editorial */}
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-black leading-[1.08] max-w-4xl mx-auto mb-6"
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
              de tu clínica.
              <span className="block mt-4 text-xl sm:text-2xl md:text-3xl text-miiles-gray-400 font-light tracking-wide">
                - 24 horas al día
              </span>
            </motion.h1>

            {/* Párrafo Direct Answer AEO */}
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl font-light text-miiles-gray-600 max-w-3xl mx-auto leading-relaxed mb-10"
            >
              No dejes que los pacientes se vayan con otra clínica por no responder a tiempo. Tu
              asistente responde al instante, confirma citas en tu calendario oficial,
              resuelve dudas de tratamientos y envía recordatorios para eliminar los pacientes que no
              asisten.
            </motion.p>

            {/* Precio y CTA Principal */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-normal bg-blue-600 text-white hover:bg-black transition-all duration-300 hover:scale-105 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Activar asistente para mi clínica ($500 MXN / mes)</span>
              </button>
              <Link
                to="/agentes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-normal bg-miiles-gray-50 text-black border border-miiles-gray-200 hover:bg-miiles-gray-100 transition-all duration-300"
              >
                <span>Ver agentes de diseño y ventas</span>
                <ArrowRight className="w-3.5 h-3.5 text-miiles-gray-600" />
              </Link>
            </motion.div>

            {/* Resumen de Condiciones Claras */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-14 pt-10 border-t border-miiles-gray-100 text-xs font-light text-miiles-gray-600"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Cancela cuando quieras</span>
              </div>
            </motion.div>
          </header>

          {/* ─── LOS 3 DOLORES QUE RESUELVE EN CONSULTORIOS Y CLÍNICAS ─── */}
          <section className="py-20 px-6 md:px-12 bg-blue-50/40 border-y border-blue-100">
            <div className="max-w-5xl mx-auto">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-xs font-normal tracking-widest uppercase text-blue-700">
                  El Reto Diario en Clínicas
                </span>
                <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-black">
                  El 40% de los pacientes potenciales se pierde por lentitud en la atención.
                </h2>
                <p className="text-sm md:text-base font-light text-miiles-gray-600">
                  Un consultorio con recepción ocupada o que no atiende noches ni fines de semana regala
                  citas a clínicas competidoras todos los días.
                </p>
              </div>
            </div>
          </section>

          {/* ─── EL PLAN ─── */}
          <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-normal tracking-widest uppercase text-blue-600">
                El Plan
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-black">
                Todo lo que tu clínica necesita.
              </h2>
            </div>

            <div className="max-w-md mx-auto">
              <div className="rounded-[32px] border border-blue-100 bg-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10" />
                
                <h3 className="text-2xl font-normal text-black mb-2">Agente AI Clínico</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-normal text-black">$500</span>
                  <span className="text-sm font-light text-miiles-gray-500">MXN / mes</span>
                </div>

                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-light text-black">Suscripción de $500 MXN al mes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-light text-black">Sin contratos forzosos (cancela cuando quieras)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-light text-black">Página web de clínica incluida (dominio .com opcional)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-light text-black">Agendamiento de citas 24/7 en tu calendario</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-light text-black">Recordatorios automáticos por WhatsApp</span>
                  </li>
                </ul>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setIsModalOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-normal bg-blue-600 text-white hover:bg-black transition-all duration-300 hover:scale-105 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Activar ahora</span>
                </button>
              </div>
            </div>
          </section>

          {/* ─── PREGUNTAS FRECUENTES (AEO / PAA) ─── */}
          <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-normal tracking-widest uppercase text-blue-600">
                Preguntas Frecuentes
              </span>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-black">
                Todo lo que necesitas saber antes de activar tu clínica.
              </h2>
            </div>

            <div className="space-y-4">
              {CLINIC_FAQS.map((faq, idx) => {
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
          </section>

          {/* ─── CALL TO ACTION FINAL ─── */}
          <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-normal text-black tracking-tight leading-tight">
              Moderniza la atención de tus pacientes hoy mismo.
            </h2>
            <p className="text-base sm:text-lg font-light text-miiles-gray-600 max-w-xl mx-auto">
              Por solo $500 MXN al mes tendrás el asistente que tu clínica necesita para nunca más perder
              una consulta.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 text-sm font-normal bg-blue-600 text-white hover:bg-black transition-all duration-300 hover:scale-105 shadow-md"
              >
                <span>Activar clínica por $500 MXN / mes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/agentes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-normal bg-white text-black border border-miiles-gray-200 hover:bg-miiles-gray-50 transition-all duration-300"
              >
                Ver agentes para otros negocios
              </Link>
            </div>
          </section>

          {/* Footer Oficial Miiles */}
          <LandingFooter />
        </div>
      </div>

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
              className="relative w-full max-w-lg bg-white rounded-[28px] border border-blue-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-miiles-gray-100 transition-colors text-miiles-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              {isSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-normal text-black">
                    ¡Solicitud de Clínica Recibida!
                  </h3>
                  <p className="text-sm font-light text-miiles-gray-600 max-w-md mx-auto">
                    Nos pondremos en contacto vía WhatsApp de inmediato para conectar los horarios de
                    tu consultorio y dejar activo tu asistente en menos de 48 horas.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-xs font-normal bg-blue-600 text-white hover:bg-black transition-all"
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <span className="text-[10px] font-normal uppercase tracking-wider text-blue-600">
                      Suscripción Mensual — $500 MXN / mes
                    </span>
                    <h3 className="text-2xl font-normal text-black mt-1">
                      Activar Asistente para tu Clínica
                    </h3>
                    <p className="text-xs font-light text-miiles-gray-600 mt-1">
                      Comienza a agendar pacientes 24/7 sin plazos forzosos.
                    </p>
                  </div>

                  {/* Nombre de la clínica */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-normal text-black">
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
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 p-3 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Especialidad */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-normal text-black">
                      Especialidad Médica Principal:
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({ ...formData, specialty: e.target.value })
                      }
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 p-3 bg-white focus:outline-none focus:border-blue-600"
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
                    <label className="text-xs font-normal text-black">
                      ¿Cuántos doctores o consultorios atienden?
                    </label>
                    <select
                      value={formData.estimatedDoctors}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedDoctors: e.target.value })
                      }
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 p-3 bg-white focus:outline-none focus:border-blue-600"
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
                    <label className="text-xs font-normal text-black">
                      WhatsApp o teléfono para contactarte:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+52 55... (o tu correo)"
                      value={formData.contact}
                      onChange={(e) =>
                        setFormData({ ...formData, contact: e.target.value })
                      }
                      className="w-full text-xs font-light rounded-xl border border-miiles-gray-200 p-3 focus:outline-none focus:border-blue-600"
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
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-blue-600 text-white text-xs font-normal hover:bg-black transition-all duration-300 hover:scale-105"
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

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Workflow,
  Search,
  Check,
  Copy,
  Layers,
  ShieldCheck,
  Zap,
  Target,
  PenTool,
  BarChart2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import LandingFooter from "@/components/LandingFooter";

interface Agent {
  id: string;
  name: string;
  codename: string;
  category: "all" | "content" | "ecommerce" | "growth" | "research" | "operations";
  role: string;
  tag: string;
  color: string;
  bgLight: string;
  avatarLetter: string;
  description: string;
  longDescription: string;
  skills: string[];
  tools: string[];
  samplePrompt: string;
  sampleOutput: string;
}

const CATEGORIES = [
  { id: "all", label: "Todos los agentes" },
  { id: "content", label: "Contenido & Creatividad" },
  { id: "ecommerce", label: "E-commerce & Tiendas" },
  { id: "growth", label: "Ventas & Crecimiento" },
  { id: "research", label: "Research & Tendencias" },
  { id: "operations", label: "Operaciones & Flujos" },
] as const;

const AGENTS: Agent[] = [
  {
    id: "aura",
    name: "Aura",
    codename: "Agente Creativo",
    category: "content",
    role: "Especialista en Copywriting & Social Media",
    tag: "Creatividad",
    color: "#4059F1",
    bgLight: "#E8ECFE",
    avatarLetter: "A",
    description:
      "Diseña calendarios editoriales, ganchos virales y copys persuasivos adaptados exactamente a la voz de tu marca.",
    longDescription:
      "Aura asume la dirección de tus canales de contenido. Analiza tu audiencia y formula narrativas multiplataforma (Instagram, TikTok, LinkedIn, YouTube) manteniendo coherencia en tono y estilo editorial.",
    skills: [
      "Ganchos de alto impacto (Hooks)",
      "Guiones de Reels y TikTok (15-60s)",
      "Calendarios editoriales mensuales",
      "Adaptación de tono de marca",
    ],
    tools: ["Instagram", "TikTok", "YouTube", "Canvas de Miiles"],
    samplePrompt:
      "Diseña una parrilla de 5 ideas de contenido en video para nuestra marca de café de especialidad enfocada en profesionales jóvenes. Incluye el hook de los primeros 3 segundos y el llamado a la acción.",
    sampleOutput:
      "Propuesta de guion 1:\nHook: «El 80% del café que tomas en la oficina ya está oxidado antes de prepararlo...»\nEstructura: Mostrar método de tostado artesanal vs grano comercial.\nCTA: «Guarda esta guía para elegir café de especialidad.»",
  },
  {
    id: "atlas",
    name: "Atlas",
    codename: "Agente E-commerce",
    category: "ecommerce",
    role: "Optimización de Tiendas & Catálogos",
    tag: "E-commerce",
    color: "#0F9D58",
    bgLight: "#E6F4EA",
    avatarLetter: "T",
    description:
      "Optimiza descripciones de producto, audita la tasa de conversión en tu tienda y asiste en cambios técnicos vía Shopify.",
    longDescription:
      "Atlas está diseñado para tiendas en línea que buscan elevar su ticket promedio y tasa de conversión. Se enlaza con tu catálogo, detecta fricciones en el embudo de compra y genera copys orientados a ventas.",
    skills: [
      "Optimización de páginas de producto (PDP)",
      "Soporte para Shopify CLI",
      "Estrategia de bundles y cross-selling",
      "Reducción de fricción en checkout",
    ],
    tools: ["Shopify", "Google Analytics", "Stripe", "Catalog Hub"],
    samplePrompt:
      "Revisa la ficha de nuestro producto estrella (mochila impermeable para laptop) y genera 3 versiones de copy persuasivo destacando durabilidad, compartimentos ocultos y garantía de 5 años.",
    sampleOutput:
      "Versión A (Enfoque Funcional):\n«Diseñada para el ritmo urbano: protección impermeable grado IPX4 y compartimento acolchado para laptops de hasta 16 pulgadas...»",
  },
  {
    id: "vanguard",
    name: "Vanguard",
    codename: "Agente de Crecimiento",
    category: "growth",
    role: "Prospección B2B & Secuencias de Venta",
    tag: "Crecimiento",
    color: "#D93025",
    bgLight: "#FCE8E6",
    avatarLetter: "V",
    description:
      "Identifica perfiles de cliente ideal, redacta mensajes de prospección no invasivos y crea argumentos sólidos ante objeciones.",
    longDescription:
      "Vanguard acelera la prospección comercial. Formula mensajes personalizados a partir de la propuesta de valor de tu negocio, ayudándote a iniciar conversaciones de calidad con tomadores de decisión.",
    skills: [
      "Definición de Ideal Customer Profile (ICP)",
      "Secuencias de correo de prospección",
      "Guías de manejo de objeciones",
      "Pitches de venta de 60 segundos",
    ],
    tools: ["LinkedIn", "Email B2B", "CRM Sync", "Pitch Deck"],
    samplePrompt:
      "Crea una secuencia de 3 correos breves para contactar directores de marketing de empresas medianas, ofreciéndoles nuestra auditoría de flujos con IA sin costo.",
    sampleOutput:
      "Correo 1 (Asunto: Pregunta breve sobre sus flujos de contenido):\n«Hola [Nombre], vi la última campaña de [Empresa] en LinkedIn. Noté que están produciendo alto volumen visual...»",
  },
  {
    id: "nexus",
    name: "Nexus",
    codename: "Agente de Inteligencia",
    category: "research",
    role: "Research de Mercado & Análisis de Tendencias",
    tag: "Investigación",
    color: "#673AB7",
    bgLight: "#EDE7F6",
    avatarLetter: "N",
    description:
      "Monitorea competidores, sintetiza reportes del sector y detecta formatos emergentes antes de que se vuelvan masivos.",
    longDescription:
      "Nexus funciona como tu analista de mercado dedicado. Extrae patrones clave a partir de grandes volúmenes de información y te presenta recomendaciones claras para la toma de decisiones estratégicas.",
    skills: [
      "Benchmarking competitivo detallado",
      "Detección temprana de tendencias de consumo",
      "Resumen ejecutivo de informes y estudios",
      "Auditoría de propuesta de valor",
    ],
    tools: ["Buscador Miiles", "Algoritmos Trends", "Bases de datos", "PDF Insights"],
    samplePrompt:
      "Analiza las 4 principales tendencias de empaque sustentable para marcas direct-to-consumer en 2026 y destaca cuáles generan mayor percepción de valor.",
    sampleOutput:
      "1. Materiales hidrosolubles con tintas a base de soya.\n2. Cajas modulares reutilizables como organizadores.\n3. QR interactivo que muestra la trazabilidad del producto.",
  },
  {
    id: "orion",
    name: "Orion",
    codename: "Agente de Flujos",
    category: "operations",
    role: "Arquitectura de Procesos & Automatización",
    tag: "Operaciones",
    color: "#E37400",
    bgLight: "#FEF7E0",
    avatarLetter: "O",
    description:
      "Estructura proyectos en pasos accionables, organiza tableros de trabajo y coordina dependencias entre entregables.",
    longDescription:
      "Orion toma objetivos abstractos y los transforma en flujos operativos precisos dentro de los tableros de Miiles. Elimina la dispersión definiendo prioridades, responsables y checklists concretos.",
    skills: [
      "Desglose de proyectos (WBS) en tableros",
      "Checklists y asignación de prioridades",
      "Detección de cuellos de botella",
      "Integración de pasos con otros agentes",
    ],
    tools: ["Tableros Miiles", "Kanban Node", "Timeline Flow", "Automation Triggers"],
    samplePrompt:
      "Tengo que lanzar un nuevo producto en 4 semanas. Desglosa todo el plan de trabajo en un tablero con 4 fases: Estrategia, Producción, Pre-lanzamiento y Go-Live.",
    sampleOutput:
      "Fase 1 (Semana 1): Definición de pricing y activos clave.\nFase 2 (Semana 2): Producción fotográfica y desarrollo de landing.\nFase 3 (Semana 3): Campaña teaser y prueba de pasarela...",
  },
  {
    id: "metric",
    name: "Metric",
    codename: "Agente Financiero",
    category: "operations",
    role: "Analítica de Rendimiento & Modelos de Costo",
    tag: "Datos",
    color: "#00796B",
    bgLight: "#E0F2F1",
    avatarLetter: "M",
    description:
      "Evalúa costos de adquisición, proyecta retornos sobre inversión y traduce métricas complejas en decisiones simples.",
    longDescription:
      "Metric supervisa la salud financiera de tus iniciativas. Modela escenarios de rentabilidad publicitaria, analiza la relación CAC/LTV y te ayuda a asignar presupuestos con fundamentos numéricos.",
    skills: [
      "Cálculo de CAC, LTV y ROAS objetivo",
      "Modelado de presupuestos publicitarios",
      "Análisis de punto de equilibrio (Break-even)",
      "Reportes de rendimiento simplificados",
    ],
    tools: ["Módulo Ingresos", "Recharts Dashboard", "Simulador CAC", "Plan Pro"],
    samplePrompt:
      "Si mi costo por producto es de $18 USD y el precio de venta es de $65 USD, ¿cuál es el CAC máximo que puedo pagar en Meta Ads para mantener un margen neto del 30%?",
    sampleOutput:
      "Margen bruto: $47 USD (72.3%)\nMargen neto deseado (30%): $19.50 USD\nCostos operativos estimados (10%): $6.50 USD\nCAC Máximo Permitido: $21.00 USD (ROAS mínimo: 3.1x)",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const Agentes = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const filteredAgents =
    selectedCategory === "all"
      ? AGENTS
      : AGENTS.filter((a) => a.category === selectedCategory);

  const handleCopyPrompt = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2200);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-miiles-pink-light selection:text-black">
      {/* Barra de navegación superior */}
      <LandingNavbar
        cta={
          <Link
            to="/register"
            className="flex items-center gap-2 text-xs font-normal px-5 py-2 rounded-full bg-black text-white hover:bg-miiles-pink hover:text-black transition-all duration-300 hover:scale-105"
          >
            <span>Crear cuenta</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* HERO SECTION */}
      <header className="relative pt-36 md:pt-48 pb-20 md:pb-28 px-6 md:px-12 max-w-6xl mx-auto text-center">
        {/* Badge superior */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-miiles-gray-50 border border-miiles-gray-200/80 mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-miiles-blue animate-pulse" />
          <span className="text-[11px] font-normal tracking-wide text-miiles-gray-600">
            Inteligencia Artificial Especializada en Miiles
          </span>
        </motion.div>

        {/* Título Principal */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-4xl sm:text-5xl md:text-7xl font-normal tracking-tight text-black leading-[1.08] max-w-4xl mx-auto mb-6"
        >
          Tu equipo autónomo de IA.{" "}
          <span
            style={{
              fontFamily: "'Welth Catritz', serif",
              fontStyle: "italic",
            }}
            className="font-normal block sm:inline text-black"
          >
            Especializado, ágil y sin fricción.
          </span>
        </motion.h1>

        {/* Subtítulo descriptivo */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg md:text-xl font-light text-miiles-gray-600 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Diseñamos agentes de inteligencia artificial para operar en cada área
          estratégica de tu marca. Investigan, generan contenido de alto
          rendimiento, optimizan ventas y ejecutan flujos de trabajo en tus
          tableros.
        </motion.p>

        {/* Acciones principales */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-normal bg-black text-white hover:bg-miiles-pink hover:text-black transition-all duration-300 hover:scale-105 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Comenzar gratis con Miiles</span>
          </Link>
          <a
            href="#catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-normal bg-miiles-gray-50 text-black border border-miiles-gray-200 hover:bg-miiles-gray-100 transition-all duration-300"
          >
            <SlidersHorizontal className="w-4 h-4 text-miiles-gray-600" />
            <span>Explorar catálogo de agentes</span>
          </a>
        </motion.div>

        {/* Métricas / Puntos clave */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-12 border-t border-miiles-gray-100 max-w-4xl mx-auto"
        >
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-normal text-black">6+</p>
            <p className="text-xs font-light text-miiles-gray-400">
              Roles especializados listos
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-normal text-black">24/7</p>
            <p className="text-xs font-light text-miiles-gray-400">
              Ejecución continua en tableros
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-normal text-black">100%</p>
            <p className="text-xs font-light text-miiles-gray-400">
              Adaptado a la voz de tu marca
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-normal text-black">0</p>
            <p className="text-xs font-light text-miiles-gray-400">
              Líneas de código requeridas
            </p>
          </div>
        </motion.div>
      </header>

      {/* CATÁLOGO DE AGENTES */}
      <section
        id="catalogo"
        className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto border-t border-miiles-gray-100"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-normal tracking-widest uppercase text-miiles-blue">
              Catálogo de Agentes
            </span>
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-black">
              Selecciona el agente ideal para cada tarea.
            </h2>
            <p className="text-sm md:text-base font-light text-miiles-gray-600">
              Cada agente domina un conjunto concreto de habilidades, herramientas
              y criterios para entregarte soluciones listas sin pérdida de tiempo.
            </p>
          </div>

          {/* Filtros por categoría */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-normal transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "bg-black text-white shadow-sm"
                    : "bg-miiles-gray-50 text-miiles-gray-600 hover:bg-miiles-gray-100 border border-miiles-gray-200/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Cards de Agentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <motion.div
              key={agent.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="group relative rounded-[24px] border border-miiles-gray-200 bg-white p-6 md:p-8 flex flex-col justify-between hover:border-black/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              <div>
                {/* Cabecera de la Card */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-normal text-lg shadow-sm"
                      style={{
                        backgroundColor: agent.bgLight,
                        color: agent.color,
                      }}
                    >
                      {agent.avatarLetter}
                    </div>
                    <div>
                      <h3 className="text-lg font-normal text-black flex items-center gap-1.5">
                        {agent.name}
                      </h3>
                      <p className="text-xs font-light text-miiles-gray-400">
                        {agent.codename}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-normal uppercase tracking-wider px-3 py-1 rounded-full border border-miiles-gray-200 bg-miiles-gray-50 text-miiles-gray-600"
                  >
                    {agent.tag}
                  </span>
                </div>

                {/* Rol */}
                <p className="text-xs font-normal text-miiles-blue mb-2.5">
                  {agent.role}
                </p>

                {/* Descripción */}
                <p className="text-sm font-light text-miiles-gray-600 leading-relaxed mb-6">
                  {agent.description}
                </p>

                {/* Habilidades destacadas */}
                <div className="space-y-2 mb-6">
                  <p className="text-[11px] font-normal uppercase tracking-wider text-miiles-gray-400">
                    Capacidades principales:
                  </p>
                  <ul className="space-y-1.5">
                    {agent.skills.slice(0, 3).map((skill, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-xs font-light text-miiles-gray-800"
                      >
                        <Check className="w-3.5 h-3.5 text-miiles-blue shrink-0" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botón para interactuar / ver detalle */}
              <div className="pt-6 border-t border-miiles-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveAgent(agent)}
                  className="text-xs font-normal text-black hover:text-miiles-blue transition-colors flex items-center gap-1.5"
                >
                  <span>Ver perfil y prompt</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => handleCopyPrompt(agent.samplePrompt, agent.id)}
                  title="Copiar prompt de ejemplo"
                  className="p-2 rounded-full hover:bg-miiles-gray-100 transition-colors text-miiles-gray-600"
                >
                  {copiedPromptId === agent.id ? (
                    <Check className="w-4 h-4 text-miiles-blue" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA EN MIILES */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-miiles-gray-50 border-y border-miiles-gray-200/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-normal tracking-widest uppercase text-miiles-blue">
              Flujo de Trabajo
            </span>
            <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-black">
              Cómo trabajan tus agentes en Miiles.
            </h2>
            <p className="text-sm md:text-base font-light text-miiles-gray-600">
              Integrar un agente a tu día a día no requiere complejas
              configuraciones técnicas. Todo ocurre visualmente en tu espacio de
              trabajo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-[24px] bg-white border border-miiles-gray-200 p-8 space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-miiles-blue-light text-miiles-blue flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <p className="text-xs font-normal text-miiles-gray-400">Paso 01</p>
              <h3 className="text-lg font-normal text-black">
                Asigna el agente a tu tablero
              </h3>
              <p className="text-xs md:text-sm font-light text-miiles-gray-600 leading-relaxed">
                Selecciona al especialista que necesitas según el reto: crear
                contenido, auditar una tienda o planificar un lanzamiento de
                marca.
              </p>
            </div>

            <div className="rounded-[24px] bg-white border border-miiles-gray-200 p-8 space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-miiles-pink-light text-black flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <p className="text-xs font-normal text-miiles-gray-400">Paso 02</p>
              <h3 className="text-lg font-normal text-black">
                Comparte contexto y objetivos
              </h3>
              <p className="text-xs md:text-sm font-light text-miiles-gray-600 leading-relaxed">
                El agente adopta la voz de tu marca, tus restricciones de
                presupuesto y tus metas comerciales sin que tengas que
                recordárselas.
              </p>
            </div>

            <div className="rounded-[24px] bg-white border border-miiles-gray-200 p-8 space-y-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 text-black flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <p className="text-xs font-normal text-miiles-gray-400">Paso 03</p>
              <h3 className="text-lg font-normal text-black">
                Ejecuta y colabora en vivo
              </h3>
              <p className="text-xs md:text-sm font-light text-miiles-gray-600 leading-relaxed">
                Recibe propuestas terminadas directamente sobre tus tarjetas y
                tableros. Ajusta con un clic y aprueba solo lo que te encante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN SEGURIDAD Y CONTROL */}
      <section className="py-20 md:py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="rounded-[32px] border border-miiles-gray-200 p-8 md:p-14 flex flex-col md:flex-row items-center gap-10 bg-white shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-miiles-gray-50 border border-miiles-gray-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8 text-black" />
          </div>
          <div className="space-y-3 flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-normal text-black tracking-tight">
              Tú siempre tienes la última palabra.
            </h3>
            <p className="text-sm md:text-base font-light text-miiles-gray-600 leading-relaxed">
              Los agentes de Miiles están programados para asistir, sugerir y
              elaborar borradores de nivel profesional. Ningún contenido se
              publica ni ninguna modificación se aplica sin tu confirmación
              explícita.
            </p>
          </div>
          <Link
            to="/register"
            className="shrink-0 rounded-full bg-black text-white px-7 py-3 text-xs font-normal hover:bg-miiles-pink hover:text-black transition-all duration-300 hover:scale-105"
          >
            Probar la plataforma
          </Link>
        </div>
      </section>

      {/* CALL TO ACTION FINAL */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-normal text-black tracking-tight leading-tight">
          Comienza a trabajar con tu nuevo equipo de agentes.
        </h2>
        <p className="text-base sm:text-lg font-light text-miiles-gray-600 max-w-xl mx-auto">
          Crea tu cuenta en Miiles y descubre cómo la inteligencia artificial
          especializada transforma el ritmo de crecimiento de tu empresa.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 text-sm font-normal bg-black text-white hover:bg-miiles-pink hover:text-black transition-all duration-300 hover:scale-105 shadow-md"
          >
            <span>Crear cuenta gratuita</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/precios"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-normal bg-white text-black border border-miiles-gray-200 hover:bg-miiles-gray-50 transition-all duration-300"
          >
            Ver planes y precios
          </Link>
        </div>
      </section>

      {/* MODAL DETALLE DE AGENTE */}
      <AnimatePresence>
        {activeAgent && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveAgent(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-white rounded-[28px] border border-miiles-gray-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10 space-y-6"
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setActiveAgent(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-miiles-gray-100 transition-colors text-miiles-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Perfil del agente */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-normal text-2xl shadow-sm shrink-0"
                  style={{
                    backgroundColor: activeAgent.bgLight,
                    color: activeAgent.color,
                  }}
                >
                  {activeAgent.avatarLetter}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-normal text-black">
                      {activeAgent.name}
                    </h3>
                    <span className="text-[10px] uppercase font-normal tracking-wider px-2.5 py-0.5 rounded-full bg-miiles-gray-100 text-miiles-gray-600">
                      {activeAgent.codename}
                    </span>
                  </div>
                  <p className="text-xs font-normal text-miiles-blue mt-0.5">
                    {activeAgent.role}
                  </p>
                </div>
              </div>

              {/* Descripción detallada */}
              <p className="text-sm font-light text-miiles-gray-800 leading-relaxed">
                {activeAgent.longDescription}
              </p>

              {/* Herramientas que integra */}
              <div className="space-y-2">
                <p className="text-xs font-normal uppercase tracking-wider text-miiles-gray-400">
                  Herramientas y Entornos Integrados:
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeAgent.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-miiles-gray-50 border border-miiles-gray-200 text-xs font-light text-miiles-gray-800"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Habilidades completas */}
              <div className="space-y-2">
                <p className="text-xs font-normal uppercase tracking-wider text-miiles-gray-400">
                  Habilidades Clave:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeAgent.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs font-light text-miiles-gray-800 p-2 rounded-lg bg-miiles-gray-50/70"
                    >
                      <Check className="w-3.5 h-3.5 text-miiles-blue shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prompt de Ejemplo */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-normal uppercase tracking-wider text-miiles-gray-400">
                    Prompt de instrucción de ejemplo:
                  </p>
                  <button
                    onClick={() =>
                      handleCopyPrompt(activeAgent.samplePrompt, "modal")
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-miiles-blue hover:underline"
                  >
                    {copiedPromptId === "modal" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-miiles-gray-50 border border-miiles-gray-200 text-xs font-mono text-miiles-gray-800 whitespace-pre-wrap leading-relaxed select-all">
                  {activeAgent.samplePrompt}
                </div>
              </div>

              {/* Resultado simulado */}
              <div className="space-y-2">
                <p className="text-xs font-normal uppercase tracking-wider text-miiles-gray-400">
                  Ejemplo de respuesta / entregable:
                </p>
                <div className="p-4 rounded-xl bg-miiles-blue-light/30 border border-miiles-blue-light text-xs font-light text-miiles-gray-800 whitespace-pre-wrap leading-relaxed">
                  {activeAgent.sampleOutput}
                </div>
              </div>

              {/* Botón de acción */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-miiles-gray-100">
                <button
                  onClick={() => setActiveAgent(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-normal text-miiles-gray-600 hover:text-black transition-colors"
                >
                  Cerrar
                </button>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-normal hover:bg-miiles-pink hover:text-black transition-all duration-300 hover:scale-105"
                >
                  <span>Probar con {activeAgent.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
};

export default Agentes;

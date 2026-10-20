import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Copy, ShieldCheck, X } from "lucide-react";

const MCP_URL = `https://${import.meta.env["VITE_SUPABASE_PROJECT_ID"]}.supabase.co/functions/v1/mcp`;

const AGENTS = [
  {
    name: "Claude",
    steps: [
      "Abre Claude y ve a Ajustes → Conectores.",
      "Toca «Agregar conector personalizado».",
      "Ponle de nombre Miiles y pega el enlace.",
      "Inicia sesión con tu cuenta de Miiles y acepta.",
    ],
    config: MCP_URL,
    configLabel: "Copiar enlace de Miiles",
  },
  {
    name: "Cursor",
    steps: [
      "Abre Cursor → Settings → MCP.",
      "Toca «Add new MCP server».",
      "Pega la configuración que copiaste.",
      "Inicia sesión con tu cuenta de Miiles y acepta.",
    ],
    config: JSON.stringify({ mcpServers: { miiles: { url: MCP_URL } } }, null, 2),
    configLabel: "Copiar configuración",
  },
  {
    name: "Otro agente",
    steps: [
      "Busca en tu agente la opción «Agregar servidor MCP».",
      "Elige el tipo de conexión por enlace (HTTP).",
      "Pega el enlace de Miiles.",
      "Inicia sesión con tu cuenta de Miiles y acepta.",
    ],
    config: MCP_URL,
    configLabel: "Copiar enlace de Miiles",
  },
] as const;

const CAN = [
  "Ver el catálogo de plantillas de Miiles Estudio.",
  "Consultar el detalle de una plantilla y sus enlaces de vista previa.",
  "Trabajar con tu cuenta, solo con lo que tú autorizas.",
];

const CANNOT = [
  "Ver tu contraseña o tu método de inicio de sesión.",
  "Ver datos, tableros o plantillas de otras personas.",
  "Editar ni publicar una página tuya: eso todavía se hace dentro de Miiles.",
];

const EXAMPLES = [
  "¿Qué plantillas de portafolio tiene Miiles Estudio?",
  "Muéstrame los detalles de la plantilla Aura y su vista previa.",
  "Compara Minimalist y Gallery: ¿cuál me sirve para un fotógrafo de producto?",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const ConectaIA = () => {
  const [copied, setCopied] = useState("");
  const timerRef = useRef<number | null>(null);

  const handleCopy = async (text: string, key: string) => {
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
    setCopied(key);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95vw] md:w-max z-[100]">
        <nav className="flex items-center justify-between gap-10 px-6 md:px-8 py-2.5 rounded-full backdrop-blur-md bg-white/80 border border-neutral-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <Link to="/" className="flex items-center shrink-0">
            <img src="/logotipo.svg" alt="Miiles" className="h-5 w-auto" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-normal px-5 py-2.5 rounded-full bg-black text-white transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Inicio
          </Link>
        </nav>
      </header>

      <main className="pt-36 md:pt-44 pb-24 px-6 md:px-12 max-w-4xl mx-auto space-y-14">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center space-y-5"
        >
          <motion.h1
            variants={fadeUp}
            className="text-3xl md:text-5xl font-normal tracking-tight text-black"
          >
            Conecta tu IA a Miiles
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-sm md:text-base font-light text-miiles-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Una sola vez, en un minuto: tu asistente podrá consultar las plantillas
            de Miiles Estudio y ayudarte a armar tu portafolio o tu embudo de ventas.
          </motion.p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-6"
        >
          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl font-normal text-black">Paso 1 · Elige tu agente</h2>
            <p className="text-sm font-light text-miiles-gray-600">
              Copia el enlace y sigue los cuatro pasos. Después inicia sesión con tu cuenta de Miiles.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {AGENTS.map((agent) => (
              <div
                key={agent.name}
                className="flex flex-col rounded-[24px] border border-miiles-gray-200 bg-miiles-gray-50 p-6"
              >
                <h3 className="text-base font-normal text-black">{agent.name}</h3>
                <ol className="mt-4 space-y-2.5">
                  {agent.steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm font-light leading-5 text-miiles-gray-600">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-miiles-gray-200 text-[10px] text-miiles-gray-800">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <button
                  onClick={() => handleCopy(agent.config, agent.name)}
                  className={`mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-normal transition-all duration-300 hover:scale-105 ${
                    copied === agent.name ? "bg-miiles-blue text-white" : "bg-black text-white hover:bg-miiles-pink"
                  }`}
                >
                  {copied === agent.name ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === agent.name ? "¡Copiado!" : agent.configLabel}
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="rounded-[24px] border border-miiles-gray-200 bg-white p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.06)]"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-miiles-blue" />
            <h2 className="text-lg font-normal text-black">Qué puede y qué no puede hacer tu agente</h2>
          </div>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <ul className="space-y-3">
              {CAN.map((item) => (
                <li key={item} className="flex gap-3 text-sm font-light leading-5 text-miiles-gray-800">
                  <Check className="h-4 w-4 shrink-0 text-miiles-blue mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <ul className="space-y-3">
              {CANNOT.map((item) => (
                <li key={item} className="flex gap-3 text-sm font-light leading-5 text-miiles-gray-400">
                  <X className="h-4 w-4 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl font-normal text-black">Paso 2 · Pide tu plantilla</h2>
            <p className="text-sm font-light text-miiles-gray-600">
              Ya conectado, prueba con alguna de estas preguntas en el chat de tu agente.
            </p>
          </div>
          <div className="rounded-[24px] border border-miiles-gray-200 bg-miiles-gray-50 p-6 md:p-8 space-y-4">
            {EXAMPLES.map((example) => (
              <div key={example} className="flex items-start gap-3">
                <p className="flex-1 text-sm font-light leading-5 text-miiles-gray-800 select-all">{example}</p>
                <button
                  onClick={() => handleCopy(example, example)}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-normal transition-all duration-300 ${
                    copied === example ? "bg-miiles-blue text-white" : "bg-white border border-miiles-gray-200 text-miiles-gray-600 hover:bg-black hover:text-white"
                  }`}
                >
                  {copied === example ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === example ? "Copiado" : "Copiar"}
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="rounded-[24px] border border-miiles-gray-200 bg-miiles-gray-50 p-6 md:p-8 text-center space-y-3"
        >
          <h2 className="text-lg font-normal text-black">¿Todavía no tienes cuenta?</h2>
          <p className="text-sm font-light text-miiles-gray-600 max-w-xl mx-auto">
            La conexión se hace con tu cuenta de Miiles, así que primero créala o entra
            para poder autorizar a tu agente.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Link
              to="/register"
              className="inline-flex items-center rounded-full bg-black px-6 py-3 text-sm font-normal text-white transition-all duration-300 hover:bg-miiles-pink hover:scale-105"
            >
              Crear cuenta
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full border border-miiles-gray-200 bg-white px-6 py-3 text-sm font-normal text-black transition-all duration-300 hover:scale-105"
            >
              Entrar
            </Link>
          </div>
        </motion.section>
      </main>

      <footer className="pb-10 px-6">
        <p className="text-center text-xs font-light text-miiles-gray-400">
          © {new Date().getFullYear()} Miiles ·{" "}
          <Link to="/privacidad" className="hover:opacity-50">Privacidad</Link> ·{" "}
          <Link to="/terminos" className="hover:opacity-50">Términos</Link>
        </p>
      </footer>
    </div>
  );
};

export default ConectaIA;

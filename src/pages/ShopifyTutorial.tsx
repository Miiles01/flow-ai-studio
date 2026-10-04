import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Copy } from "lucide-react";
import videoAsset from "@/assets/shopify-ai.mp4.asset.json";

const PROMPT = `Hola, necesito que te conectes a mi tienda de Shopify para editarla desde aquí.

Datos:

•  Sitio:

•  Tema publicado:

•  Carpeta de trabajo:

Quiero que hagas esto paso a paso, explicando brevemente cada paso:

1.  Revisa si Shopify CLI está instalado (shopify version). Si no lo está o falla la actualización por permisos, dime el comando con sudo para que yo lo corra.

2.  Descarga el tema con shopify theme pull a la carpeta de trabajo. Yo inicio sesión en el navegador; tú nunca escribas credenciales.

3.  Dime qué secciones tiene la página de inicio (templates/index.json).

4.  Haz este cambio: en el título del hero, cambia "hecho para ti" por "hecho para todos".

5.  Corre shopify theme dev para que yo vea la vista previa, sin tocar la tienda publicada.

6.  Cuando yo te lo confirme, sube SOLO el archivo modificado al tema publicado con:

   shopify theme push --only templates/index.json --allow-live --nodelete

7.  No hagas push sin mi confirmación explícita. Consulta https://shopify.dev/docs/api/shopify-cli para mayor entendimiento`;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const ShopifyTutorial = () => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = PROMPT;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
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
        {/* Hero */}
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
            Conecta Shopify con tu asistente
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-sm md:text-base font-light text-miiles-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Gestiona tu tienda en línea más fácil: este asistente te ayuda a
            editarla y hacer cualquier cambio. Ya no necesitas hacer cambios
            manuales, simplemente le das tu instrucción y se ejecuta.
          </motion.p>
        </motion.section>

        {/* Video */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="rounded-[24px] overflow-hidden border border-miiles-gray-200 shadow-[0_24px_70px_rgba(0,0,0,0.12)] bg-black">
            <video
              src={videoAsset.url}
              controls
              playsInline
              preload="metadata"
              className="w-full aspect-[3024/1896] object-contain bg-black"
            />
          </div>
          <p className="mt-4 text-xs font-light text-miiles-gray-400 text-center">
            Tutorial: cómo conectar Shopify con tu asistente de Miiles
          </p>
        </motion.section>

        {/* Prompt copiable */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-5"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-xl md:text-2xl font-normal text-black">
                Prompt para copiar
              </h2>
              <p className="text-sm font-light text-miiles-gray-600">
                Copia este prompt, completa tus datos (sitio, tema y carpeta) y
                pégalo en tu asistente.
              </p>
            </div>
            <button
              onClick={handleCopy}
              className={`shrink-0 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-normal transition-all duration-300 hover:scale-105 ${
                copied
                  ? "bg-miiles-blue text-white"
                  : "bg-black text-white hover:bg-miiles-pink"
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "¡Copiado!" : "Copiar prompt"}
            </button>
          </div>

          <div className="rounded-[24px] border border-miiles-gray-200 bg-miiles-gray-50 p-6 md:p-8">
            <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-miiles-gray-800 select-all">
{PROMPT}
            </pre>
          </div>
        </motion.section>
      </main>

      <footer className="pb-10 px-6">
        <p className="text-center text-xs font-light text-miiles-gray-400">
          © {new Date().getFullYear()} Miiles
        </p>
      </footer>
    </div>
  );
};

export default ShopifyTutorial;

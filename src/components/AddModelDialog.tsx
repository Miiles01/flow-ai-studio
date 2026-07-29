import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Eye, EyeOff, ExternalLink, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { AI_PROVIDERS, AIProvider, AIProviderId } from "@/lib/aiModels";

type Props = {
  open: boolean;
  onClose: () => void;
  initialProvider?: AIProviderId | null;
  onSave: (provider: AIProviderId, model: string, apiKey: string) => void;
};

export default function AddModelDialog({ open, onClose, initialProvider, onSave }: Props) {
  const { isDark } = useTheme();
  const [provider, setProvider] = useState<AIProvider | null>(null);
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (!open) return;
    const p = initialProvider ? AI_PROVIDERS.find((x) => x.id === initialProvider) ?? null : null;
    setProvider(p);
    setModel(p?.models[0] ?? "");
    setApiKey("");
    setShowKey(false);
  }, [open, initialProvider]);

  function pick(p: AIProvider) {
    setProvider(p);
    setModel(p.models[0]);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    const key = apiKey.trim();
    const mdl = model.trim();
    if (!mdl) return toast.error("Elige o escribe un modelo");
    if (key.length < 10) return toast.error("Ingresa una API Key válida");
    onSave(provider.id, mdl, key);
    toast.success(`${provider.name} conectado`);
    onClose();
  }

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
    isDark
      ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-white/25"
      : "bg-white border border-black/10 text-black placeholder:text-black/30 focus:border-black/30"
  }`;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] shadow-2xl"
            style={{ background: isDark ? "#0c0d12" : "#ffffff" }}
          >
            <div className="flex items-center gap-2 px-6 pt-6">
              {provider && !initialProvider && (
                <button
                  onClick={() => setProvider(null)}
                  className={`-ml-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    isDark ? "text-white/60 hover:bg-white/10" : "text-black/50 hover:bg-black/5"
                  }`}
                  aria-label="Volver"
                >
                  <ArrowLeft size={16} strokeWidth={1.5} />
                </button>
              )}
              <div className="flex-1">
                <h2 className={`text-xl font-normal ${isDark ? "text-white" : "text-black"}`}>
                  {provider ? `Conectar ${provider.name}` : "Agregar modelo"}
                </h2>
                <p className={`mt-1 text-xs font-light ${isDark ? "text-white/40" : "text-black/40"}`}>
                  {provider
                    ? "Usa tu propia API Key para generar flujos y editar widgets."
                    : "Elige el proveedor de IA que quieres usar en el canvas."}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isDark ? "text-white/60 hover:bg-white/10" : "text-black/50 hover:bg-black/5"
                }`}
                aria-label="Cerrar"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {!provider ? (
              <div className="p-4 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  {AI_PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => pick(p)}
                      className={`flex flex-col items-start gap-1 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                        isDark
                          ? "border-white/10 hover:bg-white/5 text-white"
                          : "border-black/10 hover:bg-miiles-gray-50 text-black"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-normal">
                        <Sparkles size={13} strokeWidth={1.5} className="opacity-60" />
                        {p.name}
                      </span>
                      <span className={`text-[11px] font-light ${isDark ? "text-white/35" : "text-black/35"}`}>
                        {p.models[0]}
                      </span>
                    </button>
                  ))}
                </div>
                <div
                  className={`mt-3 flex gap-2.5 rounded-2xl px-4 py-3 ${
                    isDark ? "bg-white/5" : "bg-miiles-gray-50"
                  }`}
                >
                  <ShieldCheck size={15} strokeWidth={1.5} className={isDark ? "text-white/50 mt-0.5 shrink-0" : "text-black/40 mt-0.5 shrink-0"} />
                  <p className={`text-[11px] font-light leading-snug ${isDark ? "text-white/45" : "text-black/45"}`}>
                    Tu API Key se guarda únicamente en este navegador y se envía cifrada solo al generar.
                    Si no agregas ninguna, seguimos usando el modelo de Miiles.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="p-6 pt-4 space-y-4">
                <div>
                  <label className={`mb-1.5 block text-xs font-light ${isDark ? "text-white/50" : "text-black/50"}`}>
                    Modelo
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {provider.models.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setModel(m)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-light transition-colors ${
                          model === m
                            ? isDark
                              ? "bg-white text-black"
                              : "bg-black text-white"
                            : isDark
                            ? "bg-white/10 text-white/60 hover:bg-white/15"
                            : "bg-miiles-gray-100 text-miiles-gray-600 hover:bg-miiles-gray-200"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="nombre-del-modelo"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={`mb-1.5 block text-xs font-light ${isDark ? "text-white/50" : "text-black/50"}`}>
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      type={showKey ? "text" : "password"}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder={provider.keyPlaceholder}
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                        isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"
                      }`}
                      aria-label={showKey ? "Ocultar" : "Mostrar"}
                    >
                      {showKey ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                    </button>
                  </div>
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-2 inline-flex items-center gap-1 text-[11px] font-light ${
                      isDark ? "text-white/40 hover:text-white/70" : "text-black/40 hover:text-black/70"
                    }`}
                  >
                    {provider.keyHint} <ExternalLink size={11} strokeWidth={1.5} />
                  </a>
                </div>

                <button
                  type="submit"
                  className={`w-full rounded-full py-3 text-sm font-normal transition-colors ${
                    isDark
                      ? "bg-black text-white border border-white/10 hover:bg-zinc-900"
                      : "bg-black text-white hover:bg-miiles-pink"
                  }`}
                >
                  Guardar y activar
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

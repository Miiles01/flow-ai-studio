import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Server, Globe, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import type { ConnectorType, NewUserApp } from "@/hooks/useUserApps";

const schema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre a tu app").max(60, "Máximo 60 caracteres"),
  connector_type: z.enum(["mcp", "api"]),
  url: z
    .string()
    .trim()
    .url("Ingresa una URL válida")
    .startsWith("https://", "La URL debe empezar con https://")
    .max(500, "URL demasiado larga"),
  api_key: z.string().trim().max(2000).optional(),
});

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (app: NewUserApp) => Promise<void>;
};

export default function AddAppModal({ open, onClose, onCreate }: Props) {
  const { isDark } = useTheme();
  const [name, setName] = useState("");
  const [type, setType] = useState<ConnectorType>("mcp");
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setName("");
    setType("mcp");
    setUrl("");
    setApiKey("");
  }

  function handleClose() {
    if (saving) return;
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ name, connector_type: type, url, api_key: apiKey || undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }
    setSaving(true);
    try {
      await onCreate({
        name: parsed.data.name,
        connector_type: parsed.data.connector_type,
        url: parsed.data.url,
        api_key: parsed.data.api_key ?? null,
      });
      toast.success("App agregada");
      reset();
      onClose();
    } catch {
      toast.error("No se pudo agregar la app");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
    isDark
      ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-white/25"
      : "bg-miiles-gray-50 border border-miiles-gray-200 text-black placeholder:text-miiles-gray-400 focus:border-miiles-gray-400"
  }`;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={`relative z-10 w-full max-w-md overflow-hidden rounded-[28px] shadow-2xl p-6 md:p-8 ${
              isDark ? "bg-[#15161d] border border-white/10" : "bg-white"
            }`}
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <h2 className={`text-xl font-normal ${isDark ? "text-white" : "text-black"}`}>Agregar app</h2>
            <p className={`mt-1 text-sm font-light ${isDark ? "text-white/50" : "text-miiles-gray-400"}`}>
              Conecta un servidor MCP o una API para que la IA pueda usar tus herramientas.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className={`mb-1.5 block text-xs font-light ${isDark ? "text-white/60" : "text-miiles-gray-600"}`}>
                  Nombre
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mi conector"
                  className={inputClass}
                  maxLength={60}
                />
              </div>

              <div>
                <label className={`mb-1.5 block text-xs font-light ${isDark ? "text-white/60" : "text-miiles-gray-600"}`}>
                  Tipo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: "mcp" as ConnectorType, label: "Servidor MCP", icon: Server },
                    { key: "api" as ConnectorType, label: "API / Endpoint", icon: Globe },
                  ]).map(({ key, label, icon: Icon }) => {
                    const active = type === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setType(key)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm transition-colors border ${
                          active
                            ? isDark
                              ? "bg-white text-black border-white"
                              : "bg-black text-white border-black"
                            : isDark
                              ? "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                              : "bg-miiles-gray-50 text-miiles-gray-600 border-miiles-gray-200 hover:bg-miiles-gray-100"
                        }`}
                      >
                        <Icon size={15} strokeWidth={1.5} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={`mb-1.5 block text-xs font-light ${isDark ? "text-white/60" : "text-miiles-gray-600"}`}>
                  URL {type === "mcp" ? "del servidor MCP" : "de la API"}
                </label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`mb-1.5 block text-xs font-light ${isDark ? "text-white/60" : "text-miiles-gray-600"}`}>
                  API key / token <span className="opacity-50">(opcional)</span>
                </label>
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors ${
                  isDark
                    ? "bg-white text-black hover:bg-white/90 disabled:opacity-50"
                    : "bg-black text-white hover:bg-miiles-pink disabled:opacity-50"
                }`}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Agregar app
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

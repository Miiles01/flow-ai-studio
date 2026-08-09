import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Server, Globe, Loader2, Plus, Trash2, ArrowLeft, Boxes } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import type { ConnectorType, NewUserApp, UserApp } from "@/hooks/useUserApps";

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

type CatalogApp = {
  id: string;
  name: string;
  category: string;
  desc: string;
  connector_type: ConnectorType;
  url: string;
  keyLabel: string;
  keyHint: string;
  logo: string;
};

const CATALOG: CatalogApp[] = [
  {
    id: "gmail",
    name: "Gmail",
    category: "Correo",
    desc: "Lee, busca y redacta correos desde tus flujos.",
    connector_type: "api",
    url: "https://gmail.googleapis.com/gmail/v1",
    keyLabel: "Access token de Google",
    keyHint: "Genera un token OAuth con el scope gmail.readonly o gmail.modify.",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=gmail.com",
  },
  {
    id: "apify",
    name: "Apify",
    category: "Scraping",
    desc: "Ejecuta actors y extrae datos de la web automáticamente.",
    connector_type: "api",
    url: "https://api.apify.com/v2",
    keyLabel: "API token de Apify",
    keyHint: "Lo encuentras en apify.com → Settings → Integrations.",
    logo: "https://www.google.com/s2/favicons?sz=64&domain=apify.com",
  },
];


type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (app: NewUserApp) => Promise<void>;
  customApps: UserApp[];
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
};

export default function AddAppModal({ open, onClose, onCreate, customApps, onToggle, onDelete }: Props) {
  const { isDark } = useTheme();
  const [view, setView] = useState<"list" | "form" | "market">("market");
  const [name, setName] = useState("");
  const [type, setType] = useState<ConnectorType>("mcp");
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [keyLabel, setKeyLabel] = useState<string | null>(null);
  const [keyHint, setKeyHint] = useState<string | null>(null);

  useEffect(() => {
    if (open) setView(customApps.length === 0 ? "market" : "list");
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps


  function resetForm() {
    setName("");
    setType("mcp");
    setUrl("");
    setApiKey("");
    setKeyLabel(null);
    setKeyHint(null);
  }

  function pickCatalog(app: CatalogApp) {
    setName(app.name);
    setType(app.connector_type);
    setUrl(app.url);
    setApiKey("");
    setKeyLabel(app.keyLabel);
    setKeyHint(app.keyHint);
    setView("form");
  }


  function handleClose() {
    if (saving) return;
    resetForm();
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
      resetForm();
      setView("list");
    } catch {
      toast.error("No se pudo agregar la app");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
    isDark
      ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-white/25"
      : "bg-white/90 border border-black/10 text-black placeholder:text-black/30 focus:border-black/30"
  }`;

  const navCards = [
    {
      key: "market" as const,
      icon: Boxes,
      title: "Populares",
      desc: "Explora apps sugeridas y conéctalas en un clic.",
    },
    {
      key: "form" as const,
      icon: Plus,
      title: "Conectar otra",
      desc: "Agrega manualmente un servidor MCP o una API.",
    },
  ];


  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          data-app-modal="true"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
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
            className="relative z-10 w-full max-w-4xl max-h-[90vh] md:max-h-none md:h-[560px] overflow-hidden rounded-[28px] shadow-2xl flex flex-col md:grid md:grid-cols-[42%_58%]"
            style={{ background: isDark ? "#000000" : "#7E7E7E" }}
          >
            <button
              onClick={handleClose}
              className={`absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center transition-opacity opacity-70 hover:opacity-100 ${
                isDark ? "text-white" : "text-black"
              }`}
              aria-label="Cerrar"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {/* Left panel — info */}
            <div className="p-6 md:p-10 flex flex-col flex-shrink-0">
              <h2 className="text-2xl md:text-4xl font-normal leading-tight text-white pr-10 md:pr-0">
                Conecta otras aplicaciones
              </h2>
              <p className="mt-3 text-sm font-light text-white/60">
                Suma herramientas externas para que la IA pueda usarlas dentro de tus flujos.
              </p>

              <div className="mt-6 md:mt-10 flex flex-col gap-3">
                {navCards.map((c) => {
                  const active = view === c.key || (c.key === "form" && view === "form");
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => { if (c.key === "form") resetForm(); setView(c.key); }}
                      className={`flex gap-3 text-left rounded-2xl p-4 transition-colors border ${
                        active
                          ? "bg-white/15 border-white/25"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <c.icon size={16} strokeWidth={1.5} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{c.title}</p>
                        <p className="text-xs font-light text-white/50 leading-snug">{c.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Right panel — list / form */}
            <div
              className="flex flex-col flex-grow min-h-0 m-3 md:my-4 md:mr-4 rounded-[22px] overflow-hidden"
              style={{ background: isDark ? "#0c0d12" : "#f4f4f6" }}
            >
              {view === "list" ? (
                <div className="flex flex-col h-full min-h-0">
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <h3 className={`text-base font-normal ${isDark ? "text-white" : "text-black"}`}>
                      Conectadas
                    </h3>
                    <button
                      onClick={() => { resetForm(); setView("market"); }}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                        isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-miiles-pink"
                      }`}
                    >
                      <Plus size={14} strokeWidth={2} /> Agregar nuevo
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4 scrollbar-hide">
                    {customApps.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center h-full py-10 px-6">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                          <Boxes size={20} strokeWidth={1.5} className={isDark ? "text-white/50" : "text-black/40"} />
                        </div>
                        <p className={`mt-3 text-sm font-normal ${isDark ? "text-white" : "text-black"}`}>
                          Aún no tienes apps conectadas
                        </p>
                        <p className={`mt-1 text-xs font-light ${isDark ? "text-white/40" : "text-black/40"}`}>
                          Agrega un servidor MCP o una API para empezar.
                        </p>
                      </div>
                    ) : (
                      customApps.map((app) => (
                        <div
                          key={app.id}
                          className={`group flex items-center gap-3 px-3 py-3 rounded-xl ${
                            isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isDark ? "bg-white/10" : "bg-black/5"
                            }`}
                          >
                            {app.connector_type === "mcp" ? (
                              <Server size={14} strokeWidth={1.5} className={isDark ? "text-white/60" : "text-black/50"} />
                            ) : (
                              <Globe size={14} strokeWidth={1.5} className={isDark ? "text-white/60" : "text-black/50"} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`truncate text-sm font-normal ${isDark ? "text-white" : "text-black"}`}>
                              {app.name}
                            </p>
                            <p className={`truncate text-[11px] font-light ${isDark ? "text-white/40" : "text-black/40"}`}>
                              {app.connector_type === "mcp" ? "Servidor MCP" : "API"}
                            </p>
                          </div>
                          <button
                            onClick={() => onDelete(app.id)}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                              isDark ? "text-white/40" : "text-black/30"
                            } hover:text-red-400`}
                            aria-label="Eliminar"
                          >
                            <Trash2 size={15} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => onToggle(app.id, !app.enabled)}
                            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                              app.enabled ? "bg-miiles-blue" : isDark ? "bg-white/15" : "bg-black/15"
                            }`}
                            aria-label="Activar"
                          >
                            <span
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                                app.enabled ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : view === "market" ? (
                <div className="flex flex-col h-full min-h-0">
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div>
                      <h3 className={`text-base font-normal ${isDark ? "text-white" : "text-black"}`}>
                        Populares
                      </h3>
                      <p className={`text-[11px] font-light ${isDark ? "text-white/40" : "text-black/40"}`}>
                        Elige una app y completa tus datos.
                      </p>
                    </div>
                    {customApps.length > 0 && (
                      <button
                        onClick={() => setView("list")}
                        className={`rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                          isDark ? "bg-white/10 text-white hover:bg-white/15" : "bg-black/5 text-black hover:bg-black/10"
                        }`}
                      >
                        Conectadas ({customApps.length})
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 scrollbar-hide grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                    {CATALOG.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => pickCatalog(app)}
                        className={`text-left rounded-2xl p-4 border transition-colors ${
                          isDark
                            ? "bg-white/5 border-white/10 hover:bg-white/10"
                            : "bg-white border-black/5 hover:bg-black/[0.03] shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={app.logo}
                            alt=""
                            className="h-8 w-8 rounded-lg object-contain bg-white/80 p-1"
                            onError={(e) => ((e.currentTarget.style.visibility = "hidden"))}
                          />
                          <div className="min-w-0">
                            <p className={`truncate text-sm font-normal ${isDark ? "text-white" : "text-black"}`}>
                              {app.name}
                            </p>
                            <p className={`truncate text-[11px] font-light ${isDark ? "text-white/40" : "text-black/40"}`}>
                              {app.category}
                            </p>
                          </div>
                        </div>
                        <p className={`mt-3 text-xs font-light leading-snug ${isDark ? "text-white/50" : "text-black/50"}`}>
                          {app.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (

                <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                  <div className="flex items-center gap-2 px-5 pt-5 pb-1">
                    <button
                      type="button"
                      onClick={() => setView(keyLabel ? "market" : customApps.length > 0 ? "list" : "market")}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                        isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-black/5 text-black/60"
                      }`}
                      aria-label="Volver"
                    >
                      <ArrowLeft size={16} />
                    </button>

                    <h3 className={`text-base font-normal ${isDark ? "text-white" : "text-black"}`}>
                      Nueva conexión
                    </h3>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4 scrollbar-hide">
                    <div>
                      <label className={`mb-1.5 block text-xs font-light ${isDark ? "text-white/60" : "text-black/60"}`}>
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
                      <label className={`mb-1.5 block text-xs font-light ${isDark ? "text-white/60" : "text-black/60"}`}>
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
                                    : "bg-white/80 text-black/60 border-black/10 hover:bg-white"
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
                      <label className={`mb-1.5 block text-xs font-light ${isDark ? "text-white/60" : "text-black/60"}`}>
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
                      <label className={`mb-1.5 block text-xs font-light ${isDark ? "text-white/60" : "text-black/60"}`}>
                        {keyLabel ?? "API key / token"} <span className="opacity-50">(opcional)</span>
                      </label>
                      <input
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="••••••••"
                        type="password"
                        className={inputClass}
                      />
                      {keyHint && (
                        <p className={`mt-1.5 text-[11px] font-light ${isDark ? "text-white/40" : "text-black/40"}`}>
                          {keyHint}
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="px-5 pb-5 pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors ${
                        isDark
                          ? "bg-white text-black hover:bg-white/90 disabled:opacity-50"
                          : "bg-black text-white hover:bg-miiles-pink disabled:opacity-50"
                      }`}
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                      Agregar app
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, ShieldCheck, Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";
import { AI_PROVIDERS, type AIProviderId, type UserModel, maskKey } from "@/lib/aiModels";
import { Switch } from "@/components/ui/switch";
import { PROVIDER_LOGOS, PROVIDER_COLORS } from "@/components/ProviderLogos";

interface Props {
  open: boolean;
  onClose: () => void;
  initialProvider?: AIProviderId | null;
  onSave: (provider: AIProviderId, model: string, apiKey: string) => void;
  models: UserModel[];
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

export default function ModelManagerDialog({
  open,
  onClose,
  initialProvider,
  onSave,
  models,
  onDelete,
  onToggle,
}: Props) {
  const { isDark } = useTheme();

  // Right panel state
  const [provider, setProvider] = useState<(typeof AI_PROVIDERS)[0] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Init from initialProvider
  useEffect(() => {
    if (open) {
      if (initialProvider) {
        const p = AI_PROVIDERS.find((x) => x.id === initialProvider) ?? null;
        setProvider(p);
        setModel(p?.models[0] ?? "");
      } else {
        setProvider(null);
        setModel("");
      }
      setApiKey("");
      setShowKey(false);
      setEditingId(null);
      setDeleteConfirm(null);
    }
  }, [open, initialProvider]);

  const startEdit = (m: UserModel) => {
    const p = AI_PROVIDERS.find((x) => x.id === m.provider) ?? null;
    setProvider(p);
    setModel(m.model);
    setApiKey(m.apiKey);
    setEditingId(m.id);
    setShowKey(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !model.trim() || !apiKey.trim()) return;
    onSave(provider.id, model.trim(), apiKey.trim());
    setProvider(null);
    setModel("");
    setApiKey("");
    setEditingId(null);
  };

  const cancelForm = () => {
    setProvider(null);
    setModel("");
    setApiKey("");
    setEditingId(null);
  };

  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const panelBg = isDark ? "bg-white/[0.04]" : "bg-gray-50";
  const borderCls = isDark ? "border-white/8" : "border-black/8";
  const rowHover = isDark ? "hover:bg-white/5" : "hover:bg-black/[0.03]";
  const inputCls = `w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors border ${
    isDark
      ? "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/25"
      : "bg-white border-black/10 text-black placeholder:text-black/30 focus:border-black/30"
  }`;
  const subtle = isDark ? "text-white/40" : "text-black/40";
  const labelCls = `block mb-1.5 text-xs font-light ${subtle}`;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            role="dialog"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className={`relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] shadow-2xl border ${borderCls}`}
            style={{ background: bg }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${borderCls}`}>
              <div>
                <h2 className={`text-base font-medium ${isDark ? "text-white" : "text-black"}`}>
                  Modelos de IA
                </h2>
                <p className={`text-xs mt-0.5 font-light ${subtle}`}>
                  Administra tus claves y elige qué modelos usar en el canvas
                </p>
              </div>
              <button
                onClick={onClose}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isDark ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-black/40 hover:bg-black/5 hover:text-black"
                }`}
              >
                <X size={15} strokeWidth={1.5} />
              </button>
            </div>

            {/* Two columns */}
            <div className="flex min-h-[360px]">
              {/* ─── LEFT: list of configured models ─── */}
              <div className={`w-[46%] border-r ${borderCls} flex flex-col`}>
                <p className={`px-4 pt-3 pb-2 text-[11px] font-medium uppercase tracking-wider ${subtle}`}>
                  Tus modelos
                </p>
                <div className="flex-1 overflow-y-auto px-2 pb-3">
                  {models.length === 0 ? (
                    <div className={`mx-2 mt-2 rounded-2xl px-4 py-6 text-center ${panelBg}`}>
                      <p className={`text-sm font-light ${subtle}`}>Aún no tienes modelos</p>
                      <p className={`mt-1 text-xs font-light ${isDark ? "text-white/25" : "text-black/25"}`}>
                        Agrega uno desde el panel derecho
                      </p>
                    </div>
                  ) : (
                    models.map((m) => {
                      const prov = AI_PROVIDERS.find((x) => x.id === m.provider);
                      const Logo = PROVIDER_LOGOS[m.provider];
                      const colors = PROVIDER_COLORS[m.provider];
                      const isEditing = editingId === m.id;
                      return (
                        <div
                          key={m.id}
                          className={`group flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors ${rowHover} ${
                            isEditing ? (isDark ? "bg-white/5" : "bg-black/[0.04]") : ""
                          }`}
                        >
                          {Logo && (
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                isDark ? colors?.darkBg ?? "bg-white/10" : colors?.bg ?? "bg-gray-100"
                              }`}
                            >
                              <Logo
                                className={`w-3.5 h-3.5 ${isDark ? colors?.darkText ?? "text-white" : colors?.text ?? "text-gray-700"}`}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-[12.5px] font-normal truncate ${isDark ? "text-white" : "text-black"}`}>
                              {prov?.name ?? m.provider}
                            </p>
                            <p className={`text-[10.5px] font-light truncate ${subtle}`}>
                              {m.model} · {maskKey(m.apiKey)}
                            </p>
                          </div>
                          <Switch
                            checked={m.enabled}
                            onCheckedChange={(v) => onToggle(m.id, v)}
                          />
                          <button
                            onClick={() => startEdit(m)}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity ${subtle} hover:${isDark ? "text-white" : "text-black"}`}
                            title="Editar"
                          >
                            <Pencil size={12} strokeWidth={1.5} />
                          </button>
                          {deleteConfirm === m.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => { onDelete(m.id); setDeleteConfirm(null); if (editingId === m.id) cancelForm(); }}
                                className="text-[10px] text-red-500 font-medium px-1.5 py-0.5 rounded hover:bg-red-500/10 transition-colors"
                              >
                                Borrar
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${subtle} hover:${isDark ? "bg-white/10" : "bg-black/5"}`}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(m.id)}
                              className={`opacity-0 group-hover:opacity-100 transition-opacity ${subtle} hover:text-red-400`}
                              title="Eliminar"
                            >
                              <Trash2 size={12} strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Security note */}
                <div className={`mx-3 mb-3 flex gap-2 rounded-xl px-3 py-2.5 ${panelBg}`}>
                  <ShieldCheck size={13} strokeWidth={1.5} className={`${subtle} mt-0.5 shrink-0`} />
                  <p className={`text-[10.5px] font-light leading-snug ${isDark ? "text-white/35" : "text-black/35"}`}>
                    Tus claves se guardan solo en este navegador y se envían cifradas.
                  </p>
                </div>
              </div>

              {/* ─── RIGHT: add / edit form ─── */}
              <div className="flex-1 flex flex-col">
                {!provider ? (
                  <>
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                      <p className={`text-[11px] font-medium uppercase tracking-wider ${subtle}`}>
                        {editingId ? "Editar modelo" : "Agregar modelo"}
                      </p>
                    </div>
                    <div className="flex-1 px-3 pb-3">
                      <div className="grid grid-cols-2 gap-2">
                        {AI_PROVIDERS.map((p) => {
                          const Logo = PROVIDER_LOGOS[p.id];
                          const colors = PROVIDER_COLORS[p.id];
                          return (
                            <button
                              key={p.id}
                              onClick={() => { setProvider(p); setModel(p.models[0]); }}
                              className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                                isDark
                                  ? "border-white/10 hover:bg-white/5 text-white"
                                  : "border-black/8 hover:bg-gray-50 text-black"
                              }`}
                            >
                              {Logo && (
                                <div
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                    isDark ? colors?.darkBg ?? "bg-white/10" : colors?.bg ?? "bg-gray-100"
                                  }`}
                                >
                                  <Logo
                                    className={`w-3.5 h-3.5 ${isDark ? colors?.darkText ?? "text-white" : colors?.text ?? "text-gray-700"}`}
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-[12.5px] font-normal">{p.name}</p>
                                <p className={`text-[10.5px] font-light truncate ${subtle}`}>{p.models[0]}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleSave} className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelForm}
                        className={`-ml-1 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                          isDark ? "text-white/50 hover:bg-white/10" : "text-black/40 hover:bg-black/5"
                        }`}
                      >
                        <ArrowLeft size={14} strokeWidth={1.5} />
                      </button>
                      {(() => {
                        const Logo = PROVIDER_LOGOS[provider.id];
                        const colors = PROVIDER_COLORS[provider.id];
                        return Logo ? (
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isDark ? colors?.darkBg ?? "bg-white/10" : colors?.bg ?? "bg-gray-100"}`}>
                            <Logo className={`w-3.5 h-3.5 ${isDark ? colors?.darkText ?? "text-white" : colors?.text ?? "text-gray-700"}`} />
                          </div>
                        ) : null;
                      })()}
                      <p className={`text-sm font-medium ${isDark ? "text-white" : "text-black"}`}>
                        {editingId ? `Editar ${provider.name}` : `Conectar ${provider.name}`}
                      </p>
                    </div>

                    {/* Model selector */}
                    <div>
                      <label className={labelCls}>Modelo</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {provider.models.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setModel(m)}
                            className={`rounded-full px-3 py-1 text-[11px] font-light transition-colors ${
                              model === m
                                ? isDark ? "bg-white text-black" : "bg-black text-white"
                                : isDark ? "bg-white/10 text-white/60 hover:bg-white/15" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                      <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="o escribe un nombre de modelo" className={inputCls} />
                    </div>

                    {/* API Key */}
                    <div>
                      <label className={labelCls}>API Key</label>
                      <div className="relative">
                        <input
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          type={showKey ? "text" : "password"}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder={provider.keyPlaceholder}
                          className={`${inputCls} pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey((v) => !v)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${subtle}`}
                        >
                          {showKey ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                        </button>
                      </div>
                      <a
                        href={provider.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-light ${subtle} hover:opacity-70`}
                      >
                        {provider.keyHint} ↗
                      </a>
                    </div>

                    <button
                      type="submit"
                      className={`mt-auto w-full rounded-full py-2.5 text-sm font-normal transition-colors ${
                        isDark
                          ? "bg-white text-black hover:bg-white/90"
                          : "bg-black text-white hover:bg-neutral-800"
                      }`}
                    >
                      {editingId ? "Guardar cambios" : "Guardar y activar"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

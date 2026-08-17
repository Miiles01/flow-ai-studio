import { useState } from "react";
import { LayoutGrid, Plus, Trash2, Server, Globe, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserApps } from "@/hooks/useUserApps";
import { useUserModels } from "@/hooks/useUserModels";
import { AI_PROVIDERS, AIProviderId, getProvider, maskKey } from "@/lib/aiModels";
import AddModelDialog from "@/components/AddModelDialog";
import AddAppModal from "@/components/AddAppModal";


function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

type AppsMenuProps = {
  isDark: boolean;
};

const AppsMenu = ({ isDark }: AppsMenuProps) => {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [presetProvider, setPresetProvider] = useState<AIProviderId | null>(null);
  const { customApps, webSearchEnabled, createApp, toggleApp, toggleWebSearch, deleteApp } = useUserApps();
  const { models, addModel, toggleModel, deleteModel } = useUserModels();
  useTheme();

  const rowText = isDark ? "text-white" : "text-black";
  const subText = isDark ? "text-white/40" : "text-miiles-gray-400";
  const sectionLabel = `px-3 pt-2 pb-1 text-[11px] font-medium ${
    isDark ? "text-white/50" : "text-gray-500"
  }`;

  const openModelDialog = (p: AIProviderId | null) => {
    setPresetProvider(p);
    setOpen(false);
    setModelOpen(true);
  };

  return (
    <>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 bg-white/10 h-10 px-4 rounded-full cursor-pointer hover:bg-white/20 transition-all group"
          >
            <LayoutGrid size={15} strokeWidth={1.5} className="text-white transition-colors" />
            <span className="text-[13px] font-light text-white transition-colors tracking-wider">
              Apps
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={12}
          className={`w-80 p-2 rounded-2xl border shadow-2xl ${
            isDark ? "bg-[#15161d] border-white/10" : "bg-white border-miiles-gray-200"
          }`}
        >
          <div className="max-h-[380px] overflow-y-auto scrollbar-hide">
            {/* ─── Modelos ─────────────────────────────────────────── */}
            <p className={sectionLabel}>Modelos</p>

            {models.map((m) => {
              const p = getProvider(m.provider);
              return (
                <div key={m.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-xl">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                      isDark ? "bg-white/10" : "bg-miiles-gray-100"
                    }`}
                  >
                    <Sparkles size={13} strokeWidth={1.5} className={subText} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`truncate text-sm font-normal ${rowText}`}>{p?.name ?? m.provider}</p>
                    <p className={`truncate text-[11px] font-light ${subText}`}>
                      {m.model} · {maskKey(m.apiKey)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteModel(m.id)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${subText} hover:text-red-400`}
                    aria-label="Eliminar modelo"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                  <Switch checked={m.enabled} onCheckedChange={(v) => toggleModel(m.id, v)} />
                </div>
              );
            })}

            <div className="flex flex-wrap gap-1.5 px-3 pb-1 pt-1">
              {AI_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openModelDialog(p.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-light transition-colors ${
                    isDark
                      ? "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                      : "bg-miiles-gray-100 text-miiles-gray-600 hover:bg-miiles-gray-200"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => openModelDialog(null)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isDark ? "hover:bg-white/5 text-white" : "hover:bg-miiles-gray-50 text-black"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                  isDark ? "bg-white/10" : "bg-miiles-gray-100"
                }`}
              >
                <Plus size={14} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-normal">Agregar modelo</p>
                <p className={`text-[11px] font-light ${subText}`}>
                  {models.some((m) => m.enabled) ? "Usando tu propia API Key" : "Usa tu propia API Key"}
                </p>
              </div>
            </button>

            {/* ─── Herramientas ────────────────────────────────────── */}
            <p className={`${sectionLabel} mt-1`}>Herramientas</p>

            {false && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                <GoogleIcon className="w-6 h-6 shrink-0" />
                <span className={`flex-1 text-sm font-normal ${rowText}`}>Búsqueda en la web</span>
                <Switch checked={webSearchEnabled} onCheckedChange={toggleWebSearch} />
              </div>
            )}



            {customApps.map((app) => (
              <div key={app.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-xl">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                    isDark ? "bg-white/10" : "bg-miiles-gray-100"
                  }`}
                >
                  {app.connector_type === "mcp" ? (
                    <Server size={13} strokeWidth={1.5} className={subText} />
                  ) : (
                    <Globe size={13} strokeWidth={1.5} className={subText} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`truncate text-sm font-normal ${rowText}`}>{app.name}</p>
                  <p className={`truncate text-[11px] font-light ${subText}`}>
                    {app.connector_type === "mcp" ? "Servidor MCP" : "API"}
                  </p>
                </div>
                <button
                  onClick={() => deleteApp(app.id)}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${subText} hover:text-red-400`}
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
                <Switch checked={app.enabled} onCheckedChange={(v) => toggleApp(app.id, v)} />
              </div>
            ))}
          </div>

          <div className={`mt-1 border-t pt-1 ${isDark ? "border-white/10" : "border-miiles-gray-100"}`}>
            <button
              disabled
              onClick={() => {
                setOpen(false);
                setAddOpen(true);
              }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-colors opacity-50 cursor-not-allowed ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                  isDark ? "bg-white/10" : "bg-miiles-gray-100"
                }`}
              >
                <Plus size={14} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-normal flex-1 text-left">Agregar app</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
                Próximamente
              </span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <AddAppModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={createApp}
        customApps={customApps}
        onToggle={toggleApp}
        onDelete={deleteApp}
      />

      <AddModelDialog
        open={modelOpen}
        onClose={() => setModelOpen(false)}
        initialProvider={presetProvider}
        onSave={addModel}
      />

    </>
  );
};

export default AppsMenu;

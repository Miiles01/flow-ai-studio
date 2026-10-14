import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Monitor, Tablet, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { downloadTemplateZip, KIND_LABEL, type StudioTemplate as T } from "@/lib/studio";

export default function StudioTemplate() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [t, setT] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    const onR = () => setVw(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  // Dispositivos disponibles según la pantalla actual
  const devices = (vw >= 1024 ? ["desktop", "tablet", "mobile"] : vw >= 640 ? ["tablet", "mobile"] : ["mobile"]) as Array<"desktop" | "tablet" | "mobile">;
  const activeDevice = devices.includes(device) ? device : devices[0];
  const frameWidth = { desktop: "100%", tablet: "820px", mobile: "390px" }[activeDevice];
  const DEVICE_ICON = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };
  const DEVICE_LABEL = { desktop: "Escritorio", tablet: "Tablet", mobile: "Móvil" };

  useEffect(() => {
    supabase.from("studio_templates").select("*").eq("slug", slug ?? "").maybeSingle().then(({ data }) => {
      setT(data as T | null);
      setLoading(false);
    });
  }, [slug]);

  const goBack = () => navigate("/studio");

  /* Botonera flotante estilo canvas: pill con título y acción, reacciona al dark mode */
  const pill = isDark ? "bg-black ring-1 ring-white/10" : "bg-white ring-1 ring-gray-200 shadow-sm";
  const iconBtn = `w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
    isDark ? "text-[#9CA3AF] hover:bg-white/10 hover:text-white" : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
  }`;
  const getBtn = isDark
    ? "bg-white text-black hover:bg-white/90"
    : "bg-black text-white hover:bg-black/90";

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <p className={`text-sm font-light ${isDark ? "text-white/60" : "text-muted-foreground"}`}>Cargando…</p>
      </div>
    );

  if (!t)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className={`text-sm font-light ${isDark ? "text-white" : "text-foreground"}`}>No encontramos esta plantilla.</p>
        <button onClick={goBack} className={`px-5 py-2.5 text-sm rounded-full ${getBtn}`}>
          Volver al Estudio
        </button>
      </div>
    );

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Botonera izquierda: volver + título + descripción */}
      <div className={`fixed top-4 left-4 z-20 flex items-center gap-1.5 pl-1.5 pr-4 py-1.5 rounded-[28px] select-none max-w-[calc(100vw-10rem)] md:max-w-[420px] ${pill}`}>
        <button onClick={goBack} aria-label="Volver" className={`${iconBtn} shrink-0`}>
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div className="pl-1 flex flex-col items-start leading-tight min-w-0">
          <span className={`text-sm truncate w-full ${isDark ? "text-white" : "text-foreground"}`}>{t.title}</span>
          <span className={`text-[11px] font-light truncate w-full ${isDark ? "text-white/50" : "text-miiles-gray-400"}`}>
            {t.description || (KIND_LABEL[t.kind] ?? t.kind)}
          </span>
        </div>
      </div>

      {/* Botonera derecha: vistas responsivas + Obtener */}
      <div className={`fixed top-4 right-4 z-20 flex items-center gap-1 p-1.5 rounded-[28px] select-none ${pill}`}>
        {devices.length > 1 && (
          <>
            {devices.map((d) => {
              const Icon = DEVICE_ICON[d];
              const on = d === activeDevice;
              return (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  aria-label={DEVICE_LABEL[d]}
                  title={DEVICE_LABEL[d]}
                  className={`${iconBtn} ${on ? (isDark ? "bg-white/10 text-white" : "bg-[#F3F4F6] text-black") : ""}`}
                >
                  <Icon size={16} strokeWidth={1.5} />
                </button>
              );
            })}
            <div className={`w-px h-6 mx-1 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
          </>
        )}
        <button
          onClick={() => downloadTemplateZip(t)}
          className={`h-9 px-4 flex items-center gap-2 text-sm rounded-full transition-colors ${getBtn}`}
        >
          <Download size={15} strokeWidth={1.75} /> Obtener
        </button>
      </div>

      {/* Preview */}
      <div className={`flex-1 flex justify-center overflow-hidden ${activeDevice === "desktop" ? "" : `pt-20 pb-4 ${isDark ? "bg-[hsl(222,20%,8%)]" : "bg-miiles-gray-50"}`}`}>
        <iframe
          title={t.title}
          srcDoc={t.html}
          sandbox="allow-scripts"
          style={{ width: frameWidth, maxWidth: "100%" }}
          className={`h-full bg-white border-0 transition-[width] duration-300 ${activeDevice === "desktop" ? "" : "rounded-2xl shadow-md"}`}
        />
      </div>
    </div>
  );
}

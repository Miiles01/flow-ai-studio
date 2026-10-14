import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { downloadTemplateZip, KIND_LABEL, type StudioTemplate as T } from "@/lib/studio";

export default function StudioTemplate() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [t, setT] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

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
      {/* Botonera superior */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pl-1.5 pr-1.5 py-1.5 rounded-[28px] select-none ${pill}`}>
        <button onClick={goBack} aria-label="Volver" className={iconBtn}>
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div className="px-2 flex flex-col items-start leading-tight max-w-[40vw] md:max-w-[320px]">
          <span className={`text-sm truncate w-full ${isDark ? "text-white" : "text-foreground"}`}>{t.title}</span>
          <span className={`text-[10px] font-light ${isDark ? "text-white/50" : "text-miiles-gray-400"}`}>
            {KIND_LABEL[t.kind] ?? t.kind}
          </span>
        </div>
        <div className={`w-px h-6 mx-0.5 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
        <button
          onClick={() => downloadTemplateZip(t)}
          className={`h-9 px-4 flex items-center gap-2 text-sm rounded-full transition-colors ${getBtn}`}
        >
          <Download size={15} strokeWidth={1.75} /> Obtener
        </button>
      </div>

      {/* Preview a pantalla completa */}
      <div className="flex-1 pt-2">
        <iframe
          title={t.title}
          srcDoc={t.html}
          sandbox="allow-scripts"
          className="w-full h-full bg-white border-0"
        />
      </div>
    </div>
  );
}

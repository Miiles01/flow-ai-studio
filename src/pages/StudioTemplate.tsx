import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Download, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadTemplateZip, KIND_LABEL, type StudioTemplate as T } from "@/lib/studio";

export default function StudioTemplate() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [t, setT] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.from("studio_templates").select("*").eq("slug", slug ?? "").maybeSingle().then(({ data }) => {
      setT(data as T | null);
      setLoading(false);
    });
  }, [slug]);

  const copy = async () => {
    if (!t) return;
    await navigator.clipboard.writeText(t.html);
    setCopied(true);
    toast.success("Código copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  const primary = `rounded-full ${isDark ? "bg-black text-white border border-white/10 hover:bg-zinc-900" : "bg-black text-white hover:bg-miiles-pink"}`;

  if (loading) return <div className="p-8 md:pt-48 text-sm text-muted-foreground">Cargando…</div>;
  if (!t)
    return (
      <div className="p-8 md:pt-48 max-w-5xl mx-auto space-y-4">
        <p className="text-foreground">No encontramos esta plantilla.</p>
        <Button className={primary} onClick={() => navigate("/studio")}>Volver al Estudio</Button>
      </div>
    );

  return (
    <div className="p-4 md:px-12 md:pb-12 md:pt-40 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground font-light">{KIND_LABEL[t.kind] ?? t.kind}</p>
          <h1 className="text-2xl md:text-3xl font-normal text-foreground">{t.title}</h1>
          {t.description && <p className="text-sm font-light text-muted-foreground mt-1">{t.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "¡Copiado!" : "Copiar"}
          </Button>
          <Button className={primary} onClick={() => downloadTemplateZip(t)}>
            <Download className="h-4 w-4" /> Descargar
          </Button>
        </div>
      </div>

      <div className={`rounded-2xl overflow-hidden ${isDark ? "ring-1 ring-white/10" : "shadow-md"}`}>
        <div className={`flex items-center gap-3 px-4 py-2.5 ${isDark ? "bg-white/10" : "bg-miiles-gray-100"}`}>
          <button onClick={() => navigate("/studio")} aria-label="Volver" className="p-1 rounded-full hover:bg-background/60 text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 text-xs font-light text-muted-foreground bg-background rounded-full px-4 py-1.5 truncate">
            miiles.app/studio/{t.slug}
          </div>
          <button onClick={() => navigate("/studio")} aria-label="Salir" className="p-1 rounded-full hover:bg-background/60 text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <iframe title={t.title} srcDoc={t.html} sandbox="allow-scripts" className="w-full h-[70vh] bg-white border-0" />
      </div>
    </div>
  );
}

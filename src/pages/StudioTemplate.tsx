import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, Maximize2, Monitor, Tablet, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { usePageSeo } from "@/hooks/usePageSeo";
import { downloadTemplateZip, KIND_LABEL, type StudioTemplate as T } from "@/lib/studio";

type Device = "desktop" | "tablet" | "mobile";
const DEVICE_ICON = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };
const DEVICE_LABEL = { desktop: "Escritorio", tablet: "Tablet", mobile: "Móvil" };
const DESKTOP_WIDTH = 1440;
const DESKTOP_HEIGHT = 900;

export default function StudioTemplate() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fullscreen = searchParams.get("view") === "fullscreen";
  const { isDark } = useTheme();
  const [t, setT] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [vw, setVw] = useState(window.innerWidth);
  const [device, setDevice] = useState<Device>("desktop");
  const [previewWidth, setPreviewWidth] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  usePageSeo({
    title: t ? `${t.title} — Miiles Estudio` : "Plantillas — Miiles Estudio",
    description: t?.description || "Plantillas de portafolios y páginas web de Miiles Estudio.",
  });

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase.from("studio_templates").select("*").eq("slug", slug ?? "").maybeSingle().then(({ data }) => {
      if (cancelled) return;
      setT(data as T | null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setPreviewWidth(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [loading, fullscreen]);

  const devices: Device[] = vw >= 1024 ? ["desktop", "tablet", "mobile"] : vw >= 640 ? ["tablet", "mobile"] : ["mobile"];
  const activeDevice = devices.includes(device) ? device : devices[0];
  const frameWidth = { desktop: "100%", tablet: "820px", mobile: "390px" }[activeDevice];
  const setFullscreen = (enabled: boolean) => {
    const next = new URLSearchParams(searchParams);
    if (enabled) next.set("view", "fullscreen");
    else next.delete("view");
    setSearchParams(next);
  };
  const obtain = async () => {
    if (!t || downloading) return;
    setDownloading(true);
    setDownloadError("");
    try { await downloadTemplateZip(t); }
    catch { setDownloadError("No se pudo descargar la plantilla. Intenta de nuevo."); }
    finally { setDownloading(false); }
  };
  const pill = "rounded-full bg-card text-card-foreground border border-border shadow-sm";
  const iconBtn = "h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground";
  const getButton = (
    <Button onClick={obtain} disabled={downloading} size="sm" className="hover:translate-y-0">
      <Download size={15} strokeWidth={1.75} /> {downloading ? "Descargando…" : "Obtener"}
    </Button>
  );
  const frameProps = t ? {
    title: t.title,
    ...(t.preview_url ? { src: t.preview_url } : {}),
    srcDoc: t.preview_url ? undefined : `<style>html,body{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar,body::-webkit-scrollbar,*::-webkit-scrollbar{display:none}</style>${t.html}`,
    sandbox: "allow-scripts",
  } : {};

  return (
    <div className={`${isDark ? "dark" : ""} min-h-screen bg-background text-foreground`}>
      {loading ? (
        <div className="flex h-screen items-center justify-center"><p className="text-sm font-light text-muted-foreground">Cargando…</p></div>
      ) : !t ? (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <p className="text-sm font-light text-foreground">No encontramos esta plantilla.</p>
          <Button onClick={() => navigate("/studio")}>Volver al Estudio</Button>
        </div>
      ) : fullscreen ? (
        <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
          <div className={`fixed left-4 top-4 z-20 p-1.5 ${pill}`}>
            <Button variant="ghost" size="icon" onClick={() => setFullscreen(false)} aria-label="Volver a la plantilla" title="Volver a la plantilla" className={iconBtn}>
              <ArrowLeft size={18} strokeWidth={1.5} />
            </Button>
          </div>
          <div className={`fixed right-4 top-4 z-20 flex items-center gap-1 p-1.5 ${pill}`}>
            {devices.length > 1 && <>
              {devices.map((d) => {
                const Icon = DEVICE_ICON[d];
                return <Button key={d} variant="ghost" size="icon" onClick={() => setDevice(d)} aria-label={DEVICE_LABEL[d]} title={DEVICE_LABEL[d]} aria-pressed={d === activeDevice} className={`${iconBtn} ${d === activeDevice ? "bg-muted text-foreground" : ""}`}><Icon size={16} strokeWidth={1.5} /></Button>;
              })}
              <div className="mx-1 h-6 w-px bg-border" />
            </>}
            {getButton}
          </div>
          <div className={`flex flex-1 justify-center overflow-hidden ${activeDevice === "desktop" ? "" : "bg-muted pb-4 pt-20"}`}>
            <iframe {...frameProps} style={{ width: frameWidth, maxWidth: "100%" }} className={`h-full border-0 bg-background transition-[width] duration-300 motion-reduce:transition-none ${activeDevice === "desktop" ? "" : "rounded-2xl shadow-md"}`} />
          </div>
          {downloadError && <p role="alert" className="absolute bottom-4 left-4 right-4 bg-card p-3 text-sm text-destructive">{downloadError}</p>}
        </div>
      ) : (
        <main className="mx-auto max-w-6xl px-5 pb-12 pt-6 md:px-10 md:pt-8">
          <Button variant="ghost" onClick={() => navigate("/studio")} className="mb-7 -ml-3 text-muted-foreground hover:text-foreground"><ArrowLeft /> Estudio</Button>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-light text-muted-foreground">{KIND_LABEL[t.kind] ?? t.kind}</p>
              <h1 className="break-words text-2xl font-normal text-foreground md:text-3xl">{t.title}</h1>
            </div>
            <Button onClick={() => setFullscreen(true)} className="max-w-full hover:translate-y-0"><Maximize2 /> Ver en pantalla completa</Button>
          </div>
          <div ref={previewRef} className="relative aspect-[8/5] w-full overflow-hidden rounded-lg border border-border bg-muted">
            <iframe {...frameProps} tabIndex={-1} style={{ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT, transform: `scale(${previewWidth / DESKTOP_WIDTH})`, transformOrigin: "top left", visibility: previewWidth > 0 ? "visible" : "hidden" }} className="absolute left-0 top-0 border-0 bg-background" />
          </div>
          <section className="mt-7 flex flex-col items-start justify-between gap-6 sm:flex-row">
            <p className="max-w-3xl whitespace-pre-line text-sm font-light leading-7 text-muted-foreground">{t.description || `Plantilla de ${KIND_LABEL[t.kind]?.toLowerCase() ?? "página web"} disponible en Miiles Estudio.`}</p>
            <div className="shrink-0">{getButton}</div>
          </section>
          {downloadError && <p role="alert" className="mt-4 text-sm text-destructive">{downloadError}</p>}
        </main>
      )}
    </div>
  );
}

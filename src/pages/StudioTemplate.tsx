import { useTranslation } from "react-i18next";
import dashboardI18n from "@/i18n";
const dt = (key: string, options?: Record<string, unknown>): string => dashboardI18n.t(key, options) as string;
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, Maximize2, Monitor, Tablet, Smartphone } from "lucide-react";
import MiilesStar from "@/components/MiilesStar";
import UseTemplateDialog from "@/components/studio/UseTemplateDialog";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { usePageSeo } from "@/hooks/usePageSeo";
import { downloadTemplateZip, KIND_LABEL, STUDIO_TEMPLATES } from "@/lib/studio";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import antigravityLogo from "@/assets/ai-logos/antigravity.png.asset.json";
import codexLogo from "@/assets/ai-logos/codex.png.asset.json";
import cursorLogo from "@/assets/ai-logos/cursor.png.asset.json";

type Device = "desktop" | "tablet" | "mobile";
const DEVICE_ICON = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };

const DESKTOP_WIDTH = 1440;
const DESKTOP_HEIGHT = 900;

// Los logos van sin recorte: Claude y Antigravity llegan hasta la orilla y un redondeo les corta las puntas
const AI_TOOLS: { name: string; logo: string; rounded?: boolean }[] = [
  { name: "Claude", logo: "/logos/claude.svg" },
  { name: "Codex", logo: codexLogo.url },
  { name: "Cursor", logo: cursorLogo.url, rounded: true }, // su imagen es un cuadro: se redondea
  { name: "Antigravity", logo: antigravityLogo.url },
  { name: "DeepSeek", logo: "/logos/deepseek.svg" },
];





export default function StudioTemplate() {
const FAQ = [
  { q: dt("dashboard.text75"), a: dt("dashboard.text76") },
  { q: dt("dashboard.text77"), a: dt("dashboard.text78") },
  { q: dt("dashboard.text79"), a: dt("dashboard.text80") },
  { q: dt("dashboard.text81"), a: dt("dashboard.text82") },
  { q: dt("dashboard.text83"), a: dt("dashboard.text84") },
];
const STEPS = [
  dt("dashboard.text72"),
  dt("dashboard.openAi"),
  dt("dashboard.text73"),
  dt("dashboard.text74"),
];
const DEVICE_LABEL = { desktop: dt("dashboard.text69"), tablet: dt("dashboard.text70"), mobile: dt("dashboard.text71") };
  useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fullscreen = searchParams.get("view") === "fullscreen";
  const { isDark } = useTheme();
  const t = STUDIO_TEMPLATES.find((x) => x.slug === slug) ?? null;
  const loading = false;
  const [vw, setVw] = useState(window.innerWidth);
  const [device, setDevice] = useState<Device>("desktop");
  const [previewWidth, setPreviewWidth] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [useTemplateOpen, setUseTemplateOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  usePageSeo({
    title: t ? `${t.title} — Miiles Estudio` : "Plantillas — Miiles Estudio",
    description: t?.description || dt("dashboard.text85"),
  });

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setPreviewWidth(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [fullscreen]);

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
    catch { setDownloadError(dt("dashboard.text86")); }
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
      {t && <UseTemplateDialog template={t} open={useTemplateOpen} onOpenChange={setUseTemplateOpen} />}
      {loading ? (
        <div className="flex h-screen items-center justify-center"><p className="text-sm font-light text-muted-foreground">{dt("dashboard.text87")}</p></div>
      ) : !t ? (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <p className="text-sm font-light text-foreground">{dt("dashboard.text88")}</p>
          <Button onClick={() => navigate("/studio")}>{dt("dashboard.text89")}</Button>
        </div>
      ) : fullscreen ? (
        <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
          <div className={`fixed left-4 top-4 z-20 p-1.5 ${pill}`}>
            <Button variant="ghost" size="icon" onClick={() => setFullscreen(false)} aria-label={dt("dashboard.text90")} title={dt("dashboard.text90")} className={iconBtn}>
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
        <main className="mx-auto max-w-7xl px-5 pb-12 pt-6 md:px-8 md:pt-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => navigate("/studio")} className="-ml-3 text-muted-foreground hover:text-foreground"><ArrowLeft />  {dt("dashboard.text65")}</Button>
            <Button variant="outline" onClick={obtain} disabled={downloading} className="shrink-0 rounded-full hover:translate-y-0"><Download /> {downloading ? "Descargando…" : "Descargar"}</Button>
          </div>
          {downloadError && <p role="alert" className="mb-5 text-sm text-destructive">{downloadError}</p>}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Página + preguntas */}
            <div className="min-w-0 space-y-6">
              <div ref={previewRef} className="relative aspect-[8/5] w-full overflow-hidden rounded-[24px] border border-border bg-muted shadow-sm">
                {t.thumbnail_url ? (
                  <img src={t.thumbnail_url} alt={t.title} className="absolute inset-0 h-full w-full object-cover object-top" />
                ) : <iframe {...frameProps} tabIndex={-1} style={{ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT, transform: `scale(${previewWidth / DESKTOP_WIDTH})`, transformOrigin: "top left", visibility: previewWidth > 0 ? "visible" : "hidden" }} className="absolute left-0 top-0 border-0 bg-background" />}
              </div>
              <section className="rounded-[24px] border border-border bg-card p-6">
                <h2 className="mb-2 text-lg font-normal text-foreground">{dt("dashboard.text91")}</h2>
                <Accordion type="single" collapsible defaultValue="q0">
                  {FAQ.map((f, i) => (
                    <AccordionItem key={i} value={`q${i}`} className="border-border">
                      <AccordionTrigger className="text-left text-sm font-normal text-foreground hover:no-underline">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-sm font-light leading-6 text-muted-foreground">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            </div>

            {/* Información */}
            <aside className="h-fit space-y-6 rounded-[24px] border border-border bg-card p-6 lg:sticky lg:top-6">
              <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-light text-muted-foreground">{KIND_LABEL[t.kind] ?? t.kind}</span>
              <div>
                <h1 className="break-words text-2xl font-normal text-foreground md:text-3xl">{t.title}</h1>
                <p className="mt-3 whitespace-pre-line text-sm font-light leading-6 text-muted-foreground">{t.description || `Plantilla de ${KIND_LABEL[t.kind]?.toLowerCase() ?? dt("dashboard.text92")} disponible en Miiles Estudio.`}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button size="lg" onClick={() => setUseTemplateOpen(true)} className="h-12 w-full rounded-full hover:translate-y-0"><MiilesStar className="h-4 w-4" />  {dt("dashboard.text93")}</Button>
                {t.preview_url ? (
                  <Button asChild variant="outline" size="lg" className="w-full rounded-full hover:translate-y-0">
                    <a href={t.preview_url} target="_blank" rel="noopener noreferrer"><Maximize2 />  {dt("dashboard.text94")}</a>
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" onClick={() => setFullscreen(true)} className="w-full rounded-full hover:translate-y-0"><Maximize2 />  {dt("dashboard.text94")}</Button>
                )}
              </div>
              <div className="border-t border-border pt-5">
                <p className="text-sm font-normal text-foreground">{dt("dashboard.text95")}</p>
                <p className="mt-1 text-xs font-light text-muted-foreground">{dt("dashboard.text96")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {AI_TOOLS.map((a) => (
                    <span key={a.name} className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-light text-foreground">
                      <img src={a.logo} alt="" className={`h-4 w-4 shrink-0 object-contain ${a.rounded ? "rounded-full" : ""}`} /> {a.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-5">
                <p className="mb-3 text-sm font-normal text-foreground">{dt("dashboard.text97")}</p>
                <ol className="space-y-2 text-sm font-light leading-6 text-muted-foreground">
                  {STEPS.map((s, i) => (
                    <li key={i} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-foreground">{i + 1}</span>{s}</li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}

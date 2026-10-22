import { useTranslation } from "react-i18next";
import dashboardI18n from "@/i18n";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Check, Copy, Plus, ShieldCheck, X } from "lucide-react";
import MiilesStar from "@/components/MiilesStar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import type { StudioTemplate } from "@/lib/studio";

const dt = (key: string, options?: Record<string, unknown>): string => dashboardI18n.t(key, options) as string;
const MCP_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/mcp`;

// Los pasos son los mismos en Claude, Cursor y cualquier agente compatible con MCP
const CONNECT_STEPS = ["step1", "step2", "step3", "step4"] as const;

type Step = 1 | 2;

/** Paso 1: el pop-up «Agregar conector personalizado» con los dos campos ya llenos. */
function ConnectorIllustration({ isDark }: { isDark: boolean }) {
  const card = isDark ? "bg-[#1C1C1E] border-white/10" : "bg-white border-black/[0.06]";
  const field = isDark ? "bg-white/5 text-white" : "bg-[#F7F7F8] text-black";
  const bar = isDark ? "bg-white/10" : "bg-black/[0.07]";
  return (
    <div className={`w-full rounded-[22px] border p-6 shadow-[0_24px_60px_rgba(0,0,0,0.10)] ${card}`}>
      <div className="flex items-start justify-between">
        <p className="text-lg font-medium tracking-tight">{dt("dashboard.connectMcp.dialogTitle")}</p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${isDark ? "border-white/10" : "border-black/10"}`}><X size={13} strokeWidth={1.5} /></span>
      </div>
      {/* Esqueleto del texto introductorio */}
      <div className="mt-3 space-y-2"><div className={`h-2 w-11/12 rounded-full ${bar}`} /><div className={`h-2 w-7/12 rounded-full ${bar}`} /></div>
      <p className="mt-5 text-xs font-light text-muted-foreground">{dt("dashboard.connectMcp.nameLabel")}</p>
      <div className={`mt-1.5 rounded-xl px-3.5 py-2.5 text-[13px] ${field}`}>Miiles</div>
      <p className="mt-4 text-xs font-light text-muted-foreground">{dt("dashboard.connectMcp.urlLabel")}</p>
      <div className={`mt-1.5 break-all rounded-xl px-3.5 py-2.5 font-mono text-[11px] leading-5 ${field}`}>{MCP_URL}</div>
      <div className="mt-2 space-y-2"><div className={`h-2 w-10/12 rounded-full ${bar}`} /><div className={`h-2 w-6/12 rounded-full ${bar}`} /></div>
      {/* Esqueleto del aviso */}
      <div className="mt-6 space-y-2"><div className={`h-2 w-full rounded-full ${bar}`} /><div className={`h-2 w-11/12 rounded-full ${bar}`} /><div className={`h-2 w-8/12 rounded-full ${bar}`} /></div>
      <div className="relative mt-6 flex justify-end gap-2">
        <span className={`rounded-xl border px-4 py-2 text-[13px] ${isDark ? "border-white/10" : "border-black/10"}`}>{dt("dashboard.connectMcp.cancel")}</span>
        <span className={`rounded-xl px-4 py-2 text-[13px] font-medium ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>{dt("dashboard.connectMcp.continue")}</span>
        <svg className="absolute -bottom-3 right-6" width="16" height="19" viewBox="0 0 20 24" fill="none" aria-hidden="true">
          <path d="M0 0L0 20L5.5 14.5L9 22L11.5 21L8 13.5L15 13.5L0 0Z" fill="#111" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/** Paso 2: un chat de IA donde se pega el mensaje. */
function ChatIllustration({ isDark, prompt, active }: { isDark: boolean; prompt: string; active: boolean }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? prompt.length : 0);
  useEffect(() => {
    if (!active) return;
    if (reduce) { setShown(prompt.length); return; }
    setShown(0);
    let n = 0;
    const id = setInterval(() => {
      n += 6;
      setShown(Math.min(n, prompt.length));
      if (n >= prompt.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [active, prompt, reduce]);
  const bar = isDark ? "bg-white/10" : "bg-black/[0.07]";
  const done = shown >= prompt.length;
  return (
    <div className="w-full">
      {/* Saludo del asistente en esqueleto */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <MiilesStar className="h-7 w-7 text-primary" />
        <div className={`h-3 w-40 rounded-full ${bar}`} />
      </div>
      <div className={`rounded-[22px] border p-4 shadow-[0_24px_60px_rgba(0,0,0,0.10)] ${isDark ? "bg-[#1C1C1E] border-white/10" : "bg-white border-black/[0.06]"}`}>
        <p className="min-h-[150px] text-[12.5px] font-light leading-5 text-foreground">
          {prompt.slice(0, shown)}
          {!done && <span className="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 animate-pulse bg-foreground" />}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${isDark ? "border-white/10" : "border-black/10"}`}><Plus size={14} strokeWidth={1.5} /></span>
          <span className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${done ? (isDark ? "bg-white text-black" : "bg-black text-white") : (isDark ? "bg-white/10 text-white/40" : "bg-black/10 text-white")}`}><ArrowUp size={15} strokeWidth={2} /></span>
        </div>
      </div>
    </div>
  );
}

export default function UseTemplateDialog({ template, open, onOpenChange }: { template: StudioTemplate; open: boolean; onOpenChange: (open: boolean) => void }) {
  useTranslation();
  const { isDark } = useTheme();
  const [copied, setCopied] = useState<"" | "mcp" | "prompt">("");
  const [step, setStep] = useState<Step>(1);
  // Estado (no ref) para que el efecto se vuelva a conectar cuando Radix monta el contenido del pop-up
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const step2Ref = useRef<HTMLElement>(null);
  const prompt = dt("dashboard.dynamic269", { value1: template.title, value2: template.slug, value3: template.slug, value4: template.download_url || dt("dashboard.text251") });

  async function copy(text: string, kind: "mcp" | "prompt") {
    try { await navigator.clipboard.writeText(text); setCopied(kind); setTimeout(() => setCopied((c) => (c === kind ? "" : c)), 1800); }
    catch { toast.error(dt("dashboard.text252")); }
  }

  // La ilustración sigue al paso que estás leyendo: cambia al paso 2 cuando este llega a la mitad del pop-up
  useEffect(() => {
    if (!open) { setStep(1); return; }
    const el = scrollEl;
    if (!el) return;
    const onScroll = () => {
      const s2 = step2Ref.current;
      if (!s2) return;
      const box = el.getBoundingClientRect();
      setStep(s2.getBoundingClientRect().top < box.top + box.height * 0.55 ? 2 : 1);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [open, scrollEl]);

  const stepTitle = "flex items-center gap-3 text-base font-normal";
  const stepNum = `flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${isDark ? "bg-white text-black" : "bg-black text-white"}`;

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      ref={setScrollEl}
      hideClose
      className={`${isDark ? "dark" : ""} scrollbar-hide max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-[28px] bg-background p-6 text-foreground sm:p-8`}
    >
      {/* Cerrar: la misma píldora de los pop-ups de Widgets y Apps */}
      {/* Fija arriba a la derecha aunque se haga scroll */}
      <div className="pointer-events-none sticky top-0 z-50 -mb-px h-px">
      <DialogClose asChild>
        <button
          className={`pointer-events-auto absolute -right-2 -top-2 z-50 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-black"
          }`}
          aria-label={dt("dashboard.connectMcp.close")}
        >
          <span>{dt("dashboard.connectMcp.close")}</span>
          <X size={14} />
        </button>
      </DialogClose>
      </div>

      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        {/* Información */}
        <div className="min-w-0 space-y-8 md:pb-[28vh]">
          <DialogHeader className="space-y-3 text-left">
            <MiilesStar className="h-7 w-7 text-primary" />
            <DialogTitle className="text-2xl font-normal tracking-normal">{dt("dashboard.connectMcp.title")}</DialogTitle>
            <DialogDescription className="font-light">{template.title} {dt("dashboard.connectMcp.subtitle")}</DialogDescription>
          </DialogHeader>

          {/* Paso 1 */}
          <section className="space-y-4" onMouseEnter={() => setStep(1)} onFocusCapture={() => setStep(1)}>
            <h3 className={stepTitle}><span className={stepNum}>1</span>{dt("dashboard.connectMcp.connectTitle")}</h3>
            {/* El enlace completo a la vista: si no cabe, pasa a otra línea */}
            <div className={`flex items-center gap-3 rounded-2xl p-2 pl-4 ${isDark ? "bg-white/5" : "bg-[#F7F7F8]"}`}>
              <code className="min-w-0 flex-1 select-all break-all py-1 font-mono text-xs leading-5 text-foreground">{MCP_URL}</code>
              <Button size="sm" onClick={() => copy(MCP_URL, "mcp")} className="shrink-0 rounded-full hover:translate-y-0">
                {copied === "mcp" ? <Check /> : <Copy />}{copied === "mcp" ? dt("dashboard.connectMcp.copied") : dt("dashboard.connectMcp.copyLink")}
              </Button>
            </div>
            <ol className="space-y-2.5">
              {CONNECT_STEPS.map((k) => dt(`dashboard.connectMcp.${k}`)).map((s, i) => (
                <li key={s} className="flex gap-3 text-sm font-light leading-6">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px]">{i + 1}</span>{s}
                </li>
              ))}
            </ol>
            <div className="flex gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-xs leading-5 text-muted-foreground">{dt("dashboard.connectMcp.privacy")}</p>
            </div>
          </section>

          {/* Paso 2 */}
          <section ref={step2Ref} className="space-y-4" onMouseEnter={() => setStep(2)} onFocusCapture={() => setStep(2)}>
            <h3 className={stepTitle}><span className={stepNum}>2</span><label htmlFor="template-agent-prompt">{dt("dashboard.connectMcp.pasteTitle")}</label></h3>
            <textarea id="template-agent-prompt" readOnly value={prompt} className={`scrollbar-hide min-h-28 w-full resize-none rounded-2xl border-0 p-4 text-xs font-light leading-5 text-foreground outline-none ${isDark ? "bg-white/5" : "bg-[#F7F7F8]"}`} />
            <Button onClick={() => copy(prompt, "prompt")} className="h-11 w-full rounded-full hover:translate-y-0">
              {copied === "prompt" ? <Check /> : <Copy />}{copied === "prompt" ? dt("dashboard.connectMcp.messageCopied") : dt("dashboard.connectMcp.copyMessage")}
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">{dt("dashboard.connectMcp.publishNote")}</p>
          </section>
        </div>

        {/* Ilustración fija que cambia según el paso (solo en pantallas medianas en adelante) */}
        <div className="sticky top-0 hidden md:block">
          <div className={`relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-[24px] p-8 ${isDark ? "bg-white/[0.03]" : "bg-gradient-to-b from-[#FDFDFD] to-[#F1EFF6]"}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                className="w-full"
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 1 ? <ConnectorIllustration isDark={isDark} /> : <ChatIllustration isDark={isDark} prompt={prompt} active={step === 2} />}
              </motion.div>
            </AnimatePresence>
            <span className={`absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-light ${isDark ? "bg-white/10 text-white/70" : "bg-white text-black/60"}`}>{dt("dashboard.connectMcp.stepOf", { step })}</span>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}

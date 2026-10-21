import { useTranslation } from "react-i18next";
import dashboardI18n from "@/i18n";
const dt = (key: string, options?: Record<string, unknown>): string => dashboardI18n.t(key, options) as string;
import { useState } from "react";
import { Check, Copy, ShieldCheck } from "lucide-react";
import MiilesStar from "@/components/MiilesStar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import type { StudioTemplate } from "@/lib/studio";

const AGENTS = ["Claude", "Cursor", "Otro agente"] as const;
const MCP_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/mcp`;

export default function UseTemplateDialog({ template, open, onOpenChange }: { template: StudioTemplate; open: boolean; onOpenChange: (open: boolean) => void }) {
  useTranslation();
  const { isDark } = useTheme();
  const [agent, setAgent] = useState<typeof AGENTS[number]>("Claude");
  const [copied, setCopied] = useState<"" | "mcp" | "prompt">("");
const STEPS: Record<typeof AGENTS[number], { steps: string[]; copy: string; copyLabel: string }> = {
  Claude: {
    steps: [dt("dashboard.text241"), dt("dashboard.tapConnector"), dt("dashboard.text242"), dt("dashboard.text243")],
    copy: MCP_URL, copyLabel: dt("dashboard.text244"),
  },
  Cursor: {
    steps: [dt("dashboard.text245"), dt("dashboard.tapMcp"), dt("dashboard.text246"), dt("dashboard.text243")],
    copy: JSON.stringify({ mcpServers: { miiles: { url: MCP_URL } } }, null, 2), copyLabel: dt("dashboard.text247"),
  },
  "Otro agente": {
    steps: [dt("dashboard.text248"), dt("dashboard.text249"), dt("dashboard.text250"), dt("dashboard.text243")],
    copy: MCP_URL, copyLabel: dt("dashboard.text244"),
  },
};
  const guide = STEPS[agent];
  const prompt = dt("dashboard.dynamic269", { value1: template.title, value2: template.slug, value3: template.slug, value4: template.download_url || dt("dashboard.text251") });
  async function copy(text: string, kind: "mcp" | "prompt") {
    try { await navigator.clipboard.writeText(text); setCopied(kind); }
    catch { toast.error(dt("dashboard.text252")); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={`${isDark ? "dark" : ""} max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto bg-background text-foreground p-6 sm:p-8`}>
      <DialogHeader className="text-left space-y-3">
        <MiilesStar className="h-7 w-7 text-primary" />
        <DialogTitle className="text-2xl font-normal tracking-normal">{dt("dashboard.text253")}</DialogTitle>
        <DialogDescription className="font-light">{template.title}  {dt("dashboard.text254")}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap gap-2" aria-label={dt("dashboard.text255")}>
        {AGENTS.map((item) => <Button key={item} variant="ghost" aria-pressed={agent === item} onClick={() => { setAgent(item); setCopied(""); }} className={`rounded-full border border-border ${agent === item ? "bg-foreground text-background hover:bg-foreground hover:text-background" : "text-muted-foreground"}`}>{item === "Otro agente" ? dt("dashboard.text240") : item}</Button>)}
      </div>
      <div className="space-y-4 border-y border-border py-5">
        <p className="text-sm font-normal">{dt("dashboard.text256")} {agent}</p>
        <Button variant="outline" onClick={() => copy(guide.copy, "mcp")} className="w-full rounded-full">{copied === "mcp" ? <Check /> : <Copy />}{copied === "mcp" ? dt("dashboard.label5") : guide.copyLabel}</Button>
        <ol className="space-y-2">
          {guide.steps.map((s, i) => <li key={s} className="flex gap-3 text-sm font-light"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px]">{i + 1}</span>{s}</li>)}
        </ol>
        <div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><p className="text-xs leading-5 text-muted-foreground">{dt("dashboard.text257")}</p></div>
      </div>
      <label htmlFor="template-agent-prompt" className="text-sm font-normal">{dt("dashboard.text258")} {agent}</label>
      <textarea id="template-agent-prompt" readOnly value={prompt} className="min-h-32 w-full resize-none rounded-md border border-border bg-muted p-3 text-xs font-light leading-5 text-foreground" />
      <Button onClick={() => copy(prompt, "prompt")} className="w-full hover:translate-y-0">{copied === "prompt" ? <Check /> : <Copy />}{copied === "prompt" ? dt("dashboard.text259") : dt("dashboard.text260")}</Button>
      <p className="text-xs text-muted-foreground">{dt("dashboard.text261")}</p>
    </DialogContent>
  </Dialog>;
}
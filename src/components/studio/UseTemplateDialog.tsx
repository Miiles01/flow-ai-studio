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
const STEPS: Record<typeof AGENTS[number], { steps: string[]; copy: string; copyLabel: string }> = {
  Claude: {
    steps: ["Abre Claude y ve a Ajustes → Conectores.", "Toca «Agregar conector personalizado».", "Ponle de nombre Miiles y pega el enlace.", "Inicia sesión con tu cuenta de Miiles y acepta."],
    copy: MCP_URL, copyLabel: "Copiar enlace de Miiles",
  },
  Cursor: {
    steps: ["Abre Cursor → Settings → MCP.", "Toca «Add new MCP server».", "Pega la configuración que copiaste.", "Inicia sesión con tu cuenta de Miiles y acepta."],
    copy: JSON.stringify({ mcpServers: { miiles: { url: MCP_URL } } }, null, 2), copyLabel: "Copiar configuración",
  },
  "Otro agente": {
    steps: ["Busca en tu agente la opción «Agregar servidor MCP».", "Elige el tipo de conexión por enlace (HTTP).", "Pega el enlace de Miiles.", "Inicia sesión con tu cuenta de Miiles y acepta."],
    copy: MCP_URL, copyLabel: "Copiar enlace de Miiles",
  },
};
export default function UseTemplateDialog({ template, open, onOpenChange }: { template: StudioTemplate; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { isDark } = useTheme();
  const [agent, setAgent] = useState<typeof AGENTS[number]>("Claude");
  const [copied, setCopied] = useState<"" | "mcp" | "prompt">("");
  const guide = STEPS[agent];
  const prompt = `Quiero adaptar la plantilla de Miiles «${template.title}» (${template.slug}). Usa el conector de Miiles y consulta get_studio_template con slug "${template.slug}"; si no está conectado, usa este ZIP: ${template.download_url || "solicítame el archivo descargado"}. Pregúntame mi nombre, servicios, textos, imágenes y colores antes de editar. Cuando esté lista y yo lo confirme, guárdala con save_page_files (incluye index.html e imágenes) y publícala con publish_page; dame el enlace de wearemiiles.com que te devuelva.`;
  async function copy(text: string, kind: "mcp" | "prompt") {
    try { await navigator.clipboard.writeText(text); setCopied(kind); }
    catch { toast.error("No pudimos copiarlo. Selecciona el texto y cópialo manualmente."); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={`${isDark ? "dark" : ""} max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto bg-background text-foreground p-6 sm:p-8`}>
      <DialogHeader className="text-left space-y-3">
        <MiilesStar className="h-7 w-7 text-primary" />
        <DialogTitle className="text-2xl font-normal tracking-normal">Conecta tu IA a Miiles</DialogTitle>
        <DialogDescription className="font-light">{template.title} · Solo la primera vez, toma 1 minuto.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap gap-2" aria-label="Elegir agente">
        {AGENTS.map((item) => <Button key={item} variant="ghost" aria-pressed={agent === item} onClick={() => { setAgent(item); setCopied(""); }} className={`rounded-full border border-border ${agent === item ? "bg-foreground text-background hover:bg-foreground hover:text-background" : "text-muted-foreground"}`}>{item}</Button>)}
      </div>
      <div className="space-y-4 border-y border-border py-5">
        <p className="text-sm font-normal">Paso 1 · Conecta {agent}</p>
        <Button variant="outline" onClick={() => copy(guide.copy, "mcp")} className="w-full rounded-full">{copied === "mcp" ? <Check /> : <Copy />}{copied === "mcp" ? "Copiado" : guide.copyLabel}</Button>
        <ol className="space-y-2">
          {guide.steps.map((s, i) => <li key={s} className="flex gap-3 text-sm font-light"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px]">{i + 1}</span>{s}</li>)}
        </ol>
        <div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><p className="text-xs leading-5 text-muted-foreground">Tu IA solo podrá ver las plantillas de Miiles. Nunca verá tu contraseña ni datos de otras personas.</p></div>
      </div>
      <label htmlFor="template-agent-prompt" className="text-sm font-normal">Paso 2 · Pega esto en el chat de {agent}</label>
      <textarea id="template-agent-prompt" readOnly value={prompt} className="min-h-32 w-full resize-none rounded-md border border-border bg-muted p-3 text-xs font-light leading-5 text-foreground" />
      <Button onClick={() => copy(prompt, "prompt")} className="w-full hover:translate-y-0">{copied === "prompt" ? <Check /> : <Copy />}{copied === "prompt" ? "Prompt copiado" : "Copiar prompt para mi agente"}</Button>
      <p className="text-xs text-muted-foreground">Al final dile «Publica mi página en Miiles» y quedará en wearemiiles.com/tu-usuario. La verás en Estudio → Mis páginas.</p>
    </DialogContent>
  </Dialog>;
}
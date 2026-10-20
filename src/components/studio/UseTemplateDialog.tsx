import { useState } from "react";
import { Check, Copy, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import type { StudioTemplate } from "@/lib/studio";

const AGENTS = ["Claude", "Cursor", "Otro agente"] as const;
export default function UseTemplateDialog({ template, open, onOpenChange }: { template: StudioTemplate; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { isDark } = useTheme();
  const [agent, setAgent] = useState<typeof AGENTS[number]>("Claude");
  const [copied, setCopied] = useState(false);
  const prompt = `Quiero adaptar la plantilla de Miiles «${template.title}» (${template.slug}). Si tienes conectado el MCP de Miiles, consulta get_studio_template con slug "${template.slug}"; si no, usa este ZIP: ${template.download_url || "solicítame el archivo descargado"}. Pregúntame mi nombre, servicios, textos, imágenes y colores antes de editar. Trabaja únicamente en mi copia local; no modifiques el repositorio compartido de Miiles. No publiques ni afirmes que mi página está publicada sin una confirmación real: la publicación automática en wearemiiles.com todavía no está disponible.`;
  async function copyPrompt() {
    try { await navigator.clipboard.writeText(prompt); setCopied(true); }
    catch { toast.error("No pudimos copiarlo. Selecciona el texto y cópialo manualmente."); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={`${isDark ? "dark" : ""} max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto bg-background text-foreground p-6 sm:p-8`}>
      <DialogHeader className="text-left space-y-3">
        <Sparkles className="h-7 w-7 text-primary" />
        <DialogTitle className="text-2xl font-normal tracking-normal">Tu próxima página empieza aquí</DialogTitle>
        <DialogDescription className="font-light">{template.title}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap gap-2" aria-label="Elegir agente">
        {AGENTS.map((item) => <Button key={item} variant="ghost" aria-pressed={agent === item} onClick={() => { setAgent(item); setCopied(false); }} className={`rounded-full border border-border ${agent === item ? "bg-foreground text-background hover:bg-foreground hover:text-background" : "text-muted-foreground"}`}>{item}</Button>)}
      </div>
      <div className="space-y-4 border-y border-border py-5">
        <div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><div><p className="text-sm font-normal">Acceso seguro con tu cuenta</p><p className="mt-1 text-xs leading-5 text-muted-foreground">MCP de Miiles preparado para consultar plantillas. La conexión estará disponible tras publicar esta actualización.</p></div></div>
        <p className="text-xs leading-5 text-muted-foreground">La creación y publicación automática en wearemiiles.com aún no está disponible. Por ahora puedes adaptar una copia con tu agente.</p>
      </div>
      <label htmlFor="template-agent-prompt" className="text-sm font-normal">Tu punto de partida para {agent}</label>
      <textarea id="template-agent-prompt" readOnly value={prompt} className="min-h-36 w-full resize-none rounded-md border border-border bg-muted p-3 text-xs font-light leading-5 text-foreground" />
      <Button onClick={copyPrompt} className="w-full hover:translate-y-0">{copied ? <Check /> : <Copy />}{copied ? "Prompt copiado" : "Copiar prompt para mi agente"}</Button>
      {agent === "Cursor" && <Button variant="ghost" asChild className="text-muted-foreground"><a href="https://cursor.com/" target="_blank" rel="noopener noreferrer">Abrir Cursor<ArrowUpRight /></a></Button>}
    </DialogContent>
  </Dialog>;
}
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Trash2, EyeOff, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { publicSiteUrl } from "@/lib/userSites";

type Site = { id: string; title: string; path: string; status: string; template_slug: string | null; published_at: string | null };

export default function MyPages() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [sites, setSites] = useState<Site[] | null>(null);
  const [busy, setBusy] = useState("");

  async function load() {
    if (!user) return;
    const { data, error } = await supabase.from("user_sites").select("id, title, path, status, template_slug, published_at").eq("owner_id", user.id).order("created_at");
    if (error) { toast({ title: "No se pudieron cargar tus páginas", description: error.message, variant: "destructive" }); setSites([]); return; }
    setSites(data ?? []);
  }
  useEffect(() => { load(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(site: Site, kind: "publish" | "unpublish" | "delete") {
    if (kind === "delete" && !window.confirm(`¿Borrar «${site.title}»? Se eliminan sus archivos.`)) return;
    setBusy(site.id);
    const { error } = kind === "delete"
      ? await supabase.from("user_sites").delete().eq("id", site.id)
      : await supabase.from("user_sites").update({ status: kind === "publish" ? "published" : "draft" }).eq("id", site.id);
    setBusy("");
    if (error) return toast({ title: "No se pudo completar", description: error.message, variant: "destructive" });
    await load();
  }

  if (!user || sites === null) return null;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-medium text-foreground">Mis páginas</h2>
        <p className="text-sm font-light text-miiles-gray-400 mt-1">Las páginas que tu agente guardó o publicó en wearemiiles.com.</p>
      </div>
      {sites.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm font-light text-muted-foreground">
          Aún no tienes páginas. Elige una plantilla abajo, pulsa «Usar esta plantilla» y, cuando tu agente termine, dile «Publica mi página en Miiles».
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,max(220px,calc((100%-3rem)/3))),1fr))] gap-6 pt-2">
          {sites.map((s) => {
            const url = publicSiteUrl(s.path);
            const live = s.status === "published";
            return (
              <motion.div key={s.id} whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`overflow-hidden rounded-[24px] ${isDark ? "bg-black ring-1 ring-white/10" : "bg-white shadow-md"}`}>
                {/* Vista previa en vivo (solo páginas visibles) */}
                <div className={`relative aspect-[4/3] overflow-hidden ${isDark ? "bg-white/5" : "bg-miiles-gray-50"}`}>
                  {live ? (
                    <iframe
                      src={url}
                      title={`Vista previa de ${s.title}`}
                      sandbox="allow-scripts"
                      tabIndex={-1}
                      loading="lazy"
                      className="pointer-events-none absolute left-0 top-0 h-[400%] w-[400%] origin-top-left scale-[0.25] border-0 bg-background"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <EyeOff className="h-6 w-6" />
                      <span className="text-xs font-light">Página oculta</span>
                    </div>
                  )}
                  <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-normal ${live ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {live ? "Visible" : "Oculta"}
                  </span>
                </div>
                {/* Datos y acciones */}
                <div className="space-y-3 p-4">
                  <div className="min-w-0">
                    <p className={`truncate text-base font-normal ${isDark ? "text-white" : "text-black"}`}>{s.title}</p>
                    <p className="truncate text-xs font-light text-muted-foreground">
                      {url.replace("https://", "")}{s.template_slug ? ` · plantilla ${s.template_slug}` : ""}
                      {live && s.published_at ? ` · ${new Date(s.published_at).toLocaleDateString("es-MX")}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {live && <Button asChild size="sm" variant="outline" className="rounded-full"><a href={url} target="_blank" rel="noreferrer"><ExternalLink />Abrir</a></Button>}
                    {live
                      ? <Button size="sm" variant="outline" className="rounded-full" disabled={busy === s.id} onClick={() => act(s, "unpublish")}><EyeOff />Ocultar</Button>
                      : <Button size="sm" className="rounded-full" disabled={busy === s.id} onClick={() => act(s, "publish")}><Globe />Mostrar</Button>}
                    <Button size="sm" variant="ghost" className="rounded-full text-destructive" aria-label={`Borrar ${s.title}`} disabled={busy === s.id} onClick={() => act(s, "delete")}><Trash2 /></Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import { ExternalLink, Trash2, EyeOff, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { publicSiteUrl } from "@/lib/userSites";

type Site = { id: string; title: string; path: string; status: string; template_slug: string | null; published_at: string | null };

export default function MyPages() {
  const { user } = useAuth();
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
        <ul className="space-y-3">
          {sites.map((s) => {
            const url = publicSiteUrl(s.path);
            const live = s.status === "published";
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-normal text-foreground truncate">{s.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-normal ${live ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{live ? "Publicada" : "Borrador"}</span>
                  </div>
                  <p className="text-xs font-light text-muted-foreground truncate">
                    {url.replace("https://", "")}{s.template_slug ? ` · plantilla ${s.template_slug}` : ""}
                    {live && s.published_at ? ` · ${new Date(s.published_at).toLocaleDateString("es-MX")}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  {live && <Button asChild size="sm" variant="outline" className="rounded-full"><a href={url} target="_blank" rel="noreferrer"><ExternalLink />Abrir</a></Button>}
                  {live
                    ? <Button size="sm" variant="outline" className="rounded-full" disabled={busy === s.id} onClick={() => act(s, "unpublish")}><EyeOff />Despublicar</Button>
                    : <Button size="sm" className="rounded-full" disabled={busy === s.id} onClick={() => act(s, "publish")}><Globe />Publicar</Button>}
                  <Button size="sm" variant="ghost" className="rounded-full text-destructive" aria-label={`Borrar ${s.title}`} disabled={busy === s.id} onClick={() => act(s, "delete")}><Trash2 /></Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

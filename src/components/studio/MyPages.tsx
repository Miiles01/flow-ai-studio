import { useTranslation } from "react-i18next";
import dashboardI18n from "@/i18n";
const dt = (key: string, options?: Record<string, unknown>): string => dashboardI18n.t(key, options) as string;
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { publicSiteUrl } from "@/lib/userSites";

type Site = { id: string; title: string; path: string; status: string; template_slug: string | null; published_at: string | null };

export default function MyPages() {
  useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [sites, setSites] = useState<Site[] | null>(null);
  const [busy, setBusy] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [toDelete, setToDelete] = useState<Site | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const renamePending = useRef(false);
  const renameCancelled = useRef(false);

  function startRename(site: Site) {
    renameCancelled.current = false;
    setDraftTitle(site.title);
    setEditingId(site.id);
  }

  async function saveTitle(site: Site) {
    if (!user || renamePending.current || renameCancelled.current) return;
    const title = draftTitle.trim();
    if (!title || title === site.title) {
      setEditingId(null);
      return;
    }
    renamePending.current = true;
    setBusy(site.id);
    try {
      const { data, error } = await supabase.from("user_sites")
        .update({ title }).eq("id", site.id).eq("owner_id", user.id)
        .select("title").single();
      if (error) throw error;
      setSites((current) => current?.map((item) => item.id === site.id ? { ...item, title: data.title } : item) ?? null);
      setEditingId(null);
    } catch (error) {
      toast({ title: dt("dashboard.text132"), description: error instanceof Error ? error.message : dt("dashboard.text229"), variant: "destructive" });
    } finally {
      renamePending.current = false;
      setBusy("");
    }
  }

  async function load() {
    if (!user) return;
    const { data, error } = await supabase.from("user_sites").select("id, title, path, status, template_slug, published_at").eq("owner_id", user.id).order("created_at");
    if (error) { toast({ title: dt("dashboard.text228"), description: error.message, variant: "destructive" }); setSites([]); return; }
    setSites(data ?? []);
  }
  useEffect(() => { load(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(site: Site, kind: "publish" | "unpublish" | "delete") {
    setBusy(site.id);
    const { error } = kind === "delete"
      ? await supabase.from("user_sites").delete().eq("id", site.id)
      : await supabase.from("user_sites").update({ status: kind === "publish" ? "published" : "draft" }).eq("id", site.id);
    setBusy("");
    if (error) { toast({ title: dt("dashboard.text229"), description: error.message, variant: "destructive" }); return false; }
    await load();
    return true;
  }

  async function copyLink(site: Site, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(site.id);
      setTimeout(() => setCopiedId((id) => (id === site.id ? "" : id)), 1600);
    } catch {
      toast({ title: dt("dashboard.text230"), description: url, variant: "destructive" });
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    if (await act(toDelete, "delete")) setToDelete(null);
  }

  if (!user || sites === null) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-xl md:text-2xl font-medium text-foreground">{dt("dashboard.text231")}</h2>
      {sites.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm font-light text-muted-foreground">
           {dt("dashboard.text232")} </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,max(220px,calc((100%-3rem)/3))),1fr))] gap-6 pt-2">
          {sites.map((s) => {
            const url = publicSiteUrl(s.path);
            const shownUrl = url.replace("https://", "").replace(/\/+$/, "");
            const live = s.status === "published";
            const isBusy = busy === s.id;
            return (
              <motion.div key={s.id} whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`group relative overflow-hidden rounded-[24px] ${isDark ? "bg-black ring-1 ring-white/10" : "bg-white shadow-md"}`}>
                {/* Vista previa: un clic abre la página (solo si está visible) */}
                <div className={`relative aspect-[4/3] overflow-hidden ${isDark ? "bg-white/5" : "bg-miiles-gray-50"}`}>
                  {live ? (
                    <a href={url} target="_blank" rel="noreferrer" aria-label={`Abrir ${s.title}`} className="absolute inset-0 block">
                      <iframe
                        src={url}
                        title={`Vista previa de ${s.title}`}
                        sandbox="allow-scripts"
                        tabIndex={-1}
                        loading="lazy"
                        className="pointer-events-none absolute left-0 top-0 h-[400%] w-[400%] origin-top-left scale-[0.25] border-0 bg-background"
                      />
                    </a>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <EyeOff className="h-6 w-6" />
                      <span className="text-xs font-light">{dt("dashboard.text233")}</span>
                    </div>
                  )}

                  {/* Eliminar: aparece al pasar el cursor (siempre visible en pantallas táctiles) */}
                  <button
                    type="button"
                    onClick={() => setToDelete(s)}
                    disabled={isBusy}
                    aria-label={dt("dashboard.aria294", { title: s.title })}
                    title={dt("dashboard.text60")}
                    className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-sm transition-opacity duration-200 hover:bg-white/90 focus-visible:opacity-100 disabled:opacity-50 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>

                  {/* Estado: un selector para elegir entre visible y oculta */}
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        disabled={isBusy}
                        aria-label={`Estado de ${s.title}: ${live ? "visible" : "oculta"}`}
                        className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-normal outline-none transition-colors disabled:opacity-60 ${
                          live
                            ? "bg-white text-black shadow-sm hover:bg-white/90"
                            : isDark ? "bg-white/10 text-white hover:bg-white/15" : "bg-black/5 text-black/60 hover:bg-black/10"
                        }`}
                      >
                        {isBusy
                          ? <Loader2 size={10} className="animate-spin" />
                          : <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-miiles-blue" : isDark ? "bg-white/40" : "bg-black/30"}`} />}
                        {live ? dt("dashboard.label0") : dt("dashboard.label1")}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={6}
                      className={`w-40 rounded-2xl p-1.5 ${isDark ? "bg-[#1C1C1E] border-white/10 text-white" : "bg-white border-gray-200 text-black"}`}
                    >
                      {([
                        { value: "published", label: dt("dashboard.label0"), Icon: Eye },
                        { value: "draft", label: dt("dashboard.label1"), Icon: EyeOff },
                      ] as const).map((o) => {
                        const selected = s.status === o.value;
                        return (
                          <DropdownMenuItem
                            key={o.value}
                            onSelect={() => { if (!selected) act(s, o.value === "published" ? "publish" : "unpublish"); }}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-normal ${isDark ? "focus:bg-white/10" : "focus:bg-[#F3F4F6]"}`}
                          >
                            <o.Icon size={15} strokeWidth={1.5} className="shrink-0" />
                            <span className="flex-1">{o.label}</span>
                            {selected && <Check size={14} strokeWidth={1.75} className="shrink-0" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Título y enlace (con copiar al pasar el cursor) */}
                <div className="p-4">
                  {editingId === s.id ? (
                    <div className="relative h-8">
                      <Input
                        autoFocus
                        aria-label={dt("dashboard.pageName")}
                        value={draftTitle}
                        disabled={isBusy}
                        onFocus={(event) => event.currentTarget.select()}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        onBlur={() => saveTitle(s)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") { event.preventDefault(); saveTitle(s); }
                          if (event.key === "Escape") { event.preventDefault(); renameCancelled.current = true; setEditingId(null); }
                        }}
                        className="h-8 px-2 pr-8 text-base md:text-base font-normal text-foreground"
                      />
                      {isBusy && <Loader2 size={14} className="absolute right-2 top-2 animate-spin text-muted-foreground" />}
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      disabled={isBusy || !!busy}
                      onClick={() => startRename(s)}
                      aria-label={dt("dashboard.renamePage", { title: s.title })}
                      title={dt("dashboard.renamePage", { title: s.title })}
                      className="group/title h-8 w-full min-w-0 justify-start gap-2 px-0 text-base font-normal text-foreground hover:bg-transparent"
                    >
                      <span className="truncate">{s.title}</span>
                      <Pencil size={13} strokeWidth={1.5} className="shrink-0 text-muted-foreground transition-opacity md:opacity-0 md:group-hover/title:opacity-100 group-focus-visible/title:opacity-100" />
                    </Button>
                  )}
                  <div className="group/link mt-0.5 flex min-w-0 items-center gap-1.5">
                    <a href={url} target="_blank" rel="noreferrer" className="truncate text-xs font-light text-muted-foreground transition-colors hover:text-foreground">
                      {shownUrl}
                    </a>
                    <button
                      type="button"
                      onClick={() => copyLink(s, url)}
                      aria-label={dt("dashboard.aria295", { title: s.title })}
                      title={dt("dashboard.text234")}
                      className="shrink-0 rounded-full p-1 text-muted-foreground transition-opacity hover:text-foreground focus-visible:opacity-100 md:opacity-0 md:group-hover/link:opacity-100"
                    >
                      {copiedId === s.id ? <Check size={13} strokeWidth={1.8} /> : <Copy size={13} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmación para eliminar (mismo pop-up del canvas) */}
      <AnimatePresence>
        {toDelete && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !busy && setToDelete(null)} />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-page-title"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className={`relative z-10 w-full max-w-sm rounded-3xl p-6 ${isDark ? "bg-[#1C1C1E] border border-white/10 text-white" : "bg-white text-black border border-gray-200"}`}
            >
              <h3 id="delete-page-title" className={`text-base font-normal ${isDark ? "text-white" : "text-black"}`}>
                 {dt("dashboard.text235")}{toDelete.title}»?
              </h3>
              <p className={`mt-1 text-[13px] font-light ${isDark ? "text-white/50" : "text-[#6B7280]"}`}>
                 {dt("dashboard.text236")} </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setToDelete(null)}
                  disabled={!!busy}
                  className={`rounded-full px-4 py-2.5 text-[13px] font-normal transition-colors disabled:opacity-50 ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-[#F3F4F6] text-black"}`}
                >
                   {dt("dashboard.text129")} </button>
                <button
                  onClick={confirmDelete}
                  disabled={!!busy}
                  autoFocus
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50 ${isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-miiles-pink"}`}
                >
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} strokeWidth={1.5} />}
                   {dt("dashboard.text60")} </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

import { useEffect, useState } from "react";
import { adminFetch } from "@/hooks/useAdminAuth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";

type Item = { at: string; kind: string; route?: string; step?: number | null; network?: string | null; title?: string | null; cta?: string | null };
const SCREEN: Record<string, string> = {
  home: "Inicio", affiliates: "Afiliados", trial_popup: "Abrió el pop-up de Pro gratis", trial: "Acceso especial de Pro gratis",
  signup: "Registro", onboarding: "Onboarding", dashboard: "Panel (Inicio)", upgrade: "Precios", boards: "Tableros",
  studio: "Estudio", architecture: "Arquitectura algorítmica",
};
const STEP = ["Bienvenida", "Foto de perfil", "Cuéntanos sobre ti", "Medios de contacto", "Portafolio", "Contacto", "Todo listo"];
const NET: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" };

function describe(i: Item): string {
  if (i.kind === "screen") return i.route === "onboarding" && i.step ? `Onboarding · ${STEP[i.step - 1] ?? i.step}` : SCREEN[i.route ?? ""] ?? i.route ?? "—";
  if (i.kind === "architecture_view") return `Vio Arquitectura · ${NET[i.network ?? ""] ?? i.network ?? ""}`;
  if (i.kind === "template_view") return `Vio la plantilla «${i.title ?? "—"}»`;
  if (i.kind === "template_use") return `Tocó «Usar esta plantilla» en «${i.title ?? "—"}»`;
  if (i.kind === "pricing_card_click") return "Tocó una tarjeta de precios";
  if (i.kind === "pricing_cta") return i.cta === "pro" ? "Tocó comprar Pro" : i.cta === "contact" ? "Tocó contactar ventas" : "Tocó un botón de precios";
  return i.kind;
}
const time = (d: string) => new Date(d).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function CustomerJourney({ user, onClose }: { user: { id: string; email: string; name: string | null } | null; onClose: () => void }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    let off = false;
    setItems(null); setError(false);
    adminFetch("admin-customers", { mode: "journey", user_id: user.id }).then(({ data, error: e }) => {
      if (off) return;
      if (e || data?.error) setError(true); else { setItems(data.items ?? []); setCreatedAt(data.created_at); }
    }).catch(() => !off && setError(true));
    return () => { off = true; };
  }, [user?.id]);

  // Insert the signup moment so the path reads before / after creating the account.
  const rows: (Item & { mark?: boolean })[] = items ? [...items] : [];
  if (createdAt && items) {
    const idx = rows.findIndex((r) => r.at > createdAt);
    rows.splice(idx < 0 ? rows.length : idx, 0, { at: createdAt, kind: "signup_done", mark: true });
  }
  return (
    <Sheet open={!!user} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-normal">Recorrido de {user?.name || user?.email}</SheetTitle>
          <p className="text-xs text-muted-foreground font-light">Lo que vio, en orden. Las pantallas se miden desde el 25 nov; antes solo hay plantillas, Arquitectura y precios.</p>
        </SheetHeader>
        <div className="mt-6">
          {error ? <p className="text-sm text-destructive">No se pudo cargar el recorrido.</p>
            : !items ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            : rows.length <= 1 ? <p className="text-sm text-muted-foreground font-light">Todavía no hay nada registrado de este usuario.</p>
            : <ol className="relative border-l border-border ml-2 space-y-4">
              {rows.map((r, i) => (
                <li key={i} className="pl-4 relative">
                  <span className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${r.mark ? "bg-primary" : "bg-muted-foreground/50"}`} />
                  <p className={`text-sm ${r.mark ? "text-primary" : "text-foreground"} font-light`}>{r.mark ? "Creó su cuenta" : describe(r)}</p>
                  <p className="text-[11px] text-muted-foreground">{time(r.at)}</p>
                </li>))}
            </ol>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

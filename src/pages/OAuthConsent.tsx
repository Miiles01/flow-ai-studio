import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { OAuthAuthorizationDetails } from "@supabase/supabase-js";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<OAuthAuthorizationDetails | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setError(""); setDetails(null);
    async function load() {
      if (!authorizationId) { setError("Esta solicitud no es válida. Inicia la conexión nuevamente desde tu agente."); return; }
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!active) return;
        if (sessionError) throw sessionError;
        if (!data.session) {
          window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }
        const result = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (result.error) throw result.error;
        if ("redirect_url" in result.data) { window.location.assign(result.data.redirect_url); return; }
        setDetails(result.data);
      } catch { if (active) setError("No pudimos recuperar la autorización. Puede haber caducado; vuelve a conectar desde tu agente."); }
    }
    void load();
    return () => { active = false; };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    if (busy || !details) return;
    setBusy(true); setError("");
    try {
      const { data, error } = approve ? await supabase.auth.oauth.approveAuthorization(authorizationId) : await supabase.auth.oauth.denyAuthorization(authorizationId);
      if (error || !data?.redirect_url) throw new Error("No redirect");
      window.location.assign(data.redirect_url);
    } catch { setError("No pudimos completar tu decisión. Intenta nuevamente."); setBusy(false); }
  }

  return <main className="min-h-screen bg-background px-5 py-16 text-foreground flex items-center justify-center">
    <section className="w-full max-w-md space-y-6">
      <p className="text-lg font-normal">Miiles <span className="text-muted-foreground">/ Conexión con agentes</span></p>
      {details ? <>
        <ShieldCheck className="h-9 w-9 text-primary" />
        <h1 className="text-2xl font-normal break-words">Conectar {details.client.name || "tu agente"}</h1>
        <p className="text-sm text-muted-foreground">Estás autorizando a este agente a consultar el catálogo de plantillas de Miiles con tu cuenta.</p>
        <ul className="space-y-3 border-y border-border py-5 text-sm text-muted-foreground"><li>Consultar plantillas y sus enlaces de descarga.</li><li>Sin acceso a tu GitHub ni a páginas de otros usuarios.</li><li>Esta versión no puede editar ni publicar páginas.</li></ul>
        <div className="flex gap-3"><Button disabled={busy} onClick={() => decide(true)}>{busy && <Loader2 className="animate-spin" />}Autorizar conexión</Button><Button variant="outline" disabled={busy} onClick={() => decide(false)}>Rechazar</Button></div>
      </> : !error ? <p className="flex gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" /> Consultando autorización…</p> : null}
      {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="shrink-0 h-4 w-4" />{error}</p>}
    </section>
  </main>;
}
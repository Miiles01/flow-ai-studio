import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { OAuthAuthorizationDetails } from "@supabase/supabase-js";
import { ShieldCheck, Loader2, AlertCircle, Check, X } from "lucide-react";
import logotipoSvg from "@/assets/miiles/logotipo.svg";
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

  return <main className="min-h-screen bg-muted/40 px-5 py-12 text-foreground flex flex-col items-center justify-center gap-8">
    <img src={logotipoSvg} alt="miiles" className="h-7" />
    <section className="w-full max-w-md rounded-[24px] bg-card text-card-foreground shadow-md border border-border p-8 space-y-6">
      {details ? <>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center"><ShieldCheck className="h-7 w-7 text-foreground" /></div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Conexión con agentes</p>
            <h1 className="text-2xl font-normal break-words">Conectar {details.client.name || "tu agente"}</h1>
            <p className="text-sm font-light text-muted-foreground">Este agente podrá consultar el catálogo de plantillas de Miiles con tu cuenta.</p>
          </div>
        </div>
        <ul className="space-y-3 rounded-2xl bg-muted/60 p-5 text-sm font-light">
          {[["ok","Consultar plantillas y sus enlaces de descarga."],["no","Sin acceso a tu GitHub ni a páginas de otros usuarios."],["no","No puede editar ni publicar páginas."]].map(([k,t]) => <li key={t} className="flex items-start gap-3">{k==="ok" ? <Check className="h-4 w-4 mt-0.5 shrink-0 text-foreground" /> : <X className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />}<span>{t}</span></li>)}
        </ul>
        <div className="flex flex-col gap-2">
          <Button className="w-full rounded-full h-11" disabled={busy} onClick={() => decide(true)}>{busy && <Loader2 className="animate-spin" />}Autorizar conexión</Button>
          <Button variant="ghost" className="w-full rounded-full h-11" disabled={busy} onClick={() => decide(false)}>Rechazar</Button>
        </div>
      </> : !error ? <p className="flex justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Consultando autorización…</p> : null}
      {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="shrink-0 h-4 w-4" />{error}</p>}
    </section>
    <p className="text-xs font-light text-muted-foreground">Puedes revocar el acceso cuando quieras desde tu agente.</p>
  </main>;
}
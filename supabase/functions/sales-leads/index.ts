import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const PIN = "6464";
const STATUSES = ["new", "contacted", "won", "lost"];
const SERVICES = ["Diseño de marca", "Embudo de ventas", "Sistema de clínicas"];
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const body = await req.json().catch(() => ({}));
    if (body.pin !== PIN) return json({ error: "PIN incorrecto" }, 401);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action } = body;

    if (action === "list") {
      const { data, error } = await sb.from("sales_leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return json({ leads: data });
    }
    if (action === "create") {
      const name = String(body.name ?? "").trim().slice(0, 200);
      const phone = String(body.phone ?? "").trim().slice(0, 50);
      const service = SERVICES.includes(body.service) ? body.service : SERVICES[0];
      if (!name) return json({ error: "Nombre requerido" }, 400);
      const { data, error } = await sb.from("sales_leads").insert({ name, phone, service }).select().single();
      if (error) throw error;
      return json({ lead: data });
    }
    if (action === "bulk") {
      const service = SERVICES.includes(body.service) ? body.service : SERVICES[0];
      const rows = (Array.isArray(body.leads) ? body.leads : []).slice(0, 2000)
        .map((r: any) => ({ name: String(r?.name ?? "").trim().slice(0, 200), phone: String(r?.phone ?? "").trim().slice(0, 50), service }))
        .filter((r: any) => r.name);
      const { data: existing } = await sb.from("sales_leads").select("phone");
      const norm = (p: string) => p.replace(/\D/g, "");
      const seen = new Set((existing ?? []).map((e: any) => norm(e.phone ?? "")).filter(Boolean));
      const fresh = rows.filter((r: any) => { const n = norm(r.phone); if (!n) return true; if (seen.has(n)) return false; seen.add(n); return true; });
      if (!fresh.length) return json({ leads: [], skipped: rows.length });
      const { data, error } = await sb.from("sales_leads").insert(fresh).select();
      if (error) throw error;
      return json({ leads: data, skipped: rows.length - fresh.length });
    }
    if (action === "service") {
      if (!SERVICES.includes(body.service)) return json({ error: "Servicio inválido" }, 400);
      const { error } = await sb.from("sales_leads").update({ service: body.service, updated_at: new Date().toISOString() }).eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }
    if (action === "status") {
      if (!STATUSES.includes(body.status)) return json({ error: "Estado inválido" }, 400);
      const { error } = await sb.from("sales_leads").update({ status: body.status, updated_at: new Date().toISOString() }).eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }
    if (action === "delete") {
      const { error } = await sb.from("sales_leads").delete().eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }
    return json({ error: "Acción desconocida" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});

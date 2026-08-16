const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
import { createClient } from "npm:@supabase/supabase-js@2";

const enc = new TextEncoder();
async function verifyToken(token: string | null, secret: string) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const bytes = new Uint8Array(sigBuf);
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  const expected = btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (expected !== sig) return false;
  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.exp > Date.now();
  } catch { return false; }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD")!;
    if (!(await verifyToken(req.headers.get("x-admin-token"), ADMIN_PASSWORD))) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const action = body.action ?? "list";

    if (action === "list") {
      const { data, error } = await supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;

      const ids = [...new Set((data ?? []).map((s: any) => s.user_id))];
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("user_id, display_name, username").in("user_id", ids)
        : { data: [] as any[] };
      const byUser = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));

      const suggestions = (data ?? []).map((s: any) => ({
        ...s,
        author_name: byUser.get(s.user_id)?.display_name ?? null,
        author_username: byUser.get(s.user_id)?.username ?? null,
      }));

      return json({ suggestions, total: suggestions.length });
    }

    if (action === "update_status") {
      const { id, status } = body;
      if (!id || !["new", "reviewed", "applied", "archived"].includes(status)) throw new Error("Invalid input");
      const { error } = await supabase.from("suggestions").update({ status }).eq("id", id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "delete") {
      const { id } = body;
      if (!id) throw new Error("Invalid input");
      const { error } = await supabase.from("suggestions").delete().eq("id", id);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});

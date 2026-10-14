import { corsHeaders as defaultCorsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const enc = new TextEncoder();
const corsHeaders = { ...defaultCorsHeaders, "Access-Control-Allow-Headers": `${defaultCorsHeaders["Access-Control-Allow-Headers"]}, x-admin-token` };
async function verifyToken(token: string | null, secret: string) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  const expected = btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (expected !== sig) return false;
  try { return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))).exp > Date.now(); } catch { return false; }
}

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const secret = Deno.env.get("ADMIN_PASSWORD");
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!secret || !url || !key) throw new Error("Configuración no disponible");
    if (!(await verifyToken(req.headers.get("x-admin-token"), secret))) return json({ error: "Unauthorized" }, 401);
    const sb = createClient(url, key);
    const body = await req.json().catch(() => ({}));
    const action = body.action ?? "list";

    if (action === "prepare-upload") {
      const paths = body.paths;
      if (!Array.isArray(paths) || paths.length > 1001 || !paths.length || paths.some((p) => typeof p !== "string" || p.length > 500 || p.startsWith("/") || p.includes("\\") || p.split("/").some((part) => part === ".." || part.startsWith(".")))) return json({ error: "Rutas no válidas" }, 400);
      const project = crypto.randomUUID();
      const uploads = [];
      for (const path of paths) {
        const { data, error } = await sb.storage.from("studio-projects").createSignedUploadUrl(`${project}/${path}`);
        if (error) throw error;
        uploads.push({ path, token: data.token });
      }
      return json({ project, uploads });
    }

    if (action === "list") {
      const { data, error } = await sb.from("studio_templates").select("*").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return json({ templates: data });
    }
    if (action === "upsert") {
      const t = body.template ?? {};
      const title = String(t.title ?? "").trim().slice(0, 200);
      if (!title) return json({ error: "El nombre es obligatorio" }, 400);
      const kind = t.kind === "website" ? "website" : "portfolio";
      const html = String(t.html ?? "");
      if (html.length > 2_000_000) return json({ error: "HTML demasiado grande" }, 400);
      const thumb = t.thumbnail_url ? String(t.thumbnail_url) : null;
      if (thumb && thumb.length > 1_500_000) return json({ error: "Miniatura demasiado grande" }, 400);
      const row = {
        title, kind, html, thumbnail_url: thumb,
        description: String(t.description ?? "").slice(0, 2000),
        is_published: t.is_published !== false,
        slug: slugify(String(t.slug || title)) || crypto.randomUUID(),
        ...(t.preview_url !== undefined ? { preview_url: t.preview_url || null } : {}),
        ...(t.download_url !== undefined ? { download_url: t.download_url || null } : {}),
      };
      const q = t.id
        ? sb.from("studio_templates").update(row).eq("id", String(t.id))
        : sb.from("studio_templates").insert(row);
      const { error } = await q;
      if (error) throw error;
      return json({ ok: true });
    }
    if (action === "delete") {
      const { error } = await sb.from("studio_templates").delete().eq("id", String(body.id));
      if (error) throw error;
      return json({ ok: true });
    }
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});

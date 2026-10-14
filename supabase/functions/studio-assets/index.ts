import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const types: Record<string, string> = { css: "text/css", js: "application/javascript", mjs: "application/javascript", json: "application/json", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", avif: "image/avif", svg: "image/svg+xml", gif: "image/gif", ico: "image/x-icon", woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf", mp4: "video/mp4", webm: "video/webm", mp3: "audio/mpeg", wasm: "application/wasm", pdf: "application/pdf", zip: "application/zip" };
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  try {
    const segments = new URL(req.url).pathname.split("/studio-assets/")[1]?.split("/") ?? [];
    const project = segments.shift();
    const path = decodeURIComponent(segments.join("/"));
    if (!project || !/^[0-9a-f-]{36}$/.test(project) || !path || path.includes("\\") || path.split("/").some((p) => p === ".." || p.startsWith("."))) return new Response("Not found", { status: 404, headers: corsHeaders });
    const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("Missing configuration");
    const sb = createClient(url, key);
    const { data: template } = await sb.from("studio_templates").select("id").eq("is_published", true).eq("download_url", `${url}/functions/v1/studio-assets/${project}/source.zip`).maybeSingle();
    if (!template) return new Response("Not found", { status: 404, headers: corsHeaders });
    const { data, error } = await sb.storage.from("studio-projects").download(`${project}/${path}`);
    if (error || !data) return new Response("Not found", { status: 404, headers: corsHeaders });
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    return new Response(data, { headers: { ...corsHeaders, "Content-Type": types[ext] ?? "text/plain", "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox", ...(ext === "zip" ? { "Content-Disposition": 'attachment; filename="project.zip"' } : {}) } });
  } catch { return new Response("No se pudo cargar el archivo", { status: 500, headers: corsHeaders }); }
});
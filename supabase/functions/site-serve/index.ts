import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// Sirve archivos de páginas de usuarios PUBLICADAS. URL: /site-serve/<usuario>[/<pagina>]/<archivo>
// El dominio del backend convierte HTML en texto plano, por eso enviamos el tipo real en
// X-Miiles-Content-Type: el proxy de wearemiiles.com (Hostinger) lo usa como Content-Type.
const types: Record<string, string> = { html: "text/html; charset=utf-8", htm: "text/html; charset=utf-8", css: "text/css; charset=utf-8", js: "application/javascript; charset=utf-8", mjs: "application/javascript; charset=utf-8", json: "application/json", txt: "text/plain; charset=utf-8", xml: "application/xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", avif: "image/avif", svg: "image/svg+xml", gif: "image/gif", ico: "image/x-icon", woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf", mp4: "video/mp4", webm: "video/webm", mp3: "audio/mpeg", pdf: "application/pdf" };
const SEG = /^[a-z0-9][a-z0-9_-]{0,39}$/;

function decode(content: string, encoding: string): Uint8Array {
  if (encoding === "base64") return Uint8Array.from(atob(content), (c) => c.charCodeAt(0));
  return new TextEncoder().encode(content);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  const notFound = () => new Response("Página no encontrada", { status: 404, headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } });
  try {
    const raw = new URL(req.url).pathname.split("/site-serve/")[1] ?? "";
    const parts = raw.split("/").map((p) => decodeURIComponent(p));
    const trailing = raw.endsWith("/") || raw === "";
    if (trailing) parts.pop();
    if (!parts.length || parts.some((p) => !p || p.startsWith(".") || p.includes("\\"))) return notFound();
    const user = parts[0].toLowerCase();
    if (!SEG.test(user)) return notFound();

    const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !key) throw new Error("Missing configuration");
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const lookup = async (path: string, file: string) => {
      const { data } = await sb.rpc("get_published_site_file", { p_path: path, p_file: file });
      return Array.isArray(data) && data.length ? data[0] as { content: string; encoding: string; content_type: string } : null;
    };

    // Candidatos: página secundaria (/usuario/pagina/archivo) y página principal (/usuario/archivo).
    const rest = parts.slice(1);
    const candidates: Array<[string, string[]]> = [];
    if (rest.length && SEG.test(rest[0].toLowerCase())) candidates.push([`${user}/${rest[0].toLowerCase()}`, rest.slice(1)]);
    candidates.push([user, rest]);

    for (const [path, fileParts] of candidates) {
      const last = fileParts[fileParts.length - 1];
      const isDir = trailing || !fileParts.length || !last.includes(".");
      const file = isDir ? [...fileParts, "index.html"].join("/") : fileParts.join("/");
      const hit = await lookup(path, file);
      if (!hit) continue;
      if (isDir && !trailing) {
        // Redirección relativa para que las rutas relativas de CSS/imágenes funcionen.
        const seg = parts[parts.length - 1];
        return new Response(null, { status: 301, headers: { ...corsHeaders, Location: `${encodeURIComponent(seg)}/` } });
      }
      const ext = file.split(".").pop()?.toLowerCase() ?? "";
      const type = types[ext] ?? hit.content_type ?? "application/octet-stream";
      const body = decode(hit.content, hit.encoding);
      return new Response(req.method === "HEAD" ? null : body, { headers: { ...corsHeaders, "Content-Type": type, "X-Miiles-Content-Type": type, "Cache-Control": "public, max-age=60", "X-Content-Type-Options": "nosniff" } });
    }
    return notFound();
  } catch {
    return new Response("No se pudo cargar la página", { status: 500, headers: corsHeaders });
  }
});

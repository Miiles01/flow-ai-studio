import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx@0.18.5";

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

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

    const adminToken = req.headers.get("x-admin-token");
    if (!(await verifyToken(adminToken, ADMIN_PASSWORD))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { filename, mime, contentBase64 } = await req.json();
    if (!filename || !contentBase64) {
      return new Response(JSON.stringify({ error: "filename y contentBase64 requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = b64ToBytes(contentBase64);
    let rawText = "";

    const lower = filename.toLowerCase();
    if (lower.endsWith(".csv") || lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
      const wb = XLSX.read(bytes, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, unknown>[];
      rawText = "Filas tabulares:\n" + rows.slice(0, 500).map(r => JSON.stringify(r)).join("\n");
    } else if (lower.endsWith(".pdf")) {
      // Minimal PDF text extraction via regex over text streams (best-effort).
      // For richer extraction, we delegate to the AI by passing the raw text we can salvage.
      const decoder = new TextDecoder("latin1");
      const raw = decoder.decode(bytes);
      const matches = raw.match(/\(([^)]{2,})\)/g) || [];
      rawText = matches.slice(0, 5000).map(m => m.slice(1, -1)).join(" ").slice(0, 60000);
      if (!rawText.trim()) rawText = "(no se pudo extraer texto del PDF; la IA tratará de inferir)";
    } else {
      // txt and otros
      rawText = new TextDecoder().decode(bytes).slice(0, 80000);
    }

    const systemPrompt = `Eres un parser de prospectos. Recibes contenido crudo (filas o texto) y devuelves SOLO JSON válido sin markdown con esta forma:
{"prospects":[{"name":"","company":"","email":"","phone":"","role":"","industry":"","location":"","website":"","notes":"","tags":[]}]}

Reglas:
- Extrae todos los prospectos que puedas identificar.
- Si un campo no existe, usa "" (string vacío) o [] para tags.
- "tags" debe ser un array de strings cortos (industria, ciudad, segmento, etc.).
- NO inventes datos. Si no hay nada en el contenido, devuelve {"prospects":[]}.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Archivo: ${filename}\n\n${rawText}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Intenta de nuevo." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "Créditos IA agotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${aiResp.status} ${t}`);
    }
    const aiJson = await aiResp.json();
    const content = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: { prospects?: any[] } = {};
    try {
      parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    } catch {
      parsed = { prospects: [] };
    }

    const prospects = (parsed.prospects ?? []).filter((p: any) => p && (p.name || p.company || p.email));
    if (prospects.length === 0) {
      return new Response(JSON.stringify({ inserted: 0, message: "No se encontraron prospectos" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rows = prospects.map((p: any) => ({
      name: p.name || null,
      company: p.company || null,
      email: p.email || null,
      phone: p.phone || null,
      role: p.role || null,
      industry: p.industry || null,
      location: p.location || null,
      website: p.website || null,
      notes: p.notes || null,
      tags: Array.isArray(p.tags) ? p.tags : [],
      source_file: filename,
      raw: p,
    }));

    const { error } = await supabase.from("prospects").insert(rows);
    if (error) throw error;

    return new Response(JSON.stringify({ inserted: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-ingest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

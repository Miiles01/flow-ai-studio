import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SCRAPINGANT_API_KEY = Deno.env.get("SCRAPINGANT_API_KEY");

// Extract URLs from a string
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches)].slice(0, 3);
}

// Scrape a URL using ScrapingAnt and return clean text
async function scrapeUrl(url: string): Promise<string> {
  if (!SCRAPINGANT_API_KEY) throw new Error("SCRAPINGANT_API_KEY no configurada");
  const endpoint = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(url)}&x-api-key=${SCRAPINGANT_API_KEY}&return_text=true`;
  const resp = await fetch(endpoint, { method: "GET" });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`ScrapingAnt ${resp.status}: ${t.slice(0, 200)}`);
  }
  const text = await resp.text();
  return text.replace(/\s+/g, " ").trim().slice(0, 6000);
}

// Use ScrapingAnt to fetch DuckDuckGo HTML results and extract top URLs
async function searchWeb(query: string): Promise<string[]> {
  if (!SCRAPINGANT_API_KEY) return [];
  const ddg = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const endpoint = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(ddg)}&x-api-key=${SCRAPINGANT_API_KEY}`;
  try {
    const resp = await fetch(endpoint, { method: "GET" });
    if (!resp.ok) {
      console.error("DuckDuckGo search failed", resp.status);
      return [];
    }
    const html = await resp.text();
    // DuckDuckGo HTML wraps real URLs in /l/?uddg=<encoded>
    const urls: string[] = [];
    const re = /\/l\/\?uddg=([^"&]+)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      try {
        const decoded = decodeURIComponent(m[1]);
        if (decoded.startsWith("http") && !urls.includes(decoded)) urls.push(decoded);
      } catch { /* ignore */ }
      if (urls.length >= 3) break;
    }
    // Fallback: direct hrefs
    if (urls.length === 0) {
      const re2 = /href="(https?:\/\/[^"]+)"/gi;
      while ((m = re2.exec(html)) !== null) {
        const u = m[1];
        if (u.includes("duckduckgo.com")) continue;
        if (!urls.includes(u)) urls.push(u);
        if (urls.length >= 3) break;
      }
    }
    return urls;
  } catch (e) {
    console.error("searchWeb error", e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
    let scrapedContext = "";
    let sourcesUsed: string[] = [];

    if (lastUser?.content && SCRAPINGANT_API_KEY) {
      const userText = String(lastUser.content);
      let urls = extractUrls(userText);

      // If no URL provided, search the web first (vía ScrapingAnt + DuckDuckGo)
      if (urls.length === 0) {
        console.log("No URL in message — searching web for:", userText.slice(0, 100));
        urls = await searchWeb(userText);
        console.log("Search results:", urls);
      }

      if (urls.length > 0) {
        console.log("Scraping URLs:", urls);
        const results = await Promise.allSettled(urls.map(scrapeUrl));
        const parts: string[] = [];
        results.forEach((r, i) => {
          if (r.status === "fulfilled" && r.value.length > 50) {
            parts.push(`### Fuente: ${urls[i]}\n${r.value}`);
            sourcesUsed.push(urls[i]);
          } else {
            console.warn("Scrape failed for", urls[i], r.status === "rejected" ? r.reason : "empty");
          }
        });
        scrapedContext = parts.join("\n\n");
      }
    }

    const formattingRules = `Formato (OBLIGATORIO):
- Markdown bien estructurado y fácil de leer.
- Párrafos cortos separados por línea en blanco. NUNCA pegues el texto.
- Listas con - o 1. cuando enumeres ideas o pasos.
- **Negrita** para términos clave, \`código\` para handles/URLs cortas.
- Encabezados ## o ### solo si la respuesta es larga y tiene secciones.
- NO uses líneas horizontales (---, ***, ___).
- Deja una línea en blanco antes y después de listas y encabezados.`;

    const groundingRules = scrapedContext
      ? `REGLAS ESTRICTAS DE CONTENIDO (OBLIGATORIO):
- TODA tu respuesta debe basarse ÚNICAMENTE en el "Contexto web" que sigue. Fue obtenido en tiempo real con ScrapingAnt.
- PROHIBIDO inventar datos, cifras, nombres, URLs, comisiones, fechas o citas que NO aparezcan literalmente en el contexto.
- Si el contexto no contiene la respuesta, di exactamente: "No encontré información confiable sobre eso en la web." y NADA más sobre ese punto.
- Cita las fuentes al final con una sección **Fuentes:** y lista los enlaces usados como bullets.
- No menciones "ScrapingAnt", "scraping" ni cómo obtuviste la info; sólo úsala.

Contexto web (única fuente de verdad):

${scrapedContext}`
      : `REGLA: No tienes acceso a internet en este turno. Si el usuario pide datos actuales, específicos, precios, métricas o información que cambia con el tiempo, responde: "No encontré información confiable sobre eso en la web." y sugiere que reformule la pregunta o incluya una URL. NO INVENTES datos.`;

    const systemPrompt = `Eres Miiles AI, un asistente que responde con datos reales obtenidos de la web.\n\n${formattingRules}\n\n${groundingRules}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes alcanzado. Intenta de nuevo en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 403) {
        return new Response(JSON.stringify({ error: "El límite de créditos de IA del workspace se alcanzó. Ajusta el límite en Ajustes → Planes y créditos." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "x-sources-count": String(sourcesUsed.length),
      },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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
  return [...new Set(matches)].slice(0, 3); // Max 3 URLs
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
  // Clean & truncate to keep token usage sane
  return text.replace(/\s+/g, " ").trim().slice(0, 8000);
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

    // Look at the latest user message — if it contains URLs, scrape them
    const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
    let scrapedContext = "";

    if (lastUser?.content) {
      const urls = extractUrls(String(lastUser.content));
      if (urls.length > 0 && SCRAPINGANT_API_KEY) {
        console.log("Scraping URLs:", urls);
        const results = await Promise.allSettled(urls.map(scrapeUrl));
        const parts: string[] = [];
        results.forEach((r, i) => {
          if (r.status === "fulfilled") {
            parts.push(`### Contenido de ${urls[i]}\n${r.value}`);
          } else {
            parts.push(`### Error scraping ${urls[i]}\n${r.reason?.message || "desconocido"}`);
          }
        });
        scrapedContext = parts.join("\n\n");
      }
    }

    const systemPrompt = `Eres un asistente de IA útil llamado Miiles AI. Responde de forma clara y concisa en el idioma del usuario.${
      scrapedContext
        ? `\n\nTienes acceso al siguiente contenido extraído de la web (vía ScrapingAnt). Úsalo para responder con precisión y cita las fuentes cuando sea relevante:\n\n${scrapedContext}`
        : ""
    }`;

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
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

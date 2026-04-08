import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { username } = await req.json();
    if (!username || typeof username !== "string") {
      return new Response(JSON.stringify({ error: "username is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanUsername = username.replace(/^@/, "").trim();
    const igUrl = `https://www.instagram.com/${cleanUsername}/`;

    console.log("Scraping Instagram profile:", igUrl);

    // Step 1: Scrape the Instagram profile with Firecrawl
    const scrapeResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: igUrl,
        formats: ["markdown"],
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResp.json();

    if (!scrapeResp.ok) {
      console.error("Firecrawl error:", scrapeData);
      return new Response(
        JSON.stringify({ error: scrapeData.error || "Error scraping Instagram profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
    const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};

    if (!markdown || markdown.length < 50) {
      // Fallback: search for the profile info using Firecrawl search
      console.log("Direct scrape yielded little content, trying search...");
      
      const searchResp = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `Instagram ${cleanUsername} profile bio affiliate program`,
          limit: 5,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      const searchData = await searchResp.json();
      const searchMarkdown = searchData.data
        ?.map((r: any) => `## ${r.title || r.url}\n${r.markdown || r.description || ""}`)
        .join("\n\n") || "";

      if (searchMarkdown.length > 50) {
        return await analyzeWithAI(LOVABLE_API_KEY, cleanUsername, searchMarkdown, "search", corsHeaders);
      }
    }

    // Step 2: Analyze with Gemini
    return await analyzeWithAI(LOVABLE_API_KEY, cleanUsername, markdown, "scrape", corsHeaders);
  } catch (e) {
    console.error("analyze-instagram error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeWithAI(
  apiKey: string,
  username: string,
  content: string,
  source: string,
  corsHeaders: Record<string, string>
) {
  const systemPrompt = `Eres un experto en marketing de afiliados e influencer marketing. 
Analiza la información de un perfil de Instagram y determina si esta persona/marca está buscando afiliados para vender sus productos.

Responde SIEMPRE en español con el siguiente formato:

## 📊 Análisis de @${username}

### Probabilidad de programa de afiliados
[Alta / Media / Baja / No detectado]

### Señales detectadas
- Lista de señales que indiquen que buscan afiliados (links en bio, menciones de "ambassador", "affiliate", "colaboración", "comisión", códigos de descuento, etc.)

### Tipo de negocio
[Qué tipo de producto/servicio venden]

### Recomendación
[Si vale la pena contactarlos y cómo hacerlo]

### Información extraída
[Resumen breve del perfil]

Si no hay suficiente información, indícalo claramente y sugiere formas alternativas de investigar.`;

  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analiza este perfil de Instagram (@${username}). La información fue obtenida por ${source}:\n\n${content.slice(0, 8000)}`,
        },
      ],
      stream: true,
    }),
  });

  if (!aiResp.ok) {
    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Límite de solicitudes alcanzado. Intenta en unos segundos." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const t = await aiResp.text();
    console.error("AI error:", aiResp.status, t);
    return new Response(JSON.stringify({ error: "Error del gateway de IA" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(aiResp.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

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

    console.log("Searching info for Instagram profile:", cleanUsername);

    // Use Firecrawl search instead of direct scrape (Instagram is blocked)
    const searchResp = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `"${cleanUsername}" Instagram profile bio affiliate program ambassador collaboration`,
        limit: 5,
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    const searchData = await searchResp.json();

    if (!searchResp.ok) {
      console.error("Firecrawl search error:", searchData);
      return new Response(
        JSON.stringify({ error: searchData.error || "Error searching for Instagram profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const content = searchData.data
      ?.map((r: any) => `## ${r.title || r.url}\n${r.markdown || r.description || ""}`)
      .join("\n\n") || "";

    if (content.length < 30) {
      return new Response(
        JSON.stringify({ error: `No se encontró información suficiente sobre @${cleanUsername}. Verifica que el nombre de usuario sea correcto.` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze with AI
    return await analyzeWithAI(LOVABLE_API_KEY, cleanUsername, content, corsHeaders);
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
  corsHeaders: Record<string, string>
) {
  const systemPrompt = `Eres un experto en marketing de afiliados e influencer marketing. 
Analiza la información recopilada sobre un perfil de Instagram y determina si esta persona/marca está buscando afiliados para vender sus productos.

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
          content: `Analiza este perfil de Instagram (@${username}). Información recopilada de búsqueda web:\n\n${content.slice(0, 8000)}`,
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

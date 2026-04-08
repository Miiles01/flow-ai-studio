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
    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
    if (!TAVILY_API_KEY) throw new Error("TAVILY_API_KEY is not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { username } = await req.json();
    if (!username || typeof username !== "string" || username.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Se requiere un término de búsqueda" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const input = username.trim();
    const cleanUsername = input.replace(/^@/, "");
    const isUsername = /^[a-zA-Z0-9._]{1,30}$/.test(cleanUsername);

    const query = isUsername
      ? `"${cleanUsername}" Instagram profile bio affiliate program ambassador collaboration`
      : `${input} Instagram affiliate program ambassador collaboration`;

    console.log("Searching:", query, isUsername ? `(username: ${cleanUsername})` : "(free search)");

    // Use Tavily search API
    const searchResp = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        max_results: 5,
        include_raw_content: false,
        search_depth: "advanced",
      }),
    });

    const searchData = await searchResp.json();

    if (!searchResp.ok) {
      console.error("Tavily search error:", searchData);
      return new Response(
        JSON.stringify({ error: searchData.error || "Error searching for Instagram profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const content = searchData.results
      ?.map((r: any) => `## ${r.title || r.url}\n${r.content || ""}`)
      .join("\n\n") || "";

    if (content.length < 30) {
      return new Response(
        JSON.stringify({ error: `No se encontró información suficiente. Intenta con otros términos de búsqueda.` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze with AI
    const label = isUsername ? cleanUsername : input;
    return await analyzeWithAI(LOVABLE_API_KEY, label, isUsername, content, corsHeaders);
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
  label: string,
  isUsername: boolean,
  content: string,
  corsHeaders: Record<string, string>
) {
  let systemPrompt: string;

  if (isUsername) {
    const profileUrl = `https://www.instagram.com/${label}/`;
    systemPrompt = `Eres un experto en marketing de afiliados e influencer marketing. 
Analiza la información recopilada sobre un perfil de Instagram y determina si esta persona/marca está buscando afiliados para vender sus productos.

Responde SIEMPRE en español con el siguiente formato:

## 📊 Análisis de @${label}

🔗 **Perfil:** [instagram.com/${label}](${profileUrl})

### Probabilidad de programa de afiliados
[Alta / Media / Baja / No detectado]

### Señales detectadas
- Lista de señales que indiquen que buscan afiliados

### Tipo de negocio
[Qué tipo de producto/servicio venden]

### Recomendación
[Si vale la pena contactarlos y cómo hacerlo]

### Información extraída
[Resumen breve del perfil]

Si no hay suficiente información, indícalo claramente y sugiere formas alternativas de investigar.`;
  } else {
    systemPrompt = `Eres un experto en marketing de afiliados e influencer marketing.
Analiza la información recopilada de la búsqueda web y responde de forma útil y detallada.

Responde SIEMPRE en español. Incluye links a fuentes relevantes cuando sea posible.
Estructura tu respuesta con encabezados markdown claros.`;
  }

  const userContent = isUsername
    ? `Analiza este perfil de Instagram (@${label}). Información recopilada:\n\n${content.slice(0, 8000)}`
    : `Responde sobre: "${label}". Información recopilada:\n\n${content.slice(0, 8000)}`;

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
        { role: "user", content: userContent },
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

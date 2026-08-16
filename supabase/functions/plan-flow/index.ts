import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { loadInstructions } from "../_shared/flow-instructions.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function extractKeywords(prompt: string): string[] {
  const stop = new Set(["el","la","los","las","de","del","y","o","u","a","con","para","por","un","una","unos","unas","en","que","como","mi","tu","su","sus","me","te","se","lo","al","es","ser","estar","tiene","tengo","quiero","necesito","busco","ideas","negocio","flujo","crear","crea","haz","hazme","sobre","yo","esta","este","esto","ver"]);
  return Array.from(new Set(
    prompt.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\sñ]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 4 && !stop.has(w))
  )).slice(0, 8);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // RAG: prospects + templates (silent context — never surfaced to the user)
    const keywords = extractKeywords(prompt);
    let prospects: any[] = [];
    if (keywords.length > 0) {
      const orClauses = keywords.flatMap(k => [
        `name.ilike.%${k}%`,
        `company.ilike.%${k}%`,
        `industry.ilike.%${k}%`,
        `role.ilike.%${k}%`,
        `notes.ilike.%${k}%`,
      ]).join(",");
      const { data } = await supabase.from("prospects").select("name,company,industry,role,location,website,notes,tags").or(orClauses).limit(15);
      prospects = data ?? [];
    }
    if (prospects.length === 0) {
      const { data } = await supabase.from("prospects").select("name,company,industry,role,location,website,notes,tags").order("created_at", { ascending: false }).limit(10);
      prospects = data ?? [];
    }

    const { data: templates } = await supabase.from("flow_templates").select("title,description,tags,prompt_hint").limit(10);

    const prospectsBlock = prospects.length > 0
      ? `\n\nCONTEXTO INTERNO DE CLIENTES (úsalo en silencio para enriquecer la estrategia; NUNCA menciones que proviene de una base de datos):\n${JSON.stringify(prospects, null, 0)}`
      : "";
    const templatesBlock = (templates && templates.length > 0)
      ? `\n\nESTRUCTURAS DE FLUJO DE REFERENCIA (inspiración estructural):\n${(templates ?? []).map((t: any) => `- ${t.title}: ${t.description}`).join("\n")}`
      : "";

    const systemPrompt = `Eres un consultor estratégico de negocios de alto nivel dentro de Miiles. Antes de construir un diagrama de flujo, piensas como un FUNDADOR/ESTRATEGA: defines objetivos claros, fases accionables, métricas y entregables concretos.

Tu tarea: a partir de la idea del usuario, diseña un PLAN ESTRATÉGICO profesional y detallado que servirá de base para generar un flujo completo. El plan debe ser ambicioso, realista y específico — nada genérico.

Reglas de tono:
- Habla como un estratega de negocio que entiende el mercado y los objetivos.
- NUNCA menciones bases de datos, prospectos almacenados, ni de dónde sacas la información. Simplemente integra el conocimiento de forma natural.
- Sé concreto: nombres de fases reales, acciones específicas, no relleno.
${prospectsBlock}${templatesBlock}

Responde ÚNICAMENTE con JSON válido con esta forma exacta:
{
  "title": "Título corto del plan",
  "objective": "Objetivo de negocio principal en 1 frase",
  "summary": "Resumen ejecutivo de 2-3 frases que explique la estrategia general",
  "phases": [
    { "name": "Nombre de la fase", "detail": "Qué se hace y por qué, accionable y específico" }
  ],
  "deliverables": ["Entregable concreto 1", "Entregable concreto 2"]
}

Reglas:
- Entre 4 y 6 fases, cada una accionable y secuencial.
- Entre 3 y 5 entregables concretos.
- Todo en español, profesional y detallado.
- No incluyas markdown ni texto fuera del JSON.`;

    const customInstructions = await loadInstructions(supabase, "plan");
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt + customInstructions },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes alcanzado. Intenta de nuevo en unos segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 403) {
        return new Response(JSON.stringify({ error: "El límite de créditos de IA del workspace se alcanzó. Ajusta el límite en Ajustes → Planes y créditos." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in AI response");

    let parsed: any = {};
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse plan response:", content);
      parsed = {};
    }

    const result = {
      title: typeof parsed.title === "string" ? parsed.title : "Plan estratégico",
      objective: typeof parsed.objective === "string" ? parsed.objective : "",
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      phases: Array.isArray(parsed.phases) ? parsed.phases.filter((p: any) => p && p.name).slice(0, 6) : [],
      deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables.filter((d: any) => typeof d === "string").slice(0, 5) : [],
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("plan-flow error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

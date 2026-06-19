import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { loadInstructions } from "../_shared/flow-instructions.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Context: templates + prospect industries ────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: templates } = await supabase
      .from("flow_templates")
      .select("title,description,tags")
      .limit(20);

    const { data: industriesRows } = await supabase
      .from("prospects")
      .select("industry")
      .not("industry", "is", null)
      .limit(200);

    const industries = Array.from(
      new Set((industriesRows ?? []).map((r: any) => r.industry).filter(Boolean))
    ).slice(0, 15);

    const templatesBlock = (templates && templates.length > 0)
      ? `ESTRUCTURAS DE FLUJO DE REFERENCIA (úsalas en silencio como inspiración para proponer opciones útiles):\n${templates.map((t: any) => `- ${t.title}: ${t.description} | tags: ${(t.tags ?? []).join(",")}`).join("\n")}`
      : "";

    const industriesBlock = industries.length > 0
      ? `INDUSTRIAS QUE CONOCES (úsalas en silencio para sugerir opciones concretas cuando el usuario hable de clientes o segmentos):\n${industries.join(", ")}`
      : "";

    const systemPrompt = `Eres el asistente estratégico de Miiles para crear diagramas de flujo. Piensas como un fundador/estratega de negocio: tu trabajo es ENTENDER LA INTENCIÓN y los OBJETIVOS del usuario.

Cuando el usuario da una instrucción MUY GENERAL o ambigua (ej: "haz un flujo de ventas", "ayúdame con mi negocio", "ideas"), NO generes nada todavía: en su lugar devuelve 2 o 3 preguntas cortas y estratégicas para afinar el objetivo, cada una con opciones rápidas para elegir.

Cuando el prompt YA es suficientemente específico (incluye objetivo, contexto y alcance claros), marca needs_clarification = false.

REGLA DE TONO CRÍTICA:
- NUNCA menciones bases de datos, "la base de datos", prospectos almacenados, ni de dónde sacas la información. Integra todo el conocimiento de forma natural, como si fuera tu propia experiencia de negocio.
- Las preguntas deben sonar como las de un consultor experto: orientadas a objetivos, mercado y resultados.

Usa el contexto disponible para proponer opciones útiles y concretas, sin revelar su origen:

${templatesBlock}

${industriesBlock}

Responde ÚNICAMENTE con JSON válido con esta forma exacta:
{
  "needs_clarification": boolean,
  "intent": "resumen breve de lo que crees que quiere el usuario",
  "questions": [
    {
      "id": "q1",
      "question": "Pregunta corta y clara",
      "allow_multiple": false,
      "options": ["Opción 1", "Opción 2", "Opción 3"]
    }
  ],
  "refined_prompt": "una versión mejorada y específica del prompt que el usuario podría usar directamente"
}

Reglas:
- Máximo 3 preguntas, cada una con 3 a 5 opciones concretas.
- Las preguntas deben estar en español, ser breves y accionables.
- Si needs_clarification es false, "questions" debe ser un arreglo vacío.
- "refined_prompt" siempre presente: si no se necesita aclaración, repite/mejora el prompt original.
- No incluyas markdown ni texto fuera del JSON.`;

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
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes alcanzado. Intenta de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
      console.error("Failed to parse clarify response:", content);
      // Fail open: don't block generation
      parsed = { needs_clarification: false, intent: prompt, questions: [], refined_prompt: prompt };
    }

    const result = {
      needs_clarification: Boolean(parsed.needs_clarification) && Array.isArray(parsed.questions) && parsed.questions.length > 0,
      intent: typeof parsed.intent === "string" ? parsed.intent : prompt,
      questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 3) : [],
      refined_prompt: typeof parsed.refined_prompt === "string" ? parsed.refined_prompt : prompt,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("clarify-flow error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

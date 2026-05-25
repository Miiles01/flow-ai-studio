import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function extractKeywords(prompt: string): string[] {
  const stop = new Set(["el","la","los","las","de","del","y","o","u","a","con","para","por","un","una","unos","unas","en","que","como","mi","tu","su","sus","me","te","se","lo","al","es","ser","estar","tiene","tengo","quiero","necesito","busco","ideas","negocio","flujo","crear","crea","haz","hazme","una","uno","sobre","sus","yo","como","esta","este","esto","ver"]);
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
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── RAG: fetch prospects + templates ────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
      const { data } = await supabase.from("prospects").select("name,company,email,phone,role,industry,location,website,notes,tags").or(orClauses).limit(20);
      prospects = data ?? [];
    }

    const { data: templates } = await supabase.from("flow_templates").select("title,description,tags,prompt_hint,nodes,edges").limit(10);

    const prospectsBlock = prospects.length > 0
      ? `\n\nPROSPECTOS EN LA BASE DE DATOS (úsalos como fuente primaria; si el usuario pide alguno listado aquí, refiérelo con sus datos reales):\n${JSON.stringify(prospects, null, 0)}`
      : "";

    const templatesBlock = (templates && templates.length > 0)
      ? `\n\nPLANTILLAS DE FLUJOS DE REFERENCIA (úsalas como inspiración estructural cuando apliquen):\n${(templates ?? []).map((t: any) => `- ${t.title}: ${t.description} | tags: ${(t.tags ?? []).join(",")} | hint: ${t.prompt_hint}`).join("\n")}`
      : "";

    const systemPrompt = `You are a flow diagram generator. Given a user description, generate a JSON array of steps for a flow diagram.

Each step must have:
- "label": short name (max 30 chars)
- "description": optional brief description (max 60 chars)  
- "type": one of "start", "process", "decision", "action", "end"

Rules:
- Always start with a "start" type node and end with an "end" type node
- Use "decision" for yes/no or conditional branches
- Use "action" for operations like sending emails, API calls, etc.
- Use "process" for general steps
- Generate 4-8 steps typically
- Respond ONLY with valid JSON array, no markdown, no explanation
- When the user asks about prospects or business ideas, prefer real prospects from the database below over invented ones.

Example output:
[{"label":"Inicio","type":"start"},{"label":"Recibir solicitud","description":"El usuario envía el formulario","type":"process"},{"label":"¿Datos válidos?","description":"Validar campos requeridos","type":"decision"},{"label":"Guardar en BD","description":"Insertar registro","type":"action"},{"label":"Enviar confirmación","description":"Email al usuario","type":"action"},{"label":"Fin","type":"end"}]${prospectsBlock}${templatesBlock}`;

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
          JSON.stringify({ error: "Créditos de IA agotados. Agrega fondos en Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let steps;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      steps = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify({ steps, used_prospects: prospects.length, used_templates: templates?.length ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-flow error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

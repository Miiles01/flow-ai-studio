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

    const systemPrompt = `You are an expert visual flow diagram generator. Generate a beautiful, highly professional, and structured JSON object representing a flow on a canvas.

Each node MUST have:
- "id": unique string identifier (e.g. "1", "2")
- "type": one of "shapeNode", "todoNode", "textNode", "imageNode"
- "position": {"x": number, "y": number}
- "style": {"width": number, "height": number} (optional but highly recommended: shapes default to 140x140, todos to 280x240 or wider if they have long tasks)
- "data": an object based on the type

Node Types and Data:
1. "shapeNode": {"shape": "square"|"circle"|"diamond"|"hexagon"|"star", "label": "text", "fillColor": "hex", "textColor": "hex", "fontSize": 14}
   - Use "circle" for start/end points, "diamond" for decision points, and "square" or other shapes for general processes.
2. "todoNode": {"title": "text", "subtitle": "text", "tasks": [{"id": "t1", "text": "detailed task description", "completed": boolean}], "backgroundColor": "hex", "accentColor": "hex", "textColor": "hex"}
   - Use for phases with actionable checklist items. Do not make tasks generic; customize them in detail based on the user request.
3. "textNode": {"html": "<b>Title</b>", "fontSize": 24, "textColor": "hex"}
   - Use for general headers, sections, or annotations.
4. "imageNode": {"url": "string", "width": number, "height": number}
   - Use for visual placeholders or logos.

Rules for Premium Visual Design:
- ALIGNMENT: Layout nodes neatly in a clean grid or linear structure. For sequential steps, increment X by 320 to 360 pixels. For parallel branches or decisions, offset Y by 240 to 280 pixels. Make sure nodes NEVER overlap.
- COLOR CONTRAST: Ensure high readability. If you set a dark card "backgroundColor" (e.g., #1F2937, #111827, #0F172A), you MUST set "textColor" to "#FFFFFF" or a very light gray. If you use a light card background, use dark text (e.g., #1F2937).
- COLOR PALETTES: Choose a cohesive palette. Avoid mixing random conflicting colors. Use sleek combinations:
  - Dark Premium: Dark card backgrounds (#1F2937, #1E1E24) with vibrant brand accents (#4059F1, #10B981, #EC4899, #8B5CF6) and white text.
  - Light Clean: White (#FFFFFF) or soft gray (#F3F4F6) card backgrounds with brand accents (#4059F1) and dark text (#1F2937).
- DEFAULT BRAND COLOR: The primary brand color is #4059F1. Use it as the default accentColor for todos and stroke color for edges.
- EDGES: Connect nodes logically. Set edge "style": {"stroke": "hex", "strokeWidth": 2}. Use "animated": true for active processes/main flows.
- When the user asks about prospects or business ideas, prefer real prospects from the database below over invented ones.
- Respond ONLY with valid JSON containing {"nodes": [...], "edges": [...]}, no markdown.

Example output:
{"nodes": [{"id":"1","type":"textNode","position":{"x":50,"y":50},"data":{"html":"<b>Inicio</b>","fontSize":24,"textColor":"#4059F1"}},{"id":"2","type":"shapeNode","position":{"x":50,"y":120},"style":{"width":140,"height":140},"data":{"shape":"circle","label":"Inicio del Flujo","fillColor":"#4059F1","textColor":"#FFFFFF"}},{"id":"3","type":"todoNode","position":{"x":350,"y":70},"style":{"width":280,"height":240},"data":{"title":"Fase de Planificación","subtitle":"Prerrequisitos obligatorios","tasks":[{"id":"t1","text":"Analizar requerimientos del cliente","completed":false},{"id":"t2","text":"Crear bocetos preliminares","completed":false}],"backgroundColor":"#1F2937","accentColor":"#4059F1","textColor":"#FFFFFF"}}], "edges": [{"id":"e2-3","source":"2","target":"3","animated":true,"style":{"stroke":"#4059F1","strokeWidth":2}}]}${prospectsBlock}${templatesBlock}`;

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

    let parsedData: any = {};
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    let nodes = [];
    let edges = [];
    if (parsedData.nodes) {
      nodes = parsedData.nodes;
      edges = parsedData.edges || [];
    } else if (Array.isArray(parsedData)) {
      nodes = parsedData;
    }

    return new Response(JSON.stringify({ nodes, edges, steps: nodes, used_prospects: prospects.length, used_templates: templates?.length ?? 0 }), {
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

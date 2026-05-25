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

    const systemPrompt = `You are an expert visual flow diagram generator. Generate a beautiful, structured JSON array of nodes representing a flow on a canvas.

Each node MUST have:
- "id": unique string identifier (e.g. "1", "2")
- "type": one of "shape", "todo", "text"
- "position": {"x": number, "y": number}
- "data": an object based on the type

Node Types and Data:
1. "shape": {"shape": "square"|"circle"|"diamond"|"hexagon"|"star", "label": "text", "fillColor": "hex", "textColor": "hex", "fontSize": 14}
2. "todo": {"title": "text", "subtitle": "text", "tasks": [{"id": "t1", "text": "task", "completed": boolean}], "backgroundColor": "hex", "accentColor": "hex"}
3. "text": {"html": "<b>Title</b>", "fontSize": 24, "textColor": "hex"}

Rules:
- Organize the nodes logically with X and Y positions. Typically increment X by 250 for sequential steps.
- Make it colorful and visually appealing (use colors like #3B82F6, #F97316, #22C55E, #EC4899, #FACC15).
- Include "width" and "height" in "style" if needed (shapes: 140x140, todos: 280x200).
- If you use edges, generate them in a separate array "edges": [{"id": "e1-2", "source": "1", "target": "2", "animated": true, "style": {"stroke": "hex", "strokeWidth": 2}}].
- Respond ONLY with valid JSON with {"nodes": [...], "edges": [...]}, no markdown.
- When the user asks about prospects or business ideas, prefer real prospects from the database below over invented ones.

Example output:
{"nodes": [{"id":"1","type":"text","position":{"x":50,"y":50},"data":{"html":"<b>Inicio</b>","fontSize":24,"textColor":"#4059F1"}},{"id":"2","type":"shape","position":{"x":50,"y":100},"style":{"width":140,"height":140},"data":{"shape":"circle","label":"Paso 1","fillColor":"#3B82F6","textColor":"#FFFFFF"}},{"id":"3","type":"todo","position":{"x":300,"y":50},"style":{"width":280,"height":200},"data":{"title":"Tareas","tasks":[{"id":"t1","text":"Hacer esto","completed":true}],"backgroundColor":"#1F2937","accentColor":"#A855F7"}}], "edges": [{"id":"e2-3","source":"2","target":"3","animated":true,"style":{"stroke":"#3B82F6","strokeWidth":2}}]}${prospectsBlock}${templatesBlock}`;

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

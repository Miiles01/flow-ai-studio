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
    // Fallback: if no keyword match, bring a recent base set so the AI always has client context
    if (prospects.length === 0) {
      const { data } = await supabase.from("prospects").select("name,company,email,phone,role,industry,location,website,notes,tags").order("created_at", { ascending: false }).limit(15);
      prospects = data ?? [];
    }

    const { data: templates } = await supabase.from("flow_templates").select("title,description,tags,prompt_hint,nodes,edges").limit(10);

    const prospectsBlock = prospects.length > 0
      ? `\n\nPROSPECTOS EN LA BASE DE DATOS (úsalos como fuente primaria; si el usuario pide alguno listado aquí, refiérelo con sus datos reales. Cada prospecto puede tener un campo "website" con su sitio real):\n${JSON.stringify(prospects, null, 0)}`
      : "";

    const templatesBlock = (templates && templates.length > 0)
      ? `\n\nPLANTILLAS DE FLUJOS DE REFERENCIA (úsalas como inspiración estructural cuando apliquen):\n${(templates ?? []).map((t: any) => `- ${t.title}: ${t.description} | tags: ${(t.tags ?? []).join(",")} | hint: ${t.prompt_hint}`).join("\n")}`
      : "";

    const systemPrompt = `You are an expert visual flow diagram generator AND a seasoned business strategist/founder. Think like someone who BUILDS businesses: every flow must reflect clear objectives, real strategy, concrete actions, owners, metrics and outcomes — never generic filler. Generate a beautiful, highly professional, comprehensive and DEEPLY DETAILED structured JSON object representing a flow on a canvas. If an approved strategic plan is provided in the user message, follow it faithfully: turn each phase into a clear section with detailed steps and checklists. NEVER mention databases or where information comes from inside the flow content.

Each node MUST have:
- "id": unique string identifier (e.g. "1", "2")
- "type": one of "shapeNode", "todoNode", "textNode", "imageNode"
- "position": {"x": number, "y": number}
- "style": {"width": number, "height": number} (optional but highly recommended: shapes default to 140x140, todos to 280x240 or wider if they have long tasks)
- "data": an object based on the type

Node Types and Data:
1. "shapeNode": {"shape": "square"|"circle"|"diamond"|"hexagon"|"star", "label": "text", "fillColor": "hex", "textColor": "hex", "fontSize": 14}
   - Use "circle" for start/end points, "diamond" for decision points, and "square" or other shapes for general processes.
   - LINE BREAKS FOR BALANCED TEXT: The UI renders newlines perfectly and wraps words cleanly. You MUST insert explicit '\n' in the "label" string to split long lines into balanced rows (e.g. use "Creación de\nContenido" or "Enviar\nEmail Frío" or "¿Presupuesto\npara Ads?" instead of single long lines) so words do not break awkwardly. NEVER use HTML tags like "<br>", "<br/>" or any markup inside shapeNode "label"; use ONLY the '\n' character for line breaks.
 2. "todoNode": {"title": "text", "subtitle": "text", "tasks": [{"id": "t1", "text": "detailed task description", "completed": boolean, "note": "extra AI-only instructions"}], "backgroundColor": "#FFFFFF", "accentColor": "hex", "textColor": "#000000"}
    - Use for phases with actionable checklist items.
    - HIDDEN AI INSTRUCTIONS: For each task add an optional "note" field with extra, more detailed instructions that help an external AI execute the task (expected output, context, success criteria). The "note" is NOT shown to the user in the UI; it is only used when the user copies the list to paste into an AI. Keep "text" short and human-friendly, and put the richer execution detail in "note". Only add "note" when the task text is generic or could be ambiguous; a well-specified task can omit it.
   - CRITICAL COLOR RULE: Checklist backgrounds MUST ALWAYS be "#FFFFFF" (pure white) and text/labels/title/subtitle MUST ALWAYS be "#000000" (pure black). NEVER use dark backgrounds or other colors for todoNode.
   - RESPONSIVE WRAPPING: Title, subtitle, and task items automatically wrap to new lines and auto-resize height if long or if container is small. Write complete, detailed task items without fear of text clipping.
3. "textNode": {"html": "<b style='color:#000000'>Title</b>", "fontSize": 24, "textColor": "#000000"}
   - Use for general headers, sections, or annotations.
   - CRITICAL COLOR RULE: Titles and text nodes MUST ALWAYS use "#000000" (pure black) for "textColor" and inside HTML style attributes. NEVER use gray or any other colors for titles.
4. "imageNode": {"url": "string", "width": number, "height": number}
   - Use for visual placeholders or logos.
5. "embedNode": {"url": "https://..."} con "style": {"width": 480, "height": 320}
   - Embebe una página web real dentro del canvas (iframe en vivo). Úsalo SOLO con URLs reales (por ejemplo el campo "website" de un prospecto de la base de datos). NUNCA inventes URLs.

Rules for Premium Visual Design:
- ALIGNMENT & SYMMETRY: Nodes in the same sequence must be aligned on the exact same horizontal grid line (e.g. Y: 250) to look like a high-end mind map.
- CONSTANT X-SPACING: Every consecutive node in a sequence must increment X by exactly 350 pixels (e.g. X: 100, X: 450, X: 800...).
- DECISION BRANCHING: For decision points (diamond shape):
  - Offset one branch (e.g. "Yes") downwards by exactly 200px (Y: +200) and keep that branch straight (Y constant).
  - Offset the other branch (e.g. "No") upwards by exactly 200px (Y: -200) and keep that branch straight (Y constant).
  - This forms clean, straight parallel lanes and avoids random angles or overlaps.
- COLOR RULES: Checklists (todoNodes) MUST be "#FFFFFF" (pure white) with "#000000" (pure black) text. Titles (textNodes) MUST be "#000000" (pure black). Other shapeNodes can use vibrant palettes.
- COLOR PALETTES: Choose a cohesive palette for shapeNodes. Avoid mixing random conflicting colors. Use sleek combinations:
  - shapeNodes: vibrant accents (#4059F1, #10B981, #EC4899, #8B5CF6) with white text.
- DEFAULT BRAND COLOR: The primary brand color is #4059F1. Use it as the default accentColor for todos and stroke color for edges.
- EDGES: Connect nodes logically. Set edge "style": {"stroke": "hex", "strokeWidth": 2}. Do NOT animate the edges (always set "animated": false or omit it).
- When the user asks about prospects or business ideas, prefer real prospects from the database below over invented ones.
- CONTEXTO DEL CLIENTE: Antes de diseñar, infiere el contexto, la industria y los OBJETIVOS del cliente a partir del prompt y de los prospectos disponibles, y construye el flujo en función de esos objetivos.
- EMBEDS DE SITIO WEB: Si un prospecto relevante tiene un campo "website", PUEDES (no es obligatorio) añadir un "embedNode" con esa URL real cuando aporte valor al plan o a los objetivos planteados (p. ej. para revisar el sitio del cliente/competencia). Decide si es necesario según el plan; no lo agregues por defecto en cada flujo.
- Respond ONLY with valid JSON containing {"nodes": [...], "edges": [...]}, no markdown.

Example output:
{"nodes": [{"id":"1","type":"textNode","position":{"x":50,"y":50},"data":{"html":"<b style='color:#000000'>Inicio</b>","fontSize":24,"textColor":"#000000"}},{"id":"2","type":"shapeNode","position":{"x":50,"y":120},"style":{"width":140,"height":140},"data":{"shape":"circle","label":"Inicio del Flujo","fillColor":"#4059F1","textColor":"#FFFFFF"}},{"id":"3","type":"todoNode","position":{"x":350,"y":70},"style":{"width":280,"height":240},"data":{"title":"Fase de Planificación","subtitle":"Prerrequisitos obligatorios","tasks":[{"id":"t1","text":"Analizar requerimientos del cliente","completed":false},{"id":"t2","text":"Crear bocetos preliminares","completed":false}],"backgroundColor":"#FFFFFF","accentColor":"#4059F1","textColor":"#000000"}}], "edges": [{"id":"e2-3","source":"2","target":"3","animated":false,"style":{"stroke":"#4059F1","strokeWidth":2}}]}${prospectsBlock}${templatesBlock}`;

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

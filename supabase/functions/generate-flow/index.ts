import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { loadInstructions, loadInstruction } from "../_shared/flow-instructions.ts";
import { callLLM, parseUserModel, resolveTarget, type LLMTarget } from "../_shared/llm.ts";

const FALLBACK_MODEL = "google/gemini-3-flash-preview";

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

// ─── Apify: actor IDs ─────────────────────────────────────────────────────
const APIFY_ACTORS = {
  google_maps: "compass~crawler-google-places",
  instagram: "apify~instagram-scraper",
};

type SearchPlan = {
  needsSearch: boolean;
  channel: "instagram" | "google_maps" | null;
  query: string;
  location: string | null;
  limit: number;
};

// Ask the model whether the user wants to DISCOVER new real prospects, and on which channel.
async function classifyIntent(prompt: string, target: LLMTarget, searchGuidance?: string): Promise<SearchPlan> {
  const sys = `Eres un clasificador de intención para un generador de flujos de prospección.
Decide si el usuario quiere DESCUBRIR cuentas/negocios/prospectos REALES y NUEVOS (no solo planear).
Canales disponibles:
- "instagram": cuando busca cuentas, creadores, marcas o perfiles de Instagram.
- "google_maps": cuando busca negocios locales, empresas, tiendas o lugares (por nicho + ubicación).
Si el usuario solo quiere un plan/estrategia sin buscar prospectos reales, needsSearch=false.${searchGuidance && searchGuidance.trim() ? `\n\n=== REGLAS DE BÚSQUEDA DE MIILES (PRIORIDAD ALTA) ===\n${searchGuidance.trim()}\n=== FIN REGLAS DE BÚSQUEDA ===` : ""}
Responde SOLO JSON válido con esta forma:
{"needsSearch":boolean,"channel":"instagram"|"google_maps"|null,"query":"términos de búsqueda limpios","location":"ciudad/país o null","limit":6}
El "query" debe ser conciso y en el idioma del usuario. limit entre 4 y 8.`;
  try {
    const r = await callLLM(target, [
      { role: "system", content: sys },
      { role: "user", content: prompt },
    ], { maxTokens: 800 });
    if (!r.ok) return { needsSearch: false, channel: null, query: "", location: null, limit: 6 };
    const c = r.content ?? "";
    const cleaned = c.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      needsSearch: !!parsed.needsSearch,
      channel: parsed.channel === "instagram" || parsed.channel === "google_maps" ? parsed.channel : null,
      query: typeof parsed.query === "string" ? parsed.query : "",
      location: typeof parsed.location === "string" && parsed.location ? parsed.location : null,
      limit: Math.min(8, Math.max(4, Number(parsed.limit) || 6)),
    };
  } catch (e) {
    console.error("classifyIntent failed:", e);
    return { needsSearch: false, channel: null, query: "", location: null, limit: 6 };
  }
}

// Classify whether the user wants to LEARN a concept vs PLAN actionable tasks.
type ContentMode = "learn" | "plan" | "mixed";
async function classifyContentMode(prompt: string, target: LLMTarget): Promise<ContentMode> {
  const sys = `Eres un clasificador de intención para un generador de esquemas visuales.
Debes decidir la INTENCIÓN del usuario:
- "learn": quiere entender, aprender o que le expliquen un concepto, teoría, fundamentos, definición o funcionamiento. Ejemplos: "¿qué es el marketing?", "explícame la fotosíntesis", "cómo funciona SEO", "diferencia entre X y Y", "conceptos básicos de finanzas", "resumen de la teoría de...".
- "plan": quiere un plan, estrategia, pasos o tareas accionables para EJECUTAR algo. Ejemplos: "crea un plan de lanzamiento", "pasos para conseguir clientes", "estrategia de contenido para mi marca", "tareas para migrar la app", "flujo de prospección".
- "mixed": si el prompt claramente pide ambas cosas (entender + ejecutar).
Ante duda entre learn y plan, elige el que mejor refleje el verbo principal del usuario. Si el usuario solo hace una pregunta conceptual sin pedir tareas, es "learn".
Responde SOLO JSON válido: {"mode":"learn"|"plan"|"mixed"}`;
  try {
    const r = await callLLM(target, [
      { role: "system", content: sys },
      { role: "user", content: prompt },
    ], { maxTokens: 200 });
    if (!r.ok) return "mixed";
    const c = r.content ?? "";
    const cleaned = c.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return parsed.mode === "learn" || parsed.mode === "plan" ? parsed.mode : "mixed";
  } catch (e) {
    console.error("classifyContentMode failed:", e);
    return "mixed";
  }
}

// Run an Apify actor synchronously and return its dataset items.
async function runApify(actor: string, input: unknown, token: string): Promise<any[]> {
  const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}&timeout=90`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error("Apify error:", actor, r.status, t.slice(0, 500));
    return [];
  }
  const items = await r.json();
  return Array.isArray(items) ? items : [];
}

function s(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

// Map raw Apify items into prospect rows.
function mapGoogleMaps(items: any[]): any[] {
  return items.map((it) => ({
    name: s(it.title),
    company: s(it.title),
    email: s(it.email) ?? (Array.isArray(it.emails) ? s(it.emails[0]) : null),
    phone: s(it.phone) ?? s(it.phoneUnformatted),
    role: null,
    industry: s(it.categoryName) ?? (Array.isArray(it.categories) ? s(it.categories[0]) : null),
    location: s(it.address) ?? ([s(it.city), s(it.state)].filter(Boolean).join(", ") || null),
    website: s(it.website) ?? s(it.url),
    notes: s(it.description) ?? null,
    tags: Array.isArray(it.categories) ? it.categories.filter((x: any) => typeof x === "string").slice(0, 6) : [],
    source_file: "apify-google-maps",
    raw: it,
  })).filter((p) => p.name);
}

function mapInstagram(items: any[]): any[] {
  return items.map((it) => {
    const username = s(it.username) ?? s(it.ownerUsername);
    return {
      name: s(it.fullName) ?? s(it.full_name) ?? username,
      company: s(it.fullName) ?? s(it.full_name) ?? username,
      email: s(it.businessEmail) ?? s(it.public_email),
      phone: s(it.businessPhoneNumber),
      role: null,
      industry: s(it.businessCategoryName) ?? s(it.category),
      location: s(it.city) ?? null,
      website: s(it.externalUrl) ?? (username ? `https://instagram.com/${username}` : null),
      notes: s(it.biography) ?? null,
      tags: username ? [`@${username}`] : [],
      source_file: "apify-instagram",
      raw: it,
    };
  }).filter((p) => p.name);
}

// Insert prospects into the "brain", deduping by website/company.
async function ingestProspects(supabase: any, rows: any[]): Promise<any[]> {
  if (rows.length === 0) return [];
  const websites = rows.map((r) => r.website).filter(Boolean);
  const companies = rows.map((r) => r.company).filter(Boolean);
  const existing = new Set<string>();
  if (websites.length) {
    const { data } = await supabase.from("prospects").select("website").in("website", websites);
    (data ?? []).forEach((d: any) => d.website && existing.add(`w:${d.website.toLowerCase()}`));
  }
  if (companies.length) {
    const { data } = await supabase.from("prospects").select("company").in("company", companies);
    (data ?? []).forEach((d: any) => d.company && existing.add(`c:${d.company.toLowerCase()}`));
  }
  const seen = new Set<string>();
  const fresh = rows.filter((r) => {
    const wk = r.website ? `w:${r.website.toLowerCase()}` : null;
    const ck = r.company ? `c:${r.company.toLowerCase()}` : null;
    if ((wk && existing.has(wk)) || (ck && existing.has(ck))) return false;
    const dedupKey = wk ?? ck ?? JSON.stringify(r.raw);
    if (seen.has(dedupKey)) return false;
    seen.add(dedupKey);
    return true;
  });
  if (fresh.length === 0) return rows; // nothing new, still return found for the flow
  const { error } = await supabase.from("prospects").insert(fresh);
  if (error) console.error("ingestProspects insert error:", error.message);
  return rows;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");

    const { prompt, userModel } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // BYOK: si el usuario trae su propia llave, se usa su proveedor/modelo.
    // Si no, fallback transparente al gateway global + google/gemini-3-flash-preview.
    const byok = parseUserModel(userModel);
    if (!byok && !LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    const target = resolveTarget(byok, FALLBACK_MODEL, LOVABLE_API_KEY ?? "");
    console.log("generate-flow target:", target.label);

    // ─── RAG: fetch prospects + templates ────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Classify content intent (learn vs plan) in parallel with the rest of prep.
    const contentModePromise = classifyContentMode(prompt, target);


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

    // ─── Apify channel: discover NEW real prospects when intent requires it ──
    let apifyFound: any[] = [];
    let apifyChannel: string | null = null;
    if (APIFY_API_TOKEN) {
      const searchGuidance = await loadInstruction(supabase, "search");
      const plan = await classifyIntent(prompt, LOVABLE_API_KEY, searchGuidance);
      if (plan.needsSearch && plan.channel && plan.query) {
        apifyChannel = plan.channel;

        // The Apify actor can be slow; run it as a task and wait at most ~22s.
        // If it returns in time → use in this flow + save to brain.
        // If not → keep running in the background and ingest into the brain for next time.
        const apifyTask = (async (): Promise<any[]> => {
          if (plan.channel === "google_maps") {
            const searchString = plan.location ? `${plan.query} ${plan.location}` : plan.query;
            const items = await runApify(APIFY_ACTORS.google_maps, {
              searchStringsArray: [searchString],
              maxCrawledPlacesPerSearch: plan.limit,
              language: "es",
            }, APIFY_API_TOKEN);
            return mapGoogleMaps(items);
          }
          const items = await runApify(APIFY_ACTORS.instagram, {
            search: plan.query,
            searchType: "user",
            searchLimit: plan.limit,
            resultsType: "details",
            resultsLimit: plan.limit,
            addParentData: false,
          }, APIFY_API_TOKEN);
          return mapInstagram(items);
        })();

        const TIMEOUT = Symbol("timeout");
        let winner: any[] | typeof TIMEOUT;
        try {
          winner = await Promise.race([
            apifyTask,
            new Promise<typeof TIMEOUT>((res) => setTimeout(() => res(TIMEOUT), 22000)),
          ]);
        } catch (e) {
          console.error("Apify search failed:", e);
          winner = [];
        }

        if (winner === TIMEOUT) {
          // Finish the search in the background and save to the brain for next time.
          const bg = apifyTask
            .then((found) => found.length > 0 ? ingestProspects(supabase, found) : null)
            .catch((e) => console.error("Apify background ingest failed:", e));
          (globalThis as any).EdgeRuntime?.waitUntil?.(bg);
        } else {
          apifyFound = Array.isArray(winner) ? winner : [];
          if (apifyFound.length > 0) {
            await ingestProspects(supabase, apifyFound); // always save to the brain (deduped)
            const slim = apifyFound.map((p) => ({
              name: p.name, company: p.company, email: p.email, phone: p.phone,
              role: p.role, industry: p.industry, location: p.location,
              website: p.website, notes: p.notes, tags: p.tags,
            }));
            prospects = [...slim, ...prospects];
          }
        }
      }
    }

    const { data: templates } = await supabase.from("flow_templates").select("title,description,tags,prompt_hint,nodes,edges").limit(10);

    const prospectsBlock = prospects.length > 0
      ? `\n\nPROSPECTOS EN LA BASE DE DATOS (úsalos como fuente primaria; si el usuario pide alguno listado aquí, refiérelo con sus datos reales. Cada prospecto puede tener un campo "website" con su sitio/perfil real):\n${JSON.stringify(prospects, null, 0)}`
      : "";

    const apifyBlock = apifyFound.length > 0
      ? `\n\nPROSPECTOS RECIÉN ENCONTRADOS EN VIVO (canal ${apifyChannel}). Estos son cuentas/negocios REALES descubiertos para esta petición. DEBES incluirlos en el flujo: por cada uno crea un "embedNode" o un "textNode" con su enlace real (campo "website") para que el usuario pueda hacer clic y verlo. Preséntalos como los prospectos objetivo del flujo:\n${JSON.stringify(apifyFound.map((p) => ({ name: p.name, industry: p.industry, location: p.location, website: p.website, notes: p.notes })), null, 0)}`
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
   - DO NOT generate a global title or header textNode at the top of the canvas for the flow. Omit the general title entirely. Use textNodes ONLY for specific annotations or clickable prospect links: usa "<a href='URL_REAL' style='color:#4059F1'>Nombre del prospecto</a>".
   - CRITICAL COLOR RULE: Text nodes MUST ALWAYS use "#000000" (pure black) for "textColor" and inside HTML style attributes.
4. "imageNode": {"url": "string", "width": number, "height": number}
   - Use for visual placeholders or logos.
5. "embedNode": {"url": "https://..."} con "style": {"width": 480, "height": 320}
   - Embebe una página web real dentro del canvas (iframe en vivo). Úsalo SOLO con URLs reales (por ejemplo el campo "website" de un prospecto de la base de datos o de los prospectos recién encontrados). NUNCA inventes URLs.
6. "kanbanNode" (WIDGET PIZARRA — SOLO usar si el usuario pide explícitamente una "pizarra", "kanban", "tablero de tareas", "board de tareas" o similar; NUNCA lo generes por defecto en flujos normales):
   - "style": {"width": 780, "height": 440} (recomendado, puede ser mayor si hay muchas tarjetas)
   - "data": {"title": "Nombre de la pizarra", "showTitle": true, "showSubtitle": false, "backgroundColor": "#FFFFFF", "textColor": "#111827", "accentColor": "#4059F1", "columns": [{"id":"col-1","title":"Por hacer","cards":[{"id":"c-1","title":"Tarea","subtitle":"Opcional","url":"https://opcional.com","fields":[{"id":"f-1","label":"Prioridad","value":"Alta"}]}]}]}
   - Cada columna necesita "id" único y "title". Cada card necesita "id" único y "title"; "subtitle", "url" y "fields" son opcionales.
   - Colores: fondo blanco #FFFFFF, texto #111827 (el UI invierte automáticamente en dark mode).
   - POSICIONAMIENTO: si se incluye junto a un flujo, colócalo aparte para no chocar con los nodos del flujo (por ejemplo bien a la derecha o debajo, dejando al menos 200px de separación). NO conectes edges hacia/desde el kanbanNode (no admite conexiones).

Rules for Premium Visual Design:
- ALIGNMENT & SYMMETRY: Nodes in the same sequence must be aligned on the exact same horizontal grid line (e.g. Y: 250) to look like a high-end mind map.
- CONSTANT X-SPACING: Every consecutive node in a sequence must increment X by exactly 350 pixels (e.g. X: 100, X: 450, X: 800...).
- DECISION BRANCHING: For decision points (diamond shape):
  - Offset one branch (e.g. "Yes") downwards by exactly 200px (Y: +200) and keep that branch straight (Y constant).
  - Offset the other branch (e.g. "No") upwards by exactly 200px (Y: -200) and keep that branch straight (Y constant).
  - This forms clean, straight parallel lanes and avoids random angles or overlaps.
- COLOR RULES: Checklists (todoNodes) MUST be "#FFFFFF" (pure white) with "#000000" (pure black) text. Titles (textNodes) MUST be "#000000" (pure black).
- COLOR PALETTES: For shapeNodes, strictly prioritize using black (#000000) or brand blue (#4059F1) backgrounds with white text. Do not use random colors like orange, red, green, etc., unless strictly necessary for semantic meaning.
- DEFAULT BRAND COLOR: The primary brand color is #4059F1. Use it as the default accentColor for todos and stroke color for edges.
- EDGES: Connect nodes logically. Set edge "style": {"stroke": "hex", "strokeWidth": 2}. Do NOT animate the edges (always set "animated": false or omit it).
- When the user asks about prospects or business ideas, prefer real prospects from the database below over invented ones.
- CONTEXTO DEL CLIENTE: Antes de diseñar, infiere el contexto, la industria y los OBJETIVOS del cliente a partir del prompt y de los prospectos disponibles, y construye el flujo en función de esos objetivos.
- EMBEDS / ENLACES DE PROSPECTOS: Si hay "PROSPECTOS RECIÉN ENCONTRADOS EN VIVO", DEBES incluir cada uno en el flujo con su enlace real (embedNode con su "website", o textNode con un <a href> clicable). Para prospectos de la base de datos con "website", PUEDES añadir un "embedNode" cuando aporte valor.
- Respond ONLY with valid JSON containing {"nodes": [...], "edges": [...]}, no markdown.

Example output:
{"nodes": [{"id":"1","type":"shapeNode","position":{"x":50,"y":120},"style":{"width":140,"height":140},"data":{"shape":"circle","label":"Inicio del Flujo","fillColor":"#000000","textColor":"#FFFFFF"}},{"id":"2","type":"todoNode","position":{"x":350,"y":70},"style":{"width":280,"height":240},"data":{"title":"Fase de Planificación","subtitle":"Descripción de la fase","tasks":[{"id":"t1","text":"Analizar requerimientos","completed":false}],"backgroundColor":"#FFFFFF","accentColor":"#4059F1","textColor":"#000000"}}], "edges": [{"id":"e1-2","source":"1","target":"2","animated":false,"style":{"stroke":"#4059F1","strokeWidth":2}}]}

INTENT-BASED NODE SELECTION (REGLA CRÍTICA — LEE ANTES DE GENERAR):
No conviertas todo en checklist. Elige el tipo de nodo según la INTENCIÓN del usuario:
- Conceptos / teoría / explicaciones / "qué es" / "cómo funciona" → shapeNode + textNode (mapa conceptual, esquema visual).
- Acciones / pasos / plan / estrategia / "cómo hago" → todoNode con tareas accionables.
Los textNode NO son solo para títulos: en contenido conceptual DEBEN contener explicaciones completas en HTML (oraciones, definiciones, ejemplos, con <b>, <i>, <ul><li>) — nunca verbos de acción tipo tarea.
${apifyBlock}${prospectsBlock}${templatesBlock}`;

    const customInstructions = await loadInstructions(supabase, "generate");
    const contentMode = await contentModePromise;

    const modeGuidance =
      contentMode === "learn"
        ? `\n\n=== MODO DE CONTENIDO: LEARN (APRENDER) ===
El usuario quiere ENTENDER un concepto, teoría o fundamentos. NO quiere tareas.
REGLAS OBLIGATORIAS:
- PROHIBIDO usar "todoNode" en este flujo (a menos que el usuario lo pida explícitamente en su prompt).
- Construye un MAPA CONCEPTUAL / ESQUEMA visual:
  * Un nodo central (shapeNode circle o hexagon) con el concepto principal.
  * Ramas con subconceptos (shapeNode square/hexagon) y hojas con definiciones/ejemplos (textNode).
  * Usa "diamond" solo para distinciones/decisiones conceptuales (ej. "¿es B2B o B2C?").
- Los textNode DEBEN contener explicaciones completas en HTML: oraciones reales, definiciones ("El X es..."), ejemplos, con <b>, <i>, <ul><li>. NO listas de acciones.
- Etiqueta los edges con relaciones conceptuales cortas cuando ayude ("incluye", "se divide en", "influye en", "vs").
- Mezcla shapeNode y textNode para que el esquema sea visualmente rico, no una sola columna de cajas iguales.
=== FIN MODO ===`
        : contentMode === "plan"
        ? `\n\n=== MODO DE CONTENIDO: PLAN (EJECUTAR) ===
El usuario quiere un plan accionable. Usa "todoNode" con tareas concretas y verbos de acción, agrupadas por fases. Es el comportamiento estándar.
=== FIN MODO ===`
        : `\n\n=== MODO DE CONTENIDO: MIXED ===
El usuario quiere contexto conceptual + acción. Empieza el esquema con nodos conceptuales (shapeNode + textNode explicativos) y añade 1-2 todoNode al final SOLO para la parte ejecutable. No conviertas los conceptos en tareas.
=== FIN MODO ===`;

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
            { role: "system", content: systemPrompt + modeGuidance + customInstructions },
            { role: "user", content: prompt },
          ],
        }),
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

    return new Response(JSON.stringify({
      nodes,
      edges,
      steps: nodes,
      used_prospects: prospects.length,
      used_templates: templates?.length ?? 0,
      apify_channel: apifyChannel,
      apify_found: apifyFound.length,
      content_mode: contentMode,
    }), {
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

// Widget AI — clasifica intención (query/edit) y aplica cambios o responde con un comentario.
import { callLLM, parseUserModel, resolveTarget } from "../_shared/llm.ts";
import { appsCatalogText, loadUserApps, maybeUseApps } from "../_shared/userApps.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FALLBACK_MODEL = "google/gemini-2.5-flash";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { widgetType, data, prompt, history, userModel } = await req.json();
    if (!widgetType || !prompt) {
      return new Response(JSON.stringify({ error: "widgetType y prompt requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const byok = parseUserModel(userModel);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!byok && !apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY no configurada" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const schemaHints: Record<string, string> = {
      kanbanNode: `KanbanNodeData: { title?: string, columns: [{ id, title, cards: [{ id, title, subtitle?, description?, extraTexts?: [{id,label,value}], tags?: [{id,label,color}], assignees?: [{id,name,email?}], imageUrl?, imageRatio?: "1:1"|"4:3"|"16:9", priority?: "low"|"medium"|"high" }] }] }. Al VACIAR información (texto largo, listas, notas, ideas), REPARTE los items como cards en columnas lógicas (por defecto: "Por hacer", "En progreso", "Hecho"). Cada línea/idea del usuario = una card con title claro; usa description/subtitle si hay detalle; extrae assignees si hay nombres/emails; extrae tags si hay categorías; infiere priority si el usuario menciona urgencia.`,
      clientCardNode: `ClientCardNodeData: { name, role?, company?, email?, phone?, notes?, value?, currency?, tags?: [{id,label,color}], assignees?, fields?: [{id,label,value}] }. Extrae datos de contacto y agrupa datos extra en "fields".`,
      campaignsNode: `CampaignsNodeData: { title?, campaigns: [{ id, brand, status: "Pendiente"|"Activa"|"Completada", payType: "monetario"|"intercambio", amount?, currency?, installments?: [{id, amount, dueDate, paid}], deliverables?: { reels?, posts?, stories?, tiktoks?, ugc?, otros? }, startDate?, endDate?, notes?, client?, assignees? }] }. Cuando el usuario vacíe lista de marcas/campañas, crea una entrada por marca con los datos que menciones; usa valores plausibles si faltan.`,
      ingresosNode: `IngresosNode agrega automáticamente los campañasNode del canvas — normalmente NO se edita su data manualmente; si el usuario pregunta, contesta como query.`,
    };

    const system = `Eres el asistente de widgets de Miiles. Recibes widgetType, data (JSON actual), prompt del usuario y opcional history.

Decide la intención:
- "query": el usuario PIDE INFORMACIÓN sin cambiar la data (preguntas, "dime", "muéstrame", "cuáles son"). Devuelves respuesta en Markdown en "answer".
- "edit": el usuario PIDE CUALQUIER CAMBIO sobre la data del widget. Devuelves el objeto data COMPLETO ya modificado en "data_json".

QUÉ CUENTA COMO EDIT (todos son edit, NO query):
- Agregar: "añade", "mete", "crea", "agrega", vaciados de listas/ideas/tareas/marcas.
- Eliminar: "borra", "elimina", "quita", "remueve", "sácame", "limpia", "vacía", "empieza de cero", "resetea", "borra todas las cards de tal columna", "elimina las campañas pendientes".
- Modificar: "cambia", "actualiza", "renombra", "corrige", "mueve", "reasigna", "marca como hecho/pagado", "cambia el estado", "pon prioridad alta", "cambia la fecha", "cambia el monto".
- Resumir/Condensar la DATA del widget: "resume las cards", "consolida", "junta las duplicadas", "acorta los títulos", "deja solo lo importante", "reduce a N items". Esto es edit: reescribe la data condensada dentro del widget.
- Reordenar, reorganizar, mover entre columnas, agrupar, dividir cards.
- Operaciones masivas y condicionales sobre items existentes.

Diferencia clave: si el usuario quiere VER un resumen sin tocar el widget ("dime un resumen", "cuántas cards hay") → query. Si quiere que el widget QUEDE resumido/modificado → edit.
Si es ambiguo pero usa verbos imperativos de acción (resume, borra, cambia, elimina, mete), prefiere edit.

REGLAS DE EDIT:
- Devuelve SIEMPRE el objeto data COMPLETO (no un diff), respetando exactamente el schema del widget.
- Para AGREGAR sin borrar: mantén todo lo previo y añade lo nuevo.
- Para BORRAR/RESUMIR/REEMPLAZAR: sí quita/reescribe lo que el usuario pide; NO preserves lo que te pide eliminar o condensar.
- Preserva IDs de items que no se tocan. Genera IDs nuevos como strings cortos ("c_" + random) solo para items nuevos.
- No añadas propiedades desconocidas al schema.

BULK INGEST (edit):
- Parsea líneas, viñetas, párrafos, listas separadas por comas.
- Deduplica items obviamente repetidos.
- Distribuye lógicamente según el schema del widget.
- Rellena campos faltantes con valores plausibles; no inventes datos sensibles (emails, teléfonos) salvo que el usuario los dé.

Schema del widget actual (${widgetType}):
${schemaHints[widgetType] ?? "(schema desconocido — infiere del data actual)"}

Responde SIEMPRE con la tool "widget_result".`;

    const tool = {
      name: "widget_result",
      description: "Resultado de la operación sobre el widget",
      parameters: {
        type: "object",
        properties: {
          intent: { type: "string", enum: ["query", "edit"] },
          answer: { type: "string", description: "Respuesta en Markdown si intent=query" },
          data_json: { type: "string", description: "Si intent=edit, JSON string con el objeto data COMPLETO ya modificado (mismo schema que el data actual)" },
        },
        required: ["intent"],
        additionalProperties: false,
      },
    };

    const messages: any[] = [{ role: "system", content: system }];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h?.role && h?.content) messages.push({ role: h.role, content: String(h.content) });
      }
    }
    messages.push({
      role: "user",
      content: `widgetType: ${widgetType}\ndata actual:\n${JSON.stringify(data ?? {}, null, 2)}\n\nInstrucción del usuario:\n${prompt}`,
    });

    const target = resolveTarget(byok, FALLBACK_MODEL, apiKey ?? "");
    console.log("widget-ai target:", target.label);
    const res = await callLLM(target, messages, { tool, maxTokens: 16000 });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `IA (${target.label}) ${res.status}: ${res.errorText ?? ""}` }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const finishReason = res.finishReason;
    const rawArgs = res.toolArgs;
    if (!rawArgs) {
      console.error("widget-ai no tool_call. finish:", finishReason, "content:", res.content?.slice(0, 500));
      return new Response(JSON.stringify({ error: "Respuesta inválida de IA" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let parsed: any;
    try {
      parsed = JSON.parse(rawArgs);
    } catch (e) {
      console.error("widget-ai args no parseables. finish:", finishReason, "len:", rawArgs.length);
      return new Response(JSON.stringify({ error: "IA devolvió respuesta truncada. Intenta con menos data o pide cambios más pequeños." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("widget-ai parsed intent:", parsed.intent, "finish:", finishReason);
    const out: Record<string, unknown> = { intent: parsed.intent, answer: parsed.answer };
    if (parsed.intent === "edit" && parsed.data_json) {
      try {
        out.data = JSON.parse(parsed.data_json);
      } catch (e) {
        console.error("data_json inválido. finish:", finishReason, "len:", parsed.data_json.length, "tail:", parsed.data_json.slice(-200));
        out.data = {};
        out.error = finishReason === "length"
          ? "La respuesta se truncó por tamaño. Divide la instrucción en partes más pequeñas."
          : "IA devolvió data_json inválido";
      }
    }

    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

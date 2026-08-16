// Widget AI — clasifica intención (query/edit) y aplica cambios o responde con un comentario.
import { createClient } from "npm:@supabase/supabase-js@2";
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
    const { widgetType, data, prompt, history, userModel, flowId, nodeId, canvasWidgets } = await req.json();
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
      contractsNode: `ContractsNodeData: { title?: string, currency?: "MXN"|"USD"|"EUR"|"COP"|"ARS"|"CLP", pageSize?: "Carta"|"A4"|"Oficio", logoUrl?, logoPosition?, publicId?, pages: [{ id, content }] }. Cada página es texto plano corrido (sin markdown, sin asteriscos, sin mayúsculas sostenidas) con secciones numeradas del contrato: partes, objeto, vigencia, entregables, contraprestación y forma de pago, confidencialidad, propiedad intelectual, terminación, ley aplicable y firmas. Redacta en español neutro, claro y profesional; usa corchetes [así] para los datos que el usuario debe completar. Reparte el contenido en varias páginas (una sección grande por página, sin cortar frases) y NO cambies publicId ni logoUrl salvo petición expresa. Si el usuario pide añadir o modificar una cláusula, conserva el resto del texto tal cual.`,

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

HERRAMIENTAS / APPS CONECTADAS:
- SÍ tienes capacidad de usar las apps conectadas del usuario (APIs externas como Apify, Gmail, etc.). Cuando el usuario menciona una app, el sistema ya ejecuta las llamadas y te entrega los resultados en el bloque "RESULTADOS DE APPS CONECTADAS".
- NUNCA digas "no tengo la capacidad" ni "mi función es solo gestionar este widget".
- Si el usuario pide usar una app y NO llegó ningún bloque de resultados: responde como query explicando brevemente qué falta (que la app esté conectada y ACTIVADA en el menú Apps, o que falte precisar la búsqueda), usando la lista de apps conectadas de abajo.
- Si la app aparece marcada como [DESACTIVADA], dile al usuario que la active en Apps.
- Si llegaron resultados de apps, úsalos como fuente real y aplica el edit correspondiente al widget.
- TAREAS ASÍNCRONAS (Apify): si en los resultados aparece "ASYNC_APIFY_STARTED", significa que la búsqueda se lanzó en segundo plano y todavía NO hay datos. En ese caso responde SIEMPRE con intent="query" y answer exactamente: "He iniciado la búsqueda profunda en Apify en segundo plano. Esto tomará unos minutos. Te notificaré cuando los resultados estén listos." No inventes resultados ni edites la data del widget.

SINCRONIZACIÓN ENTRE WIDGETS DEL CANVAS:
- Puedes recibir un bloque "OTROS WIDGETS DEL CANVAS" con la data de los demás widgets (campañas, pizarras, clientes, ingresos, contratos).
- Úsalo como FUENTE REAL de datos cuando el usuario haga referencia a algo que vive en otro widget: "hazme un contrato para la campaña de tal marca", "usa los datos del cliente X", "pásalo de la pizarra".
- Busca por coincidencia aproximada de nombre de marca/cliente/tarjeta (ignora mayúsculas y acentos). Si hay varias coincidencias, usa la más reciente/relevante y menciónalo en "answer".
- De campañas puedes extraer: marca, cliente, estado, tipo de pago, monto y moneda, parcialidades (montos y fechas de pago), entregables (reels, posts, stories, tiktoks, ugc), fechas de inicio/fin, notas y asignados. Tradúcelos a los campos del widget actual (por ejemplo, en un contrato: partes, objeto, vigencia, entregables, contraprestación y calendario de pagos).
- NUNCA inventes cifras o fechas que ya existan en el otro widget: cópialas literalmente. Solo deja corchetes [así] para lo que realmente falte.
- No modifiques los otros widgets: solo puedes editar el widget actual.
- Si el usuario referencia un widget/marca que no existe en el canvas, responde como query diciendo qué no encontraste.

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

    const target = resolveTarget(byok, FALLBACK_MODEL, apiKey ?? "");
    console.log("widget-ai target:", target.label);

    // Herramientas: apps conectadas del usuario (funcionan con cualquier "cerebro", Lovable o BYOK).
    const apps = await loadUserApps(req.headers.get("Authorization"));

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const admin = supabaseUrl && serviceKey
      ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
      : null;

    let userId: string | null = null;
    if (admin) {
      const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
      if (token) {
        const { data: userRes } = await admin.auth.getUser(token);
        userId = userRes?.user?.id ?? null;
      }
    }

    let startedJobId: string | null = null;
    const appsBlock = apps.length
      ? await maybeUseApps({
          apps,
          target,
          prompt: String(prompt),
          ctx: {
            webhookBaseUrl: supabaseUrl ? `${supabaseUrl}/functions/v1/apify-webhook` : undefined,
            onRunStarted: async ({ jobId, runId, datasetId, appName }) => {
              startedJobId = jobId;
              if (!admin || !userId || !nodeId) return;
              const { error } = await admin.from("widget_jobs").insert({
                id: jobId,
                user_id: userId,
                flow_id: flowId ?? null,
                node_id: String(nodeId),
                widget_type: String(widgetType),
                prompt: String(prompt),
                provider: appName,
                run_id: runId,
                dataset_id: datasetId,
                status: "running",
              });
              if (error) console.error("widget_jobs insert error", error.message);
            },
          },
        })
      : "";

    const appsCatalog = apps.length
      ? `\n\nAPPS CONECTADAS DEL USUARIO (puedes usarlas cuando el usuario las mencione):\n${appsCatalogText(apps)}`
      : "";

    const messages: any[] = [{ role: "system", content: system + appsCatalog }];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h?.role && h?.content) messages.push({ role: h.role, content: String(h.content) });
      }
    }
    messages.push({
      role: "user",
      content: `widgetType: ${widgetType}\ndata actual:\n${JSON.stringify(data ?? {}, null, 2)}\n\nInstrucción del usuario:\n${prompt}${appsBlock}`,
    });

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
    if (startedJobId) {
      // Tarea en segundo plano: el canvas muestra un loader hasta que llegue el webhook.
      out.jobId = startedJobId;
      out.intent = "query";
      out.pending = true;
      if (!out.answer) out.answer = "He iniciado la búsqueda profunda en segundo plano. Te aviso en cuanto tenga los resultados.";
      delete out.data;
    }
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

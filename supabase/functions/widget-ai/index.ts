// Widget AI — clasifica intención (query/edit) y aplica cambios o responde con un comentario.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { widgetType, data, prompt, history } = await req.json();
    if (!widgetType || !prompt) {
      return new Response(JSON.stringify({ error: "widgetType y prompt requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
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
- "query": el usuario PIDE INFORMACIÓN (consultas, resúmenes, preguntas). NO modificas nada; devuelves respuesta clara y concisa en Markdown en "answer".
- "edit": el usuario PIDE CAMBIOS o VACÍA INFORMACIÓN (listas de tareas, notas sueltas, ideas, marcas, contactos, texto largo desestructurado). Devuelves el objeto data COMPLETO ya modificado en "data_json".

REGLA CLAVE — bulk ingest:
Si el usuario pega/dicta un bloque grande de información con la intención de que "lo organices", "lo metas", "lo llenes", "lo estructures", o simplemente vacía muchos items, es SIEMPRE intent=edit.
- Parsea líneas, viñetas, párrafos, listas separadas por comas, saltos de línea.
- Deduplica items obviamente repetidos.
- Distribuye lógicamente según el schema del widget (ver hints).
- Rellena campos faltantes con valores plausibles y consistentes; no inventes datos sensibles (emails, teléfonos) salvo que el usuario los dé.
- Si ya hay contenido en el widget, POR DEFECTO añade sin borrar lo existente, salvo que el usuario pida "reemplaza"/"limpia"/"empieza de cero".

Reglas edit generales:
- Devuelve SIEMPRE el objeto data COMPLETO (no un diff), respetando exactamente el schema del widget.
- Preserva todos los campos existentes que no se cambien.
- Genera IDs únicos como strings cortos (ej: "c_" + random).
- No añadas propiedades desconocidas al schema.

Schema del widget actual (${widgetType}):
${schemaHints[widgetType] ?? "(schema desconocido — infiere del data actual)"}

Responde SIEMPRE con la tool "widget_result".`;

    const tools = [{
      type: "function",
      function: {
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
      },
    }];

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

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools,
        tool_choice: { type: "function", function: { name: "widget_result" } },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: `AI Gateway ${res.status}: ${txt}` }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await res.json();
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Respuesta inválida de IA" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(call.function.arguments);
    console.log("widget-ai parsed:", JSON.stringify(parsed).slice(0, 500));
    const out: Record<string, unknown> = { intent: parsed.intent, answer: parsed.answer };
    if (parsed.intent === "edit" && parsed.data_json) {
      try { out.data = JSON.parse(parsed.data_json); }
      catch { out.data = {}; out.error = "IA devolvió data_json inválido"; }
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

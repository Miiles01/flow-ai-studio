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

    const system = `Eres el asistente de widgets de Miiles. Recibes:
- widgetType: uno de kanbanNode, clientCardNode, campaignsNode, ingresosNode
- data: JSON actual del widget
- prompt del usuario

Debes decidir la intención:
- "query": el usuario PIDE INFORMACIÓN sobre el contenido actual (consultas, resúmenes, preguntas). NO modificas nada; devuelves un texto claro y conciso en Markdown.
- "edit": el usuario PIDE CAMBIOS (crear/añadir/quitar/modificar tarjetas, campañas, columnas, campos, etc.). Devuelves el objeto data COMPLETO ya modificado, respetando su estructura original.

Reglas edit:
- Preserva todos los campos existentes salvo lo que se pida cambiar.
- Genera IDs nuevos como cadenas únicas (uuid-ish).
- No añadas propiedades desconocidas al schema.
- Sé generoso: si el usuario dice "crea 20 campañas de prueba", créalas con datos plausibles.

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

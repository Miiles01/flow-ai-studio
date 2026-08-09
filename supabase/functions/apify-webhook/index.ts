// Webhook de Apify — recibe ACTOR.RUN.SUCCEEDED, descarga el dataset y deja los
// resultados en widget_jobs. Supabase Realtime avisa al canvas y el widget se actualiza solo.
import { createClient } from "npm:@supabase/supabase-js@2";
import { callLLM, resolveTarget } from "../_shared/llm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-2.5-flash";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");
    if (!jobId) return json({ error: "jobId requerido" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) return json({ error: "backend no configurado" }, 500);
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: job, error: jobErr } = await admin
      .from("widget_jobs")
      .select("id, user_id, node_id, widget_type, prompt, run_id, dataset_id, status")
      .eq("id", jobId)
      .maybeSingle();
    if (jobErr || !job) return json({ error: "job no encontrado" }, 404);

    let payload: any = {};
    try {
      payload = await req.json();
    } catch { /* Apify puede mandar body vacío en pruebas */ }

    const runIdFromHook = payload?.resource?.id ?? payload?.eventData?.actorRunId ?? null;
    if (job.run_id && runIdFromHook && String(job.run_id) !== String(runIdFromHook)) {
      return json({ error: "run no coincide con el job" }, 403);
    }

    const datasetId =
      payload?.resource?.defaultDatasetId ?? job.dataset_id ?? null;
    if (!datasetId) {
      await admin.from("widget_jobs")
        .update({ status: "error", answer: "Apify no devolvió dataset." })
        .eq("id", jobId);
      return json({ ok: true });
    }

    // Token de Apify: el que el usuario guardó en su app conectada.
    const { data: appRow } = await admin
      .from("user_apps")
      .select("api_key, url, name")
      .eq("user_id", job.user_id)
      .ilike("name", "%apify%")
      .limit(1)
      .maybeSingle();
    const apifyToken = appRow?.api_key ?? Deno.env.get("APIFY_API_TOKEN") ?? null;

    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&limit=50&format=json`,
      {
        headers: apifyToken ? { Authorization: `Bearer ${apifyToken}` } : {},
        signal: AbortSignal.timeout(30000),
      },
    );
    const itemsText = await itemsRes.text();
    if (!itemsRes.ok) {
      console.error(`Apify dataset error [${itemsRes.status}]: ${itemsText.slice(0, 500)}`);
      await admin.from("widget_jobs")
        .update({ status: "error", answer: `Apify devolvió ${itemsRes.status} al leer el dataset.` })
        .eq("id", jobId);
      return json({ ok: true });
    }

    let items: unknown[] = [];
    try {
      const parsed = JSON.parse(itemsText);
      items = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      items = [];
    }

    // Resumen breve en background para que el widget reciba algo legible aunque falle el LLM.
    let answer = `Apify terminó: ${items.length} resultados listos.`;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (lovableKey && items.length) {
      try {
        const target = resolveTarget(null, MODEL, lovableKey);
        const res = await callLLM(
          target,
          [
            {
              role: "system",
              content:
                "Resume en Markdown breve (máx 10 viñetas) los resultados de una búsqueda web para que se puedan volcar en un widget. Sé concreto: nombre, dato clave y URL cuando exista.",
            },
            {
              role: "user",
              content: `Instrucción original: ${job.prompt}\n\nResultados (JSON recortado):\n${JSON.stringify(items).slice(0, 20000)}`,
            },
          ],
          { maxTokens: 1200 },
        );
        if (res.ok && res.content) answer = res.content;
      } catch (e) {
        console.error("resumen LLM falló", e);
      }
    }

    const { error: updErr } = await admin
      .from("widget_jobs")
      .update({
        status: "ready",
        dataset_id: datasetId,
        answer,
        result: { items: items.slice(0, 50) },
      })
      .eq("id", jobId);
    if (updErr) console.error("widget_jobs update error", updErr.message);

    return json({ ok: true, items: items.length });
  } catch (err) {
    console.error("apify-webhook error", err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

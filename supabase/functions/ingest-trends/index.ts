import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const AUTOMATION_SECRET = Deno.env.get("AUTOMATION_SECRET");
    if (!AUTOMATION_SECRET) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = req.headers.get("x-automation-key");
    if (key !== AUTOMATION_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const trends: any[] = body.trends ?? [];
    const source: string = body.source ?? "claude-agent";
    const defaultDays: number = Number(body.expires_in_days ?? 21);

    if (!Array.isArray(trends) || trends.length === 0) {
      return new Response(JSON.stringify({ inserted: 0, skipped: 0, message: "No trends provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Deduplicate by title against active trends
    const { data: existing } = await supabase
      .from("trends")
      .select("title")
      .eq("is_active", true);

    const existingTitles = new Set(
      (existing ?? []).map((r: any) => (r.title ?? "").toLowerCase().trim())
    );

    const now = Date.now();
    const newRows = trends
      .filter((t: any) => {
        const title = (t.title ?? "").toLowerCase().trim();
        if (!title) return false;
        if (existingTitles.has(title)) return false;
        existingTitles.add(title);
        return true;
      })
      .map((t: any) => {
        const days = Number.isFinite(Number(t.expires_in_days)) ? Number(t.expires_in_days) : defaultDays;
        return {
          title: t.title,
          summary: t.summary || null,
          media_url: t.media_url || null,
          media_type: t.media_type === "video" ? "video" : "image",
          thumbnail_url: t.thumbnail_url || t.media_url || null,
          links: Array.isArray(t.links) ? t.links : [],
          bullets: Array.isArray(t.bullets) ? t.bullets : [],
          category: t.category || "negocios",
          source,
          published_at: t.published_at || new Date().toISOString(),
          expires_at: t.expires_at || new Date(now + days * 86400000).toISOString(),
          is_active: true,
        };
      });

    const skipped = trends.length - newRows.length;

    if (newRows.length === 0) {
      return new Response(JSON.stringify({ inserted: 0, skipped, message: "All trends already exist" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase.from("trends").insert(newRows);
    if (error) throw error;

    // Optional cleanup: deactivate expired trends to keep the brain fresh
    await supabase
      .from("trends")
      .update({ is_active: false })
      .lt("expires_at", new Date().toISOString())
      .eq("is_active", true);

    return new Response(JSON.stringify({ inserted: newRows.length, skipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ingest-trends error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

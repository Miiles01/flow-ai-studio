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
    const prospects: any[] = body.prospects ?? [];
    const sourceFile: string = body.source_file ?? "auto-agent";

    if (!Array.isArray(prospects) || prospects.length === 0) {
      return new Response(JSON.stringify({ inserted: 0, skipped: 0, message: "No prospects provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch existing companies to deduplicate
    const { data: existing } = await supabase
      .from("prospects")
      .select("company, website")
      .not("company", "is", null);

    const existingCompanies = new Set(
      (existing ?? []).map((r: any) => (r.company ?? "").toLowerCase().trim())
    );
    const existingWebsites = new Set(
      (existing ?? []).map((r: any) => (r.website ?? "").toLowerCase().trim()).filter(Boolean)
    );

    const newRows = prospects.filter((p: any) => {
      const company = (p.company ?? "").toLowerCase().trim();
      const website = (p.website ?? "").toLowerCase().trim();
      if (!company) return false;
      if (existingCompanies.has(company)) return false;
      if (website && existingWebsites.has(website)) return false;
      return true;
    }).map((p: any) => ({
      name: p.name || null,
      company: p.company || null,
      email: p.email || null,
      phone: p.phone || null,
      role: p.role || null,
      industry: p.industry || null,
      location: p.location || null,
      website: p.website || null,
      notes: p.notes || null,
      tags: Array.isArray(p.tags) ? p.tags : [],
      source_file: sourceFile,
      raw: p,
    }));

    const skipped = prospects.length - newRows.length;

    if (newRows.length === 0) {
      return new Response(JSON.stringify({ inserted: 0, skipped, message: "All prospects already exist" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase.from("prospects").insert(newRows);
    if (error) throw error;

    return new Response(JSON.stringify({ inserted: newRows.length, skipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auto-ingest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

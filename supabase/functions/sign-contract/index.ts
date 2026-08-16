import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { publicId, name, email, signature } = await req.json();

    if (!publicId || !name || !signature) {
      return new Response(JSON.stringify({ error: "Faltan datos para firmar" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: contract, error: readErr } = await supabase
      .from("contracts")
      .select("id, signed_at")
      .eq("public_id", publicId)
      .maybeSingle();

    if (readErr || !contract) {
      return new Response(JSON.stringify({ error: "Documento no encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (contract.signed_at) {
      return new Response(JSON.stringify({ ok: true, alreadySigned: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updErr } = await supabase
      .from("contracts")
      .update({
        signer_name: String(name).slice(0, 200),
        signer_email: email ? String(email).slice(0, 200) : null,
        signature_data: String(signature).slice(0, 400000),
        signed_at: new Date().toISOString(),
      })
      .eq("id", contract.id);

    if (updErr) throw updErr;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

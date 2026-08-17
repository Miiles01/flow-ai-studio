import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { publicId, name, email, signature, fieldId, action } = await req.json();

    // Quitar una firma ya guardada (el documento es público y solo permite firmar/desfirmar).
    if (action === "remove") {
      if (!publicId) return json({ error: "Faltan datos" }, 400);
      const admin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      const { data: doc, error: docErr } = await admin
        .from("contracts")
        .select("id, field_signatures")
        .eq("public_id", publicId)
        .maybeSingle();
      if (docErr || !doc) return json({ error: "Documento no encontrado" }, 404);

      const patch: Record<string, unknown> = {
        signed_at: null,
        signer_name: null,
        signer_email: null,
      };
      if (fieldId) {
        const current = { ...((doc.field_signatures ?? {}) as Record<string, unknown>) };
        delete current[fieldId];
        patch.field_signatures = current;
      } else {
        patch.signature_data = null;
      }

      const { error: rmErr } = await admin.from("contracts").update(patch).eq("id", doc.id);
      if (rmErr) throw rmErr;
      return json({ ok: true, removed: true });
    }

    if (!publicId || !name || !signature) {
      return json({ error: "Faltan datos para firmar" }, 400);
    }
    if (typeof signature !== "string" || !signature.startsWith("data:image/")) {
      return json({ error: "Firma no válida" }, 400);
    }
    if (String(signature).length > 400000) {
      return json({ error: "La firma es demasiado grande" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: contract, error: readErr } = await supabase
      .from("contracts")
      .select("id, signed_at, signature_fields, field_signatures")
      .eq("public_id", publicId)
      .maybeSingle();

    if (readErr || !contract) return json({ error: "Documento no encontrado" }, 404);

    const signedAt = new Date().toISOString();
    const safeName = String(name).slice(0, 200);
    const safeEmail = email ? String(email).slice(0, 200) : null;

    // Firma de un campo insertado en el documento.
    if (fieldId) {
      const fields = (contract.signature_fields ?? []) as { id: string }[];
      if (!fields.some((f) => f?.id === fieldId)) {
        return json({ error: "Ese campo de firma ya no existe en el documento" }, 400);
      }

      const current = (contract.field_signatures ?? {}) as Record<string, unknown>;
      if (current[fieldId]) return json({ ok: true, alreadySigned: true });

      const next = {
        ...current,
        [fieldId]: { name: safeName, email: safeEmail, dataUrl: signature, signedAt },
      };

      const patch: Record<string, unknown> = { field_signatures: next };
      // El documento se marca como firmado cuando ya no queda ningún campo pendiente.
      if (!contract.signed_at && fields.every((f) => next[f.id])) {
        patch.signed_at = signedAt;
        patch.signer_name = safeName;
        patch.signer_email = safeEmail;
      }

      const { error: updErr } = await supabase.from("contracts").update(patch).eq("id", contract.id);
      if (updErr) throw updErr;

      return json({ ok: true, signedAt });
    }

    // Firma global (documentos sin campos insertados).
    if (contract.signed_at) return json({ ok: true, alreadySigned: true });

    const { error: updErr } = await supabase
      .from("contracts")
      .update({
        signer_name: safeName,
        signer_email: safeEmail,
        signature_data: signature,
        signed_at: signedAt,
      })
      .eq("id", contract.id);

    if (updErr) throw updErr;

    return json({ ok: true, signedAt });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

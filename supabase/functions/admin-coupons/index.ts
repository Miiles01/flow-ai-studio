const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const enc = new TextEncoder();
async function verifyToken(token: string | null, secret: string) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const bytes = new Uint8Array(sigBuf);
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  const expected = btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (expected !== sig) return false;
  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.exp > Date.now();
  } catch { return false; }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD")!;
    if (!(await verifyToken(req.headers.get("x-admin-token"), ADMIN_PASSWORD))) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action ?? "list";
    const env: StripeEnv = body.environment === "live" ? "live" : "sandbox";
    const stripe = createStripeClient(env);

    if (action === "list") {
      const promos = await stripe.promotionCodes.list({ limit: 100, expand: ["data.coupon"] });
      return json({
        codes: promos.data.map((p: any) => ({
          id: p.id,
          code: p.code,
          active: p.active,
          times_redeemed: p.times_redeemed,
          max_redemptions: p.max_redemptions,
          expires_at: p.expires_at,
          created: p.created,
          percent_off: p.coupon?.percent_off ?? null,
          amount_off: p.coupon?.amount_off ?? null,
          currency: p.coupon?.currency ?? null,
          duration: p.coupon?.duration ?? null,
          duration_in_months: p.coupon?.duration_in_months ?? null,
        })),
      });
    }

    if (action === "create") {
      const code = String(body.code ?? "").trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,40}$/.test(code)) throw new Error("Código inválido (3-40, A-Z 0-9 - _)");

      const type = body.type === "amount" ? "amount" : "percent";
      const value = Number(body.value);
      if (!Number.isFinite(value) || value <= 0) throw new Error("Valor inválido");
      if (type === "percent" && value > 100) throw new Error("El porcentaje no puede superar 100");

      const duration = ["once", "repeating", "forever"].includes(body.duration) ? body.duration : "once";
      const durationInMonths = Number(body.duration_in_months);

      const coupon = await stripe.coupons.create({
        name: code,
        duration,
        ...(duration === "repeating" && {
          duration_in_months: Number.isFinite(durationInMonths) && durationInMonths > 0
            ? Math.floor(durationInMonths)
            : 1,
        }),
        ...(type === "percent"
          ? { percent_off: value }
          : { amount_off: Math.round(value * 100), currency: String(body.currency ?? "mxn").toLowerCase() }),
      });

      const maxRedemptions = Number(body.max_redemptions);
      const expiresInDays = Number(body.expires_in_days);

      const promo = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code,
        ...(Number.isFinite(maxRedemptions) && maxRedemptions > 0 && {
          max_redemptions: Math.floor(maxRedemptions),
        }),
        ...(Number.isFinite(expiresInDays) && expiresInDays > 0 && {
          expires_at: Math.floor(Date.now() / 1000) + Math.floor(expiresInDays) * 86400,
        }),
      });

      return json({ ok: true, id: promo.id, code: promo.code });
    }

    if (action === "toggle") {
      const id = String(body.id ?? "");
      if (!/^promo_[A-Za-z0-9]+$/.test(id)) throw new Error("ID inválido");
      const promo = await stripe.promotionCodes.update(id, { active: !!body.active });
      return json({ ok: true, active: promo.active });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 400);
  }
});

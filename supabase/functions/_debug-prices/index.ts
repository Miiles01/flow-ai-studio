import { createStripeClient } from "../_shared/stripe.ts";

Deno.serve(async () => {
  try {
    const stripe = createStripeClient("sandbox");
    const prices = await stripe.prices.list({
      lookup_keys: ["pro_monthly", "pro_yearly"],
      expand: ["data.product"],
    });
    const out = prices.data.map((p: any) => ({
      lookup_key: p.lookup_key,
      unit_amount: p.unit_amount,
      currency: p.currency,
      recurring: p.recurring?.interval,
      product: typeof p.product === "object" ? p.product.name : p.product,
    }));
    return new Response(JSON.stringify(out, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

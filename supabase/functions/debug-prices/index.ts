import { createStripeClient } from "../_shared/stripe.ts";

Deno.serve(async () => {
  try {
    const stripe = createStripeClient("sandbox");
    const prices = await stripe.prices.list({
      lookup_keys: ["pro_monthly", "pro_yearly"],
      expand: ["data.product"],
    });
    const out = prices.data.map((p: any) => ({
      price_id: p.id,
      lookup_key: p.lookup_key,
      unit_amount: p.unit_amount,
      currency: p.currency,
      recurring: p.recurring?.interval,
      product_id: typeof p.product === "object" ? p.product.id : p.product,
      product_name: typeof p.product === "object" ? p.product.name : null,
      product_metadata: typeof p.product === "object" ? p.product.metadata : null,
    }));
    return new Response(JSON.stringify(out, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

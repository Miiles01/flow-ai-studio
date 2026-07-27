import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

interface StripeEmbeddedCheckoutProps {
  priceId: string;
  customerEmail?: string;
  userId?: string;
  returnUrl?: string;
}

export function StripeEmbeddedCheckout({
  priceId,
  customerEmail,
  userId,
  returnUrl,
}: StripeEmbeddedCheckoutProps) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId,
        customerEmail,
        userId,
        returnUrl: returnUrl || `${window.location.origin}/profile?checkout=success`,
        environment: getStripeEnvironment(),
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || data?.error || "No se pudo iniciar el pago");
    }
    return data.clientSecret;
  };

  return (
    <div id="checkout" className="w-full h-full min-h-[500px]">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

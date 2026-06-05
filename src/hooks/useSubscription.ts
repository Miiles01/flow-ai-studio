import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";

export type Subscription = {
  id: string;
  status: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
};

function computeIsActive(sub: Subscription | null): boolean {
  if (!sub) return false;
  const futureOrNull = !sub.current_period_end || new Date(sub.current_period_end) > new Date();
  if (["active", "trialing", "past_due"].includes(sub.status) && futureOrNull) return true;
  if (sub.status === "canceled" && sub.current_period_end && new Date(sub.current_period_end) > new Date()) return true;
  return false;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSub = useCallback(async () => {
    if (!user || !isPaymentsConfigured()) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("environment", getStripeEnvironment())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription((data as Subscription) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSub();
    if (!user) return;
    const channel = supabase
      .channel(`subscriptions-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => fetchSub(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSub]);

  return {
    subscription,
    isActive: computeIsActive(subscription),
    loading,
    refetch: fetchSub,
  };
}

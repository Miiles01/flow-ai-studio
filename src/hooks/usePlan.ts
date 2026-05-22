import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) {
      setPlan("free");
      setLoading(false);
      return;
    }
    supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setPlan(data?.plan ?? "free");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  return { plan, isPro: plan !== "free", loading };
}

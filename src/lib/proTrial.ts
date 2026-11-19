import { supabase } from "@/integrations/supabase/client";

/** Marks that the visitor came through the special "Obtener Plan Pro" access. */
export const PRO_TRIAL_INTENT_KEY = "miiles-pro-trial-intent";
export const PRO_TRIAL_PATH = "/obtener-pro";

export type ProTrialResult = {
  granted: boolean;
  reason: "already_claimed" | "already_pro" | null;
  expires_at: string | null;
};

export const setProTrialIntent = () => {
  try { localStorage.setItem(PRO_TRIAL_INTENT_KEY, "1"); } catch { /* ignore */ }
};

export const clearProTrialIntent = () => {
  try { localStorage.removeItem(PRO_TRIAL_INTENT_KEY); } catch { /* ignore */ }
};

/** Grants the 30-day Pro trial to the signed-in user (once per account, decided by the server). */
export async function claimProTrial(): Promise<ProTrialResult | null> {
  const { data, error } = await supabase.rpc("claim_pro_trial");
  if (error) {
    console.error("claim_pro_trial error:", error);
    return null;
  }
  return data as unknown as ProTrialResult;
}

import { supabase } from "@/integrations/supabase/client";

/** Holds the invitation code entered before the special "Obtener Plan Pro" access. */
export const PRO_TRIAL_CODE_KEY = "miiles-pro-trial-code";
export const PRO_TRIAL_PATH = "/obtener-pro";

export type ProTrialResult = {
  granted: boolean;
  reason: "invalid_code" | "already_claimed" | "already_pro" | null;
  expires_at: string | null;
};

export const normalizeCode = (code: string) => code.trim().toUpperCase();

export const getStoredProTrialCode = (): string | null => {
  try { return localStorage.getItem(PRO_TRIAL_CODE_KEY); } catch { return null; }
};

export const storeProTrialCode = (code: string) => {
  try { localStorage.setItem(PRO_TRIAL_CODE_KEY, normalizeCode(code)); } catch { /* ignore */ }
};

export const clearProTrialCode = () => {
  try { localStorage.removeItem(PRO_TRIAL_CODE_KEY); } catch { /* ignore */ }
};

/** Asks the server whether an invitation code is valid (yes/no only). */
export async function checkProTrialCode(code: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_pro_trial_code", { p_code: normalizeCode(code) });
  if (error) {
    console.error("check_pro_trial_code error:", error);
    return false;
  }
  return data === true;
}

/** Grants the free Pro trial to the signed-in user (valid code, once per account — decided by the server). */
export async function claimProTrial(code: string): Promise<ProTrialResult | null> {
  const { data, error } = await supabase.rpc("claim_pro_trial", { p_code: normalizeCode(code) });
  if (error) {
    console.error("claim_pro_trial error:", error);
    return null;
  }
  return data as unknown as ProTrialResult;
}

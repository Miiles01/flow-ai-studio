import { supabase } from "@/integrations/supabase/client";

const REF_KEY = "miiles_pending_ref";

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;

export function isValidUsername(value: string): boolean {
  return USERNAME_RE.test(value);
}

/** Capture a ?ref=username from the current URL and store it for later signup. */
export function capturePendingReferral() {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && isValidUsername(ref)) {
      localStorage.setItem(REF_KEY, ref.toLowerCase());
    }
  } catch {
    /* ignore */
  }
}

export function getPendingReferral(): string | null {
  try {
    return localStorage.getItem(REF_KEY);
  } catch {
    return null;
  }
}

export function clearPendingReferral() {
  try {
    localStorage.removeItem(REF_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * If there's a pending referral, register it for the currently authenticated
 * user (one time) and clear the pending value.
 */
export async function registerPendingReferral() {
  const ref = getPendingReferral();
  if (!ref) return;
  try {
    await supabase.rpc("register_referral", { p_username: ref });
  } catch {
    /* ignore — referral tracking is best-effort */
  } finally {
    clearPendingReferral();
  }
}

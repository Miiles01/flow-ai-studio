import { supabase } from "@/integrations/supabase/client";

export type TrackedEvent =
  | "architecture_view"
  | "pricing_card_click"
  | "pricing_cta"
  | "template_view"
  | "template_use";

/** Fire-and-forget customer tracking; ignored when signed out. */
export function trackEvent(event: TrackedEvent, props: Record<string, unknown> = {}) {
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id;
      if (!uid) return;
      await (supabase as any).from("user_events").insert({ user_id: uid, event, props });
    } catch {
      /* tracking never breaks the UI */
    }
  })();
}

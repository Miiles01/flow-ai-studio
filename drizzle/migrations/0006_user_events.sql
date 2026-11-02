CREATE TABLE public.user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event text NOT NULL,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.user_events TO authenticated;
GRANT ALL ON public.user_events TO service_role;
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own events" ON public.user_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND event IN ('architecture_view','pricing_card_click','pricing_cta','template_view','template_use') AND length(props::text) < 2000);
CREATE INDEX user_events_user_idx ON public.user_events(user_id);
CREATE INDEX user_events_event_idx ON public.user_events(event);
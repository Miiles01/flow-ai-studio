CREATE TABLE IF NOT EXISTS public.site_view_days (
 path text NOT NULL,
 day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
 owner_id uuid NOT NULL,
 views integer NOT NULL DEFAULT 0,
 PRIMARY KEY (path, day)
);
GRANT SELECT ON public.site_view_days TO authenticated;
GRANT ALL ON public.site_view_days TO service_role;
ALTER TABLE public.site_view_days ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS site_view_days_owner_day_idx ON public.site_view_days(owner_id, day);
CREATE POLICY "Owners can read their site views" ON public.site_view_days FOR SELECT TO authenticated USING(owner_id = auth.uid());
CREATE OR REPLACE FUNCTION public.record_site_view(p_path text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_owner uuid;
BEGIN
 SELECT owner_id INTO v_owner FROM public.user_sites WHERE path = lower(p_path) AND status = 'published' LIMIT 1;
 IF v_owner IS NULL THEN RETURN; END IF;
 INSERT INTO public.site_view_days(path, day, owner_id, views) VALUES(lower(p_path), (now() AT TIME ZONE 'utc')::date, v_owner, 1)
 ON CONFLICT(path, day) DO UPDATE SET views = public.site_view_days.views + 1, owner_id = EXCLUDED.owner_id;
END;
$$;
REVOKE ALL ON FUNCTION public.record_site_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_site_view(text) TO anon, authenticated;
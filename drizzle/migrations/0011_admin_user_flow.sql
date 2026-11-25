CREATE TABLE public.user_flow_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 session_id uuid NOT NULL,
 user_id uuid,
 route text NOT NULL CHECK (route IN ('home','affiliates','signup','onboarding','dashboard','upgrade','boards','programs','studio','architecture','trial')),
 step smallint CHECK (step BETWEEN 1 AND 7),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.user_flow_events TO service_role;
ALTER TABLE public.user_flow_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX user_flow_session_time ON public.user_flow_events(session_id, created_at);
CREATE INDEX user_flow_time_route ON public.user_flow_events(created_at, route);
CREATE FUNCTION public.record_user_flow(p_session uuid, p_route text, p_step integer DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF p_session IS NULL OR p_route NOT IN ('home','affiliates','signup','onboarding','dashboard','upgrade','boards','programs','studio','architecture','trial') THEN RAISE EXCEPTION 'Invalid route'; END IF;
 IF p_step IS NOT NULL AND (p_route <> 'onboarding' OR auth.uid() IS NULL OR p_step NOT BETWEEN 1 AND 7) THEN RAISE EXCEPTION 'Invalid step'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(p_session::text));
 IF EXISTS (SELECT 1 FROM public.user_flow_events WHERE session_id=p_session AND route=p_route AND step IS NOT DISTINCT FROM p_step AND created_at > now()-interval '10 seconds') THEN RETURN; END IF;
 IF (SELECT count(*) FROM public.user_flow_events WHERE session_id=p_session AND created_at > now()-interval '1 minute') >= 30 THEN RETURN; END IF;
 INSERT INTO public.user_flow_events(session_id,user_id,route,step) VALUES(p_session,auth.uid(),p_route,p_step);
END; $$;
REVOKE ALL ON FUNCTION public.record_user_flow(uuid,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_user_flow(uuid,text,integer) TO anon, authenticated;
CREATE FUNCTION public.admin_user_flow_stats(p_days integer DEFAULT 30, p_excluded uuid[] DEFAULT '{}') RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb; cutoff timestamptz;
BEGIN
 IF p_days IS NOT NULL AND p_days NOT IN (7,30) THEN RAISE EXCEPTION 'Invalid range'; END IF;
 cutoff := CASE WHEN p_days IS NULL THEN '-infinity'::timestamptz ELSE now()-make_interval(days=>p_days) END;
 WITH excluded_sessions AS (
  SELECT DISTINCT session_id FROM public.user_flow_events WHERE user_id=ANY(p_excluded)
 ), ev AS (
  SELECT * FROM public.user_flow_events e WHERE created_at>=cutoff AND NOT EXISTS(SELECT 1 FROM excluded_sessions x WHERE x.session_id=e.session_id)
 ), cohort AS (
  SELECT * FROM public.profiles WHERE created_at>=cutoff AND NOT(user_id=ANY(p_excluded))
 ), counts AS (
  SELECT route,count(*) n FROM ev WHERE step IS NULL GROUP BY route
 ), entries AS (
  SELECT route,count(DISTINCT session_id) n FROM ev WHERE route IN ('home','affiliates') GROUP BY route
 ), next_step AS (
  SELECT e.route,count(DISTINCT e.session_id) n FROM ev e WHERE e.route IN ('home','affiliates') AND EXISTS(SELECT 1 FROM ev s WHERE s.session_id=e.session_id AND s.route IN ('signup','trial') AND s.created_at>e.created_at) GROUP BY e.route
 )
 SELECT jsonb_build_object(
  'visits',coalesce((SELECT jsonb_object_agg(route,n) FROM counts),'{}'::jsonb),
  'homeSignup',coalesce((SELECT n FROM next_step WHERE route='home'),0),
  'affiliatesSignup',coalesce((SELECT n FROM next_step WHERE route='affiliates'),0),
  'homeConversion',coalesce((SELECT round(100.0*n.n/nullif(e.n,0),1) FROM next_step n JOIN entries e USING(route) WHERE route='home'),0),
  'trials',(SELECT count(*) FROM public.pro_trials WHERE source='affiliates' AND started_at>=cutoff AND NOT(user_id=ANY(p_excluded))),
  'registered',(SELECT count(*) FROM cohort),
  'completed',(SELECT count(*) FROM cohort WHERE onboarding_completed),
  'completionRate',coalesce((SELECT round(100.0*count(*) FILTER(WHERE onboarding_completed)/nullif(count(*),0),1) FROM cohort),0),
  'steps',(SELECT jsonb_agg(n ORDER BY s) FROM (SELECT s,coalesce(round(100.0*(SELECT count(DISTINCT e.user_id) FROM ev e JOIN cohort c ON c.user_id=e.user_id WHERE e.step=s)/nullif((SELECT count(*) FROM cohort),0),1),0) n FROM generate_series(1,7) s) a),
  'trackedSince',(SELECT min(created_at) FROM public.user_flow_events)
 ) INTO result;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.admin_user_flow_stats(integer,uuid[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_user_flow_stats(integer,uuid[]) TO service_role;
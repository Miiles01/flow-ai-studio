CREATE OR REPLACE FUNCTION public.record_user_flow(p_session uuid, p_route text, p_step integer DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF p_session IS NULL OR p_route NOT IN ('home','affiliates','signup','onboarding','dashboard','upgrade','boards','programs','studio','architecture','trial','trial_popup') THEN RAISE EXCEPTION 'Invalid route'; END IF;
 IF p_step IS NOT NULL AND (p_route <> 'onboarding' OR auth.uid() IS NULL OR p_step NOT BETWEEN 1 AND 7) THEN RAISE EXCEPTION 'Invalid step'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(p_session::text));
 IF EXISTS (SELECT 1 FROM public.user_flow_events WHERE session_id=p_session AND route=p_route AND step IS NOT DISTINCT FROM p_step AND created_at > now()-interval '10 seconds') THEN RETURN; END IF;
 IF (SELECT count(*) FROM public.user_flow_events WHERE session_id=p_session AND created_at > now()-interval '1 minute') >= 30 THEN RETURN; END IF;
 INSERT INTO public.user_flow_events(session_id,user_id,route,step) VALUES(p_session,auth.uid(),p_route,p_step);
END; $$;
REVOKE ALL ON FUNCTION public.record_user_flow(uuid,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_user_flow(uuid,text,integer) TO anon, authenticated;
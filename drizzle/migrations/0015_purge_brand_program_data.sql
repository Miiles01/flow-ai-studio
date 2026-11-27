DELETE FROM public.brand_program_tokens WHERE program_id IS NOT NULL;
DELETE FROM public.user_applications WHERE id IS NOT NULL;
DELETE FROM public.brand_programs WHERE id IS NOT NULL;

REVOKE ALL ON public.brand_program_tokens FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public.user_applications FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON public.brand_programs FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_program_applicants_by_token(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.toggle_applicant_like(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_brand_program_token() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_admins_on_application() FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.brand_program_tokens IS 'DEPRECATED: Programas fue eliminado; estructura vacía y acceso revocado.';
COMMENT ON TABLE public.user_applications IS 'DEPRECATED: Programas fue eliminado; estructura vacía y acceso revocado.';
COMMENT ON TABLE public.brand_programs IS 'DEPRECATED: Programas fue eliminado; estructura vacía y acceso revocado.';

DELETE FROM public.notifications WHERE title = 'Nueva postulación';
DELETE FROM public.user_flow_events WHERE route = 'programs';

ALTER TABLE public.user_flow_events DROP CONSTRAINT user_flow_events_route_check;
ALTER TABLE public.user_flow_events ADD CONSTRAINT user_flow_events_route_check CHECK (route = ANY (ARRAY['home','affiliates','signup','login','onboarding','dashboard','upgrade','boards','studio','architecture','trial','trial_popup']));

CREATE OR REPLACE FUNCTION public.record_user_flow(p_session uuid, p_route text, p_step integer DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF p_session IS NULL OR p_route NOT IN ('home','affiliates','signup','login','onboarding','dashboard','upgrade','boards','studio','architecture','trial','trial_popup') THEN RAISE EXCEPTION 'Invalid route'; END IF;
 IF p_step IS NOT NULL AND (p_route <> 'onboarding' OR auth.uid() IS NULL OR p_step NOT BETWEEN 1 AND 7) THEN RAISE EXCEPTION 'Invalid step'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(p_session::text));
 IF EXISTS (SELECT 1 FROM public.user_flow_events WHERE session_id=p_session AND route=p_route AND step IS NOT DISTINCT FROM p_step AND created_at > now()-interval '10 seconds') THEN RETURN; END IF;
 IF (SELECT count(*) FROM public.user_flow_events WHERE session_id=p_session AND created_at > now()-interval '1 minute') >= 30 THEN RETURN; END IF;
 INSERT INTO public.user_flow_events(session_id,user_id,route,step) VALUES(p_session,auth.uid(),p_route,p_step);
END; $$;
REVOKE ALL ON FUNCTION public.record_user_flow(uuid,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_user_flow(uuid,text,integer) TO anon, authenticated;
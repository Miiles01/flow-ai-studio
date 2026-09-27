REVOKE EXECUTE ON FUNCTION public.is_pro(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_access_flow_topic(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.enforce_flow_pro_limits() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_pro(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_flow_topic(text) TO authenticated;
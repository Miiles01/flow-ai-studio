ALTER TABLE public.prospects REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prospects;
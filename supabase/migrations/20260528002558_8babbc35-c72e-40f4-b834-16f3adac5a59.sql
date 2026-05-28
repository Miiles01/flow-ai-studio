
-- 1. Storage policies for admin-uploads bucket (admin-only access)
CREATE POLICY "Admins can read admin-uploads"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'admin-uploads' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert admin-uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'admin-uploads' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update admin-uploads"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'admin-uploads' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete admin-uploads"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'admin-uploads' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2. Remove flow_collaborators from realtime publication to prevent broadcast leak
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'flow_collaborators'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.flow_collaborators';
  END IF;
END $$;

-- 3. Restrict profiles policies to authenticated only (remove anon grant surface)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

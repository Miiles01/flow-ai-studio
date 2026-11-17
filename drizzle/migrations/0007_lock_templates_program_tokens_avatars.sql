-- 1) flow_templates: only admins read directly (edge functions use service role)
DROP POLICY IF EXISTS "Authenticated can read templates" ON public.flow_templates;
CREATE POLICY "Admins can read templates" ON public.flow_templates
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2) brand_programs: move the applicants share token to an admin-only table
CREATE TABLE public.brand_program_tokens (
  program_id uuid PRIMARY KEY REFERENCES public.brand_programs(id) ON DELETE CASCADE,
  public_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brand_program_tokens TO authenticated;
GRANT ALL ON public.brand_program_tokens TO service_role;
ALTER TABLE public.brand_program_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read program tokens" ON public.brand_program_tokens
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.brand_program_tokens (program_id, public_token)
SELECT id, coalesce(public_token, gen_random_uuid()) FROM public.brand_programs
ON CONFLICT (program_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.create_brand_program_token()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.brand_program_tokens (program_id) VALUES (NEW.id)
  ON CONFLICT (program_id) DO NOTHING;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.create_brand_program_token() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_create_brand_program_token
AFTER INSERT ON public.brand_programs
FOR EACH ROW EXECUTE FUNCTION public.create_brand_program_token();

CREATE OR REPLACE FUNCTION public.get_program_applicants_by_token(p_token uuid)
 RETURNS TABLE(application_id uuid, user_id uuid, status text, applied_at timestamp with time zone, display_name text, avatar_url text, bio text, instagram_handle text, tiktok_handle text, youtube_handle text, twitter_handle text, phone text, portfolio_url text, video_url_1 text, video_url_2 text, video_url_3 text, niche text, liked boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    ua.id AS application_id,
    ua.user_id,
    ua.status,
    ua.created_at AS applied_at,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.instagram_handle,
    p.tiktok_handle,
    p.youtube_handle,
    p.twitter_handle,
    p.phone,
    p.portfolio_url,
    p.video_url_1,
    p.video_url_2,
    p.video_url_3,
    p.niche,
    ua.liked
  FROM public.user_applications ua
  JOIN public.profiles p ON p.user_id = ua.user_id
  JOIN public.brand_program_tokens t ON t.program_id = ua.program_id
  WHERE t.public_token = p_token
    AND ua.status = 'applied'
  ORDER BY ua.created_at DESC;
$function$;

-- Retire the old readable column: clear the secret values, stop generating new ones
ALTER TABLE public.brand_programs ALTER COLUMN public_token DROP DEFAULT;
UPDATE public.brand_programs SET public_token = NULL WHERE public_token IS NOT NULL;
COMMENT ON COLUMN public.brand_programs.public_token IS 'DEPRECATED: replaced by public.brand_program_tokens.public_token (admin-only)';

DROP POLICY IF EXISTS "Authenticated users can view programs" ON public.brand_programs;
CREATE POLICY "Signed-in users can view programs" ON public.brand_programs
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 3) avatars: users can only read their own avatar object directly (others use signed URLs)
DROP POLICY IF EXISTS "Authenticated users can read avatars" ON storage.objects;
CREATE POLICY "Users read own avatar" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (auth.uid())::text);
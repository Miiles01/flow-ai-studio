
-- 1. Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Public avatar read" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Public token on brand_programs
ALTER TABLE public.brand_programs ADD COLUMN public_token uuid DEFAULT gen_random_uuid() UNIQUE;

-- 3. Admin RLS for user_applications
CREATE POLICY "Admins can view all applications" ON public.user_applications
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Admin RLS for profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Public access function by token
CREATE OR REPLACE FUNCTION public.get_program_applicants_by_token(p_token uuid)
RETURNS TABLE (
  application_id uuid,
  user_id uuid,
  status text,
  applied_at timestamptz,
  display_name text,
  avatar_url text,
  bio text,
  instagram_handle text,
  tiktok_handle text,
  youtube_handle text,
  twitter_handle text,
  phone text,
  portfolio_url text,
  video_url_1 text,
  video_url_2 text,
  video_url_3 text,
  niche text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    p.niche
  FROM public.user_applications ua
  JOIN public.profiles p ON p.user_id = ua.user_id
  JOIN public.brand_programs bp ON bp.id = ua.program_id
  WHERE bp.public_token = p_token
    AND ua.status = 'applied'
  ORDER BY ua.created_at DESC;
$$;

-- 6. Notification trigger when someone applies
CREATE OR REPLACE FUNCTION public.notify_admins_on_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
  applicant_name text;
  program_name text;
BEGIN
  IF NEW.status = 'applied' THEN
    SELECT display_name INTO applicant_name FROM public.profiles WHERE user_id = NEW.user_id;
    SELECT name INTO program_name FROM public.brand_programs WHERE id = NEW.program_id;
    
    FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      INSERT INTO public.notifications (recipient_id, sender_id, title, body)
      VALUES (
        admin_record.user_id,
        NEW.user_id,
        'Nueva postulación',
        COALESCE(applicant_name, 'Alguien') || ' se postuló a ' || COALESCE(program_name, 'un programa')
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_application_notify_admins
  AFTER INSERT OR UPDATE ON public.user_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_on_application();

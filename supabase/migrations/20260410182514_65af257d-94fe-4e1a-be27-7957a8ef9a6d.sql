
-- Add liked column
ALTER TABLE public.user_applications ADD COLUMN IF NOT EXISTS liked boolean NOT NULL DEFAULT false;

-- Toggle like RPC
CREATE OR REPLACE FUNCTION public.toggle_applicant_like(p_application_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_val boolean;
BEGIN
  UPDATE public.user_applications
  SET liked = NOT liked
  WHERE id = p_application_id
  RETURNING liked INTO new_val;
  RETURN new_val;
END;
$$;

-- Recreate get_program_applicants_by_token with liked
DROP FUNCTION IF EXISTS public.get_program_applicants_by_token(uuid);

CREATE FUNCTION public.get_program_applicants_by_token(p_token uuid)
RETURNS TABLE(
  application_id uuid,
  user_id uuid,
  status text,
  applied_at timestamp with time zone,
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
  niche text,
  liked boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
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
    p.niche,
    ua.liked
  FROM public.user_applications ua
  JOIN public.profiles p ON p.user_id = ua.user_id
  JOIN public.brand_programs bp ON bp.id = ua.program_id
  WHERE bp.public_token = p_token
    AND ua.status = 'applied'
  ORDER BY ua.created_at DESC;
$$;

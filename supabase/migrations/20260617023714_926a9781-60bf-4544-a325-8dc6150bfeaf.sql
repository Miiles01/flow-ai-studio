-- 1. Username column on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Backfill random usernames for existing profiles without one
UPDATE public.profiles
SET username = lower(
  regexp_replace(coalesce(split_part(display_name, ' ', 1), 'user'), '[^a-zA-Z0-9]', '', 'g')
) || '_' || substr(md5(random()::text || user_id::text), 1, 4)
WHERE username IS NULL OR username = '';

-- Ensure no empties remain
UPDATE public.profiles
SET username = 'user_' || substr(md5(random()::text || user_id::text), 1, 6)
WHERE username IS NULL OR length(username) < 3;

-- Unique case-insensitive index
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (lower(username));

-- 2. Referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchased BOOLEAN NOT NULL DEFAULT false,
  referred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (referred_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Referrer can read their own referrals
CREATE POLICY "Referrer can view own referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id);

CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. register_referral function
CREATE OR REPLACE FUNCTION public.register_referral(p_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_referrer uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT user_id INTO v_referrer
  FROM public.profiles
  WHERE lower(username) = lower(p_username)
  LIMIT 1;

  IF v_referrer IS NULL OR v_referrer = auth.uid() THEN
    RETURN false;
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_id)
  VALUES (v_referrer, auth.uid())
  ON CONFLICT (referred_id) DO NOTHING;

  RETURN true;
END;
$$;

-- 4. get_referral_stats function
CREATE OR REPLACE FUNCTION public.get_referral_stats()
RETURNS TABLE(total_referrals bigint, total_purchased bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    count(*)::bigint AS total_referrals,
    count(*) FILTER (WHERE purchased)::bigint AS total_purchased
  FROM public.referrals
  WHERE referrer_id = auth.uid();
$$;

-- 5. mark_referral_purchased function (called by webhook with service role)
CREATE OR REPLACE FUNCTION public.mark_referral_purchased(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.referrals
  SET purchased = true, purchased_at = now()
  WHERE referred_id = p_user_id AND purchased = false;
$$;
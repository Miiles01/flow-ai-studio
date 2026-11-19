CREATE TABLE public.pro_trials (
  user_id uuid PRIMARY KEY,
  source text NOT NULL DEFAULT 'affiliates',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
GRANT SELECT ON public.pro_trials TO authenticated;
GRANT ALL ON public.pro_trials TO service_role;
ALTER TABLE public.pro_trials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own pro trial" ON public.pro_trials
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read pro trials" ON public.pro_trials
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow trusted plan-sync functions to change profiles.plan
CREATE OR REPLACE FUNCTION public.protect_profile_billing()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  IF coalesce(current_setting('miiles.plan_sync', true), '') = 'on' THEN
    RETURN NEW;
  END IF;
  IF coalesce(auth.role(), '') IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.plan := 'free';
    ELSIF NEW.plan IS DISTINCT FROM OLD.plan THEN
      RAISE EXCEPTION 'plan can only be changed by the billing system';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.has_active_pro_trial(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.pro_trials WHERE user_id = _user_id AND expires_at > now());
$$;

CREATE OR REPLACE FUNCTION public.is_pro(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT public.has_active_subscription(_user_id, 'live')
      OR public.has_active_subscription(_user_id, 'sandbox')
      OR public.has_active_pro_trial(_user_id)
$$;

-- Grants a one-time 30-day Pro trial to the calling user
CREATE OR REPLACE FUNCTION public.claim_pro_trial()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _existing public.pro_trials%ROWTYPE;
  _expires timestamptz;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO _existing FROM public.pro_trials WHERE user_id = _uid;
  IF FOUND THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'already_claimed', 'expires_at', _existing.expires_at);
  END IF;

  IF public.has_active_subscription(_uid, 'live') OR public.has_active_subscription(_uid, 'sandbox') THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'already_pro', 'expires_at', null);
  END IF;

  _expires := now() + interval '30 days';
  INSERT INTO public.pro_trials (user_id, source, expires_at) VALUES (_uid, 'affiliates', _expires);

  PERFORM set_config('miiles.plan_sync', 'on', true);
  UPDATE public.profiles SET plan = 'pro' WHERE user_id = _uid AND plan = 'free';
  PERFORM set_config('miiles.plan_sync', '', true);

  RETURN jsonb_build_object('granted', true, 'reason', null, 'expires_at', _expires);
END $$;

-- Returns the calling user to Free once their trial has ended (unless they pay)
CREATE OR REPLACE FUNCTION public.refresh_my_plan()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _plan text;
BEGIN
  IF _uid IS NULL THEN RETURN NULL; END IF;
  SELECT plan INTO _plan FROM public.profiles WHERE user_id = _uid;
  IF _plan = 'pro'
     AND EXISTS (SELECT 1 FROM public.pro_trials WHERE user_id = _uid AND expires_at <= now())
     AND NOT public.has_active_subscription(_uid, 'live')
     AND NOT public.has_active_subscription(_uid, 'sandbox') THEN
    PERFORM set_config('miiles.plan_sync', 'on', true);
    UPDATE public.profiles SET plan = 'free' WHERE user_id = _uid;
    PERFORM set_config('miiles.plan_sync', '', true);
    _plan := 'free';
  END IF;
  RETURN _plan;
END $$;

REVOKE EXECUTE ON FUNCTION public.claim_pro_trial() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.refresh_my_plan() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_pro_trial(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_pro_trial() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_my_plan() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_pro_trial(uuid) TO authenticated, service_role;
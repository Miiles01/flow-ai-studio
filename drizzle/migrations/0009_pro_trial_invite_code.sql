CREATE TABLE public.pro_trial_codes (
  code text PRIMARY KEY,
  days integer NOT NULL DEFAULT 30,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pro_trial_codes TO service_role;
ALTER TABLE public.pro_trial_codes ENABLE ROW LEVEL SECURITY;

INSERT INTO public.pro_trial_codes (code, days) VALUES ('20CREATOR26', 30)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE public.pro_trials ADD COLUMN IF NOT EXISTS code text;

CREATE OR REPLACE FUNCTION public.check_pro_trial_code(p_code text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pro_trial_codes
    WHERE code = upper(btrim(coalesce(p_code, ''))) AND active
  );
$$;
REVOKE EXECUTE ON FUNCTION public.check_pro_trial_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_pro_trial_code(text) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.claim_pro_trial();

CREATE OR REPLACE FUNCTION public.claim_pro_trial(p_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _existing public.pro_trials%ROWTYPE;
  _code public.pro_trial_codes%ROWTYPE;
  _expires timestamptz;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO _code FROM public.pro_trial_codes
  WHERE code = upper(btrim(coalesce(p_code, ''))) AND active;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'invalid_code', 'expires_at', null);
  END IF;

  SELECT * INTO _existing FROM public.pro_trials WHERE user_id = _uid;
  IF FOUND THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'already_claimed', 'expires_at', _existing.expires_at);
  END IF;

  IF public.has_active_subscription(_uid, 'live') OR public.has_active_subscription(_uid, 'sandbox') THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'already_pro', 'expires_at', null);
  END IF;

  _expires := now() + make_interval(days => _code.days);
  INSERT INTO public.pro_trials (user_id, source, code, expires_at)
  VALUES (_uid, 'affiliates', _code.code, _expires);

  PERFORM set_config('miiles.plan_sync', 'on', true);
  UPDATE public.profiles SET plan = 'pro' WHERE user_id = _uid AND plan = 'free';
  PERFORM set_config('miiles.plan_sync', '', true);

  RETURN jsonb_build_object('granted', true, 'reason', null, 'expires_at', _expires);
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_pro_trial(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_pro_trial(text) TO authenticated;
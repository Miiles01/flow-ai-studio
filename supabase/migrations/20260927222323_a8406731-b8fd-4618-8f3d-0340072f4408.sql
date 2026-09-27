-- PRO helper
CREATE OR REPLACE FUNCTION public.is_pro(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_active_subscription(_user_id, 'live') OR public.has_active_subscription(_user_id, 'sandbox')
$$;

-- Protect billing columns on profiles
CREATE OR REPLACE FUNCTION public.protect_profile_billing()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF coalesce(auth.role(), '') IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.plan := 'free';
    ELSIF NEW.plan IS DISTINCT FROM OLD.plan THEN
      RAISE EXCEPTION 'plan can only be changed by the billing system';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_protect_profile_billing ON public.profiles;
CREATE TRIGGER trg_protect_profile_billing BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_billing();

-- Server-side Pro gating: sharing boards
DROP POLICY IF EXISTS "Owner can add collaborators" ON public.flow_collaborators;
CREATE POLICY "Owner can add collaborators" ON public.flow_collaborators FOR INSERT TO authenticated
WITH CHECK (is_flow_owner(flow_id) AND public.is_pro(auth.uid()) AND role = ANY (ARRAY['editor','viewer']) AND user_id <> auth.uid());

CREATE OR REPLACE FUNCTION public.enforce_flow_pro_limits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(auth.role(), '') <> 'authenticated' THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_pro(auth.uid()) AND (SELECT count(*) FROM public.flows WHERE user_id = auth.uid()) >= 10 THEN
      RAISE EXCEPTION 'Free plan board limit reached';
    END IF;
    IF NEW.is_public AND NOT public.is_pro(auth.uid()) THEN
      RAISE EXCEPTION 'Sharing boards requires Pro';
    END IF;
  ELSIF NEW.is_public AND NOT OLD.is_public AND NOT public.is_pro(OLD.user_id) THEN
    RAISE EXCEPTION 'Sharing boards requires Pro';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_enforce_flow_pro_limits ON public.flows;
CREATE TRIGGER trg_enforce_flow_pro_limits BEFORE INSERT OR UPDATE ON public.flows
FOR EACH ROW EXECUTE FUNCTION public.enforce_flow_pro_limits();

-- Realtime private channels
CREATE OR REPLACE FUNCTION public.can_access_flow_topic(_topic text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF _topic !~* '^flow:[0-9a-f-]{36}$' THEN RETURN false; END IF;
  v_id := substring(_topic from 6)::uuid;
  RETURN public.can_access_flow(v_id);
END $$;

DROP POLICY IF EXISTS "Flow members receive realtime" ON realtime.messages;
CREATE POLICY "Flow members receive realtime" ON realtime.messages FOR SELECT TO authenticated
USING (extension IN ('broadcast','presence') AND public.can_access_flow_topic(realtime.topic()));
DROP POLICY IF EXISTS "Flow members send realtime" ON realtime.messages;
CREATE POLICY "Flow members send realtime" ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (extension IN ('broadcast','presence') AND public.can_access_flow_topic(realtime.topic()));
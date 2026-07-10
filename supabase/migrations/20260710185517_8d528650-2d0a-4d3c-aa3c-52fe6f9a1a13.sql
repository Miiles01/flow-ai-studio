-- 1. FLOWS: prevent ownership takeover / privilege escalation on UPDATE
CREATE OR REPLACE FUNCTION public.prevent_flow_owner_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    IF auth.uid() IS NULL OR auth.uid() <> OLD.user_id THEN
      RAISE EXCEPTION 'Only the flow owner can transfer ownership';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_flow_owner_change ON public.flows;
CREATE TRIGGER trg_prevent_flow_owner_change
  BEFORE UPDATE ON public.flows
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_flow_owner_change();

-- Simplify the UPDATE policy (drop the no-op self-referencing subquery)
DROP POLICY IF EXISTS "Owners and editor collaborators can update flows" ON public.flows;
CREATE POLICY "Owners and editor collaborators can update flows"
  ON public.flows
  FOR UPDATE
  USING ((auth.uid() = user_id) OR can_edit_flow(id))
  WITH CHECK ((auth.uid() = user_id) OR can_edit_flow(id));

-- 2. BRAND_PROGRAMS: remove anonymous read access
DROP POLICY IF EXISTS "Anyone can view programs" ON public.brand_programs;
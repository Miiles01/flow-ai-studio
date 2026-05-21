
-- 1. Add sharing columns to flows
ALTER TABLE public.flows
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS public_role text NOT NULL DEFAULT 'editor' CHECK (public_role IN ('viewer','editor'));

CREATE UNIQUE INDEX IF NOT EXISTS flows_public_token_key ON public.flows(public_token);

-- 2. Collaborators table
CREATE TABLE IF NOT EXISTS public.flow_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id uuid NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('viewer','editor')),
  added_by uuid,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(flow_id, user_id)
);

CREATE INDEX IF NOT EXISTS flow_collaborators_user_id_idx ON public.flow_collaborators(user_id);
CREATE INDEX IF NOT EXISTS flow_collaborators_flow_id_idx ON public.flow_collaborators(flow_id);

ALTER TABLE public.flow_collaborators ENABLE ROW LEVEL SECURITY;

-- 3. Security definer helpers (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.can_access_flow(_flow_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.flows f WHERE f.id = _flow_id AND f.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.flow_collaborators c
    WHERE c.flow_id = _flow_id AND c.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.can_edit_flow(_flow_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.flows f WHERE f.id = _flow_id AND f.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.flow_collaborators c
    WHERE c.flow_id = _flow_id AND c.user_id = auth.uid() AND c.role = 'editor'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_flow_owner(_flow_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.flows f WHERE f.id = _flow_id AND f.user_id = auth.uid()
  );
$$;

-- 4. Replace flows RLS for SELECT and UPDATE to include collaborators
DROP POLICY IF EXISTS "Users can view their own flows" ON public.flows;
DROP POLICY IF EXISTS "Users can update their own flows" ON public.flows;

CREATE POLICY "Owners and collaborators can view flows"
ON public.flows FOR SELECT
USING (auth.uid() = user_id OR public.can_access_flow(id));

CREATE POLICY "Owners and editor collaborators can update flows"
ON public.flows FOR UPDATE
USING (auth.uid() = user_id OR public.can_edit_flow(id));

-- DELETE / INSERT policies remain as before (only owner)

-- 5. RLS for flow_collaborators
DROP POLICY IF EXISTS "Owner or self can view collaborators" ON public.flow_collaborators;
CREATE POLICY "Owner or self can view collaborators"
ON public.flow_collaborators FOR SELECT
USING (
  user_id = auth.uid() OR public.is_flow_owner(flow_id)
);

DROP POLICY IF EXISTS "Owner can add collaborators" ON public.flow_collaborators;
CREATE POLICY "Owner can add collaborators"
ON public.flow_collaborators FOR INSERT
WITH CHECK (public.is_flow_owner(flow_id));

DROP POLICY IF EXISTS "Owner can update collaborator role" ON public.flow_collaborators;
CREATE POLICY "Owner can update collaborator role"
ON public.flow_collaborators FOR UPDATE
USING (public.is_flow_owner(flow_id));

DROP POLICY IF EXISTS "Owner or self can remove collaborator" ON public.flow_collaborators;
CREATE POLICY "Owner or self can remove collaborator"
ON public.flow_collaborators FOR DELETE
USING (public.is_flow_owner(flow_id) OR user_id = auth.uid());

-- 6. Public access helpers
CREATE OR REPLACE FUNCTION public.get_public_flow(p_token uuid)
RETURNS TABLE(id uuid, name text, nodes jsonb, edges jsonb, public_role text, user_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.name, f.nodes, f.edges, f.public_role, f.user_id
  FROM public.flows f
  WHERE f.public_token = p_token AND f.is_public = true;
$$;

CREATE OR REPLACE FUNCTION public.join_flow_by_token(p_token uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_flow_id uuid;
  v_owner uuid;
  v_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id, user_id, public_role INTO v_flow_id, v_owner, v_role
  FROM public.flows
  WHERE public_token = p_token AND is_public = true;

  IF v_flow_id IS NULL THEN
    RAISE EXCEPTION 'Flow not found or not public';
  END IF;

  IF v_owner = auth.uid() THEN
    RETURN v_flow_id;
  END IF;

  INSERT INTO public.flow_collaborators (flow_id, user_id, role, added_by)
  VALUES (v_flow_id, auth.uid(), v_role, v_owner)
  ON CONFLICT (flow_id, user_id) DO NOTHING;

  RETURN v_flow_id;
END;
$$;

-- 7. Find user by email (for invite-by-email flow)
CREATE OR REPLACE FUNCTION public.find_user_by_email(p_email text)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT u.id, p.display_name, p.avatar_url
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE lower(u.email) = lower(p_email)
  LIMIT 1;
END;
$$;

-- 8. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.flow_collaborators;

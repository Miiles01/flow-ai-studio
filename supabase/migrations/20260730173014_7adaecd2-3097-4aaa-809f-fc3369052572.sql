DROP POLICY IF EXISTS "Owner can add collaborators" ON public.flow_collaborators;
CREATE POLICY "Owner can add collaborators"
  ON public.flow_collaborators FOR INSERT TO authenticated
  WITH CHECK (
    public.is_flow_owner(flow_id)
    AND role IN ('editor','viewer')
    AND user_id <> auth.uid()
  );

DROP POLICY IF EXISTS "Owner can update collaborator role" ON public.flow_collaborators;
CREATE POLICY "Owner can update collaborator role"
  ON public.flow_collaborators FOR UPDATE TO authenticated
  USING (public.is_flow_owner(flow_id))
  WITH CHECK (
    public.is_flow_owner(flow_id)
    AND role IN ('editor','viewer')
    AND user_id <> auth.uid()
  );
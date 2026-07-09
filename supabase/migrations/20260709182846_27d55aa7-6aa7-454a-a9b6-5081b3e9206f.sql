DROP POLICY IF EXISTS "Anyone can read AI instructions" ON public.ai_instructions;

CREATE POLICY "Admins can read AI instructions"
ON public.ai_instructions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
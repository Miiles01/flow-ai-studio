CREATE POLICY "Anyone can view programs"
ON public.brand_programs
FOR SELECT
TO anon
USING (true);
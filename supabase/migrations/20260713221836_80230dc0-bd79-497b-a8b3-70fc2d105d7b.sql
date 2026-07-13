-- Fix 1: business_inquiries — replace unrestricted INSERT policy with validated one
DROP POLICY IF EXISTS "Anyone can submit a business inquiry" ON public.business_inquiries;

CREATE POLICY "Anyone can submit a valid business inquiry"
ON public.business_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(name) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(email) <= 320
  AND (company IS NULL OR char_length(company) <= 200)
  AND (phone IS NULL OR char_length(phone) <= 50)
  AND (team_size IS NULL OR char_length(team_size) <= 100)
  AND (web_or_socials IS NULL OR char_length(web_or_socials) <= 500)
  AND (message IS NULL OR char_length(message) <= 5000)
);

-- Fix 2: flows — add SELECT policy scoped to publicly shared flows only
CREATE POLICY "Anyone can view public flows"
ON public.flows
FOR SELECT
TO anon, authenticated
USING (is_public = true);
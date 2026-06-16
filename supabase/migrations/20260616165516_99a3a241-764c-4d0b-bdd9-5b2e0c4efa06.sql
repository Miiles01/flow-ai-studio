CREATE POLICY "Admins can view business inquiries"
ON public.business_inquiries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update business inquiries"
ON public.business_inquiries
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete business inquiries"
ON public.business_inquiries
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
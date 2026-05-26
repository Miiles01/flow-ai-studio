-- Lock down prospects: admin-only access (edge functions use service_role and bypass RLS)
CREATE POLICY "Admins can view prospects" ON public.prospects FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert prospects" ON public.prospects FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update prospects" ON public.prospects FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete prospects" ON public.prospects FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- flow_templates: readable by authenticated users (used as references), writes admin-only
CREATE POLICY "Authenticated can read templates" ON public.flow_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert templates" ON public.flow_templates FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update templates" ON public.flow_templates FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete templates" ON public.flow_templates FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
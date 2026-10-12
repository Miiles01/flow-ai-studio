ALTER TABLE public.sales_leads ADD COLUMN IF NOT EXISTS service text;

COMMENT ON COLUMN public.sales_leads.service IS 'Servicio de interés: diseño de marca, embudo de ventas, sistema de clínicas';
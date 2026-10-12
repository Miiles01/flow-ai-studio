CREATE TABLE public.sales_leads (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, phone text, status text NOT NULL DEFAULT 'new', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.sales_leads TO service_role;
ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.studio_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'portfolio',
  description text NOT NULL DEFAULT '',
  thumbnail_url text,
  html text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.studio_templates TO authenticated;
GRANT ALL ON public.studio_templates TO service_role;
ALTER TABLE public.studio_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read published studio templates" ON public.studio_templates FOR SELECT TO authenticated USING (is_published = true);
CREATE TRIGGER trg_studio_templates_updated_at BEFORE UPDATE ON public.studio_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
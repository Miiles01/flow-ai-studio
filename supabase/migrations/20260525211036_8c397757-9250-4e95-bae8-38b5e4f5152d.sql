
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE public.prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  company text,
  email text,
  phone text,
  role text,
  industry text,
  location text,
  website text,
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  source_file text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_prospects_tags ON public.prospects USING GIN(tags);
CREATE INDEX idx_prospects_search ON public.prospects USING GIN (
  (coalesce(name,'') || ' ' || coalesce(company,'') || ' ' || coalesce(industry,'') || ' ' || coalesce(role,'')) gin_trgm_ops
);
CREATE INDEX idx_prospects_source ON public.prospects(source_file);

CREATE TRIGGER trg_prospects_updated_at
BEFORE UPDATE ON public.prospects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.flow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  nodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  edges jsonb NOT NULL DEFAULT '[]'::jsonb,
  prompt_hint text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.flow_templates ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_flow_templates_updated_at
BEFORE UPDATE ON public.flow_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

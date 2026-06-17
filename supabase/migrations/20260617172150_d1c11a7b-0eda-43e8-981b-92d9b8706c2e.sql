CREATE TABLE public.trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  media_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'image',
  thumbnail_url TEXT,
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL DEFAULT 'negocios',
  source TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '21 days'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.trends TO authenticated;
GRANT ALL ON public.trends TO service_role;

ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read active trends"
ON public.trends
FOR SELECT
TO authenticated
USING (is_active = true AND expires_at > now());

CREATE INDEX idx_trends_active ON public.trends (is_active, expires_at, published_at DESC);

CREATE TRIGGER update_trends_updated_at
BEFORE UPDATE ON public.trends
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
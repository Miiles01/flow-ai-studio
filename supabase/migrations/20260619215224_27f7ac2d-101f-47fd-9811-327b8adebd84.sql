CREATE TABLE public.ai_instructions (
  key TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_instructions TO anon, authenticated;
GRANT ALL ON public.ai_instructions TO service_role;

ALTER TABLE public.ai_instructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read AI instructions"
ON public.ai_instructions FOR SELECT
USING (true);

CREATE TRIGGER update_ai_instructions_updated_at
BEFORE UPDATE ON public.ai_instructions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.ai_instructions (key, content) VALUES
  ('global', ''),
  ('generate', ''),
  ('clarify', ''),
  ('plan', '');
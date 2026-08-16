CREATE TABLE public.suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  network text,
  context text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.suggestions TO authenticated;
GRANT ALL ON public.suggestions TO service_role;

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create their own suggestions"
ON public.suggestions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND char_length(message) BETWEEN 1 AND 4000);

CREATE POLICY "Users read their own suggestions"
ON public.suggestions FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX suggestions_created_idx ON public.suggestions (created_at DESC);

CREATE TRIGGER update_suggestions_updated_at BEFORE UPDATE ON public.suggestions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
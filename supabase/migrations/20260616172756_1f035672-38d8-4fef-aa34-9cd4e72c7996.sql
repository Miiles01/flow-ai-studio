CREATE TABLE public.user_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  connector_type TEXT NOT NULL DEFAULT 'api',
  url TEXT,
  api_key TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  is_builtin BOOLEAN NOT NULL DEFAULT false,
  builtin_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_apps TO authenticated;
GRANT ALL ON public.user_apps TO service_role;

ALTER TABLE public.user_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own apps"
  ON public.user_apps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own apps"
  ON public.user_apps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own apps"
  ON public.user_apps FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own apps"
  ON public.user_apps FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_apps_updated_at
  BEFORE UPDATE ON public.user_apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
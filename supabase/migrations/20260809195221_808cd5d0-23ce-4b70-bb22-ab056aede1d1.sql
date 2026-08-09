CREATE TABLE public.widget_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flow_id uuid,
  node_id text NOT NULL,
  widget_type text NOT NULL DEFAULT '',
  prompt text NOT NULL DEFAULT '',
  provider text NOT NULL DEFAULT 'apify',
  run_id text,
  dataset_id text,
  status text NOT NULL DEFAULT 'running',
  answer text,
  result jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.widget_jobs TO authenticated;
GRANT ALL ON public.widget_jobs TO service_role;

ALTER TABLE public.widget_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own widget jobs"
ON public.widget_jobs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widget jobs"
ON public.widget_jobs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget jobs"
ON public.widget_jobs FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widget jobs"
ON public.widget_jobs FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_widget_jobs_updated_at
BEFORE UPDATE ON public.widget_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_widget_jobs_user_flow ON public.widget_jobs (user_id, flow_id);
CREATE INDEX idx_widget_jobs_run ON public.widget_jobs (run_id);

ALTER TABLE public.widget_jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.widget_jobs;
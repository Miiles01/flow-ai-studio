ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS signature_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS field_signatures jsonb NOT NULL DEFAULT '{}'::jsonb;
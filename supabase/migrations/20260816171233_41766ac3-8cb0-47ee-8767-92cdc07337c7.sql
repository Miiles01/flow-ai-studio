CREATE TABLE public.contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_id text NOT NULL UNIQUE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flow_id uuid,
  node_id text,
  title text NOT NULL DEFAULT 'Contratos',
  currency text NOT NULL DEFAULT 'MXN',
  page_size text NOT NULL DEFAULT 'carta',
  logo_url text,
  logo_position text NOT NULL DEFAULT 'top-left',
  pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  signer_name text,
  signer_email text,
  signature_data text,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT SELECT ON public.contracts TO anon;
GRANT ALL ON public.contracts TO service_role;

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their contracts"
ON public.contracts FOR ALL TO authenticated
USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Anyone can read a shared contract"
ON public.contracts FOR SELECT TO anon, authenticated
USING (true);

CREATE INDEX contracts_owner_idx ON public.contracts (owner_id);
CREATE INDEX contracts_node_idx ON public.contracts (flow_id, node_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
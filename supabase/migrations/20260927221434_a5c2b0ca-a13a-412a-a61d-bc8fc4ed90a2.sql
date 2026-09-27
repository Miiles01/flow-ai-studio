DROP POLICY IF EXISTS "Anyone can read a shared contract" ON public.contracts;
REVOKE ALL ON public.contracts FROM anon;

CREATE OR REPLACE FUNCTION public.get_public_contract(p_public_id text)
RETURNS TABLE(public_id text, title text, page_size text, logo_url text, logo_position text, logo_repeat boolean, pages jsonb, signature_fields jsonb, field_signatures jsonb, signer_name text, signature_data text, signed_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.public_id, c.title, c.page_size, c.logo_url, c.logo_position, c.logo_repeat, c.pages,
         c.signature_fields, c.field_signatures, c.signer_name, c.signature_data, c.signed_at
  FROM public.contracts c
  WHERE p_public_id IS NOT NULL AND length(p_public_id) >= 10 AND c.public_id = p_public_id
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_public_contract(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_contract(text) TO anon, authenticated;

-- Los nuevos contratos deben usar un UUID aleatorio como link público
CREATE OR REPLACE FUNCTION public.enforce_contract_public_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.public_id IS NULL OR NEW.public_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    NEW.public_id := gen_random_uuid()::text;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_contracts_public_id ON public.contracts;
CREATE TRIGGER trg_contracts_public_id BEFORE INSERT ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.enforce_contract_public_id();

-- El link público no se puede cambiar después de creado
CREATE OR REPLACE FUNCTION public.prevent_contract_public_id_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.public_id IS DISTINCT FROM OLD.public_id THEN
    RAISE EXCEPTION 'public_id cannot be changed';
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_contracts_public_id_immutable ON public.contracts;
CREATE TRIGGER trg_contracts_public_id_immutable BEFORE UPDATE ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.prevent_contract_public_id_change();
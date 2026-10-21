CREATE TABLE public.user_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  template_slug text,
  title text NOT NULL DEFAULT 'Mi página',
  page_slug text NOT NULL DEFAULT '',
  path text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, page_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sites TO authenticated;
GRANT ALL ON public.user_sites TO service_role;
ALTER TABLE public.user_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sites select" ON public.user_sites FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own sites insert" ON public.user_sites FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own sites update" ON public.user_sites FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "own sites delete" ON public.user_sites FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.user_site_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.user_sites(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  file_path text NOT NULL,
  content text NOT NULL,
  encoding text NOT NULL DEFAULT 'utf8' CHECK (encoding IN ('utf8','base64')),
  content_type text NOT NULL,
  size_bytes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, file_path),
  CHECK (length(content) <= 4000000),
  CHECK (file_path ~ '^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$' AND file_path !~ '\.\.')
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_site_files TO authenticated;
GRANT ALL ON public.user_site_files TO service_role;
ALTER TABLE public.user_site_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own files select" ON public.user_site_files FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "own files insert" ON public.user_site_files FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_sites s WHERE s.id = site_id AND s.owner_id = auth.uid()));
CREATE POLICY "own files update" ON public.user_site_files FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_sites s WHERE s.id = site_id AND s.owner_id = auth.uid()));
CREATE POLICY "own files delete" ON public.user_site_files FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.prepare_user_site()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uname text;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.owner_id <> OLD.owner_id THEN RAISE EXCEPTION 'No se puede cambiar el dueño'; END IF;
  NEW.page_slug := lower(coalesce(NEW.page_slug, ''));
  IF NEW.page_slug <> '' AND NEW.page_slug !~ '^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$' THEN
    RAISE EXCEPTION 'Nombre de página inválido: usa letras, números y guiones';
  END IF;
  SELECT lower(username) INTO uname FROM public.profiles WHERE user_id = NEW.owner_id;
  IF uname IS NULL OR uname = '' THEN RAISE EXCEPTION 'Define tu nombre de usuario en tu perfil de Miiles antes de crear una página'; END IF;
  IF uname !~ '^[a-z0-9]([a-z0-9_-]{0,38}[a-z0-9])?$' OR uname IN ('studio','admin','api','assets','www','mail','ugc','miiles') OR uname ~ '^ugc-v' THEN
    RAISE EXCEPTION 'Tu nombre de usuario no se puede usar como dirección pública';
  END IF;
  NEW.path := CASE WHEN NEW.page_slug = '' THEN uname ELSE uname || '/' || NEW.page_slug END;
  IF TG_OP = 'INSERT' AND NOT public.is_pro(NEW.owner_id)
     AND (SELECT count(*) FROM public.user_sites WHERE owner_id = NEW.owner_id) >= 1 THEN
    RAISE EXCEPTION 'El plan Free permite 1 página. Pásate a Pro para tener páginas ilimitadas';
  END IF;
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status <> 'published') THEN NEW.published_at := now(); END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER prepare_user_site BEFORE INSERT OR UPDATE ON public.user_sites FOR EACH ROW EXECUTE FUNCTION public.prepare_user_site();

CREATE OR REPLACE FUNCTION public.check_user_site_quota()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE total bigint; nfiles bigint;
BEGIN
  SELECT coalesce(sum(size_bytes),0), count(*) INTO total, nfiles FROM public.user_site_files WHERE site_id = NEW.site_id AND id <> NEW.id;
  IF nfiles >= 200 THEN RAISE EXCEPTION 'Máximo 200 archivos por página'; END IF;
  IF total + NEW.size_bytes > 25000000 THEN RAISE EXCEPTION 'La página supera 25 MB'; END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER check_user_site_quota BEFORE INSERT OR UPDATE ON public.user_site_files FOR EACH ROW EXECUTE FUNCTION public.check_user_site_quota();

CREATE OR REPLACE FUNCTION public.get_published_site_file(p_path text, p_file text)
RETURNS TABLE(content text, encoding text, content_type text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.content, f.encoding, f.content_type
  FROM public.user_sites s JOIN public.user_site_files f ON f.site_id = s.id
  WHERE s.path = lower(p_path) AND s.status = 'published' AND f.file_path = p_file
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_published_site_file(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_published_site_file(text, text) TO anon, authenticated, service_role;
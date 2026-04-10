-- Add slug column
ALTER TABLE public.brand_programs ADD COLUMN slug text;

-- Populate slugs from brand_name
UPDATE public.brand_programs
SET slug = trim(both '-' from regexp_replace(lower(regexp_replace(brand_name, '[^a-zA-Z0-9]+', '-', 'g')), '-+', '-', 'g'));

-- Make slug unique and not null
ALTER TABLE public.brand_programs ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_brand_programs_slug ON public.brand_programs (slug);

-- Add price range and gallery fields to brand_programs
ALTER TABLE public.brand_programs
  ADD COLUMN price_min numeric DEFAULT NULL,
  ADD COLUMN price_max numeric DEFAULT NULL,
  ADD COLUMN gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb;

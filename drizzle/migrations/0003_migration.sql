ALTER TABLE public.studio_templates ADD COLUMN IF NOT EXISTS preview_url text, ADD COLUMN IF NOT EXISTS download_url text;
INSERT INTO public.studio_templates (slug, title, kind, description, html, preview_url, download_url, is_published)
VALUES ('portafolio-ugc', 'Portafolio UGC', 'portfolio', 'Portafolio para creadoras UGC con smooth scroll, animaciones GSAP y efectos interactivos.', '', '/studio-templates/ugc/', '/__l5e/assets-v1/ffe02281-d097-41d6-b324-9e5d48377222/ugc-plantilla.zip', true)
ON CONFLICT (slug) DO NOTHING;
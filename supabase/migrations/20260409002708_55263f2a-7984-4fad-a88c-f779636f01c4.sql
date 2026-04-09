
ALTER TABLE public.profiles
  ADD COLUMN tiktok_handle text,
  ADD COLUMN youtube_handle text,
  ADD COLUMN twitter_handle text,
  ADD COLUMN phone text,
  ADD COLUMN video_url_1 text,
  ADD COLUMN video_url_2 text,
  ADD COLUMN video_url_3 text,
  ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;

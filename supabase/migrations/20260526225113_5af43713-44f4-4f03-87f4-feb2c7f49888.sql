INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('admin-uploads', 'admin-uploads', false, 52428800)
ON CONFLICT (id) DO NOTHING;
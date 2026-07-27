DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;
CREATE POLICY "Authenticated users can read avatars" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
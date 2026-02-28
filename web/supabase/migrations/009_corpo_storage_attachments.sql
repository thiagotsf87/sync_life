BEGIN;

-- RN-CRP-10 / RN-CRP-17
ALTER TABLE public.medical_appointments
  ADD COLUMN IF NOT EXISTS attachment_url TEXT;

ALTER TABLE public.weight_entries
  ADD COLUMN IF NOT EXISTS progress_photo_url TEXT;

INSERT INTO storage.buckets (id, name, public)
SELECT 'corpo-files', 'corpo-files', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'corpo-files'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'corpo_files_public_read'
  ) THEN
    CREATE POLICY corpo_files_public_read
      ON storage.objects FOR SELECT
      USING (bucket_id = 'corpo-files');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'corpo_files_user_write'
  ) THEN
    CREATE POLICY corpo_files_user_write
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'corpo-files'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'corpo_files_user_update_delete'
  ) THEN
    CREATE POLICY corpo_files_user_update_delete
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'corpo-files'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'corpo-files'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'corpo_files_user_delete'
  ) THEN
    CREATE POLICY corpo_files_user_delete
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'corpo-files'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

COMMIT;


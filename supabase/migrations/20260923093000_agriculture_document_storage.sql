-- ============================================================
-- Intelligence E Agriculture — Document Storage Foundation
-- ============================================================
-- Private bucket for user-uploaded agricultural documents.
-- Object access is tied to authenticated user-owned path prefixes.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'agriculture-documents',
    'agriculture-documents',
    false,
    52428800,
    ARRAY[
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/webp'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "users_read_own_agriculture_documents" ON storage.objects;
CREATE POLICY "users_read_own_agriculture_documents"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'agriculture-documents'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
);

DROP POLICY IF EXISTS "users_insert_own_agriculture_documents" ON storage.objects;
CREATE POLICY "users_insert_own_agriculture_documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'agriculture-documents'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
);

DROP POLICY IF EXISTS "users_update_own_agriculture_documents" ON storage.objects;
CREATE POLICY "users_update_own_agriculture_documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'agriculture-documents'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
)
WITH CHECK (
    bucket_id = 'agriculture-documents'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
);

DROP POLICY IF EXISTS "users_delete_own_agriculture_documents" ON storage.objects;
CREATE POLICY "users_delete_own_agriculture_documents"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'agriculture-documents'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
);

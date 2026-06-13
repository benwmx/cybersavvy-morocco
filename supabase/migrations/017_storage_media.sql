-- ============================================================
-- Migration 017: Storage bucket for media + image_url columns
-- Creates the cybersafe-media bucket with public read and
-- per-user write isolation. Also adds image_url to scenarios
-- and tutorials so cover images can be referenced.
-- ============================================================


-- ─── Storage bucket ──────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cybersafe-media',
  'cybersafe-media',
  true,
  10485760,   -- 10 MB per file
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;


-- ─── Storage RLS policies ─────────────────────────────────────────────────────
-- Path convention:
--   {user_id}/scenarios/{scenario_id}/cover.webp
--   {user_id}/tutorials/{tutorial_id}/cover.webp
--   {user_id}/scenarios/{scenario_id}/questions/{filename}
--   public/scenarios/{scenario_id}/cover.webp   ← admin-managed public assets

DROP POLICY IF EXISTS "cybersafe_media_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "cybersafe_media_auth_insert"   ON storage.objects;
DROP POLICY IF EXISTS "cybersafe_media_owner_update"  ON storage.objects;
DROP POLICY IF EXISTS "cybersafe_media_owner_delete"  ON storage.objects;

-- Anyone (including anonymous game players) can download media
CREATE POLICY "cybersafe_media_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'cybersafe-media');

-- Any authenticated teacher can upload
CREATE POLICY "cybersafe_media_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cybersafe-media');

-- Users can only update files they own
CREATE POLICY "cybersafe_media_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'cybersafe-media' AND owner_id = auth.uid()::text);

-- Users can only delete files they own
CREATE POLICY "cybersafe_media_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'cybersafe-media' AND owner_id = auth.uid()::text);


-- ─── Schema: add image_url to scenarios and tutorials ─────────────────────────

ALTER TABLE public.scenarios
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE public.tutorials
  ADD COLUMN IF NOT EXISTS image_url text;

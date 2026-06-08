-- ============================================================
-- Migration 005: Fork model + privacy scoping
-- Run in Supabase SQL editor after 001–004
-- ============================================================

-- A. Link forked categories back to their global source
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS source_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- B. Scope private categories to their creator
--    (replaces the open USING(true) policy from migration 003)
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
DROP POLICY IF EXISTS "categories_read"        ON public.categories;

CREATE POLICY "categories_read" ON public.categories
  FOR SELECT USING (
    teacher_id IS NULL          -- global: visible to everyone (anon + auth)
    OR teacher_id = auth.uid()  -- private/fork: only visible to creator
  );

-- C. Protect global scenarios — revert migration 004
--    Teachers can only update scenarios they own (teacher_id = auth.uid()).
--    System scenarios (teacher_id IS NULL) are read-only for all teachers.
DROP POLICY IF EXISTS "scenarios_teacher_update" ON public.scenarios;

CREATE POLICY "scenarios_teacher_update" ON public.scenarios
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND teacher_id = auth.uid()
  );

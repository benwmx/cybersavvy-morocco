-- ============================================================
-- Migration 004: Allow teachers to edit system scenarios
-- System scenarios (teacher_id IS NULL) are shared content
-- that any authenticated teacher can modify (no admin panel yet).
-- Teachers still cannot DELETE system scenarios.
-- ============================================================

DROP POLICY IF EXISTS "scenarios_teacher_update" ON public.scenarios;

-- Teachers can update their own scenarios OR system scenarios (teacher_id IS NULL)
CREATE POLICY "scenarios_teacher_update" ON public.scenarios
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    (teacher_id = auth.uid() OR teacher_id IS NULL)
  );

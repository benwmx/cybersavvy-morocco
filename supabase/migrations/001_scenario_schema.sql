-- ============================================================
-- Migration 001: Scenario engine schema update
-- Run in Supabase SQL editor (project > SQL editor > New query)
-- ============================================================

-- 1. Add columns to scenarios
ALTER TABLE public.scenarios
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS icon      text,
  ADD COLUMN IF NOT EXISTS color     text;

-- Mark the six seed tracks as public
UPDATE public.scenarios
SET is_public = true
WHERE teacher_id IS NULL;

-- 2. Enable RLS (idempotent)
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to replace cleanly
DROP POLICY IF EXISTS "scenarios_public_read"       ON public.scenarios;
DROP POLICY IF EXISTS "scenarios_teacher_read_own"  ON public.scenarios;
DROP POLICY IF EXISTS "scenarios_teacher_read_class" ON public.scenarios;
DROP POLICY IF EXISTS "scenarios_teacher_insert"    ON public.scenarios;
DROP POLICY IF EXISTS "scenarios_teacher_update"    ON public.scenarios;
DROP POLICY IF EXISTS "scenarios_teacher_delete"    ON public.scenarios;

-- 4. RLS Policies

-- Any client (anon or authenticated) can read public scenarios
CREATE POLICY "scenarios_public_read" ON public.scenarios
  FOR SELECT USING (is_public = true);

-- Authenticated teachers can read their own private scenarios
CREATE POLICY "scenarios_teacher_read_own" ON public.scenarios
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND auth.uid() = teacher_id
  );

-- Authenticated teachers can read scenarios assigned to their classes
CREATE POLICY "scenarios_teacher_read_class" ON public.scenarios
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1
      FROM public.class_scenario_status css
      JOIN public.classes c ON css.class_id = c.id
      WHERE css.scenario_id = scenarios.id
        AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can only insert scenarios they own
CREATE POLICY "scenarios_teacher_insert" ON public.scenarios
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = teacher_id
  );

-- Teachers can only update/delete their own scenarios
CREATE POLICY "scenarios_teacher_update" ON public.scenarios
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "scenarios_teacher_delete" ON public.scenarios
  FOR DELETE USING (auth.uid() = teacher_id);

-- 5. RPC: fetch visible scenarios for a class without requiring auth
--    (used by the student offline sync flow via the anon key)
CREATE OR REPLACE FUNCTION public.get_class_visible_scenarios(p_class_id uuid)
RETURNS SETOF public.scenarios
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.*
  FROM scenarios s
  JOIN class_scenario_status css ON css.scenario_id = s.id
  WHERE css.class_id = p_class_id
    AND css.is_visible = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_visible_scenarios(uuid) TO anon, authenticated;

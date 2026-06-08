-- ============================================================
-- Migration 003: RLS policies for class_scenario_status and categories
-- Run in Supabase SQL editor after 001 and 002
-- ============================================================

-- ─── class_scenario_status ───────────────────────────────────────────────────

ALTER TABLE public.class_scenario_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "css_teacher_select" ON public.class_scenario_status;
DROP POLICY IF EXISTS "css_teacher_insert" ON public.class_scenario_status;
DROP POLICY IF EXISTS "css_teacher_update" ON public.class_scenario_status;
DROP POLICY IF EXISTS "css_anon_select"   ON public.class_scenario_status;

-- Anon can read (needed by the get_class_visible_scenarios RPC via SECURITY DEFINER)
-- Authenticated teachers can read status for their own classes
CREATE POLICY "css_teacher_select" ON public.class_scenario_status
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_id
        AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can toggle (insert) scenario visibility for their own classes
CREATE POLICY "css_teacher_insert" ON public.class_scenario_status
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_id
        AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can update visibility for their own classes
CREATE POLICY "css_teacher_update" ON public.class_scenario_status
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_id
        AND c.teacher_id = auth.uid()
    )
  );

-- Teachers can remove assignments for their own classes
CREATE POLICY "css_teacher_delete" ON public.class_scenario_status
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_id
        AND c.teacher_id = auth.uid()
    )
  );


-- ─── categories ──────────────────────────────────────────────────────────────

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read"   ON public.categories;
DROP POLICY IF EXISTS "categories_teacher_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_teacher_update" ON public.categories;
DROP POLICY IF EXISTS "categories_teacher_delete" ON public.categories;

-- Everyone (anon + authenticated) can read all categories
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (true);

-- Teachers can create their own categories
CREATE POLICY "categories_teacher_insert" ON public.categories
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = teacher_id
  );

-- Teachers can update/delete only their own categories
CREATE POLICY "categories_teacher_update" ON public.categories
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "categories_teacher_delete" ON public.categories
  FOR DELETE USING (auth.uid() = teacher_id);

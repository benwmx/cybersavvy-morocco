-- Migration 013: SECURITY DEFINER RPCs for admin writes on global content
-- Direct table writes are blocked by RLS (teacher_id = auth.uid() check).
-- These functions bypass RLS and restrict access to admins only.

-- ── Scenario: update questions only (used by per-question edit/delete/add) ──

CREATE OR REPLACE FUNCTION public.admin_update_scenario_questions(
  p_id        uuid,
  p_questions jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _is_admin boolean;
BEGIN
  SELECT COALESCE((raw_app_meta_data->>'is_admin')::boolean, false)
  INTO _is_admin FROM auth.users WHERE id = auth.uid();
  IF NOT _is_admin THEN RAISE EXCEPTION 'Access denied: admin only'; END IF;
  UPDATE public.scenarios SET questions = p_questions WHERE id = p_id;
END;
$$;

-- ── Scenario: full create or update (used by scenario title/desc dialog) ────

CREATE OR REPLACE FUNCTION public.admin_save_scenario(
  p_id          uuid,
  p_category_id uuid,
  p_title       jsonb,
  p_description jsonb,
  p_questions   jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
  _result   uuid;
BEGIN
  SELECT COALESCE((raw_app_meta_data->>'is_admin')::boolean, false)
  INTO _is_admin FROM auth.users WHERE id = auth.uid();
  IF NOT _is_admin THEN RAISE EXCEPTION 'Access denied: admin only'; END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.scenarios (teacher_id, category_id, title, description, questions, is_public)
    VALUES (NULL, p_category_id, p_title, p_description, p_questions, true)
    RETURNING id INTO _result;
  ELSE
    UPDATE public.scenarios
    SET title = p_title, description = p_description, questions = p_questions
    WHERE id = p_id
    RETURNING id INTO _result;
  END IF;

  RETURN _result;
END;
$$;

-- ── Category: create or update ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_save_category(
  p_id         uuid,
  p_name       jsonb,
  p_color_code text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
  _result   uuid;
BEGIN
  SELECT COALESCE((raw_app_meta_data->>'is_admin')::boolean, false)
  INTO _is_admin FROM auth.users WHERE id = auth.uid();
  IF NOT _is_admin THEN RAISE EXCEPTION 'Access denied: admin only'; END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.categories (teacher_id, name, color_code)
    VALUES (NULL, p_name, p_color_code)
    RETURNING id INTO _result;
  ELSE
    UPDATE public.categories SET name = p_name, color_code = p_color_code
    WHERE id = p_id
    RETURNING id INTO _result;
  END IF;

  RETURN _result;
END;
$$;

-- ── Category: delete ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_delete_category(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _is_admin boolean;
BEGIN
  SELECT COALESCE((raw_app_meta_data->>'is_admin')::boolean, false)
  INTO _is_admin FROM auth.users WHERE id = auth.uid();
  IF NOT _is_admin THEN RAISE EXCEPTION 'Access denied: admin only'; END IF;
  DELETE FROM public.categories WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_scenario_questions(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_scenario(uuid, uuid, jsonb, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_category(uuid, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_category(uuid) TO authenticated;

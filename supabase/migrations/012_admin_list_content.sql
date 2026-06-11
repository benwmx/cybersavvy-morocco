-- Migration 012: SECURITY DEFINER RPCs for admin content management
-- Uses RETURNS SETOF to match the real table schema exactly, avoiding column mismatches

DROP FUNCTION IF EXISTS public.admin_list_global_categories();
DROP FUNCTION IF EXISTS public.admin_list_global_scenarios(uuid);

-- ── Categories ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_list_global_categories()
RETURNS SETOF public.categories
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
BEGIN
  SELECT COALESCE((raw_app_meta_data->>'is_admin')::boolean, false)
  INTO _is_admin
  FROM auth.users
  WHERE auth.users.id = auth.uid();

  IF NOT _is_admin THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  RETURN QUERY
    SELECT *
    FROM categories
    WHERE teacher_id IS NULL
    ORDER BY id;
END;
$$;

-- ── Scenarios ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_list_global_scenarios(p_category_id uuid DEFAULT NULL)
RETURNS SETOF public.scenarios
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin boolean;
BEGIN
  SELECT COALESCE((raw_app_meta_data->>'is_admin')::boolean, false)
  INTO _is_admin
  FROM auth.users
  WHERE auth.users.id = auth.uid();

  IF NOT _is_admin THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  RETURN QUERY
    SELECT *
    FROM scenarios
    WHERE (p_category_id IS NULL OR category_id = p_category_id)
    ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_global_categories() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_global_scenarios(uuid) TO authenticated;

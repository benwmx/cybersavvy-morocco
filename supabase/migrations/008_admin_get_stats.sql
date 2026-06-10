-- Migration 008: Admin RPC to get platform-wide stats
-- Run in Supabase SQL editor

CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS TABLE(
  total_teachers  bigint,
  total_classes   bigint,
  total_students  bigint,
  total_results   bigint,
  avg_score_percent numeric
)
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
  SELECT
    (SELECT COUNT(DISTINCT teacher_id) FROM public.classes)::bigint,
    (SELECT COUNT(*)                   FROM public.classes)::bigint,
    (SELECT COUNT(*)                   FROM public.students)::bigint,
    (SELECT COUNT(*)                   FROM public.results)::bigint,
    (
      SELECT ROUND(AVG(r.score::numeric / NULLIF(r.max_score, 0) * 100), 1)
      FROM public.results r
      WHERE r.max_score > 0
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_stats() TO authenticated;

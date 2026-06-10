-- Migration 006: Admin-only RPC functions
-- Run in Supabase SQL editor

-- List all auth users with their class and student counts.
-- Restricted to users whose app_metadata.is_admin is true.
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
  id uuid,
  email text,
  created_at timestamptz,
  class_count bigint,
  student_count bigint
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
    u.id,
    u.email::text,
    u.created_at,
    COUNT(DISTINCT c.id)::bigint   AS class_count,
    COUNT(DISTINCT s.id)::bigint   AS student_count
  FROM auth.users u
  LEFT JOIN public.classes  c ON c.teacher_id = u.id
  LEFT JOIN public.students s ON s.class_id   = c.id
  GROUP BY u.id, u.email, u.created_at
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

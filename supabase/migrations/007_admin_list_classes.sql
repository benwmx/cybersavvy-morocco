-- Migration 007: Admin RPC to list all classes
-- Run in Supabase SQL editor

CREATE OR REPLACE FUNCTION public.admin_list_classes()
RETURNS TABLE(
  id            uuid,
  name          text,
  access_code   text,
  teacher_id    uuid,
  teacher_email text,
  student_count bigint,
  scenario_count bigint,
  created_at    timestamptz
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
    c.id,
    c.name,
    c.access_code,
    c.teacher_id,
    u.email::text                        AS teacher_email,
    COUNT(DISTINCT s.id)::bigint         AS student_count,
    COUNT(DISTINCT css.scenario_id)::bigint AS scenario_count,
    c.created_at
  FROM public.classes c
  LEFT JOIN auth.users                u   ON u.id  = c.teacher_id
  LEFT JOIN public.students           s   ON s.class_id = c.id
  LEFT JOIN public.class_scenario_status css ON css.class_id = c.id
  GROUP BY c.id, c.name, c.access_code, c.teacher_id, u.email, c.created_at
  ORDER BY c.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_classes() TO authenticated;

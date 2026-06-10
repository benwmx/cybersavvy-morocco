-- Migration 010: Teacher profiles table
-- Run in Supabase SQL editor after 009

-- ─── Table ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name  text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Each teacher can read and update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ─── Trigger: auto-insert on sign-up ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name',  '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Backfill existing users ──────────────────────────────────────────────────

INSERT INTO public.profiles (id, first_name, last_name)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'first_name', ''),
  COALESCE(raw_user_meta_data->>'last_name',  '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ─── Update admin_list_users to JOIN profiles ─────────────────────────────────

DROP FUNCTION IF EXISTS public.admin_list_users();

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
  id            uuid,
  email         text,
  first_name    text,
  last_name     text,
  created_at    timestamptz,
  class_count   bigint,
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
    COALESCE(p.first_name, '')::text AS first_name,
    COALESCE(p.last_name,  '')::text AS last_name,
    u.created_at,
    COUNT(DISTINCT c.id)::bigint  AS class_count,
    COUNT(DISTINCT s.id)::bigint  AS student_count
  FROM auth.users u
  LEFT JOIN public.profiles  p ON p.id          = u.id
  LEFT JOIN public.classes   c ON c.teacher_id  = u.id
  LEFT JOIN public.students  s ON s.class_id    = c.id
  GROUP BY u.id, u.email, p.first_name, p.last_name, u.created_at
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

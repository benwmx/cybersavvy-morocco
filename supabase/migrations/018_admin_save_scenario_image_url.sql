-- Migration 018: Add p_image_url parameter to admin_save_scenario
-- The previous version (013) didn't persist image_url when creating/updating
-- scenarios. This replaces it with the same logic plus image_url support.

CREATE OR REPLACE FUNCTION public.admin_save_scenario(
  p_id          uuid,
  p_category_id uuid,
  p_title       jsonb,
  p_description jsonb,
  p_questions   jsonb,
  p_image_url   text DEFAULT NULL
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
    INSERT INTO public.scenarios (teacher_id, category_id, title, description, questions, image_url, is_public)
    VALUES (NULL, p_category_id, p_title, p_description, p_questions, p_image_url, true)
    RETURNING id INTO _result;
  ELSE
    UPDATE public.scenarios
    SET title = p_title, description = p_description, questions = p_questions, image_url = p_image_url
    WHERE id = p_id
    RETURNING id INTO _result;
  END IF;

  RETURN _result;
END;
$$;

-- Revoke old signature and grant the new one
REVOKE EXECUTE ON FUNCTION public.admin_save_scenario(uuid, uuid, jsonb, jsonb, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_scenario(uuid, uuid, jsonb, jsonb, jsonb, text) TO authenticated;

-- ============================================================
-- Earth AI — Security Foundation Hardening
-- ============================================================
-- This migration patches unsafe authorization defaults without
-- changing Agriculture product tables or user-facing behavior.

-- Admin checks must never trust user-editable raw_user_meta_data.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = auth, public
AS $$
SELECT EXISTS (
    SELECT 1
    FROM auth.users au
    WHERE au.id = auth.uid()
      AND au.raw_app_meta_data->>'role' = 'admin'
)
$$;

-- Signup profile creation must not allow users to self-assign privileged roles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'user'::public.user_role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Keep timestamp helper deterministic and schema-bound.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Membership helpers should be schema-bound.
CREATE OR REPLACE FUNCTION public.is_farm_member(farm_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
SELECT EXISTS (
    SELECT 1
    FROM public.farm_members fm
    WHERE fm.farm_id = farm_uuid
      AND fm.user_id = auth.uid()
)
$$;

-- Usage functions may only act for the current user unless the caller is an admin.
CREATE OR REPLACE FUNCTION public.increment_usage(
    p_user_id UUID,
    p_tokens INTEGER DEFAULT 0,
    p_input_tokens INTEGER DEFAULT 0,
    p_output_tokens INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_user_id <> auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'not authorized';
    END IF;

    INSERT INTO public.usage_records (user_id, date, request_count, token_count, input_tokens, output_tokens)
    VALUES (p_user_id, CURRENT_DATE, 1, p_tokens, p_input_tokens, p_output_tokens)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        request_count = public.usage_records.request_count + 1,
        token_count = public.usage_records.token_count + p_tokens,
        input_tokens = public.usage_records.input_tokens + p_input_tokens,
        output_tokens = public.usage_records.output_tokens + p_output_tokens,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_daily_usage(p_user_id UUID)
RETURNS TABLE(request_count INTEGER, token_count INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
SELECT
    COALESCE(ur.request_count, 0)::INTEGER,
    COALESCE(ur.token_count, 0)::INTEGER
FROM public.usage_records ur
WHERE ur.user_id = p_user_id
  AND ur.date = CURRENT_DATE
  AND (p_user_id = auth.uid() OR public.is_admin())
LIMIT 1;
$$;

-- Users can read their own profile. Admin-only updates avoid self-service role escalation.
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_read_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_manage_user_profiles" ON public.user_profiles;

CREATE POLICY "users_read_own_user_profiles"
ON public.user_profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "admins_manage_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- SECURITY DEFINER functions are callable by PUBLIC by default. Restrict execution.
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_farm_member(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_usage(UUID, INTEGER, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_daily_usage(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_farm_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(UUID, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_daily_usage(UUID) TO authenticated;

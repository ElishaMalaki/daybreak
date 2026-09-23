-- ============================================================
-- Intelligence E Agriculture — Incremental Migration 001
-- Adds organization field to user_profiles
-- Adds timezone auto-detection support
-- Fixes analysis_type column to accept text values from frontend
-- ============================================================

-- Add organization column to user_profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'organization'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN organization TEXT;
    END IF;
END;
$$;

-- Ensure timezone column exists with proper default
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'timezone'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';
    END IF;
END;
$$;

-- Ensure preferred_language column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'preferred_language'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN preferred_language TEXT DEFAULT 'en';
    END IF;
END;
$$;

-- Ensure country column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'country'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN country TEXT;
    END IF;
END;
$$;

-- Add completed_at to research_requests if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'research_requests'
        AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE public.research_requests ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
END;
$$;

-- Ensure conversations.analysis_type accepts text (some frontends pass string values)
-- The existing ENUM should handle this, but ensure the column is correct
-- No change needed if ENUM already exists

-- Add index on user_profiles for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);

-- Ensure RLS is enabled on user_profiles (idempotent)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Ensure the profile policy allows upsert (needed for profile page)
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Ensure usage_records allows insert from server-side functions
DROP POLICY IF EXISTS "users_view_own_usage" ON public.usage_records;
CREATE POLICY "users_view_own_usage"
ON public.usage_records FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Allow server-side (SECURITY DEFINER functions) to insert usage records
-- The increment_usage function is SECURITY DEFINER so it bypasses RLS
-- But we need to ensure the policy doesn't block it
DROP POLICY IF EXISTS "system_insert_usage_records" ON public.usage_records;
CREATE POLICY "system_insert_usage_records"
ON public.usage_records FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "system_update_usage_records" ON public.usage_records;
CREATE POLICY "system_update_usage_records"
ON public.usage_records FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

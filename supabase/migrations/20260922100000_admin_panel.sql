-- ============================================================
-- Admin Panel Migration
-- Adds feature_flags table and admin-level RLS policies
-- ============================================================

-- 1. Feature Flags Table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  applies_to_tiers TEXT[] DEFAULT ARRAY['free','starter','professional','business','enterprise']::TEXT[],
  updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);

-- 2. Enable RLS on feature_flags
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- 3. Admin check function (uses auth.users metadata to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- 4. RLS Policies for feature_flags
DROP POLICY IF EXISTS "admins_manage_feature_flags" ON public.feature_flags;
CREATE POLICY "admins_manage_feature_flags"
ON public.feature_flags
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "authenticated_read_feature_flags" ON public.feature_flags;
CREATE POLICY "authenticated_read_feature_flags"
ON public.feature_flags
FOR SELECT
TO authenticated
USING (true);

-- 5. Admin policies on user_profiles (admins can read all)
DROP POLICY IF EXISTS "admins_read_all_user_profiles" ON public.user_profiles;
CREATE POLICY "admins_read_all_user_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin() OR id = auth.uid());

DROP POLICY IF EXISTS "admins_update_all_user_profiles" ON public.user_profiles;
CREATE POLICY "admins_update_all_user_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_admin() OR id = auth.uid())
WITH CHECK (public.is_admin() OR id = auth.uid());

-- 6. Admin policies on subscriptions
DROP POLICY IF EXISTS "admins_manage_all_subscriptions" ON public.subscriptions;
CREATE POLICY "admins_manage_all_subscriptions"
ON public.subscriptions
FOR ALL
TO authenticated
USING (public.is_admin() OR user_id = auth.uid())
WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- 7. Admin policies on ai_provider_config
DROP POLICY IF EXISTS "admins_manage_ai_provider_config" ON public.ai_provider_config;
CREATE POLICY "admins_manage_ai_provider_config"
ON public.ai_provider_config
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "authenticated_read_ai_provider_config" ON public.ai_provider_config;
CREATE POLICY "authenticated_read_ai_provider_config"
ON public.ai_provider_config
FOR SELECT
TO authenticated
USING (true);

-- 8. Admin policies on system_settings
DROP POLICY IF EXISTS "admins_manage_system_settings" ON public.system_settings;
CREATE POLICY "admins_manage_system_settings"
ON public.system_settings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 9. Admin policies on monthly_ai_credits (read all)
DROP POLICY IF EXISTS "admins_read_all_monthly_ai_credits" ON public.monthly_ai_credits;
CREATE POLICY "admins_read_all_monthly_ai_credits"
ON public.monthly_ai_credits
FOR SELECT
TO authenticated
USING (public.is_admin() OR user_id = auth.uid());

-- 10. Admin policies on usage_records (read all)
DROP POLICY IF EXISTS "admins_read_all_usage_records" ON public.usage_records;
CREATE POLICY "admins_read_all_usage_records"
ON public.usage_records
FOR SELECT
TO authenticated
USING (public.is_admin() OR user_id = auth.uid());

-- 11. Admin policies on ai_provider_usage (read all)
DROP POLICY IF EXISTS "admins_read_all_ai_provider_usage" ON public.ai_provider_usage;
CREATE POLICY "admins_read_all_ai_provider_usage"
ON public.ai_provider_usage
FOR SELECT
TO authenticated
USING (public.is_admin() OR user_id = auth.uid());

-- 12. Admin policies on audit_log
DROP POLICY IF EXISTS "admins_read_audit_log" ON public.audit_log;
CREATE POLICY "admins_read_audit_log"
ON public.audit_log
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 13. Seed default feature flags
INSERT INTO public.feature_flags (key, label, description, is_enabled, applies_to_tiers) VALUES
  ('intelligence_chat', 'AI Intelligence Chat', 'The main AI chat interface for agricultural intelligence', true, ARRAY['free','starter','professional','business','enterprise']::TEXT[]),
  ('farm_data', 'Farm Data Management', 'Ability to add and manage farm data (crops, livestock, inventory)', true, ARRAY['free','starter','professional','business','enterprise']::TEXT[]),
  ('research', 'Agricultural Research', 'AI-powered research requests', true, ARRAY['free','starter','professional','business','enterprise']::TEXT[]),
  ('reports', 'Report Generation', 'AI-generated farm and agricultural reports', true, ARRAY['free','starter','professional','business','enterprise']::TEXT[]),
  ('document_analysis', 'Document Analysis', 'Upload and analyze agricultural documents', true, ARRAY['starter','professional','business','enterprise']::TEXT[]),
  ('subscription_page', 'Subscription Management', 'Users can view and manage their subscription', true, ARRAY['free','starter','professional','business','enterprise']::TEXT[]),
  ('advanced_analytics', 'Advanced Analytics', 'Advanced data analytics and insights', true, ARRAY['professional','business','enterprise']::TEXT[]),
  ('api_access', 'API Access', 'Programmatic API access for integrations', true, ARRAY['business','enterprise']::TEXT[])
ON CONFLICT (key) DO NOTHING;

-- 14. Seed admin user (update existing user to admin role if exists, or create via auth)
DO $$
DECLARE
  admin_uuid UUID := gen_random_uuid();
BEGIN
  -- Check if admin@earthai.com already exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@earthai.com') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
      is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
      recovery_token, recovery_sent_at, email_change_token_new, email_change,
      email_change_sent_at, email_change_token_current, email_change_confirm_status,
      reauthentication_token, reauthentication_sent_at, phone, phone_change,
      phone_change_token, phone_change_sent_at
    ) VALUES (
      admin_uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@earthai.com',
      crypt('EarthAI@Admin2026', gen_salt('bf', 10)),
      now(), now(), now(),
      jsonb_build_object('full_name', 'Earth AI Admin', 'role', 'admin'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
      false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    );

    -- Ensure user_profiles row has admin role (trigger may set it from metadata)
    UPDATE public.user_profiles SET role = 'admin' WHERE id = admin_uuid;

    -- Create free subscription for admin
    INSERT INTO public.subscriptions (user_id, tier, status)
    VALUES (admin_uuid, 'enterprise', 'active')
    ON CONFLICT DO NOTHING;
  ELSE
    -- If admin@earthai.com exists, ensure they have admin role
    UPDATE public.user_profiles
    SET role = 'admin'
    WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@earthai.com' LIMIT 1);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Admin seed failed: %', SQLERRM;
END $$;

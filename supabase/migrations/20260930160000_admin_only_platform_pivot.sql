-- ============================================================
-- Intelligence E Agriculture — Admin-only platform pivot
-- The customer-facing Agriculture experience moves to Pelit.
-- The web application is retained as an internal admin/testing console.
-- ============================================================

DO $$
DECLARE
  owner_user_id UUID;
BEGIN
  SELECT id INTO owner_user_id
  FROM auth.users
  WHERE lower(email) = lower('elishamalaki77@gmail.com')
  LIMIT 1;

  IF owner_user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
      owner_user_id,
      'elishamalaki77@gmail.com',
      'Earth AI Owner',
      'admin',
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        email = EXCLUDED.email,
        updated_at = now();

    INSERT INTO public.subscriptions (user_id, tier, status, created_at, updated_at)
    VALUES (owner_user_id, 'enterprise', 'active', now(), now())
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

INSERT INTO public.feature_flags (key, label, description, is_enabled, applies_to_tiers)
VALUES
  ('pelit_api_integration', 'Pelit API Integration', 'Enables Intelligence E Agriculture usage through Pelit and other approved server-side integrations.', true, ARRAY['business','enterprise']::TEXT[]),
  ('admin_ai_testing_console', 'Admin AI Testing Console', 'Internal Earth AI console for AI chat, model, prompt, image, research, and evaluation testing.', true, ARRAY['enterprise']::TEXT[]),
  ('customer_web_app_disabled', 'Customer Web App Disabled', 'Customer-facing Agriculture usage is served through Pelit instead of the Intelligence E web app.', true, ARRAY['free','starter','professional','business','enterprise']::TEXT[])
ON CONFLICT (key) DO UPDATE
SET label = EXCLUDED.label,
    description = EXCLUDED.description,
    is_enabled = EXCLUDED.is_enabled,
    applies_to_tiers = EXCLUDED.applies_to_tiers,
    updated_at = now();

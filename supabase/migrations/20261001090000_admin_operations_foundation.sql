-- Admin operations foundation for Intelligence E Agriculture.
-- Supports internal admin workspaces and secure Pelit/API integration keys.

CREATE TABLE IF NOT EXISTS public.admin_workspace_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT admin_workspace_items_section_check CHECK (section ~ '^[a-z0-9-]+$'),
    CONSTRAINT admin_workspace_items_status_check CHECK (status IN ('active', 'testing', 'review', 'disabled', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.integration_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL UNIQUE,
    key_hash TEXT NOT NULL UNIQUE,
    scopes TEXT[] NOT NULL DEFAULT ARRAY['agriculture:ai'],
    environment TEXT NOT NULL DEFAULT 'production',
    status TEXT NOT NULL DEFAULT 'active',
    rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
    monthly_request_limit INTEGER,
    allowed_origins TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    revoked_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT integration_api_keys_environment_check CHECK (environment IN ('development', 'staging', 'production')),
    CONSTRAINT integration_api_keys_status_check CHECK (status IN ('active', 'revoked')),
    CONSTRAINT integration_api_keys_rate_limit_check CHECK (rate_limit_per_minute > 0)
);

CREATE INDEX IF NOT EXISTS idx_admin_workspace_items_section_created_at
ON public.admin_workspace_items(section, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_integration_api_keys_status_created_at
ON public.integration_api_keys(status, created_at DESC);

ALTER TABLE public.admin_workspace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_manage_admin_workspace_items" ON public.admin_workspace_items;
CREATE POLICY "admins_manage_admin_workspace_items"
ON public.admin_workspace_items
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admins_manage_integration_api_keys" ON public.integration_api_keys;
CREATE POLICY "admins_manage_integration_api_keys"
ON public.integration_api_keys
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS update_admin_workspace_items_updated_at ON public.admin_workspace_items;
CREATE TRIGGER update_admin_workspace_items_updated_at
    BEFORE UPDATE ON public.admin_workspace_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_api_keys_updated_at ON public.integration_api_keys;
CREATE TRIGGER update_integration_api_keys_updated_at
    BEFORE UPDATE ON public.integration_api_keys
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_workspace_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_api_keys TO authenticated;

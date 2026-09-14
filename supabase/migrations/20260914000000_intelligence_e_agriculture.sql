-- ============================================================
-- Intelligence E Agriculture — Full Schema Migration
-- ============================================================

-- ============================================================
-- 1. ENUMS / TYPES
-- ============================================================

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'user', 'org_admin', 'farm_manager', 'analyst');

DROP TYPE IF EXISTS public.subscription_tier CASCADE;
CREATE TYPE public.subscription_tier AS ENUM ('free', 'starter', 'professional', 'enterprise');

DROP TYPE IF EXISTS public.farm_member_role CASCADE;
CREATE TYPE public.farm_member_role AS ENUM ('owner', 'manager', 'analyst', 'viewer');

DROP TYPE IF EXISTS public.conversation_status CASCADE;
CREATE TYPE public.conversation_status AS ENUM ('active', 'archived', 'deleted');

DROP TYPE IF EXISTS public.message_role CASCADE;
CREATE TYPE public.message_role AS ENUM ('user', 'assistant', 'system');

DROP TYPE IF EXISTS public.analysis_type CASCADE;
CREATE TYPE public.analysis_type AS ENUM ('market', 'farm_data', 'decision_support', 'risk', 'research', 'general');

DROP TYPE IF EXISTS public.report_status CASCADE;
CREATE TYPE public.report_status AS ENUM ('draft', 'generating', 'completed', 'failed');

DROP TYPE IF EXISTS public.document_status CASCADE;
CREATE TYPE public.document_status AS ENUM ('uploading', 'processing', 'ready', 'failed');

DROP TYPE IF EXISTS public.ai_provider CASCADE;
CREATE TYPE public.ai_provider AS ENUM ('gemini', 'openai', 'anthropic', 'perplexity', 'other');

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- User Profiles (intermediary for auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    role public.user_role DEFAULT 'user'::public.user_role,
    subscription_tier public.subscription_tier DEFAULT 'free'::public.subscription_tier,
    preferred_language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    country TEXT,
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    country TEXT,
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    subscription_tier public.subscription_tier DEFAULT 'free'::public.subscription_tier,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Organization Members
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- Farms
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    country TEXT NOT NULL DEFAULT 'Unknown',
    region TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    total_area_hectares DECIMAL(12, 4),
    area_unit TEXT DEFAULT 'hectares',
    primary_activity TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Farm Members
CREATE TABLE IF NOT EXISTS public.farm_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role public.farm_member_role DEFAULT 'viewer'::public.farm_member_role,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(farm_id, user_id)
);

-- Crops
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    variety TEXT,
    field_name TEXT,
    area_hectares DECIMAL(12, 4),
    planting_date DATE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Livestock
CREATE TABLE IF NOT EXISTS public.livestock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    animal_type TEXT NOT NULL,
    breed TEXT,
    count INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'head',
    status TEXT DEFAULT 'active',
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Production Records
CREATE TABLE IF NOT EXISTS public.production_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    livestock_id UUID REFERENCES public.livestock(id) ON DELETE SET NULL,
    quantity DECIMAL(15, 4),
    unit TEXT,
    record_date DATE NOT NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Records
CREATE TABLE IF NOT EXISTS public.inventory_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT,
    quantity DECIMAL(15, 4),
    unit TEXT,
    unit_cost DECIMAL(15, 4),
    currency TEXT DEFAULT 'USD',
    record_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    analysis_type public.analysis_type DEFAULT 'general'::public.analysis_type,
    status public.conversation_status DEFAULT 'active'::public.conversation_status,
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role public.message_role NOT NULL,
    content TEXT NOT NULL,
    ai_provider public.ai_provider,
    model_used TEXT,
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Analyses
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    analysis_type public.analysis_type NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    full_content TEXT,
    ai_provider public.ai_provider,
    model_used TEXT,
    tokens_used INTEGER,
    status TEXT DEFAULT 'completed',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Research Requests
CREATE TABLE IF NOT EXISTS public.research_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    result TEXT,
    sources JSONB DEFAULT '[]'::jsonb,
    ai_provider public.ai_provider,
    model_used TEXT,
    tokens_used INTEGER,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    report_type TEXT NOT NULL,
    status public.report_status DEFAULT 'draft'::public.report_status,
    content TEXT,
    summary TEXT,
    ai_provider public.ai_provider,
    model_used TEXT,
    tokens_used INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- Uploaded Documents
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT,
    storage_path TEXT,
    status public.document_status DEFAULT 'uploading'::public.document_status,
    extracted_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tier public.subscription_tier NOT NULL DEFAULT 'free'::public.subscription_tier,
    status TEXT DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    billing_provider TEXT,
    external_subscription_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Usage Records (per-user AI usage tracking)
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_count INTEGER DEFAULT 0,
    token_count INTEGER DEFAULT 0,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- AI Provider Usage Records (per-provider tracking)
CREATE TABLE IF NOT EXISTS public.ai_provider_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    provider public.ai_provider NOT NULL,
    model_used TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_count INTEGER DEFAULT 0,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    avg_latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- System Settings (admin-only)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- AI Provider Config (admin-only, never exposed to users)
CREATE TABLE IF NOT EXISTS public.ai_provider_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider public.ai_provider NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 100,
    display_name TEXT NOT NULL,
    capabilities JSONB DEFAULT '[]'::jsonb,
    daily_request_limit INTEGER,
    monthly_request_limit INTEGER,
    max_tokens_per_request INTEGER DEFAULT 4096,
    timeout_seconds INTEGER DEFAULT 30,
    retry_limit INTEGER DEFAULT 2,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON public.farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_farms_organization_id ON public.farms(organization_id);
CREATE INDEX IF NOT EXISTS idx_farm_members_farm_id ON public.farm_members(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_members_user_id ON public.farm_members(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON public.crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);
CREATE INDEX IF NOT EXISTS idx_livestock_farm_id ON public.livestock(farm_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_date ON public.usage_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_ai_provider_usage_user_date ON public.ai_provider_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Check if user is admin (safe, uses auth metadata)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
    AND (au.raw_user_meta_data->>'role' = 'admin'
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- Check if user is farm member
CREATE OR REPLACE FUNCTION public.is_farm_member(farm_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.farm_members fm
    WHERE fm.farm_id = farm_uuid
    AND fm.user_id = auth.uid()
)
$$;

-- Increment usage record for a user
CREATE OR REPLACE FUNCTION public.increment_usage(
    p_user_id UUID,
    p_tokens INTEGER DEFAULT 0,
    p_input_tokens INTEGER DEFAULT 0,
    p_output_tokens INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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

-- Get user daily usage
CREATE OR REPLACE FUNCTION public.get_user_daily_usage(p_user_id UUID)
RETURNS TABLE(request_count INTEGER, token_count INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT
    COALESCE(ur.request_count, 0)::INTEGER,
    COALESCE(ur.token_count, 0)::INTEGER
FROM public.usage_records ur
WHERE ur.user_id = p_user_id
AND ur.date = CURRENT_DATE
LIMIT 1;
$$;

-- ============================================================
-- 5. ENABLE RLS
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_provider_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- user_profiles: own record only (Pattern 1 - no function to avoid recursion)
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- organizations: owner or member
DROP POLICY IF EXISTS "users_view_own_organizations" ON public.organizations;
CREATE POLICY "users_view_own_organizations"
ON public.organizations FOR SELECT TO authenticated
USING (
    owner_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = id AND om.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "users_manage_own_organizations" ON public.organizations;
CREATE POLICY "users_manage_own_organizations"
ON public.organizations FOR ALL TO authenticated
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- organization_members
DROP POLICY IF EXISTS "users_view_org_members" ON public.organization_members;
CREATE POLICY "users_view_org_members"
ON public.organization_members FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "org_owners_manage_members" ON public.organization_members;
CREATE POLICY "org_owners_manage_members"
ON public.organization_members FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id = organization_id AND o.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id = organization_id AND o.owner_id = auth.uid()
    )
);

-- farms: owner or member
DROP POLICY IF EXISTS "users_view_accessible_farms" ON public.farms;
CREATE POLICY "users_view_accessible_farms"
ON public.farms FOR SELECT TO authenticated
USING (
    owner_id = auth.uid()
    OR public.is_farm_member(id)
);

DROP POLICY IF EXISTS "users_manage_own_farms" ON public.farms;
CREATE POLICY "users_manage_own_farms"
ON public.farms FOR ALL TO authenticated
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- farm_members
DROP POLICY IF EXISTS "users_view_farm_memberships" ON public.farm_members;
CREATE POLICY "users_view_farm_memberships"
ON public.farm_members FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_farm_member(farm_id));

DROP POLICY IF EXISTS "farm_owners_manage_members" ON public.farm_members;
CREATE POLICY "farm_owners_manage_members"
ON public.farm_members FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.farms f WHERE f.id = farm_id AND f.owner_id = auth.uid())
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.farms f WHERE f.id = farm_id AND f.owner_id = auth.uid())
);

-- crops
DROP POLICY IF EXISTS "users_manage_own_crops" ON public.crops;
CREATE POLICY "users_manage_own_crops"
ON public.crops FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- livestock
DROP POLICY IF EXISTS "users_manage_own_livestock" ON public.livestock;
CREATE POLICY "users_manage_own_livestock"
ON public.livestock FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- production_records
DROP POLICY IF EXISTS "users_manage_own_production_records" ON public.production_records;
CREATE POLICY "users_manage_own_production_records"
ON public.production_records FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- inventory_records
DROP POLICY IF EXISTS "users_manage_own_inventory_records" ON public.inventory_records;
CREATE POLICY "users_manage_own_inventory_records"
ON public.inventory_records FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- conversations
DROP POLICY IF EXISTS "users_manage_own_conversations" ON public.conversations;
CREATE POLICY "users_manage_own_conversations"
ON public.conversations FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- messages
DROP POLICY IF EXISTS "users_manage_own_messages" ON public.messages;
CREATE POLICY "users_manage_own_messages"
ON public.messages FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- analyses
DROP POLICY IF EXISTS "users_manage_own_analyses" ON public.analyses;
CREATE POLICY "users_manage_own_analyses"
ON public.analyses FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- research_requests
DROP POLICY IF EXISTS "users_manage_own_research_requests" ON public.research_requests;
CREATE POLICY "users_manage_own_research_requests"
ON public.research_requests FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- reports
DROP POLICY IF EXISTS "users_manage_own_reports" ON public.reports;
CREATE POLICY "users_manage_own_reports"
ON public.reports FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- uploaded_documents
DROP POLICY IF EXISTS "users_manage_own_documents" ON public.uploaded_documents;
CREATE POLICY "users_manage_own_documents"
ON public.uploaded_documents FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- subscriptions
DROP POLICY IF EXISTS "users_view_own_subscriptions" ON public.subscriptions;
CREATE POLICY "users_view_own_subscriptions"
ON public.subscriptions FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- usage_records
DROP POLICY IF EXISTS "users_view_own_usage" ON public.usage_records;
CREATE POLICY "users_view_own_usage"
ON public.usage_records FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- ai_provider_usage
DROP POLICY IF EXISTS "users_view_own_provider_usage" ON public.ai_provider_usage;
CREATE POLICY "users_view_own_provider_usage"
ON public.ai_provider_usage FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- notifications
DROP POLICY IF EXISTS "users_manage_own_notifications" ON public.notifications;
CREATE POLICY "users_manage_own_notifications"
ON public.notifications FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- system_settings: public settings readable by all authenticated
DROP POLICY IF EXISTS "authenticated_view_public_settings" ON public.system_settings;
CREATE POLICY "authenticated_view_public_settings"
ON public.system_settings FOR SELECT TO authenticated
USING (is_public = true);

DROP POLICY IF EXISTS "admins_manage_system_settings" ON public.system_settings;
CREATE POLICY "admins_manage_system_settings"
ON public.system_settings FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ai_provider_config: admin only (never exposed to normal users)
DROP POLICY IF EXISTS "admins_manage_ai_provider_config" ON public.ai_provider_config;
CREATE POLICY "admins_manage_ai_provider_config"
ON public.ai_provider_config FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- audit_log: users see own, admins see all
DROP POLICY IF EXISTS "users_view_own_audit_log" ON public.audit_log;
CREATE POLICY "users_view_own_audit_log"
ON public.audit_log FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "system_insert_audit_log" ON public.audit_log;
CREATE POLICY "system_insert_audit_log"
ON public.audit_log FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_farms_updated_at ON public.farms;
CREATE TRIGGER update_farms_updated_at
    BEFORE UPDATE ON public.farms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 8. SEED: AI Provider Config (admin-managed, not user-visible)
-- ============================================================

INSERT INTO public.ai_provider_config (provider, is_enabled, priority, display_name, capabilities, daily_request_limit, monthly_request_limit, max_tokens_per_request, timeout_seconds, retry_limit, notes)
VALUES
    ('gemini', true, 10, 'Google Gemini', '["text_generation","structured_response","document_analysis","long_context"]'::jsonb, 100, 1500, 8192, 30, 2, 'Free tier via API key. Requires GEMINI_API_KEY.'),
    ('openai', false, 20, 'OpenAI GPT', '["text_generation","structured_response","document_analysis"]'::jsonb, 50, 500, 4096, 30, 2, 'Paid API. Requires OPENAI_API_KEY.'),
    ('anthropic', false, 30, 'Anthropic Claude', '["text_generation","structured_response","long_context","document_analysis"]'::jsonb, 50, 500, 8192, 30, 2, 'Paid API. Requires ANTHROPIC_API_KEY.'),
    ('perplexity', false, 40, 'Perplexity', '["text_generation","research","web_search"]'::jsonb, 50, 500, 4096, 30, 2, 'Paid API. Requires PERPLEXITY_API_KEY.')
ON CONFLICT (provider) DO NOTHING;

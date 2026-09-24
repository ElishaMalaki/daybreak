-- ============================================================
-- Earth AI — Usage & Billing Foundation
-- ============================================================
-- Adds production-safe primitives for subscription history,
-- invoice records, admin AI usage controls, and provider enum
-- compatibility. This does not create fake billing data.

ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'business';
ALTER TYPE public.ai_provider ADD VALUE IF NOT EXISTS 'groq';
ALTER TYPE public.ai_provider ADD VALUE IF NOT EXISTS 'deepseek';
ALTER TYPE public.ai_provider ADD VALUE IF NOT EXISTS 'openrouter';

CREATE TABLE IF NOT EXISTS public.subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    previous_tier public.subscription_tier,
    new_tier public.subscription_tier NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL DEFAULT 'active',
    changed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    change_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.billing_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    invoice_number TEXT UNIQUE,
    billing_provider TEXT,
    external_invoice_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft',
    currency TEXT NOT NULL DEFAULT 'USD',
    amount_due_cents INTEGER NOT NULL DEFAULT 0,
    amount_paid_cents INTEGER NOT NULL DEFAULT 0,
    hosted_invoice_url TEXT,
    invoice_pdf_url TEXT,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT billing_invoices_status_check CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    CONSTRAINT billing_invoices_currency_check CHECK (currency = upper(currency) AND length(currency) = 3),
    CONSTRAINT billing_invoices_amount_due_check CHECK (amount_due_cents >= 0),
    CONSTRAINT billing_invoices_amount_paid_check CHECK (amount_paid_cents >= 0)
);

CREATE TABLE IF NOT EXISTS public.ai_usage_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tier public.subscription_tier,
    ai_credit_limit_override INTEGER,
    ai_request_limit_override INTEGER,
    reports_limit_override INTEGER,
    research_limit_override INTEGER,
    is_ai_suspended BOOLEAN NOT NULL DEFAULT false,
    suspension_reason TEXT,
    notes TEXT,
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ai_usage_controls_scope_check CHECK ((user_id IS NOT NULL AND tier IS NULL) OR (user_id IS NULL AND tier IS NOT NULL)),
    CONSTRAINT ai_usage_controls_user_unique UNIQUE (user_id),
    CONSTRAINT ai_usage_controls_tier_unique UNIQUE (tier)
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user_created ON public.subscription_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_history_changed_by ON public.subscription_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_user_created ON public.billing_invoices(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON public.billing_invoices(status);
CREATE INDEX IF NOT EXISTS idx_ai_usage_controls_user ON public.ai_usage_controls(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_controls_tier ON public.ai_usage_controls(tier);
CREATE INDEX IF NOT EXISTS idx_ai_provider_usage_provider_date ON public.ai_provider_usage(provider, date DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_ai_credits_user_month ON public.monthly_ai_credits(user_id, billing_month DESC);

ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_subscription_history" ON public.subscription_history;
DROP POLICY IF EXISTS "admins_manage_subscription_history" ON public.subscription_history;
CREATE POLICY "users_read_own_subscription_history"
ON public.subscription_history FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "admins_manage_subscription_history"
ON public.subscription_history FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "users_read_own_billing_invoices" ON public.billing_invoices;
DROP POLICY IF EXISTS "admins_manage_billing_invoices" ON public.billing_invoices;
CREATE POLICY "users_read_own_billing_invoices"
ON public.billing_invoices FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "admins_manage_billing_invoices"
ON public.billing_invoices FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admins_manage_ai_usage_controls" ON public.ai_usage_controls;
CREATE POLICY "admins_manage_ai_usage_controls"
ON public.ai_usage_controls FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.record_subscription_history(
    p_user_id UUID,
    p_subscription_id UUID,
    p_previous_tier public.subscription_tier,
    p_new_tier public.subscription_tier,
    p_previous_status TEXT,
    p_new_status TEXT,
    p_change_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'not authorized';
    END IF;

    INSERT INTO public.subscription_history (
        user_id,
        subscription_id,
        previous_tier,
        new_tier,
        previous_status,
        new_status,
        changed_by,
        change_reason
    )
    VALUES (
        p_user_id,
        p_subscription_id,
        p_previous_tier,
        p_new_tier,
        p_previous_status,
        p_new_status,
        auth.uid(),
        p_change_reason
    );
END;
$$;

REVOKE ALL ON FUNCTION public.record_subscription_history(UUID, UUID, public.subscription_tier, public.subscription_tier, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_subscription_history(UUID, UUID, public.subscription_tier, public.subscription_tier, TEXT, TEXT, TEXT) TO authenticated;

GRANT SELECT ON public.subscription_history TO authenticated;
GRANT SELECT ON public.billing_invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_usage_controls TO authenticated;

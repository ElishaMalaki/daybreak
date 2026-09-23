-- ============================================================
-- Intelligence E Agriculture — Subscription Enforcement Migration
-- Adds: business tier, monthly_ai_credits table, DB functions
-- for server-side credit tracking and enforcement.
-- Timestamp: 20260922000000
-- ============================================================

-- ============================================================
-- 1. Add 'business' to subscription_tier enum
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'business'
    AND enumtypid = (
      SELECT oid FROM pg_type WHERE typname = 'subscription_tier'
    )
  ) THEN
    ALTER TYPE public.subscription_tier ADD VALUE 'business';
  END IF;
END $$;

-- ============================================================
-- 2. Monthly AI Credits Table
-- Tracks credits consumed per user per billing month.
-- Billing month = first day of the month (YYYY-MM-01).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.monthly_ai_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    billing_month DATE NOT NULL,
    credits_used INTEGER NOT NULL DEFAULT 0,
    requests_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, billing_month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_ai_credits_user_month
    ON public.monthly_ai_credits(user_id, billing_month);

-- ============================================================
-- 3. Enable RLS on new table
-- ============================================================

ALTER TABLE public.monthly_ai_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_own_monthly_credits" ON public.monthly_ai_credits;
CREATE POLICY "users_view_own_monthly_credits"
ON public.monthly_ai_credits FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- 4. Functions for server-side credit tracking
-- ============================================================

-- Increment monthly AI credits (called after successful AI response)
CREATE OR REPLACE FUNCTION public.increment_monthly_credits(
    p_user_id UUID,
    p_billing_month DATE,
    p_credits INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.monthly_ai_credits (user_id, billing_month, credits_used, requests_used)
    VALUES (p_user_id, p_billing_month, p_credits, 1)
    ON CONFLICT (user_id, billing_month)
    DO UPDATE SET
        credits_used = public.monthly_ai_credits.credits_used + p_credits,
        requests_used = public.monthly_ai_credits.requests_used + 1,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- Increment provider usage (detailed tracking per provider/model)
CREATE OR REPLACE FUNCTION public.increment_provider_usage(
    p_user_id UUID,
    p_provider TEXT,
    p_model TEXT,
    p_input_tokens INTEGER DEFAULT 0,
    p_output_tokens INTEGER DEFAULT 0,
    p_total_tokens INTEGER DEFAULT 0,
    p_latency_ms INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_provider public.ai_provider;
BEGIN
    -- Safely cast provider text to enum, default to 'other'
    BEGIN
        v_provider := p_provider::public.ai_provider;
    EXCEPTION WHEN invalid_text_representation THEN
        v_provider := 'other'::public.ai_provider;
    END;

    INSERT INTO public.ai_provider_usage (
        user_id, provider, model_used, date,
        request_count, input_tokens, output_tokens, total_tokens, avg_latency_ms
    )
    VALUES (
        p_user_id, v_provider, p_model, CURRENT_DATE,
        1, p_input_tokens, p_output_tokens, p_total_tokens, p_latency_ms
    )
    ON CONFLICT (user_id, provider, date)
    DO UPDATE SET
        request_count = public.ai_provider_usage.request_count + 1,
        input_tokens = public.ai_provider_usage.input_tokens + p_input_tokens,
        output_tokens = public.ai_provider_usage.output_tokens + p_output_tokens,
        total_tokens = public.ai_provider_usage.total_tokens + p_total_tokens,
        avg_latency_ms = (public.ai_provider_usage.avg_latency_ms + p_latency_ms) / 2,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- Get user's monthly credit usage (used by server-side enforcer)
CREATE OR REPLACE FUNCTION public.get_monthly_credit_usage(
    p_user_id UUID,
    p_billing_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE
)
RETURNS TABLE(credits_used INTEGER, requests_used INTEGER)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT
    COALESCE(mac.credits_used, 0)::INTEGER,
    COALESCE(mac.requests_used, 0)::INTEGER
FROM public.monthly_ai_credits mac
WHERE mac.user_id = p_user_id
AND mac.billing_month = p_billing_month
LIMIT 1;
$$;

-- ============================================================
-- 5. Add unique constraint to ai_provider_usage for upsert
-- (user_id, provider, date) must be unique for ON CONFLICT
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ai_provider_usage_user_provider_date_key'
    ) THEN
        ALTER TABLE public.ai_provider_usage
        ADD CONSTRAINT ai_provider_usage_user_provider_date_key
        UNIQUE (user_id, provider, date);
    END IF;
END $$;

-- ============================================================
-- 6. Ensure subscriptions table has needed indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
    ON public.subscriptions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at
    ON public.subscriptions(expires_at);

-- ============================================================
-- 7. Auto-create free subscription for new users
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create a free subscription for every new user
    INSERT INTO public.subscriptions (user_id, tier, status, started_at)
    VALUES (NEW.id, 'free'::public.subscription_tier, 'active', CURRENT_TIMESTAMP)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_profile_created_subscription ON public.user_profiles;
CREATE TRIGGER on_user_profile_created_subscription
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- ============================================================
-- 8. Backfill free subscriptions for existing users without one
-- ============================================================

DO $$
BEGIN
    INSERT INTO public.subscriptions (user_id, tier, status, started_at)
    SELECT up.id, 'free'::public.subscription_tier, 'active', CURRENT_TIMESTAMP
    FROM public.user_profiles up
    WHERE NOT EXISTS (
        SELECT 1 FROM public.subscriptions s WHERE s.user_id = up.id
    )
    ON CONFLICT DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Backfill subscriptions: %', SQLERRM;
END $$;

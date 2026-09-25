-- ============================================================
-- Earth AI — Strict AI Usage Reservation
-- ============================================================
-- Enforces AI credits and request limits atomically before provider calls.
-- This prevents users from exceeding plan limits through parallel requests
-- or failed asynchronous usage logging.

CREATE OR REPLACE FUNCTION public.reserve_monthly_ai_usage(
    p_user_id UUID,
    p_billing_month DATE,
    p_credits INTEGER,
    p_credit_limit INTEGER,
    p_request_limit INTEGER
)
RETURNS TABLE(
    allowed BOOLEAN,
    credits_used INTEGER,
    requests_used INTEGER,
    credits_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_credits INTEGER := 0;
    v_current_requests INTEGER := 0;
    v_new_credits INTEGER := 0;
    v_new_requests INTEGER := 0;
BEGIN
    IF p_user_id <> auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'not authorized';
    END IF;

    IF p_credits < 0 THEN
        RAISE EXCEPTION 'credits must be non-negative';
    END IF;

    IF p_credit_limit < -1 OR p_request_limit < -1 THEN
        RAISE EXCEPTION 'limits must be -1 or non-negative';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_billing_month::text, 0));

    INSERT INTO public.monthly_ai_credits (user_id, billing_month, credits_used, requests_used)
    VALUES (p_user_id, p_billing_month, 0, 0)
    ON CONFLICT (user_id, billing_month) DO NOTHING;

    SELECT mac.credits_used, mac.requests_used
    INTO v_current_credits, v_current_requests
    FROM public.monthly_ai_credits mac
    WHERE mac.user_id = p_user_id
      AND mac.billing_month = p_billing_month
    FOR UPDATE;

    v_new_credits := v_current_credits + p_credits;
    v_new_requests := v_current_requests + 1;

    IF (p_credit_limit <> -1 AND v_new_credits > p_credit_limit)
       OR (p_request_limit <> -1 AND v_new_requests > p_request_limit) THEN
        RETURN QUERY SELECT
            false,
            v_current_credits,
            v_current_requests,
            CASE WHEN p_credit_limit = -1 THEN -1 ELSE GREATEST(0, p_credit_limit - v_current_credits) END;
        RETURN;
    END IF;

    UPDATE public.monthly_ai_credits
    SET credits_used = v_new_credits,
        requests_used = v_new_requests,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id
      AND billing_month = p_billing_month;

    RETURN QUERY SELECT
        true,
        v_new_credits,
        v_new_requests,
        CASE WHEN p_credit_limit = -1 THEN -1 ELSE GREATEST(0, p_credit_limit - v_new_credits) END;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_monthly_ai_usage(
    p_user_id UUID,
    p_billing_month DATE,
    p_credits INTEGER
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

    IF p_credits < 0 THEN
        RAISE EXCEPTION 'credits must be non-negative';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_billing_month::text, 0));

    UPDATE public.monthly_ai_credits
    SET credits_used = GREATEST(0, credits_used - p_credits),
        requests_used = GREATEST(0, requests_used - 1),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id
      AND billing_month = p_billing_month;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_monthly_ai_usage(UUID, DATE, INTEGER, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refund_monthly_ai_usage(UUID, DATE, INTEGER) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.reserve_monthly_ai_usage(UUID, DATE, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_monthly_ai_usage(UUID, DATE, INTEGER) TO authenticated;

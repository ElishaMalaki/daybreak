-- ============================================================
-- Earth AI — AI Usage Controls Enforcement RPC
-- ============================================================
-- Lets server-side enforcement read only applicable control fields
-- for the current user/tier without exposing admin notes broadly.

CREATE OR REPLACE FUNCTION public.get_ai_usage_controls_for_enforcement(
    p_user_id UUID,
    p_tier public.subscription_tier
)
RETURNS TABLE(
    ai_credit_limit_override INTEGER,
    ai_request_limit_override INTEGER,
    reports_limit_override INTEGER,
    research_limit_override INTEGER,
    is_ai_suspended BOOLEAN,
    suspension_reason TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        auc.ai_credit_limit_override,
        auc.ai_request_limit_override,
        auc.reports_limit_override,
        auc.research_limit_override,
        auc.is_ai_suspended,
        auc.suspension_reason
    FROM public.ai_usage_controls auc
    WHERE (auc.user_id = p_user_id OR auc.tier = p_tier)
      AND (p_user_id = auth.uid() OR public.is_admin())
    ORDER BY CASE WHEN auc.user_id = p_user_id THEN 0 ELSE 1 END;
$$;

REVOKE ALL ON FUNCTION public.get_ai_usage_controls_for_enforcement(UUID, public.subscription_tier) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_ai_usage_controls_for_enforcement(UUID, public.subscription_tier) TO authenticated;

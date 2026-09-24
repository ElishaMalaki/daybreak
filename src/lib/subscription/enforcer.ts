// ============================================================
// Intelligence E Agriculture — Server-Side Subscription Enforcer
// All enforcement happens server-side. Client is never trusted.
// ============================================================

import { createClient } from '@/lib/supabase/server';
import { getPlanLimits, getCreditCost, SERVER_LIMITS, type PlanLimits, type SubscriptionTier } from '@/lib/subscription/config';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  status: string;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  billingPeriodStart: string;
  billingPeriodEnd: string;
}

export interface UsageSummary {
  aiCreditsUsed: number;
  aiRequestsUsed: number;
  reportsUsed: number;
  researchRequestsUsed: number;
  farmsCount: number;
  usersCount: number;
}

export interface EnforcementResult {
  allowed: boolean;
  reason?: string;
  creditsRequired?: number;
  creditsRemaining?: number;
  limitType?: string;
}

export interface AIUsageRequestOptions {
  requiresImageAnalysis?: boolean;
  requiresDocumentAnalysis?: boolean;
  isAdvancedDocumentAnalysis?: boolean;
}

interface AIUsageControlRow {
  ai_credit_limit_override: number | null;
  ai_request_limit_override: number | null;
  reports_limit_override: number | null;
  research_limit_override: number | null;
  is_ai_suspended: boolean | null;
  suspension_reason: string | null;
}

function getCurrentBillingPeriod(now = new Date()) {
  const billingStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const billingEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  return {
    billingStart,
    billingEnd,
    billingMonth: billingStart.toISOString().split('T')[0],
  };
}

function applyUsageControlOverrides(limits: PlanLimits, controls: AIUsageControlRow[]): { limits: PlanLimits; suspendedReason: string | null } {
  const effectiveLimits: PlanLimits = { ...limits };
  let suspendedReason: string | null = null;

  for (const control of controls) {
    if (control.is_ai_suspended) {
      suspendedReason = control.suspension_reason || 'AI access is currently suspended for this account.';
    }
    if (typeof control.ai_credit_limit_override === 'number') effectiveLimits.aiCredits = control.ai_credit_limit_override;
    if (typeof control.ai_request_limit_override === 'number') effectiveLimits.aiRequests = control.ai_request_limit_override;
    if (typeof control.reports_limit_override === 'number') effectiveLimits.reports = control.reports_limit_override;
    if (typeof control.research_limit_override === 'number') effectiveLimits.researchRequests = control.research_limit_override;
  }

  return { limits: effectiveLimits, suspendedReason };
}

async function getEffectivePlanLimits(userId: string, tier: SubscriptionTier): Promise<{ limits: PlanLimits; suspendedReason: string | null }> {
  const baseLimits = getPlanLimits(tier);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_ai_usage_controls_for_enforcement', {
    p_user_id: userId,
    p_tier: tier,
  });

  if (error) {
    console.error('[Subscription Enforcer] usage controls lookup failed:', error.message);
    return { limits: baseLimits, suspendedReason: null };
  }

  return applyUsageControlOverrides(baseLimits, (data || []) as AIUsageControlRow[]);
}

// ============================================================
// Get authenticated user's subscription (server-side only)
// ============================================================

export async function getUserSubscription(userId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient();

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier, status, started_at, expires_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const tier = (sub?.tier as SubscriptionTier) || 'free';
  const now = new Date();

  let isActive = true;
  if (sub?.expires_at) {
    isActive = new Date(sub.expires_at) > now;
  }

  const effectiveTier: SubscriptionTier = isActive ? tier : 'free';
  const { billingStart, billingEnd } = getCurrentBillingPeriod(now);

  return {
    tier: effectiveTier,
    status: sub?.status || 'free',
    startsAt: sub?.started_at || null,
    expiresAt: sub?.expires_at || null,
    isActive,
    billingPeriodStart: billingStart.toISOString(),
    billingPeriodEnd: billingEnd.toISOString(),
  };
}

// ============================================================
// Get current month usage (server-side only)
// ============================================================

export async function getUserMonthlyUsage(userId: string): Promise<UsageSummary> {
  const supabase = await createClient();
  const { billingStart, billingEnd, billingMonth } = getCurrentBillingPeriod();
  const monthStart = billingStart.toISOString().split('T')[0];
  const monthEnd = billingEnd.toISOString().split('T')[0];

  const { data: usageRows } = await supabase
    .from('usage_records')
    .select('request_count, token_count')
    .eq('user_id', userId)
    .gte('date', monthStart)
    .lte('date', monthEnd);

  const aiRequestsUsed = (usageRows || []).reduce((sum, r) => sum + (r.request_count || 0), 0);

  const { data: creditRow } = await supabase
    .from('monthly_ai_credits')
    .select('credits_used')
    .eq('user_id', userId)
    .eq('billing_month', billingMonth)
    .maybeSingle();

  const aiCreditsUsed = creditRow?.credits_used || 0;

  const { count: reportsUsed } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', billingStart.toISOString())
    .lte('created_at', billingEnd.toISOString());

  const { count: researchRequestsUsed } = await supabase
    .from('research_requests')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', billingStart.toISOString())
    .lte('created_at', billingEnd.toISOString());

  const { count: farmsCount } = await supabase
    .from('farms')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', userId)
    .eq('is_active', true);

  return {
    aiCreditsUsed,
    aiRequestsUsed,
    reportsUsed: reportsUsed || 0,
    researchRequestsUsed: researchRequestsUsed || 0,
    farmsCount: farmsCount || 0,
    usersCount: 1,
  };
}

// ============================================================
// Check if AI request is allowed (server-side enforcement)
// ============================================================

export async function checkAIRequestAllowed(
  userId: string,
  requestType: string,
  options: AIUsageRequestOptions = {}
): Promise<EnforcementResult> {
  const [subscription, usage] = await Promise.all([
    getUserSubscription(userId),
    getUserMonthlyUsage(userId),
  ]);

  const { limits, suspendedReason } = await getEffectivePlanLimits(userId, subscription.tier);
  const creditsRequired = getCreditCost(requestType);

  if (suspendedReason) {
    return {
      allowed: false,
      reason: suspendedReason,
      creditsRequired,
      creditsRemaining: limits.aiCredits === -1 ? -1 : Math.max(0, limits.aiCredits - usage.aiCreditsUsed),
      limitType: 'ai_suspended',
    };
  }

  if (options.requiresImageAnalysis && !limits.imageAnalysis) {
    return {
      allowed: false,
      reason: 'Image analysis is not included in your current plan. Upgrade your plan to analyze farm photos.',
      creditsRequired,
      creditsRemaining: limits.aiCredits === -1 ? -1 : Math.max(0, limits.aiCredits - usage.aiCreditsUsed),
      limitType: 'image_analysis',
    };
  }

  if (options.requiresDocumentAnalysis && !limits.documentAnalysis) {
    return {
      allowed: false,
      reason: 'Document analysis is not included in your current plan. Upgrade your plan to analyze documents.',
      creditsRequired,
      creditsRemaining: limits.aiCredits === -1 ? -1 : Math.max(0, limits.aiCredits - usage.aiCreditsUsed),
      limitType: 'document_analysis',
    };
  }

  if (options.isAdvancedDocumentAnalysis && !limits.advancedDocumentAnalysis) {
    return {
      allowed: false,
      reason: 'Advanced document intelligence is not included in your current plan.',
      creditsRequired,
      creditsRemaining: limits.aiCredits === -1 ? -1 : Math.max(0, limits.aiCredits - usage.aiCreditsUsed),
      limitType: 'advanced_document_analysis',
    };
  }

  if (limits.aiCredits === -1) {
    return { allowed: true, creditsRequired, creditsRemaining: -1 };
  }

  if (usage.aiCreditsUsed + creditsRequired > limits.aiCredits) {
    return {
      allowed: false,
      reason: 'Your monthly AI allowance has been reached. Upgrade your plan to continue using Intelligence E.',
      creditsRequired,
      creditsRemaining: Math.max(0, limits.aiCredits - usage.aiCreditsUsed),
      limitType: 'ai_credits',
    };
  }

  if (limits.aiRequests !== -1 && usage.aiRequestsUsed >= limits.aiRequests) {
    return {
      allowed: false,
      reason: 'Your monthly AI request limit has been reached. Upgrade your plan to continue.',
      creditsRequired,
      creditsRemaining: Math.max(0, limits.aiCredits - usage.aiCreditsUsed),
      limitType: 'ai_requests',
    };
  }

  return {
    allowed: true,
    creditsRequired,
    creditsRemaining: limits.aiCredits - usage.aiCreditsUsed - creditsRequired,
  };
}

// ============================================================
// Check farm creation limit
// ============================================================

export async function checkFarmCreationAllowed(userId: string): Promise<EnforcementResult> {
  const [subscription, usage] = await Promise.all([
    getUserSubscription(userId),
    getUserMonthlyUsage(userId),
  ]);

  const { limits, suspendedReason } = await getEffectivePlanLimits(userId, subscription.tier);
  if (suspendedReason) return { allowed: false, reason: suspendedReason, limitType: 'ai_suspended' };
  if (limits.farms === -1) return { allowed: true };

  if (usage.farmsCount >= limits.farms) {
    return {
      allowed: false,
      reason: `Your plan allows a maximum of ${limits.farms} farm${limits.farms === 1 ? '' : 's'}. Upgrade your plan to add more farms.`,
      limitType: 'farms',
    };
  }

  return { allowed: true };
}

// ============================================================
// Check report generation limit
// ============================================================

export async function checkReportAllowed(userId: string): Promise<EnforcementResult> {
  const [subscription, usage] = await Promise.all([
    getUserSubscription(userId),
    getUserMonthlyUsage(userId),
  ]);

  const { limits, suspendedReason } = await getEffectivePlanLimits(userId, subscription.tier);
  if (suspendedReason) return { allowed: false, reason: suspendedReason, limitType: 'ai_suspended' };
  if (limits.reports === -1) return { allowed: true };

  if (usage.reportsUsed >= limits.reports) {
    return {
      allowed: false,
      reason: `You have reached your monthly report limit (${limits.reports}). Upgrade your plan to generate more reports.`,
      limitType: 'reports',
    };
  }

  return { allowed: true };
}

// ============================================================
// Check research request limit
// ============================================================

export async function checkResearchAllowed(userId: string): Promise<EnforcementResult> {
  const [subscription, usage] = await Promise.all([
    getUserSubscription(userId),
    getUserMonthlyUsage(userId),
  ]);

  const { limits, suspendedReason } = await getEffectivePlanLimits(userId, subscription.tier);
  if (suspendedReason) return { allowed: false, reason: suspendedReason, limitType: 'ai_suspended' };
  if (limits.researchRequests === -1) return { allowed: true };

  if (usage.researchRequestsUsed >= limits.researchRequests) {
    return {
      allowed: false,
      reason: `You have reached your monthly research request limit (${limits.researchRequests}). Upgrade your plan to continue researching.`,
      limitType: 'research_requests',
    };
  }

  return { allowed: true };
}

// ============================================================
// Record AI credit usage (server-side, after successful response)
// ============================================================

export async function recordAICreditsUsed(
  userId: string,
  creditsUsed: number,
  requestType: string,
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  processingTimeMs: number
): Promise<void> {
  const supabase = await createClient();
  const { billingMonth } = getCurrentBillingPeriod();

  await supabase.rpc('increment_monthly_credits', {
    p_user_id: userId,
    p_billing_month: billingMonth,
    p_credits: creditsUsed,
  });

  await supabase.rpc('increment_provider_usage', {
    p_user_id: userId,
    p_provider: provider,
    p_model: model,
    p_input_tokens: inputTokens,
    p_output_tokens: outputTokens,
    p_total_tokens: inputTokens + outputTokens,
    p_latency_ms: processingTimeMs,
  });
}

// ============================================================
// Validate input length server-side
// ============================================================

export function validateInputLength(content: string): EnforcementResult {
  if (content.length > SERVER_LIMITS.maxInputCharacters) {
    return {
      allowed: false,
      reason: `Input too long. Maximum ${SERVER_LIMITS.maxInputCharacters} characters allowed.`,
      limitType: 'input_length',
    };
  }
  return { allowed: true };
}

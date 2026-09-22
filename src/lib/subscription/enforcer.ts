// ============================================================
// Intelligence E Agriculture — Server-Side Subscription Enforcer
// All enforcement happens server-side. Client is never trusted.
// ============================================================

import { createClient } from '@/lib/supabase/server';
import { getPlanLimits, getCreditCost, SERVER_LIMITS, type SubscriptionTier,  } from '@/lib/subscription/config';

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

// ============================================================
// Get authenticated user's subscription (server-side only)
// ============================================================

export async function getUserSubscription(userId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient();

  // Get active subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier, status, started_at, expires_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // If no active subscription, treat as free
  const tier = (sub?.tier as SubscriptionTier) || 'free';
  const now = new Date();

  // Check expiry
  let isActive = true;
  if (sub?.expires_at) {
    isActive = new Date(sub.expires_at) > now;
  }

  // If expired paid plan, revert to free
  const effectiveTier: SubscriptionTier = isActive ? tier : 'free';

  // Billing period: start of current month
  const billingStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const billingEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

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
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  // AI credits and requests from usage_records (monthly aggregate)
  const { data: usageRows } = await supabase
    .from('usage_records')
    .select('request_count, token_count')
    .eq('user_id', userId)
    .gte('date', monthStart)
    .lte('date', monthEnd);

  const aiRequestsUsed = (usageRows || []).reduce((sum, r) => sum + (r.request_count || 0), 0);

  // AI credits from monthly_ai_credits table (new)
  const { data: creditRow } = await supabase
    .from('monthly_ai_credits')
    .select('credits_used')
    .eq('user_id', userId)
    .eq('billing_month', monthStart)
    .single();

  const aiCreditsUsed = creditRow?.credits_used || 0;

  // Reports this month
  const { count: reportsUsed } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd + 'T23:59:59Z');

  // Research requests this month
  const { count: researchRequestsUsed } = await supabase
    .from('research_requests')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd + 'T23:59:59Z');

  // Farms owned
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
    usersCount: 1, // single-user context for now
  };
}

// ============================================================
// Check if AI request is allowed (server-side enforcement)
// ============================================================

export async function checkAIRequestAllowed(
  userId: string,
  requestType: string
): Promise<EnforcementResult> {
  const [subscription, usage] = await Promise.all([
    getUserSubscription(userId),
    getUserMonthlyUsage(userId),
  ]);

  const limits = getPlanLimits(subscription.tier);
  const creditsRequired = getCreditCost(requestType);

  // Enterprise: unlimited (-1)
  if (limits.aiCredits === -1) {
    return { allowed: true, creditsRequired, creditsRemaining: -1 };
  }

  // Check AI credits
  if (usage.aiCreditsUsed + creditsRequired > limits.aiCredits) {
    return {
      allowed: false,
      reason: `Your monthly AI allowance has been reached. Upgrade your plan to continue using Intelligence E.`,
      creditsRequired,
      creditsRemaining: Math.max(0, limits.aiCredits - usage.aiCreditsUsed),
      limitType: 'ai_credits',
    };
  }

  // Check AI requests
  if (usage.aiRequestsUsed >= limits.aiRequests) {
    return {
      allowed: false,
      reason: `Your monthly AI request limit has been reached. Upgrade your plan to continue.`,
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

  const limits = getPlanLimits(subscription.tier);

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

  const limits = getPlanLimits(subscription.tier);

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

  const limits = getPlanLimits(subscription.tier);

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
  const now = new Date();
  const billingMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Upsert monthly credit record
  await supabase.rpc('increment_monthly_credits', {
    p_user_id: userId,
    p_billing_month: billingMonth,
    p_credits: creditsUsed,
  });

  // Record detailed provider usage
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

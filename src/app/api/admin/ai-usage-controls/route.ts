import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { isKnownSubscriptionTier } from '@/lib/subscription/config';

function parseOptionalLimit(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return undefined;
  return parsed;
}

// GET /api/admin/ai-usage-controls - list tier/user AI usage overrides
export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase!
    .from('ai_usage_controls')
    .select('id, user_id, tier, ai_credit_limit_override, ai_request_limit_override, reports_limit_override, research_limit_override, is_ai_suspended, suspension_reason, notes, updated_at')
    .order('updated_at', { ascending: false });

  if (dbError) {
    console.error('[Admin AI Usage Controls] query failed:', dbError.message);
    return NextResponse.json({ error: 'Unable to load AI usage controls' }, { status: 500 });
  }

  return NextResponse.json({ controls: data || [] });
}

// PATCH /api/admin/ai-usage-controls - upsert a tier or user override
export async function PATCH(request: NextRequest) {
  const { error, supabase, user } = await requireAdmin();
  if (error) return error;

  let body: {
    userId?: string | null;
    tier?: string | null;
    aiCreditLimitOverride?: unknown;
    aiRequestLimitOverride?: unknown;
    reportsLimitOverride?: unknown;
    researchLimitOverride?: unknown;
    isAiSuspended?: boolean;
    suspensionReason?: string | null;
    notes?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const userId = body.userId?.trim() || null;
  const tier = body.tier?.trim() || null;

  if ((!userId && !tier) || (userId && tier)) {
    return NextResponse.json({ error: 'Provide either userId or tier, not both' }, { status: 400 });
  }

  if (tier && !isKnownSubscriptionTier(tier)) {
    return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
  }

  const aiCreditLimitOverride = parseOptionalLimit(body.aiCreditLimitOverride);
  const aiRequestLimitOverride = parseOptionalLimit(body.aiRequestLimitOverride);
  const reportsLimitOverride = parseOptionalLimit(body.reportsLimitOverride);
  const researchLimitOverride = parseOptionalLimit(body.researchLimitOverride);

  if (
    aiCreditLimitOverride === undefined ||
    aiRequestLimitOverride === undefined ||
    reportsLimitOverride === undefined ||
    researchLimitOverride === undefined
  ) {
    return NextResponse.json({ error: 'Limit overrides must be non-negative whole numbers or null' }, { status: 400 });
  }

  const payload = {
    user_id: userId,
    tier,
    ai_credit_limit_override: aiCreditLimitOverride,
    ai_request_limit_override: aiRequestLimitOverride,
    reports_limit_override: reportsLimitOverride,
    research_limit_override: researchLimitOverride,
    is_ai_suspended: body.isAiSuspended === true,
    suspension_reason: body.suspensionReason?.trim() || null,
    notes: body.notes?.trim() || null,
    updated_by: user!.id,
    updated_at: new Date().toISOString(),
  };

  const conflictTarget = userId ? 'user_id' : 'tier';
  const { data, error: upsertError } = await supabase!
    .from('ai_usage_controls')
    .upsert(payload, { onConflict: conflictTarget })
    .select('id, user_id, tier, ai_credit_limit_override, ai_request_limit_override, reports_limit_override, research_limit_override, is_ai_suspended, suspension_reason, notes, updated_at')
    .single();

  if (upsertError) {
    console.error('[Admin AI Usage Controls] upsert failed:', upsertError.message);
    return NextResponse.json({ error: 'Unable to save AI usage control' }, { status: 500 });
  }

  return NextResponse.json({ control: data });
}

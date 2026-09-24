import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

const MAX_LIMIT = 100;
const VALID_ROLES = new Set(['user', 'admin', 'org_admin', 'farm_manager', 'analyst']);
const VALID_TIERS = new Set(['free', 'starter', 'professional', 'business', 'enterprise']);

function parsePositiveInt(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function escapeSearch(value: string) {
  return value.replace(/[,%]/g, '').trim();
}

// GET /api/admin/users - list all users with subscription info
export async function GET(request: NextRequest) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const limit = parsePositiveInt(searchParams.get('limit'), 20, MAX_LIMIT);
  const search = escapeSearch(searchParams.get('search') || '');
  const offset = (page - 1) * limit;

  let query = supabase!
    .from('user_profiles')
    .select('id, email, full_name, role, subscription_tier, is_active, country, created_at, last_seen_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data: users, count, error: dbError } = await query;

  if (dbError) {
    console.error('[Admin Users] user_profiles query failed:', dbError.message);
    return NextResponse.json({ error: 'Unable to load users' }, { status: 500 });
  }

  const rows = users || [];
  const userIds = rows.map((u) => u.id).filter(Boolean);
  const subMap: Record<string, { tier: string; status: string; expires_at: string | null }> = {};

  if (userIds.length > 0) {
    const { data: subscriptions, error: subError } = await supabase!
      .from('subscriptions')
      .select('user_id, tier, status, expires_at, created_at')
      .in('user_id', userIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('[Admin Users] subscriptions query failed:', subError.message);
    }

    (subscriptions || []).forEach((s) => {
      if (!subMap[s.user_id]) {
        subMap[s.user_id] = { tier: s.tier, status: s.status, expires_at: s.expires_at };
      }
    });
  }

  const enriched = rows.map((u) => ({
    ...u,
    subscription: subMap[u.id] || {
      tier: u.subscription_tier || 'free',
      status: 'active',
      expires_at: null,
    },
  }));

  return NextResponse.json({ users: enriched, total: count || 0, page, limit });
}

// PATCH /api/admin/users - update user role, account status, or subscription tier
export async function PATCH(request: NextRequest) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  let body: { userId?: string; role?: string; is_active?: boolean; subscription_tier?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { userId, role, is_active, subscription_tier } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  if (role !== undefined && !VALID_ROLES.has(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  if (subscription_tier !== undefined && !VALID_TIERS.has(subscription_tier)) {
    return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (role !== undefined) updates.role = role;
  if (is_active !== undefined) updates.is_active = is_active;
  if (subscription_tier !== undefined) updates.subscription_tier = subscription_tier;

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase!
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);

    if (updateError) {
      console.error('[Admin Users] profile update failed:', updateError.message);
      return NextResponse.json({ error: 'Unable to update user profile' }, { status: 500 });
    }
  }

  if (subscription_tier !== undefined) {
    const { data: existingSub, error: subSelectError } = await supabase!
      .from('subscriptions')
      .select('id, tier, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subSelectError) {
      console.error('[Admin Users] subscription lookup failed:', subSelectError.message);
      return NextResponse.json({ error: 'Unable to load subscription' }, { status: 500 });
    }

    const subResult = existingSub
      ? await supabase!.from('subscriptions').update({ tier: subscription_tier }).eq('id', existingSub.id).select('id, tier, status').single()
      : await supabase!.from('subscriptions').insert({ user_id: userId, tier: subscription_tier, status: 'active' }).select('id, tier, status').single();

    if (subResult.error) {
      console.error('[Admin Users] subscription update failed:', subResult.error.message);
      return NextResponse.json({ error: 'Unable to update subscription' }, { status: 500 });
    }

    const { error: historyError } = await supabase!.rpc('record_subscription_history', {
      p_user_id: userId,
      p_subscription_id: subResult.data.id,
      p_previous_tier: existingSub?.tier || null,
      p_new_tier: subscription_tier,
      p_previous_status: existingSub?.status || null,
      p_new_status: subResult.data.status || 'active',
      p_change_reason: 'admin_subscription_update',
    });

    if (historyError) {
      console.error('[Admin Users] subscription history write failed:', historyError.message);
    }
  }

  return NextResponse.json({ success: true });
}

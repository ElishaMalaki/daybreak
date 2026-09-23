import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

// GET /api/admin/users — list all users with subscription info
export async function GET(request: NextRequest) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
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
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Get subscription details for each user
  const userIds = (users || []).map((u) => u.id);
  const { data: subscriptions } = await supabase!
    .from('subscriptions')
    .select('user_id, tier, status, expires_at')
    .in('user_id', userIds)
    .eq('status', 'active');

  const subMap: Record<string, { tier: string; status: string; expires_at: string | null }> = {};
  (subscriptions || []).forEach((s) => {
    subMap[s.user_id] = { tier: s.tier, status: s.status, expires_at: s.expires_at };
  });

  const enriched = (users || []).map((u) => ({
    ...u,
    subscription: subMap[u.id] || { tier: 'free', status: 'active', expires_at: null },
  }));

  return NextResponse.json({ users: enriched, total: count || 0, page, limit });
}

// PATCH /api/admin/users — update user role or status
export async function PATCH(request: NextRequest) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { userId, role, is_active, subscription_tier } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (role !== undefined) updates.role = role;
  if (is_active !== undefined) updates.is_active = is_active;
  if (subscription_tier !== undefined) updates.subscription_tier = subscription_tier;

  const { error: updateError } = await supabase!
    .from('user_profiles')
    .update(updates)
    .eq('id', userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // If subscription_tier changed, upsert subscription record
  if (subscription_tier !== undefined) {
    const { data: existingSub } = await supabase!
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existingSub) {
      await supabase!
        .from('subscriptions')
        .update({ tier: subscription_tier })
        .eq('id', existingSub.id);
    } else {
      await supabase!
        .from('subscriptions')
        .insert({ user_id: userId, tier: subscription_tier, status: 'active' });
    }
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

// GET /api/admin/subscriptions — list all subscriptions with user info
export async function GET(request: NextRequest) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const tier = searchParams.get('tier') || '';
  const offset = (page - 1) * limit;

  let query = supabase!
    .from('subscriptions')
    .select('id, user_id, tier, status, started_at, expires_at, billing_provider, created_at, user_profiles(email, full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (tier) {
    query = query.eq('tier', tier);
  }

  const { data, count, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ subscriptions: data || [], total: count || 0, page, limit });
}

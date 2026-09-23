import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

// GET /api/admin/stats — platform overview stats
export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Total users
  const { count: totalUsers } = await supabase!
    .from('user_profiles')
    .select('id', { count: 'exact', head: true });

  // Active users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { count: activeUsers } = await supabase!
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .gte('last_seen_at', thirtyDaysAgo.toISOString());

  // Subscription breakdown
  const { data: subData } = await supabase!
    .from('subscriptions')
    .select('tier')
    .eq('status', 'active');

  const tierCounts: Record<string, number> = { free: 0, starter: 0, professional: 0, business: 0, enterprise: 0 };
  (subData || []).forEach((s) => {
    tierCounts[s.tier] = (tierCounts[s.tier] || 0) + 1;
  });

  // Total AI credits used this month
  const { data: creditsData } = await supabase!
    .from('monthly_ai_credits')
    .select('credits_used')
    .gte('billing_month', monthStart);

  const totalCreditsThisMonth = (creditsData || []).reduce((s, r) => s + (r.credits_used || 0), 0);

  // Total farms
  const { count: totalFarms } = await supabase!
    .from('farms')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  // Total reports this month
  const { count: reportsThisMonth } = await supabase!
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', monthStart);

  // New users this month
  const { count: newUsersThisMonth } = await supabase!
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', monthStart);

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    newUsersThisMonth: newUsersThisMonth || 0,
    totalFarms: totalFarms || 0,
    reportsThisMonth: reportsThisMonth || 0,
    totalCreditsThisMonth,
    subscriptionBreakdown: tierCounts,
  });
}

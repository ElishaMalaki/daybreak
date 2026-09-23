import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

// GET /api/admin/ai-usage — platform-wide AI usage stats
export async function GET(request: NextRequest) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  // Total usage across all users
  const { data: usageData } = await supabase!
    .from('usage_records')
    .select('user_id, request_count, token_count, date')
    .gte('date', sinceStr)
    .order('date', { ascending: false });

  // Per-provider usage
  const { data: providerData } = await supabase!
    .from('ai_provider_usage')
    .select('provider, model_used, request_count, total_tokens, error_count, date')
    .gte('date', sinceStr)
    .order('date', { ascending: false });

  // Monthly credits usage
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().split('T')[0];

  const { data: creditsData } = await supabase!
    .from('monthly_ai_credits')
    .select('user_id, credits_used, requests_used, billing_month')
    .gte('billing_month', monthStartStr);

  // Aggregate totals
  const totalRequests = (usageData || []).reduce((s, r) => s + (r.request_count || 0), 0);
  const totalTokens = (usageData || []).reduce((s, r) => s + (r.token_count || 0), 0);
  const totalCreditsThisMonth = (creditsData || []).reduce((s, r) => s + (r.credits_used || 0), 0);

  // Provider breakdown
  const providerMap: Record<string, { requests: number; tokens: number; errors: number }> = {};
  (providerData || []).forEach((p) => {
    if (!providerMap[p.provider]) providerMap[p.provider] = { requests: 0, tokens: 0, errors: 0 };
    providerMap[p.provider].requests += p.request_count || 0;
    providerMap[p.provider].tokens += p.total_tokens || 0;
    providerMap[p.provider].errors += p.error_count || 0;
  });

  // Top users by credits this month
  const userCreditMap: Record<string, number> = {};
  (creditsData || []).forEach((c) => {
    userCreditMap[c.user_id] = (userCreditMap[c.user_id] || 0) + (c.credits_used || 0);
  });
  const topUserIds = Object.entries(userCreditMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  let topUsers: { id: string; email: string; full_name: string; credits: number }[] = [];
  if (topUserIds.length > 0) {
    const { data: profiles } = await supabase!
      .from('user_profiles')
      .select('id, email, full_name')
      .in('id', topUserIds);
    topUsers = (profiles || []).map((p) => ({
      ...p,
      credits: userCreditMap[p.id] || 0,
    })).sort((a, b) => b.credits - a.credits);
  }

  // Daily usage for chart (last 30 days)
  const dailyMap: Record<string, number> = {};
  (usageData || []).forEach((r) => {
    dailyMap[r.date] = (dailyMap[r.date] || 0) + (r.request_count || 0);
  });

  return NextResponse.json({
    summary: {
      totalRequests,
      totalTokens,
      totalCreditsThisMonth,
      activeUsers: new Set((usageData || []).map((r) => r.user_id)).size,
    },
    providerBreakdown: providerMap,
    topUsers,
    dailyUsage: Object.entries(dailyMap)
      .map(([date, requests]) => ({ date, requests }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  });
}

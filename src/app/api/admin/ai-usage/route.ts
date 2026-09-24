import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

interface UsageRow {
  user_id: string;
  request_count: number | null;
  token_count: number | null;
  date: string;
}

interface ProviderUsageRow {
  user_id?: string;
  provider: string;
  model_used: string | null;
  request_count: number | null;
  total_tokens: number | null;
  error_count: number | null;
  date: string;
}

interface CreditRow {
  user_id: string;
  credits_used: number | null;
  requests_used: number | null;
  billing_month: string;
}

function parseDays(value: string | null) {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed)) return 30;
  return Math.min(Math.max(parsed, 1), 365);
}

function toDateOnly(date: Date) {
  return date.toISOString().split('T')[0];
}

// GET /api/admin/ai-usage - platform-wide AI usage stats
export async function GET(request: NextRequest) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const days = parseDays(searchParams.get('days'));

  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  const sinceStr = toDateOnly(since);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartStr = toDateOnly(monthStart);

  const [usageResult, providerResult, creditsResult] = await Promise.all([
    supabase!
      .from('usage_records')
      .select('user_id, request_count, token_count, date')
      .gte('date', sinceStr)
      .order('date', { ascending: false }),
    supabase!
      .from('ai_provider_usage')
      .select('user_id, provider, model_used, request_count, total_tokens, error_count, date')
      .gte('date', sinceStr)
      .order('date', { ascending: false }),
    supabase!
      .from('monthly_ai_credits')
      .select('user_id, credits_used, requests_used, billing_month')
      .gte('billing_month', monthStartStr),
  ]);

  if (usageResult.error) {
    console.error('[Admin AI Usage] usage_records query failed:', usageResult.error.message);
  }
  if (providerResult.error) {
    console.error('[Admin AI Usage] ai_provider_usage query failed:', providerResult.error.message);
  }
  if (creditsResult.error) {
    console.error('[Admin AI Usage] monthly_ai_credits query failed:', creditsResult.error.message);
  }

  const usageData = (usageResult.data || []) as UsageRow[];
  const providerData = (providerResult.data || []) as ProviderUsageRow[];
  const creditsData = (creditsResult.data || []) as CreditRow[];

  const totalRequests = usageData.reduce((sum, row) => sum + (row.request_count || 0), 0);
  const totalTokens = usageData.reduce((sum, row) => sum + (row.token_count || 0), 0);
  const totalCreditsThisMonth = creditsData.reduce((sum, row) => sum + (row.credits_used || 0), 0);

  const providerMap: Record<string, { requests: number; tokens: number; errors: number }> = {};
  providerData.forEach((row) => {
    const provider = row.provider || 'other';
    if (!providerMap[provider]) providerMap[provider] = { requests: 0, tokens: 0, errors: 0 };
    providerMap[provider].requests += row.request_count || 0;
    providerMap[provider].tokens += row.total_tokens || 0;
    providerMap[provider].errors += row.error_count || 0;
  });

  if (Object.keys(providerMap).length === 0 && totalRequests > 0) {
    providerMap.earthai = { requests: totalRequests, tokens: totalTokens, errors: 0 };
  }

  const userCreditMap: Record<string, number> = {};
  creditsData.forEach((row) => {
    userCreditMap[row.user_id] = (userCreditMap[row.user_id] || 0) + (row.credits_used || 0);
  });

  if (Object.keys(userCreditMap).length === 0) {
    usageData.forEach((row) => {
      userCreditMap[row.user_id] = (userCreditMap[row.user_id] || 0) + (row.request_count || 0);
    });
  }

  const topUserIds = Object.entries(userCreditMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  let topUsers: { id: string; email: string; full_name: string; credits: number }[] = [];
  if (topUserIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase!
      .from('user_profiles')
      .select('id, email, full_name')
      .in('id', topUserIds);

    if (profilesError) {
      console.error('[Admin AI Usage] top user profile query failed:', profilesError.message);
    }

    topUsers = (profiles || [])
      .map((profile) => ({
        ...profile,
        credits: userCreditMap[profile.id] || 0,
      }))
      .sort((a, b) => b.credits - a.credits);
  }

  const dailyMap: Record<string, number> = {};
  for (let index = days - 1; index >= 0; index--) {
    const day = new Date();
    day.setDate(day.getDate() - index);
    dailyMap[toDateOnly(day)] = 0;
  }

  usageData.forEach((row) => {
    dailyMap[row.date] = (dailyMap[row.date] || 0) + (row.request_count || 0);
  });

  const activeUserIds = new Set<string>();
  usageData.forEach((row) => activeUserIds.add(row.user_id));
  providerData.forEach((row) => {
    if (row.user_id) activeUserIds.add(row.user_id);
  });

  return NextResponse.json({
    summary: {
      totalRequests,
      totalTokens,
      totalCreditsThisMonth,
      activeUsers: activeUserIds.size,
    },
    providerBreakdown: providerMap,
    topUsers,
    dailyUsage: Object.entries(dailyMap)
      .map(([date, requests]) => ({ date, requests }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    warnings: {
      usageRecords: usageResult.error ? 'usage_records unavailable' : null,
      providerUsage: providerResult.error ? 'ai_provider_usage unavailable' : null,
      monthlyCredits: creditsResult.error ? 'monthly_ai_credits unavailable' : null,
    },
  });
}

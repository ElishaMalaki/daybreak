import { createClient } from '@/lib/supabase/server';
import { getAIRouter } from '@/lib/ai/router';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const router = getAIRouter();
    const providerStatus = router.getProviderStatus();
    const configuredProviders = router.getConfiguredProviders();

    // Get user's daily usage
    const { data: usageData } = await supabase.rpc('get_user_daily_usage', {
      p_user_id: user.id,
    });

    const usage = usageData?.[0] || { request_count: 0, token_count: 0 };

    return NextResponse.json({
      providers: Object.entries(providerStatus).map(([name, info]) => ({
        name,
        displayName: info.displayName,
        configured: info.configured,
        status: info.configured ? 'ready' : 'not_configured',
      })),
      configuredCount: configuredProviders.length,
      dailyUsage: {
        requestCount: usage.request_count,
        tokenCount: usage.token_count,
        limit: 50,
        remaining: Math.max(0, 50 - usage.request_count),
      },
    });
  } catch (error) {
    console.error('[AI Status] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

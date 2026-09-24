import { createClient } from '@/lib/supabase/server';
import { getAIRouter, PUBLIC_AI_MODEL_NAME } from '@/lib/ai/router';
import { NextResponse } from 'next/server';
import { getUserMonthlyUsage, getUserSubscription } from '@/lib/subscription/enforcer';
import { getPlanLimits } from '@/lib/subscription/config';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const router = getAIRouter();
    const configuredProviders = router.getConfiguredProviders();
    const [subscription, usage] = await Promise.all([
      getUserSubscription(user.id),
      getUserMonthlyUsage(user.id),
    ]);
    const limits = getPlanLimits(subscription.tier);

    return NextResponse.json({
      model: {
        name: PUBLIC_AI_MODEL_NAME,
        status: configuredProviders.length > 0 ? 'ready' : 'not_configured',
      },
      configuredCount: configuredProviders.length,
      usage: {
        billingPeriodStart: subscription.billingPeriodStart,
        billingPeriodEnd: subscription.billingPeriodEnd,
        aiCreditsUsed: usage.aiCreditsUsed,
        aiCreditsLimit: limits.aiCredits,
        aiCreditsRemaining: limits.aiCredits === -1 ? -1 : Math.max(0, limits.aiCredits - usage.aiCreditsUsed),
        aiRequestsUsed: usage.aiRequestsUsed,
        aiRequestsLimit: limits.aiRequests,
        aiRequestsRemaining: limits.aiRequests === -1 ? -1 : Math.max(0, limits.aiRequests - usage.aiRequestsUsed),
      },
    });
  } catch (error) {
    console.error('[AI Status] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

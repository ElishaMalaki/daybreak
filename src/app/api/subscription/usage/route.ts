import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserSubscription, getUserMonthlyUsage } from '@/lib/subscription/enforcer';
import { getPlanLimits } from '@/lib/subscription/config';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase?.auth?.getUser();

    if (authError || !user) {
      return NextResponse?.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [subscription, usage] = await Promise.all([
      getUserSubscription(user?.id),
      getUserMonthlyUsage(user?.id),
    ]);

    const limits = getPlanLimits(subscription?.tier);

    return NextResponse?.json({
      subscription,
      usage,
      limits,
    });
  } catch (error) {
    console.error('[Usage API] Error:', error);
    return NextResponse?.json({ error: 'Internal server error' }, { status: 500 });
  }
}

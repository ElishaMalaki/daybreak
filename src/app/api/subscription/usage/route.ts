import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getUserSubscription, getUserMonthlyUsage } from '@/lib/subscription/enforcer';
import { getPlanLimits } from '@/lib/subscription/config';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [subscription, usage, invoicesResult, historyResult] = await Promise.all([
      getUserSubscription(user.id),
      getUserMonthlyUsage(user.id),
      supabase
        .from('billing_invoices')
        .select('id, invoice_number, status, currency, amount_due_cents, amount_paid_cents, hosted_invoice_url, invoice_pdf_url, period_start, period_end, due_at, paid_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12),
      supabase
        .from('subscription_history')
        .select('id, previous_tier, new_tier, previous_status, new_status, change_reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const limits = getPlanLimits(subscription.tier);

    if (invoicesResult.error) {
      console.error('[Usage API] billing invoice query failed:', invoicesResult.error.message);
    }
    if (historyResult.error) {
      console.error('[Usage API] subscription history query failed:', historyResult.error.message);
    }

    return NextResponse.json({
      subscription,
      usage,
      limits,
      invoices: invoicesResult.data || [],
      history: historyResult.data || [],
      warnings: {
        invoices: invoicesResult.error ? 'billing_invoices unavailable' : null,
        history: historyResult.error ? 'subscription_history unavailable' : null,
      },
    });
  } catch (error) {
    console.error('[Usage API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

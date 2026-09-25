import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkReportAllowed, recordAICreditsUsed, refundAIRequestUsage, reserveAIRequestUsage } from '@/lib/subscription/enforcer';
import { getAIRouter } from '@/lib/ai/router';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportCheck = await checkReportAllowed(user.id);
    if (!reportCheck.allowed) {
      return NextResponse.json(
        { error: reportCheck.reason, limitType: reportCheck.limitType, upgradeRequired: true },
        { status: 403 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { title, report_type, farm_id, prompt } = body as any;

    if (!title || !report_type) {
      return NextResponse.json({ error: 'Title and report type are required' }, { status: 400 });
    }

    const creditCheck = await reserveAIRequestUsage(user.id, 'report');
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: creditCheck.reason, limitType: creditCheck.limitType, upgradeRequired: true, creditsRemaining: creditCheck.creditsRemaining },
        { status: 429 }
      );
    }

    const creditsUsed = creditCheck.creditsRequired ?? 10;

    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        farm_id: farm_id || null,
        title,
        report_type,
        status: 'generating',
      })
      .select()
      .single();

    if (insertError || !report) {
      await refundAIRequestUsage(user.id, creditsUsed);
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
    }

    const router = getAIRouter();
    const aiResponse = await router.route({
      messages: [
        {
          role: 'user',
          content: prompt || `Generate a comprehensive ${report_type} agricultural intelligence report titled: ${title}`,
        },
      ],
      requestType: 'general',
      userId: user.id,
    });

    if (aiResponse.success) {
      recordAICreditsUsed(
        user.id,
        creditsUsed,
        'report',
        aiResponse.provider,
        aiResponse.model,
        aiResponse.inputTokens || 0,
        aiResponse.outputTokens || 0,
        aiResponse.processingTimeMs
      ).catch(() => {});

      await supabase
        .from('reports')
        .update({
          status: 'completed',
          content: aiResponse.content,
          ai_provider: aiResponse.provider as any,
          model_used: aiResponse.model,
          tokens_used: aiResponse.totalTokens,
          completed_at: new Date().toISOString(),
        })
        .eq('id', report.id);

      return NextResponse.json({ report: { ...report, status: 'completed', content: aiResponse.content } });
    }

    await refundAIRequestUsage(user.id, creditsUsed);
    await supabase.from('reports').update({ status: 'failed' }).eq('id', report.id);
    return NextResponse.json({ error: aiResponse.error || 'Report generation failed' }, { status: 500 });
  } catch (error) {
    console.error('[Reports API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

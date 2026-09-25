import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkResearchAllowed, recordAICreditsUsed, refundAIRequestUsage, reserveAIRequestUsage } from '@/lib/subscription/enforcer';
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

    const researchCheck = await checkResearchAllowed(user.id);
    if (!researchCheck.allowed) {
      return NextResponse.json(
        { error: researchCheck.reason, limitType: researchCheck.limitType, upgradeRequired: true },
        { status: 403 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { query } = body as any;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Research query is required' }, { status: 400 });
    }

    const creditCheck = await reserveAIRequestUsage(user.id, 'research');
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: creditCheck.reason, limitType: creditCheck.limitType, upgradeRequired: true, creditsRemaining: creditCheck.creditsRemaining },
        { status: 429 }
      );
    }

    const creditsUsed = creditCheck.creditsRequired ?? 5;

    const { data: researchRecord, error: insertError } = await supabase
      .from('research_requests')
      .insert({
        user_id: user.id,
        query: query.trim(),
        status: 'pending',
      })
      .select()
      .single();

    if (insertError || !researchRecord) {
      await refundAIRequestUsage(user.id, creditsUsed);
      return NextResponse.json({ error: 'Failed to create research request' }, { status: 500 });
    }

    const router = getAIRouter();
    const aiResponse = await router.route({
      messages: [
        {
          role: 'user',
          content: `Agricultural Research Query: ${query.trim()}\n\nProvide comprehensive, evidence-based agricultural research findings on this topic.`,
        },
      ],
      requestType: 'research',
      userId: user.id,
    });

    if (aiResponse.success) {
      recordAICreditsUsed(
        user.id,
        creditsUsed,
        'research',
        aiResponse.provider,
        aiResponse.model,
        aiResponse.inputTokens || 0,
        aiResponse.outputTokens || 0,
        aiResponse.processingTimeMs
      ).catch(() => {});

      await supabase
        .from('research_requests')
        .update({
          status: 'completed',
          result: aiResponse.content,
          ai_provider: aiResponse.provider as any,
          model_used: aiResponse.model,
          tokens_used: aiResponse.totalTokens,
          completed_at: new Date().toISOString(),
        })
        .eq('id', researchRecord.id);

      return NextResponse.json({
        id: researchRecord.id,
        result: aiResponse.content,
        creditsUsed,
      });
    }

    await refundAIRequestUsage(user.id, creditsUsed);
    await supabase
      .from('research_requests')
      .update({ status: 'failed' })
      .eq('id', researchRecord.id);

    return NextResponse.json({ error: aiResponse.error || 'Research failed' }, { status: 500 });
  } catch (error) {
    console.error('[Research API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

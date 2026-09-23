import { createClient } from '@/lib/supabase/server';
import { getAIRouter } from '@/lib/ai/router';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { AIRequestType } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

const DAILY_REQUEST_LIMIT = 50;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: usageData, error: usageError } = await supabase.rpc('get_user_daily_usage', {
      p_user_id: user.id,
    });

    if (usageError) {
      return NextResponse.json({ error: 'Unable to verify usage limits' }, { status: 503 });
    }

    const usage = usageData?.[0] || { request_count: 0, token_count: 0 };
    const requestCount = usage.request_count || 0;

    if (requestCount >= DAILY_REQUEST_LIMIT) {
      return NextResponse.json(
        {
          content: 'You have reached your daily request limit for Intelligence E. Your limit will reset tomorrow.',
          provider: 'system',
          model: 'none',
          tokens: 0,
          processingTimeMs: 0,
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          rateLimitRemaining: 0,
        },
        { status: 429 }
      );
    }

    let body: {
      messages?: Array<{ role: string; content: string }>;
      requestType?: string;
      conversationId?: string;
      contextData?: Record<string, unknown>;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { messages, requestType = 'general', conversationId, contextData } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return NextResponse.json({ error: 'Invalid message role' }, { status: 400 });
      }
    }

    if (conversationId) {
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (conversationError || !conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    }

    const router = getAIRouter();
    const aiResponse = await router.route({
      messages: messages as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
      requestType: requestType as AIRequestType,
      userId: user.id,
      contextData,
    });

    if (aiResponse.success && aiResponse.totalTokens) {
      supabase.rpc('increment_usage', {
        p_user_id: user.id,
        p_tokens: aiResponse.totalTokens || 0,
        p_input_tokens: aiResponse.inputTokens || 0,
        p_output_tokens: aiResponse.outputTokens || 0,
      }).then(() => {}).catch(() => {});
    }

    if (conversationId && aiResponse.success) {
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop();

      if (lastUserMessage) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: 'user',
          content: lastUserMessage.content,
        });
      }

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'assistant',
        content: aiResponse.content,
        ai_provider: aiResponse.provider as any,
        model_used: aiResponse.model,
        tokens_used: aiResponse.totalTokens,
        processing_time_ms: aiResponse.processingTimeMs,
      });

      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          message_count: messages.length + 1,
        })
        .eq('id', conversationId)
        .eq('user_id', user.id);
    }

    return NextResponse.json({
      content: aiResponse.content,
      provider: aiResponse.provider,
      model: aiResponse.model,
      tokens: aiResponse.totalTokens,
      processingTimeMs: aiResponse.processingTimeMs,
      success: aiResponse.success,
      error: aiResponse.error,
      rateLimitRemaining: Math.max(0, DAILY_REQUEST_LIMIT - requestCount - 1),
    });
  } catch (error) {
    console.error('[AI API] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

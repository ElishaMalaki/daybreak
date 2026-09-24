import { createClient } from '@/lib/supabase/server';
import { getAIRouter } from '@/lib/ai/router';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { AIImageAttachment, AIRequestType } from '@/lib/ai/types';
import {
  checkAIRequestAllowed,
  recordAICreditsUsed,
  validateInputLength,
} from '@/lib/subscription/enforcer';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_IMAGE_ATTACHMENTS = 2;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function base64ByteLength(value: string): number {
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  return Math.floor((value.length * 3) / 4) - padding;
}

function validateAttachments(value: unknown): { attachments: AIImageAttachment[]; error?: string } {
  if (value == null) return { attachments: [] };
  if (!Array.isArray(value)) return { attachments: [], error: 'Attachments must be an array' };
  if (value.length > MAX_IMAGE_ATTACHMENTS) {
    return { attachments: [], error: `Upload up to ${MAX_IMAGE_ATTACHMENTS} images at a time.` };
  }

  const attachments: AIImageAttachment[] = [];

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      return { attachments: [], error: 'Invalid attachment format' };
    }

    const attachment = item as Record<string, unknown>;
    const type = attachment.type;
    const mimeType = attachment.mimeType;
    const data = attachment.data;
    const name = attachment.name;

    if (type !== 'image') {
      return { attachments: [], error: 'Only image attachments are supported' };
    }
    if (typeof mimeType !== 'string' || !ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
      return { attachments: [], error: 'Only JPEG, PNG, and WebP images are supported' };
    }
    if (typeof data !== 'string' || data.length === 0) {
      return { attachments: [], error: 'Image data is required' };
    }
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
      return { attachments: [], error: 'Invalid image data' };
    }
    if (base64ByteLength(data) > MAX_IMAGE_BYTES) {
      return { attachments: [], error: 'Each image must be 4 MB or smaller' };
    }

    attachments.push({
      type: 'image',
      mimeType: mimeType as AIImageAttachment['mimeType'],
      data,
      name: typeof name === 'string' ? name.slice(0, 120) : undefined,
    });
  }

  return { attachments };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: {
      messages?: Array<{ role: string; content: string }>;
      requestType?: string;
      conversationId?: string;
      contextData?: Record<string, unknown>;
      attachments?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { messages, requestType = 'general', conversationId, contextData } = body;
    const attachmentValidation = validateAttachments(body.attachments);

    if (attachmentValidation.error) {
      return NextResponse.json({ error: attachmentValidation.error, success: false }, { status: 400 });
    }

    const attachments = attachmentValidation.attachments;

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

    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    if (lastUserMessage) {
      const inputCheck = validateInputLength(lastUserMessage.content);
      if (!inputCheck.allowed) {
        return NextResponse.json(
          { error: inputCheck.reason, success: false, limitType: inputCheck.limitType },
          { status: 429 }
        );
      }
    }

    const effectiveRequestType = attachments.length > 0 ? 'farm_data_analysis' : requestType;
    const enforcementResult = await checkAIRequestAllowed(user.id, effectiveRequestType);

    if (!enforcementResult.allowed) {
      return NextResponse.json(
        {
          error: enforcementResult.reason,
          success: false,
          limitType: enforcementResult.limitType,
          creditsRemaining: enforcementResult.creditsRemaining ?? 0,
          upgradeRequired: true,
        },
        { status: 429 }
      );
    }

    const router = getAIRouter();
    const aiResponse = await router.route({
      messages: messages as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
      requestType: effectiveRequestType as AIRequestType,
      userId: user.id,
      contextData,
      attachments,
    });
    const publicAIResponse = router.toPublicResponse(aiResponse);

    if (aiResponse.success) {
      const creditsUsed = enforcementResult.creditsRequired ?? 1;

      void (async () => {
        try {
          await recordAICreditsUsed(
            user.id,
            creditsUsed,
            effectiveRequestType,
            aiResponse.provider,
            aiResponse.model,
            aiResponse.inputTokens || 0,
            aiResponse.outputTokens || 0,
            aiResponse.processingTimeMs
          );
        } catch {
          // Usage logging must never block the user response.
        }
      })();

      void (async () => {
        try {
          await supabase.rpc('increment_usage', {
            p_user_id: user.id,
            p_tokens: aiResponse.totalTokens || 0,
            p_input_tokens: aiResponse.inputTokens || 0,
            p_output_tokens: aiResponse.outputTokens || 0,
          });
        } catch {
          // Legacy usage logging must never block the user response.
        }
      })();
    }

    if (conversationId && aiResponse.success) {
      const userMsg = messages.filter((m) => m.role === 'user').pop();

      if (userMsg) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: 'user',
          content: attachments.length > 0 ? `${userMsg.content}\n\n[Image attached for Earth AI analysis]` : userMsg.content,
        });
      }

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'assistant',
        content: publicAIResponse.content,
        ai_provider: aiResponse.provider as any,
        model_used: publicAIResponse.model,
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
      content: publicAIResponse.content,
      provider: publicAIResponse.provider,
      model: publicAIResponse.model,
      tokens: aiResponse.totalTokens,
      processingTimeMs: aiResponse.processingTimeMs,
      success: aiResponse.success,
      error: aiResponse.error,
      creditsUsed: enforcementResult.creditsRequired,
      creditsRemaining: enforcementResult.creditsRemaining,
    });
  } catch (error) {
    console.error('[AI API] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

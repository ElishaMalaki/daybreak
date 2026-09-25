// ============================================================
// Intelligence E Agriculture — External API Endpoint
// POST /api/v1/agriculture/intelligence
//
// External apps authenticate with an API key (Bearer token).
// All subscription limits are enforced server-side.
// This is the public integration contract for beta partners.
// ============================================================

import { createClient } from '@/lib/supabase/server';
import { getAIRouter } from '@/lib/ai/router';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { AIRequestType } from '@/lib/ai/types';
import {
  recordAICreditsUsed,
  refundAIRequestUsage,
  reserveAIRequestUsage,
} from '@/lib/subscription/enforcer';
import { createHash } from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 30;

const ALLOWED_REQUEST_TYPES: AIRequestType[] = [
  'general',
  'farm_data_analysis',
  'decision_support',
  'risk_assessment',
  'research',
  'market_analysis',
];

const MAX_INPUT_LENGTH = 6000;

interface ExternalAPIRequest {
  query: string;
  request_type?: string;
  context?: {
    farm_name?: string;
    location?: string;
    crop_type?: string;
    season?: string;
    [key: string]: unknown;
  };
  conversation_history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  metadata?: {
    source_app?: string;
    reference_id?: string;
    [key: string]: unknown;
  };
}

function extractApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const apiKeyHeader = request.headers.get('X-API-Key');
  if (apiKeyHeader) return apiKeyHeader.trim();
  return null;
}

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const rawKey = extractApiKey(request);
  if (!rawKey) {
    return NextResponse.json(
      {
        error: 'Missing API key. Provide your key as: Authorization: Bearer <your-api-key>',
        code: 'MISSING_API_KEY',
        docs: 'https://daybreak1966.builtwithrocket.new/app/agriculture/api-keys',
      },
      { status: 401 }
    );
  }

  const supabase = await createClient();
  const keyHash = hashApiKey(rawKey);

  const { data: apiKey, error: keyError } = await supabase
    .from('api_keys')
    .select('id, user_id, name, scopes, is_active, expires_at')
    .eq('key_hash', keyHash)
    .single();

  if (keyError || !apiKey) {
    return NextResponse.json(
      {
        error: 'Invalid API key.',
        code: 'INVALID_API_KEY',
        docs: 'https://daybreak1966.builtwithrocket.new/app/agriculture/api-keys',
      },
      { status: 401 }
    );
  }

  if (!apiKey.is_active) {
    return NextResponse.json({ error: 'This API key has been revoked.', code: 'KEY_REVOKED' }, { status: 401 });
  }

  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This API key has expired.', code: 'KEY_EXPIRED' }, { status: 401 });
  }

  const userId = apiKey.user_id;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const tier = subscription?.tier || 'free';
  const apiAccessTiers = ['business', 'enterprise'];

  if (!apiAccessTiers.includes(tier)) {
    return NextResponse.json(
      {
        error: 'API access requires a Business or Enterprise subscription.',
        code: 'PLAN_UPGRADE_REQUIRED',
        current_plan: tier,
        upgrade_url: 'https://daybreak1966.builtwithrocket.new/app/agriculture/subscription',
      },
      { status: 403 }
    );
  }

  let body: ExternalAPIRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.', code: 'INVALID_REQUEST' }, { status: 400 });
  }

  const { query, request_type = 'general', context, conversation_history, metadata } = body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return NextResponse.json(
      { error: 'The "query" field is required and must be a non-empty string.', code: 'MISSING_QUERY' },
      { status: 400 }
    );
  }

  if (query.length > MAX_INPUT_LENGTH) {
    return NextResponse.json(
      {
        error: `Query too long. Maximum ${MAX_INPUT_LENGTH} characters allowed.`,
        code: 'INPUT_TOO_LONG',
        max_length: MAX_INPUT_LENGTH,
        provided_length: query.length,
      },
      { status: 400 }
    );
  }

  const normalizedRequestType = ALLOWED_REQUEST_TYPES.includes(request_type as AIRequestType)
    ? (request_type as AIRequestType)
    : 'general';

  const enforcementResult = await reserveAIRequestUsage(userId, normalizedRequestType);

  if (!enforcementResult.allowed) {
    return NextResponse.json(
      {
        error: enforcementResult.reason,
        code: 'CREDIT_LIMIT_EXCEEDED',
        credits_remaining: enforcementResult.creditsRemaining ?? 0,
        upgrade_url: 'https://daybreak1966.builtwithrocket.new/app/agriculture/subscription',
      },
      { status: 429 }
    );
  }

  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

  if (context && Object.keys(context).length > 0) {
    const contextLines = Object.entries(context)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`);
    if (contextLines.length > 0) {
      messages.push({
        role: 'system',
        content: `Agricultural context provided by the requesting application:\n${contextLines.join('\n')}`,
      });
    }
  }

  if (conversation_history && Array.isArray(conversation_history)) {
    const history = conversation_history.slice(-10);
    for (const turn of history) {
      if (turn.role && turn.content && ['user', 'assistant'].includes(turn.role)) {
        messages.push({ role: turn.role, content: String(turn.content).slice(0, 2000) });
      }
    }
  }

  messages.push({ role: 'user', content: query.trim() });

  const router = getAIRouter();
  const aiResponse = await router.route({
    messages,
    requestType: normalizedRequestType,
    userId,
  });

  const processingTimeMs = Date.now() - startTime;
  const creditsUsed = enforcementResult.creditsRequired ?? 1;

  if (!aiResponse.success) {
    await refundAIRequestUsage(userId, creditsUsed);
    return NextResponse.json(
      {
        error: 'Intelligence E is temporarily unavailable. Please try again.',
        code: 'AI_UNAVAILABLE',
      },
      { status: 503 }
    );
  }

  void (async () => {
    try {
      await recordAICreditsUsed(
        userId,
        creditsUsed,
        normalizedRequestType,
        aiResponse.provider,
        aiResponse.model,
        aiResponse.inputTokens || 0,
        aiResponse.outputTokens || 0,
        processingTimeMs
      );
    } catch {
      // Provider analytics must never block the API response.
    }
  })();

  void (async () => {
    try {
      await supabase.rpc('record_api_key_usage', {
        p_key_hash: keyHash,
        p_endpoint: '/api/v1/agriculture/intelligence',
        p_request_type: normalizedRequestType,
        p_credits_used: creditsUsed,
        p_response_status: 200,
        p_processing_time_ms: processingTimeMs,
        p_ip_address: request.headers.get('x-forwarded-for') || null,
        p_user_agent: request.headers.get('user-agent') || null,
      });
    } catch {
      // API key usage analytics must never block the API response.
    }
  })();

  return NextResponse.json({
    success: true,
    intelligence: {
      response: aiResponse.content,
      request_type: normalizedRequestType,
    },
    usage: {
      credits_used: creditsUsed,
      credits_remaining: enforcementResult.creditsRemaining ?? 0,
    },
    meta: {
      processing_time_ms: processingTimeMs,
      api_version: 'v1',
      reference_id: metadata?.reference_id || null,
    },
  });
}

export async function GET() {
  return NextResponse.json({
    service: 'Intelligence E Agriculture API',
    version: 'v1',
    status: 'operational',
    description: 'External integration endpoint for Intelligence E Agriculture intelligence.',
    endpoints: {
      'POST /api/v1/agriculture/intelligence': 'Submit an agricultural intelligence query',
    },
    authentication: 'Bearer token (API key from your Intelligence E account)',
    plans_with_access: ['business', 'enterprise'],
    docs: 'https://daybreak1966.builtwithrocket.new/app/agriculture/api-keys',
  });
}

import { requireAdmin, sanitizeAdminText } from '@/lib/admin/auth';
import { createHash, randomBytes } from 'crypto';
import { NextResponse } from 'next/server';

function hashKey(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function createIntegrationKey() {
  const secret = randomBytes(32).toString('base64url');
  return `eai_live_${secret}`;
}

function normalizeTextArray(value: unknown, maxItems = 20) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitizeAdminText(item, 160))
    .filter(Boolean)
    .slice(0, maxItems);
}

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: queryError } = await supabase
    .from('integration_api_keys')
    .select('id, name, key_prefix, scopes, environment, status, rate_limit_per_minute, monthly_request_limit, allowed_origins, last_used_at, expires_at, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (queryError) return NextResponse.json({ error: 'Unable to load API keys' }, { status: 500 });
  return NextResponse.json({ keys: data || [] });
}

export async function POST(request: Request) {
  const { error, supabase, user } = await requireAdmin();
  if (error) return error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const name = sanitizeAdminText(body.name, 120);
  const environment = sanitizeAdminText(body.environment, 30) || 'production';
  const scopes = normalizeTextArray(body.scopes).length ? normalizeTextArray(body.scopes) : ['agriculture:ai'];
  const allowedOrigins = normalizeTextArray(body.allowedOrigins);
  const rateLimit = Number(body.rateLimitPerMinute || 60);
  const monthlyLimit = body.monthlyRequestLimit ? Number(body.monthlyRequestLimit) : null;
  const expiresAt = sanitizeAdminText(body.expiresAt, 80) || null;

  if (!name) return NextResponse.json({ error: 'API key name is required' }, { status: 400 });
  if (!['development', 'staging', 'production'].includes(environment)) {
    return NextResponse.json({ error: 'Invalid environment' }, { status: 400 });
  }
  if (!Number.isInteger(rateLimit) || rateLimit < 1 || rateLimit > 10000) {
    return NextResponse.json({ error: 'Rate limit must be between 1 and 10000' }, { status: 400 });
  }
  if (monthlyLimit !== null && (!Number.isInteger(monthlyLimit) || monthlyLimit < 1)) {
    return NextResponse.json({ error: 'Monthly limit must be a positive number' }, { status: 400 });
  }

  const rawKey = createIntegrationKey();
  const keyPrefix = rawKey.slice(0, 18);

  const { data, error: insertError } = await supabase
    .from('integration_api_keys')
    .insert({
      name,
      key_prefix: keyPrefix,
      key_hash: hashKey(rawKey),
      scopes,
      environment,
      rate_limit_per_minute: rateLimit,
      monthly_request_limit: monthlyLimit,
      allowed_origins: allowedOrigins,
      expires_at: expiresAt,
      created_by: user.id,
    })
    .select('id, name, key_prefix, scopes, environment, status, rate_limit_per_minute, monthly_request_limit, allowed_origins, last_used_at, expires_at, created_at, updated_at')
    .single();

  if (insertError) return NextResponse.json({ error: 'Unable to create API key' }, { status: 500 });

  return NextResponse.json({ key: data, secret: rawKey }, { status: 201 });
}

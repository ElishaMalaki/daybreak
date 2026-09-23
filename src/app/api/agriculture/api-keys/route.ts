// ============================================================
// API Key Management Routes
// GET  /api/agriculture/api-keys  — list user's API keys
// POST /api/agriculture/api-keys  — create new API key
// DELETE /api/agriculture/api-keys?id=xxx — revoke a key
// ============================================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createHash, randomBytes } from 'crypto';

export const runtime = 'nodejs';

function generateApiKey(): { raw: string; hash: string; prefix: string; hint: string } {
  // Format: eia_live_<32 random hex chars>
  const random = randomBytes(24).toString('hex');
  const raw = `eia_live_${random}`;
  const hash = createHash('sha256').update(raw).digest('hex');
  const prefix = raw.slice(0, 12); // "eia_live_xxx"
  const hint = raw.slice(-4);       // last 4 chars
  return { raw, hash, prefix, hint };
}

async function requireApiAccess(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const tier = subscription?.tier || 'free';
  const allowed = ['business', 'enterprise'].includes(tier);
  return { allowed, tier };
}

// GET — list API keys
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, tier } = await requireApiAccess(user.id, supabase);
  if (!allowed) {
    return NextResponse.json(
      {
        error: 'API access requires a Business or Enterprise subscription.',
        current_plan: tier,
        upgrade_url: '/app/agriculture/subscription',
      },
      { status: 403 }
    );
  }

  const { data: keys, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, key_hint, scopes, is_active, last_used_at, expires_at, request_count, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }

  return NextResponse.json({ keys: keys || [] });
}

// POST — create new API key
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, tier } = await requireApiAccess(user.id, supabase);
  if (!allowed) {
    return NextResponse.json(
      {
        error: 'API access requires a Business or Enterprise subscription.',
        current_plan: tier,
        upgrade_url: '/app/agriculture/subscription',
      },
      { status: 403 }
    );
  }

  // Limit: max 5 active keys per user
  const { count } = await supabase
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if ((count || 0) >= 5) {
    return NextResponse.json(
      { error: 'Maximum of 5 active API keys allowed. Revoke an existing key to create a new one.' },
      { status: 400 }
    );
  }

  let body: { name?: string; scopes?: string[]; expires_in_days?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const name = (body.name || 'API Key').trim().slice(0, 80);
  const scopes = body.scopes || ['agriculture:read', 'agriculture:write'];
  const expiresAt = body.expires_in_days
    ? new Date(Date.now() + body.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { raw, hash, prefix, hint } = generateApiKey();

  const { data: newKey, error: insertError } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      name,
      key_prefix: prefix,
      key_hash: hash,
      key_hint: hint,
      scopes,
      expires_at: expiresAt,
    })
    .select('id, name, key_prefix, key_hint, scopes, is_active, expires_at, created_at')
    .single();

  if (insertError || !newKey) {
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }

  // Return the raw key ONCE — it will never be shown again
  return NextResponse.json({
    key: {
      ...newKey,
      raw_key: raw, // Only returned on creation
    },
    warning: 'Store this key securely. It will not be shown again.',
  });
}

// DELETE — revoke a key
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get('id');

  if (!keyId) {
    return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', keyId)
    .eq('user_id', user.id); // Ensure user owns this key

  if (error) {
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'API key revoked successfully.' });
}

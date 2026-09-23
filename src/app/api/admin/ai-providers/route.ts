import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

// GET /api/admin/ai-providers — list AI provider configs
export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase!
    .from('ai_provider_config')
    .select('*')
    .order('priority');

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ providers: data || [] });
}

// PATCH /api/admin/ai-providers — update a provider config
export async function PATCH(request: NextRequest) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { id, is_enabled, priority, daily_request_limit, monthly_request_limit, max_tokens_per_request, notes } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (is_enabled !== undefined) updates.is_enabled = is_enabled;
  if (priority !== undefined) updates.priority = priority;
  if (daily_request_limit !== undefined) updates.daily_request_limit = daily_request_limit;
  if (monthly_request_limit !== undefined) updates.monthly_request_limit = monthly_request_limit;
  if (max_tokens_per_request !== undefined) updates.max_tokens_per_request = max_tokens_per_request;
  if (notes !== undefined) updates.notes = notes;

  const { error: updateError } = await supabase!
    .from('ai_provider_config')
    .update(updates)
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

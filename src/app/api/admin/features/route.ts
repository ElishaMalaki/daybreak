import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

// GET /api/admin/features — list all feature flags
export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase!
    .from('feature_flags')
    .select('*')
    .order('key');

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ features: data || [] });
}

// PATCH /api/admin/features — toggle or update a feature flag
export async function PATCH(request: NextRequest) {
  const { error, supabase, user } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { id, is_enabled, applies_to_tiers } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: user!.id };
  if (is_enabled !== undefined) updates.is_enabled = is_enabled;
  if (applies_to_tiers !== undefined) updates.applies_to_tiers = applies_to_tiers;

  const { error: updateError } = await supabase!
    .from('feature_flags')
    .update(updates)
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

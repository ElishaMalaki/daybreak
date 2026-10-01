import { requireAdmin } from '@/lib/admin/auth';
import { NextResponse } from 'next/server';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, supabase, user } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { error: updateError } = await supabase
    .from('integration_api_keys')
    .update({ status: 'revoked', revoked_at: new Date().toISOString(), revoked_by: user.id })
    .eq('id', id)
    .eq('status', 'active');

  if (updateError) return NextResponse.json({ error: 'Unable to revoke API key' }, { status: 500 });
  return NextResponse.json({ success: true });
}

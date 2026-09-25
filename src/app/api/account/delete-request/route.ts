import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const reason = String(body.reason || '').trim().slice(0, 1200);

    const { error } = await supabase.from('account_deletion_requests').insert({
      user_id: user.id,
      email: user.email || '',
      reason,
      status: 'pending',
    });

    if (error) {
      console.error('[Account Deletion] request failed:', error.message);
      return NextResponse.json({ error: 'Account deletion request could not be created.' }, { status: 503 });
    }

    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Account Deletion] unhandled error:', error);
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}

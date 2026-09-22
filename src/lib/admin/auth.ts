// ============================================================
// Admin Panel — Server-side admin check utility
// ============================================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase?.auth?.getUser();

  if (!user) {
    return { error: NextResponse?.json({ error: 'Unauthorized' }, { status: 401 }), supabase: null, user: null };
  }

  const { data: profile } = await supabase?.from('user_profiles')?.select('role')?.eq('id', user?.id)?.single();

  if (!profile || profile?.role !== 'admin') {
    return { error: NextResponse?.json({ error: 'Forbidden: Admin access required' }, { status: 403 }), supabase: null, user: null };
  }

  return { error: null, supabase, user };
}

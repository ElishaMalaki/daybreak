import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedInterests = new Set(['agriculture', 'finance', 'pelit', 'enterprise']);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const fullName = String(body.fullName || '').trim().slice(0, 160);
    const interest = String(body.interest || 'agriculture').trim();
    const message = String(body.message || '').trim().slice(0, 1200);

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }
    if (!allowedInterests.has(interest)) {
      return NextResponse.json({ error: 'Invalid interest selected.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from('waitlist_entries').upsert(
      {
        email,
        full_name: fullName,
        interest,
        message,
        source: 'earth_ai_website',
        status: 'new',
      },
      { onConflict: 'email' }
    );

    if (error) {
      console.error('[Waitlist] insert failed:', error.message);
      return NextResponse.json({ error: 'Waitlist is not ready yet. Please try again shortly.' }, { status: 503 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Waitlist] request failed:', error);
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}

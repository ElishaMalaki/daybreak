import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

const allowedTypes = new Set(['feedback', 'bug', 'error', 'suggestion']);
const allowedSeverity = new Set(['low', 'normal', 'high', 'critical']);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const type = String(body.type || 'feedback');
    const severity = String(body.severity || 'normal');
    const title = String(body.title || '').trim().slice(0, 180);
    const description = String(body.description || '').trim().slice(0, 4000);
    const pagePath = String(body.pagePath || '').trim().slice(0, 300);

    if (!allowedTypes.has(type)) return NextResponse.json({ error: 'Invalid report type.' }, { status: 400 });
    if (!allowedSeverity.has(severity)) return NextResponse.json({ error: 'Invalid severity.' }, { status: 400 });
    if (!title || !description) return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });

    const { error } = await supabase.from('feedback_reports').insert({
      user_id: user.id,
      email: user.email,
      type,
      severity,
      title,
      description,
      page_path: pagePath,
    });

    if (error) {
      console.error('[Feedback] insert failed:', error.message);
      return NextResponse.json({ error: 'Feedback reporting is not ready yet. Please try again shortly.' }, { status: 503 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Feedback] request failed:', error);
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}

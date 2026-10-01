import { requireAdmin, sanitizeAdminText } from '@/lib/admin/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_SECTIONS = new Set([
  'intelligence', 'crop-doctor', 'image-analysis', 'research', 'prompts', 'models',
  'knowledge', 'documents', 'conversations', 'ai-usage', 'usage', 'costs', 'performance',
  'errors', 'recommendations', 'evaluation', 'content', 'api-keys'
]);

function normalizeSection(value: string | null) {
  const section = sanitizeAdminText(value, 80).toLowerCase();
  return VALID_SECTIONS.has(section) ? section : '';
}

export async function GET(request: NextRequest) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const section = normalizeSection(request.nextUrl.searchParams.get('section'));
  if (!section) return NextResponse.json({ error: 'Invalid section' }, { status: 400 });

  const { data, error: queryError } = await supabase
    .from('admin_workspace_items')
    .select('id, section, title, description, status, content, metadata, created_at, updated_at')
    .eq('section', section)
    .order('updated_at', { ascending: false })
    .limit(100);

  if (queryError) return NextResponse.json({ error: 'Unable to load admin records' }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(request: NextRequest) {
  const { error, supabase, user } = await requireAdmin();
  if (error) return error;
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const section = normalizeSection(typeof body.section === 'string' ? body.section : null);
  const title = sanitizeAdminText(body.title, 160);
  const description = sanitizeAdminText(body.description, 1000);
  const status = sanitizeAdminText(body.status, 30) || 'active';

  if (!section || !title) return NextResponse.json({ error: 'Section and title are required' }, { status: 400 });
  if (!['active', 'testing', 'review', 'disabled', 'archived'].includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const content = body.content && typeof body.content === 'object' ? body.content : {};
  const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};

  const { data, error: insertError } = await supabase
    .from('admin_workspace_items')
    .insert({ section, title, description, status, content, metadata, created_by: user.id, updated_by: user.id })
    .select('id, section, title, description, status, content, metadata, created_at, updated_at')
    .single();

  if (insertError) return NextResponse.json({ error: 'Unable to save admin record' }, { status: 500 });
  return NextResponse.json({ item: data }, { status: 201 });
}

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkFarmCreationAllowed } from '@/lib/subscription/enforcer';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Server-side farm limit enforcement
    const check = await checkFarmCreationAllowed(user.id);
    if (!check.allowed) {
      return NextResponse.json(
        { error: check.reason, limitType: check.limitType, upgradeRequired: true },
        { status: 403 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { name, description, country, region, total_area_hectares, area_unit, primary_activity } = body as any;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Farm name is required' }, { status: 400 });
    }

    const { data: farm, error } = await supabase
      .from('farms')
      .insert({
        name: name.trim(),
        description: description || null,
        owner_id: user.id,
        country: country || 'Unknown',
        region: region || null,
        total_area_hectares: total_area_hectares || null,
        area_unit: area_unit || 'hectares',
        primary_activity: primary_activity || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ farm });
  } catch (error) {
    console.error('[Farms API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

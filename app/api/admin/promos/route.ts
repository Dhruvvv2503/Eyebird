export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function checkAuth(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  return token === process.env.ADMIN_SECRET;
}

/* GET — list all promo codes */
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('promo_codes').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promos: data });
}

/* POST — create promo code */
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { code, discount_type, flat_discount_amount, discount_percent, max_uses, expires_at } = body;
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });

  const { data, error } = await supabaseAdmin.from('promo_codes').insert({
    code: code.trim().toUpperCase(),
    discount_type: discount_type || 'percent',
    flat_discount_amount: flat_discount_amount || 0,
    discount_percent: discount_percent || 0,
    max_uses: max_uses || null,
    expires_at: expires_at || null,
    is_active: true,
    current_uses: 0,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promo: data });
}

/* PATCH — update promo code */
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('promo_codes').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promo: data });
}

/* DELETE — delete promo code */
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await supabaseAdmin.from('promo_codes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

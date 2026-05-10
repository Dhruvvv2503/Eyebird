export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function getSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookieStore.set(name, value, options as any)
          );
        },
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const { data: current } = await supabaseAdmin
      .from('automations')
      .select('status')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (!current) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const newStatus = current.status === 'active' ? 'paused' : 'active';

    const { data: automation, error } = await supabaseAdmin
      .from('automations')
      .update({ status: newStatus })
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ automation });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

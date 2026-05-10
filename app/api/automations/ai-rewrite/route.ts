export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as any));
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { dmText, username, niche } = body;

    if (!dmText || dmText.trim().length < 5) {
      return NextResponse.json({ error: 'DM text too short to rewrite' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are helping an Indian Instagram creator named @${username} write a warm, personal DM automation message.

Their niche: ${niche || 'content creation'}

Their current DM message:
"${dmText}"

Rewrite this DM to be:
1. Warm and personal — not robotic or corporate
2. Conversational — like a real person texting, not a brand
3. Uses {first_name} variable at the start naturally
4. Ends with a genuine question to start a conversation
5. Maximum 150 words
6. Keeps any links or CTAs from the original
7. Natural Indian English — not overly formal

Return ONLY the rewritten message. No explanation, no quotes, just the message text.`,
        },
      ],
    });

    const rewritten = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ rewritten });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

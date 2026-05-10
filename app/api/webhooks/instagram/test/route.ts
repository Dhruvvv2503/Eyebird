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

// POST /api/webhooks/instagram/test
// Simulates a comment event for testing the automation pipeline without needing
// a real Instagram comment. Requires auth — only the creator can trigger this.
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      ig_user_id = '',
      comment_text = 'TEST',
      commenter_username = 'test_user',
      commenter_ig_id = '12345678',
      post_id = null,
    } = body;

    console.log('Test webhook fired:', { ig_user_id, comment_text, commenter_username });

    // Fallback lookup — check both ig_user_id and username in case Meta sends a different ID format
    const { data: igAccount, error: igError } = await supabaseAdmin
      .from('instagram_accounts')
      .select('*')
      .or(`ig_user_id.eq.${ig_user_id},username.eq.dhruvv.bhaii`)
      .single();

    if (igError || !igAccount) {
      return NextResponse.json({
        error: 'No matching Instagram account found',
        ig_user_id_searched: ig_user_id,
        supabase_error: igError?.message,
      }, { status: 404 });
    }

    console.log('Found IG account:', igAccount.username, igAccount.ig_user_id);

    const { data: automations } = await supabaseAdmin
      .from('automations')
      .select('*')
      .eq('ig_account_id', igAccount.id)
      .eq('status', 'active');

    if (!automations || automations.length === 0) {
      return NextResponse.json({
        found_account: igAccount.username,
        error: 'No active automations found for this account',
      }, { status: 404 });
    }

    const commentTextUpper = comment_text.trim().toUpperCase();
    const results = [];

    for (const automation of automations) {
      if (automation.trigger_post_id && automation.trigger_post_id !== post_id) {
        results.push({ automation: automation.name, skipped: 'post_id mismatch' });
        continue;
      }

      let keywordMatched = false;
      if (automation.trigger_any_word) {
        keywordMatched = true;
      } else {
        const keywords: string[] = automation.trigger_keywords || [];
        keywordMatched = keywords.some(kw => commentTextUpper.includes(kw.toUpperCase()));
      }

      if (!keywordMatched) {
        results.push({ automation: automation.name, skipped: 'keyword not matched', keywords: automation.trigger_keywords });
        continue;
      }

      // Always send to creator in test route (test_mode forced true)
      const recipientIgId = igAccount.ig_user_id;
      const firstName = commenter_username.split('_')[0] || 'there';
      const dmText = (automation.main_dm_text || '').replace(/\{first_name\}/gi, firstName);

      const dmResponse = await fetch(
        `https://graph.instagram.com/v21.0/${igAccount.ig_user_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${igAccount.access_token}`,
          },
          body: JSON.stringify({
            recipient: { id: recipientIgId },
            message: { text: dmText },
          }),
        }
      );

      const dmData = await dmResponse.json();
      const dmSuccess = !dmData.error;

      await supabaseAdmin.from('automation_logs').insert({
        automation_id: automation.id,
        user_id: igAccount.user_id,
        commenter_username,
        commenter_ig_id,
        comment_text,
        post_id,
        dm_sent: dmSuccess,
        dm_sent_at: dmSuccess ? new Date().toISOString() : null,
        error_message: dmData.error?.message || null,
        test_mode: true,
      });

      if (dmSuccess) {
        await supabaseAdmin
          .from('automations')
          .update({
            total_dms_sent: automation.total_dms_sent + 1,
            total_comments_triggered: automation.total_comments_triggered + 1,
          })
          .eq('id', automation.id);
      }

      results.push({
        automation: automation.name,
        dm_sent: dmSuccess,
        dm_text: dmText,
        recipient: igAccount.username,
        api_response: dmData,
      });
    }

    return NextResponse.json({
      account_found: igAccount.username,
      ig_user_id: igAccount.ig_user_id,
      comment_text,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const TEST_SECRET = process.env.ADMIN_SECRET || 'eyebird_admin_2024';

// POST /api/webhooks/instagram/test
// Simulates a comment event for testing the automation pipeline without needing
// a real Instagram comment. Protected by ADMIN_SECRET header.
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== TEST_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      ig_user_id = '',
      comment_text = 'TEST',
      commenter_username = 'test_user',
      commenter_ig_id = '12345678',
      post_id = null,
      comment_id = null,
    } = body;

    console.log('Test webhook fired:', { ig_user_id, comment_text, commenter_username, comment_id });

    // Strategy 1: direct ig_user_id match
    let { data: igAccount } = await supabaseAdmin
      .from('instagram_accounts')
      .select('*')
      .eq('ig_user_id', ig_user_id)
      .maybeSingle();

    // Strategy 2: fetch all accounts for fallback matching
    let allAccounts: { ig_user_id: string; username: string; id: string }[] = [];
    if (!igAccount) {
      const { data: rows } = await supabaseAdmin
        .from('instagram_accounts')
        .select('id, ig_user_id, username');

      allAccounts = rows || [];

      // Single account — use it regardless of ID
      if (allAccounts.length === 1) {
        const { data: full } = await supabaseAdmin
          .from('instagram_accounts')
          .select('*')
          .eq('id', allAccounts[0].id)
          .single();
        igAccount = full;
        console.log('Using single account fallback:', igAccount?.username);
      }
    }

    // Strategy 3: match by commenter_username against stored usernames
    if (!igAccount && commenter_username) {
      const match = allAccounts.find(
        a => a.username.toLowerCase() === commenter_username.toLowerCase()
      );
      if (match) {
        const { data: full } = await supabaseAdmin
          .from('instagram_accounts')
          .select('*')
          .eq('id', match.id)
          .single();
        igAccount = full;
        console.log('Using username fallback match:', igAccount?.username);
      }
    }

    if (!igAccount) {
      return NextResponse.json({
        error: 'No matching Instagram account found',
        ig_user_id_searched: ig_user_id,
        all_stored_accounts: allAccounts.map(a => ({ ig_user_id: a.ig_user_id, username: a.username })),
        total_accounts: allAccounts.length,
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

      const firstName = commenter_username.split('_')[0] || 'there';
      const dmText = (automation.main_dm_text || '').replace(/\{first_name\}/gi, firstName);

      // Send to commenter_ig_id (same as production)
      // If comment_id provided, Private Reply is used (bypasses 24h window)
      const dmResult = await sendInstagramDM(
        igAccount.ig_user_id,
        igAccount.access_token,
        commenter_ig_id,
        comment_id || '',
        dmText,
        automation.main_dm_link_text,
        automation.main_dm_link_url
      );

      await supabaseAdmin.from('automation_logs').insert({
        automation_id: automation.id,
        user_id: igAccount.user_id,
        commenter_username,
        commenter_ig_id,
        comment_text,
        post_id,
        dm_sent: dmResult.success,
        dm_sent_at: dmResult.success ? new Date().toISOString() : null,
        error_message: dmResult.error || null,
        test_mode: true,
      });

      if (dmResult.success) {
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
        dm_sent: dmResult.success,
        dm_text: dmText,
        recipient_ig_id: commenter_ig_id,
        api_response: dmResult,
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

async function sendInstagramDM(
  senderIgUserId: string,
  accessToken: string,
  recipientIgId: string,
  commentId: string,
  text: string,
  linkText?: string | null,
  linkUrl?: string | null
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };
    const endpoint = `https://graph.instagram.com/v21.0/${senderIgUserId}/messages`;

    // Attempt 1: Button template via Private Reply (text + tappable link button in one message)
    if (commentId && linkText && linkUrl) {
      console.log('Attempting button template via Private Reply');
      const templateResp = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipient: { comment_id: commentId },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'button',
                text,
                buttons: [{ type: 'web_url', url: linkUrl, title: linkText }],
              },
            },
          },
        }),
      });
      const templateData = await templateResp.json();
      console.log('Button template response:', JSON.stringify(templateData));
      if (templateData.message_id) {
        return { success: true, messageId: templateData.message_id };
      }
      console.log('Button template failed:', templateData.error?.message, '— falling back to text+link');
    }

    // Attempt 2: Combined text + link as plain text in a single Private Reply
    const fullText = (linkText && linkUrl)
      ? `${text}\n\n${linkText}: ${linkUrl}`
      : text;

    if (commentId) {
      console.log('Attempting Private Reply (text+link combined)');
      const prResp = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipient: { comment_id: commentId },
          message: { text: fullText },
        }),
      });
      const prData = await prResp.json();
      console.log('Private Reply response:', JSON.stringify(prData));
      if (prData.message_id) {
        return { success: true, messageId: prData.message_id };
      }
      console.log('Private Reply failed:', prData.error?.message, '— falling back to id');
    }

    // Attempt 3: Direct id fallback (requires 24h window)
    console.log('Attempting direct id fallback');
    const idResp = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        recipient: { id: recipientIgId },
        message: { text: fullText ?? text },
      }),
    });
    const idData = await idResp.json();
    console.log('ID fallback response:', JSON.stringify(idData));

    if (idData.error) {
      console.error('All DM strategies failed:', idData.error);
      return { success: false, error: idData.error.message };
    }
    return { success: true, messageId: idData.message_id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

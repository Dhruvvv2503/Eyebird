export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'eyebird_webhook_2024_secure';

// ── GET: Meta webhook verification ──
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('Webhook verification attempt:', { mode, token, challenge });
  console.log('Expected token:', VERIFY_TOKEN);

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// ── POST: Receive comment events ──
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    const entries = body?.entry || [];

    for (const entry of entries) {
      const igAccountId = entry.id;
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field === 'comments') {
          await processCommentEvent(igAccountId, change.value);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: unknown) {
    console.error('Webhook error:', err);
    // Always return 200 — never return error to Meta or they retry infinitely
    return NextResponse.json({ status: 'ok' });
  }
}

// ── PROCESS COMMENT EVENT ──
async function processCommentEvent(igBusinessAccountId: string, commentData: Record<string, unknown>) {
  try {
    const commentText = ((commentData.text as string) || '').trim().toUpperCase();
    const commentId = commentData.id as string;
    const postId = (commentData.media as Record<string, string>)?.id;
    const commenterIgId = (commentData.from as Record<string, string>)?.id;
    const commenterUsername = (commentData.from as Record<string, string>)?.username;

    console.log(`Comment received: "${commentText}" from @${commenterUsername} on post ${postId}`);

    // Strategy 1: direct ig_user_id match
    let { data: igAccount } = await supabaseAdmin
      .from('instagram_accounts')
      .select('*')
      .eq('ig_user_id', igBusinessAccountId)
      .maybeSingle();

    // Strategy 2: if not found, fetch all accounts and log IDs for debugging
    if (!igAccount) {
      const { data: allAccounts } = await supabaseAdmin
        .from('instagram_accounts')
        .select('*');

      console.log('All stored ig_user_ids:', allAccounts?.map(a => ({
        id: a.ig_user_id,
        username: a.username,
      })));

      if (allAccounts && allAccounts.length === 1) {
        igAccount = allAccounts[0];
        console.log('Using single account fallback:', igAccount.username);
      }
    }

    if (!igAccount) {
      console.log('No matching account found for webhook ID:', igBusinessAccountId);
      return;
    }

    const { data: automations, error: automationsError } = await supabaseAdmin
      .from('automations')
      .select('*')
      .eq('ig_account_id', igAccount.id)
      .eq('status', 'active');

    if (automationsError || !automations || automations.length === 0) {
      console.log('No active automations found');
      return;
    }

    for (const automation of automations) {
      if (automation.trigger_post_id && automation.trigger_post_id !== postId) {
        continue;
      }

      let keywordMatched = false;
      if (automation.trigger_any_word) {
        keywordMatched = true;
      } else {
        const keywords: string[] = automation.trigger_keywords || [];
        keywordMatched = keywords.some(kw => commentText.includes(kw.toUpperCase()));
      }

      if (!keywordMatched) {
        console.log(`Comment "${commentText}" did not match keywords:`, automation.trigger_keywords);
        continue;
      }

      console.log(`Automation "${automation.name}" matched! Sending DM...`);

      // Duplicate guard — skip if we already sent a DM to this person for this automation in last 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentLog } = await supabaseAdmin
        .from('automation_logs')
        .select('id')
        .eq('automation_id', automation.id)
        .eq('commenter_ig_id', commenterIgId)
        .eq('dm_sent', true)
        .gte('created_at', oneDayAgo)
        .limit(1);

      if (recentLog && recentLog.length > 0) {
        console.log(`Already sent DM to ${commenterUsername} in last 24h, skipping`);
        continue;
      }

      // test_mode = true → send to the creator's own account for testing
      const recipientIgId = automation.test_mode ? igAccount.ig_user_id : commenterIgId;

      const firstName = commenterUsername?.split('_')[0] || commenterUsername || 'there';
      const dmText = (automation.main_dm_text || '').replace(/\{first_name\}/gi, firstName);

      const dmResult = await sendInstagramDM(
        igAccount.ig_user_id,
        igAccount.access_token,
        recipientIgId,
        dmText,
        automation.main_dm_link_text,
        automation.main_dm_link_url
      );

      await supabaseAdmin.from('automation_logs').insert({
        automation_id: automation.id,
        user_id: igAccount.user_id,
        commenter_username: commenterUsername,
        commenter_ig_id: commenterIgId,
        comment_text: commentData.text,
        comment_id: commentId,
        post_id: postId,
        dm_sent: dmResult.success,
        dm_sent_at: dmResult.success ? new Date().toISOString() : null,
        error_message: dmResult.error || null,
        test_mode: automation.test_mode,
      });

      if (dmResult.success) {
        await supabaseAdmin
          .from('automations')
          .update({
            total_dms_sent: automation.total_dms_sent + 1,
            total_comments_triggered: automation.total_comments_triggered + 1,
          })
          .eq('id', automation.id);

        await supabaseAdmin
          .from('contacts')
          .upsert({
            user_id: igAccount.user_id,
            ig_user_id: commenterIgId,
            username: commenterUsername,
            last_interaction_at: new Date().toISOString(),
            source_automation_id: automation.id,
          }, {
            onConflict: 'user_id,ig_user_id',
            ignoreDuplicates: false,
          });

        console.log(`✅ DM sent successfully to ${automation.test_mode ? 'creator (test mode)' : commenterUsername}`);
      } else {
        console.error(`❌ DM failed:`, dmResult.error);
      }
    }
  } catch (err: unknown) {
    console.error('processCommentEvent error:', err);
  }
}

// ── SEND INSTAGRAM DM ──
async function sendInstagramDM(
  senderIgUserId: string,
  accessToken: string,
  recipientIgId: string,
  text: string,
  linkText?: string | null,
  linkUrl?: string | null
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v21.0/${senderIgUserId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipient: { id: recipientIgId },
          message: { text },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Instagram DM API error:', data.error);
      return { success: false, error: data.error.message };
    }

    // Send link button as follow-up message if provided
    if (linkText && linkUrl) {
      await fetch(
        `https://graph.instagram.com/v21.0/${senderIgUserId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            recipient: { id: recipientIgId },
            message: {
              attachment: {
                type: 'template',
                payload: {
                  template_type: 'button',
                  text: linkText,
                  buttons: [{ type: 'web_url', url: linkUrl, title: linkText }],
                },
              },
            },
          }),
        }
      );
    }

    return { success: true, messageId: data.message_id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

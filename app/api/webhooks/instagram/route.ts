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
      const messaging = entry.messaging || [];

      console.log(`Entry ID: ${igAccountId} | changes: ${changes.length} | messaging: ${messaging.length}`);
      if (changes.length > 0) {
        console.log('Changes fields:', changes.map((c: Record<string, unknown>) => c.field));
      }

      for (const change of changes) {
        if (change.field === 'comments') {
          await processCommentEvent(igAccountId, change.value);
        } else {
          console.log(`Unhandled change field: ${change.field}`);
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

    // Strategy 2: Meta webhook entry.id ≠ ig_user_id from /me — find account with active automations
    if (!igAccount) {
      const { data: allAccounts } = await supabaseAdmin
        .from('instagram_accounts')
        .select('*');

      console.log(`No direct match for webhook ID: ${igBusinessAccountId}`);
      console.log('All stored accounts:', allAccounts?.map(a => ({ id: a.ig_user_id, username: a.username })));

      for (const account of (allAccounts || [])) {
        const { count } = await supabaseAdmin
          .from('automations')
          .select('id', { count: 'exact', head: true })
          .eq('ig_account_id', account.id)
          .eq('status', 'active');

        if (count && count > 0) {
          igAccount = account;
          console.log(`Using account with active automations: ${igAccount.username} (${igAccount.ig_user_id})`);
          break;
        }
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

      const firstName = commenterUsername?.split('_')[0] || commenterUsername || 'there';
      const dmText = (automation.main_dm_text || '').replace(/\{first_name\}/gi, firstName);

      console.log(`Sending DM via Private Reply to comment ${commentId} (@${commenterUsername})`);

      // Use comment_id as recipient — Instagram Private Reply API for comment-to-DM flows
      // This bypasses the 24-hour messaging window and works without prior contact
      const dmResult = await sendInstagramDM(
        igAccount.ig_user_id,
        igAccount.access_token,
        commenterIgId,
        commentId,
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

        if (automation.reply_to_comment_publicly && automation.public_reply_variations?.length > 0) {
          const validVariations = (automation.public_reply_variations as string[]).filter((v: string) => v.trim().length > 0);
          if (validVariations.length > 0) {
            const replyText = validVariations[Math.floor(Math.random() * validVariations.length)];
            try {
              const replyResp = await fetch(`https://graph.instagram.com/v21.0/${commentId}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${igAccount.access_token}` },
                body: JSON.stringify({ message: replyText }),
              });
              const replyData = await replyResp.json();
              if (replyData.error) {
                console.error('Public reply failed:', replyData.error.message);
              } else {
                console.log(`✅ Public reply posted: "${replyText}"`);
              }
            } catch (replyErr) {
              console.error('Public reply error:', replyErr);
            }
          }
        }

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
      if (!templateData.error) {
        return { success: true, messageId: templateData.message_id };
      }
      console.log('Button template failed:', templateData.error.message, '— falling back to text+link');
    }

    // Attempt 2: Combined text + link as plain text in a single Private Reply
    // (avoids the follow-up message problem — no second call needed)
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
      if (!prData.error) {
        return { success: true, messageId: prData.message_id };
      }
      console.log('Private Reply failed:', prData.error.message, '— falling back to id');
    }

    // Attempt 3: Direct id fallback (requires 24h window to be open)
    console.log('Attempting direct id fallback');
    const idResp = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        recipient: { id: recipientIgId },
        message: { text: fullText },
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

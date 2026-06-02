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

    // ── Stale-comment guard — reject Meta backlog delivery ──
    // Meta replays all recent historical comments whenever a webhook subscription
    // is created or renewed. Each replay has a unique comment_id so the dedup
    // guard cannot catch it. We skip any comment older than 5 minutes.
    const commentTimestamp = commentData.timestamp as number | undefined;
    if (commentTimestamp) {
      const ageSeconds = Math.floor(Date.now() / 1000) - commentTimestamp;
      if (ageSeconds > 300) {
        console.log(`⚠️ Skipping stale comment ${commentId} (${Math.round(ageSeconds / 60)} min old) — backlog delivery, not a real new comment`);
        return;
      }
    }

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

      // ── Skip if the commenter is the account owner ──
      // The webhook from.id (IGSID: e.g. 17841437971915155) is a different number than
      // the Business Account ID stored in ig_user_id (e.g. 26964059936539103) — they are
      // two different ID spaces for the same person. ID comparison always fails, so we
      // compare by username instead. This also stops the bot-reply loop: when the automation
      // posts a public reply, Meta fires a new webhook with commenterUsername = igAccount.username,
      // which is caught here before processing starts again.
      const isAccountOwner =
        commenterIgId === igAccount.ig_user_id ||
        (commenterUsername != null &&
          igAccount.username != null &&
          commenterUsername.toLowerCase() === igAccount.username.toLowerCase());

      if (isAccountOwner) {
        console.log(`⚠️ Skipping — commenter @${commenterUsername} is the account owner (bot reply loop or self-comment)`);
        continue;
      }

      // ── FIX 1: Dedup guard — skip if this comment was already processed ──
      // Prevents duplicate DMs from Meta backlog delivery or race conditions.
      // NOTE: also add DB-level guard: ALTER TABLE automation_logs ADD CONSTRAINT
      // unique_comment_automation UNIQUE (automation_id, comment_id);
      const { data: existingLog } = await supabaseAdmin
        .from('automation_logs')
        .select('id')
        .eq('automation_id', automation.id)
        .eq('comment_id', commentId)
        .maybeSingle();

      if (existingLog) {
        console.log(`⚠️ Already processed comment ${commentId} for automation ${automation.id} — skipping`);
        continue;
      }

      console.log(`Automation "${automation.name}" matched! Processing comment ${commentId}...`);

      // ── Insert log entry BEFORE sending DM to prevent race conditions ──
      const { data: logEntry } = await supabaseAdmin
        .from('automation_logs')
        .insert({
          automation_id: automation.id,
          user_id: igAccount.user_id,
          commenter_username: commenterUsername,
          commenter_ig_id: commenterIgId,
          comment_text: commentData.text,
          comment_id: commentId,
          post_id: postId,
          dm_sent: false,
          test_mode: automation.test_mode,
        })
        .select('id')
        .single();

      const firstName = commenterUsername?.split('_')[0] || commenterUsername || 'there';
      const dmText = (automation.main_dm_text || '').replace(/\{first_name\}/gi, firstName);

      // Send opening DM first if enabled — uses comment_id (Private Reply) to open the thread.
      // This consumes the comment_id, so the main DM below falls back to { id }, which works
      // because the conversation window is now open from the opening Private Reply.
      if (automation.opening_dm_enabled && automation.opening_dm_text) {
        const openingText = (automation.opening_dm_text as string).replace(/\{first_name\}/gi, firstName);
        try {
          const openingResp = await fetch(`https://graph.instagram.com/v21.0/${igAccount.ig_user_id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${igAccount.access_token}` },
            body: JSON.stringify({
              recipient: { comment_id: commentId },
              message: { text: openingText },
            }),
          });
          const openingData = await openingResp.json();
          if (openingData.error) {
            console.error('Opening DM failed:', openingData.error.message);
          } else {
            console.log('Opening DM sent via Private Reply:', openingData.message_id);
          }
        } catch (openingErr) {
          console.error('Opening DM error:', openingErr);
        }
      }

      console.log(`Sending main DM to @${commenterUsername}`);

      // If opening DM was sent above, comment_id is consumed — sendInstagramDM will fall through
      // attempts 1+2 (comment_id already used) and reach the { id } fallback automatically.
      const dmResult = await sendInstagramDM(
        igAccount.ig_user_id,
        igAccount.access_token,
        commenterIgId,
        commentId,
        dmText,
        automation.main_dm_link_text,
        automation.main_dm_link_url
      );

      // Update log entry with DM result
      if (logEntry?.id) {
        await supabaseAdmin
          .from('automation_logs')
          .update({
            dm_sent: dmResult.success,
            dm_sent_at: dmResult.success ? new Date().toISOString() : null,
            error_message: dmResult.error || null,
          })
          .eq('id', logEntry.id);
      }

      // PUBLIC COMMENT REPLY — send exactly ONE random variation
      if (
        automation.reply_to_comment_publicly === true &&
        automation.public_reply_variations &&
        Array.isArray(automation.public_reply_variations) &&
        automation.public_reply_variations.length > 0
      ) {
        const validVariations = (automation.public_reply_variations as string[])
          .filter((v: string) => typeof v === 'string' && v.trim().length > 0);

        if (validVariations.length > 0) {
          // Pick ONE random variation — nothing else
          const randomIndex = Math.floor(Math.random() * validVariations.length);
          const chosenReply = validVariations[randomIndex];

          console.log(`📝 Posting public reply (${randomIndex + 1}/${validVariations.length}): "${chosenReply}"`);

          try {
            const replyResponse = await fetch(
              `https://graph.instagram.com/v21.0/${commentId}/replies`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${igAccount.access_token}`,
                },
                body: JSON.stringify({
                  message: chosenReply,
                }),
              }
            );

            const replyData = await replyResponse.json();

            if (replyData.error) {
              console.error('❌ Public reply failed:', replyData.error);
            } else {
              console.log('✅ Public reply posted successfully');
            }
          } catch (replyErr) {
            console.error('❌ Public reply error:', replyErr);
            // Never block DM flow for public reply failure
          }
        }
      }

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

        console.log(`✅ DM sent successfully to ${commenterUsername}`);
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

    const fullText = (linkText && linkUrl)
      ? `${text}\n\n${linkText}: ${linkUrl}`
      : text;

    if (commentId && linkText && linkUrl) {
      // Attempt 1: Button template via Private Reply
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

      // Any positive identifier means delivered — Instagram template endpoint may omit message_id
      if (templateData.message_id || templateData.id || templateData.recipient_id) {
        return { success: true, messageId: templateData.message_id || templateData.id };
      }

      if (!templateData.error) {
        // No error and no identifier — assume delivered to avoid duplicate
        console.log('Button template: no error, assuming delivered');
        return { success: true };
      }

      // Button template truly failed — fall straight to { id }, skip plain-text Private Reply
      // (retrying comment_id would duplicate if template silently delivered)
      console.log('Button template failed:', templateData.error?.message, '— falling back to id');
      const idResp = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ recipient: { id: recipientIgId }, message: { text: fullText } }),
      });
      const idData = await idResp.json();
      console.log('ID fallback response:', JSON.stringify(idData));
      if (idData.error) return { success: false, error: idData.error.message };
      return { success: true, messageId: idData.message_id || idData.id };
    }

    if (commentId) {
      // No link — send plain text via Private Reply
      console.log('Attempting Private Reply (plain text)');
      const prResp = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ recipient: { comment_id: commentId }, message: { text: fullText } }),
      });
      const prData = await prResp.json();
      console.log('Private Reply response:', JSON.stringify(prData));
      if (prData.message_id || prData.id || prData.recipient_id || !prData.error) {
        return { success: true, messageId: prData.message_id || prData.id };
      }
      console.log('Private Reply failed:', prData.error?.message, '— falling back to id');
    }

    // Final fallback: direct { id }
    console.log('Attempting direct id fallback');
    const idResp = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ recipient: { id: recipientIgId }, message: { text: fullText } }),
    });
    const idData = await idResp.json();
    console.log('ID fallback response:', JSON.stringify(idData));
    if (idData.error) {
      console.error('All DM strategies failed:', idData.error);
      return { success: false, error: idData.error.message };
    }
    return { success: true, messageId: idData.message_id || idData.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

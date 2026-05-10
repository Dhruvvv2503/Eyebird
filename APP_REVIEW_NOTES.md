# Meta App Review Submission — Eyebird-IG
**App ID:** 4558141794468791  
**App Name:** Eyebird-IG  
**Submission Date:** May 2026

---

## Overview

Eyebird is a creator analytics and automation platform for Indian Instagram creators. It provides profile audits, growth insights, and Comment-to-DM automation — allowing creators to automatically send DMs to followers who comment specific keywords on their posts. This is the same workflow used by Meta-approved platforms ManyChat and CreatorFlow.

All automations are creator-configured, creator-controlled, and recipient-initiated. No spam. No cold outreach. No unsolicited messages.

---

## Permission 1: `instagram_manage_comments`

### Use Case Description

Eyebird uses `instagram_manage_comments` to power our Comment-to-DM automation feature. When an Instagram creator sets up an automation — for example, "anyone who comments LINK on my post receives my free guide via DM" — Eyebird monitors incoming comments on the creator's posts in real-time via Meta webhooks. When a comment matching the creator's configured keyword is detected, Eyebird reads that comment to identify the commenter's username and Instagram user ID, then triggers the appropriate automated DM response.

This is entirely creator-controlled. The creator configures every aspect of the automation themselves: which keyword(s) trigger it (e.g. "LINK", "GUIDE", "PRICE"), which specific post or all posts it applies to, whether to reply publicly on the comment before DMing, and what message is sent. No comments are read, stored, or processed without explicit creator configuration of an active automation.

The commenter has implicitly and actively requested the DM by commenting the exact keyword — which creators publicly advertise in their captions (e.g. "Comment LINK below for the free guide!"). The commenter sees this call-to-action, chooses to comment, and receives the DM they requested. This is not unsolicited outreach — it is fulfilling a request the user made publicly.

Eyebird also implements a 24-hour duplicate guard: if a user has already received a DM from a specific automation in the past 24 hours, we skip sending again. This prevents spam and respects users.

This is identical in scope and intent to how Meta-approved platforms ManyChat and CreatorFlow use `instagram_manage_comments`.

### How the User Grants This Permission

1. Creator signs up at eyebird.in and connects their Instagram Business account via Instagram OAuth.
2. During the OAuth flow, the creator is shown the permission request screen listing `instagram_manage_comments`.
3. The creator reviews what Eyebird is requesting and clicks **Allow**.
4. Eyebird stores the resulting access token securely in our database.
5. The creator is redirected to their Eyebird dashboard with their account connected.

### How Eyebird Uses This Permission

1. Creator navigates to **Automations** in the Eyebird dashboard.
2. Creator clicks **Create Automation** and configures:
   - Automation name (e.g. "Free Guide DM")
   - Trigger: any post or a specific post
   - Keywords: one or more words that trigger the automation (e.g. "LINK")
   - DM message: the exact text to send to the commenter
3. Creator clicks **Activate Automation**.
4. Eyebird calls `POST /{ig-user-id}/subscribed_apps` to subscribe to comment webhooks for this account.
5. When Meta sends a comment webhook event to `https://www.eyebird.in/api/webhooks/instagram`, Eyebird:
   a. Reads the comment text from the webhook payload.
   b. Checks if the text contains the creator's configured keyword.
   c. If matched: reads the commenter's IG user ID from the payload.
   d. Checks the 24-hour duplicate guard against our `automation_logs` table.
   e. If not a duplicate: triggers the DM send via `instagram_manage_messages`.
6. The log entry is written to Eyebird's database so the creator can see how many DMs were sent.

No comment data is retained beyond what is needed for the duplicate guard log (commenter username, comment text, timestamp, automation ID).

### What Happens if This Permission is Denied

If `instagram_manage_comments` is denied:
- The Comment-to-DM automation feature is entirely non-functional.
- The creator cannot subscribe to comment webhooks.
- No keyword matching can occur.
- The creator sees an error in the Eyebird dashboard explaining that their Meta permissions do not include comment access.
- All other Eyebird features (analytics, profile audit, AI insights) continue to work normally.
- The creator is advised to re-authorize with the required permissions to unlock automations.

---

## Permission 2: `instagram_manage_messages`

### Use Case Description

Eyebird uses `instagram_manage_messages` to send automated DM responses to Instagram users who have explicitly requested them by commenting a specific keyword on a creator's post. This is the delivery mechanism for the Comment-to-DM automation feature described above.

When a commenter triggers an automation, Eyebird sends them the creator's pre-configured DM on behalf of the creator. The DM is sent to exactly one recipient: the person who just commented the keyword. The message content is entirely written by the creator in advance. Eyebird does not generate or alter the message content (except optionally replacing a `{first_name}` placeholder with the commenter's username, which the creator explicitly inserts).

Additionally, Eyebird provides a Smart Reply feature in the creator's inbox: incoming DMs are surfaced in the Eyebird dashboard alongside AI-suggested reply options. The creator reviews every suggested reply, edits if desired, and manually clicks Send. Eyebird never sends a reply without explicit creator approval — the AI only suggests, the creator decides.

No unsolicited DMs are ever sent by Eyebird. Every outbound DM falls into one of two categories:
(a) **Automation DMs** — triggered by the recipient's own comment action, fulfilling their explicit request.
(b) **Creator-approved replies** — manually reviewed and sent by the creator from the Eyebird inbox.

This mirrors the approved use cases of ManyChat, CreatorFlow, and other Meta-approved Instagram messaging platforms. Eyebird implements the same consent model: the recipient initiates the interaction through their own comment, and the DM they receive is the direct fulfillment of what they asked for in that comment.

Eyebird does not use `instagram_manage_messages` for cold outreach, bulk messaging, promotional blasts, or any form of unsolicited communication.

### How the User Grants This Permission

1. Creator signs up at eyebird.in and connects their Instagram Business account via Instagram OAuth.
2. During the OAuth flow, the creator is shown the permission request screen listing `instagram_manage_messages`.
3. The creator reviews the permission and clicks **Allow**.
4. Eyebird stores the resulting access token securely.
5. The creator lands on their dashboard with the account fully connected.

### How Eyebird Uses This Permission

**For Comment-to-DM automations:**
1. Comment webhook fires (see `instagram_manage_comments` above).
2. Keyword match is confirmed and duplicate guard passes.
3. Eyebird calls `POST /{ig-user-id}/messages` with:
   - `recipient.id`: the commenter's Instagram-Scoped User ID (from the webhook payload).
   - `message.text`: the creator's pre-written DM message.
4. If the automation includes a link button, a follow-up message is sent using the button template format.
5. Result (success or error) is logged to `automation_logs` in Eyebird's database.
6. The creator's automation stats (`total_dms_sent`) are incremented by 1.

**For Smart Reply (inbox feature):**
1. Incoming DM webhook fires for the creator's account.
2. Eyebird surfaces the DM in the creator's Eyebird inbox.
3. AI generates 2-3 suggested reply options.
4. Creator reads the suggestions, optionally edits, then clicks **Send**.
5. Eyebird calls `POST /{ig-user-id}/messages` only after the creator clicks Send.
6. No message is sent without the creator's explicit action.

### What Happens if This Permission is Denied

If `instagram_manage_messages` is denied:
- Comment-to-DM automations cannot deliver DMs. Keywords can be detected, but no message can be sent to the commenter.
- The Smart Reply inbox feature is non-functional.
- The creator sees an error in the Eyebird dashboard explaining the missing permission.
- Analytics, profile audit, and AI insights features continue to work normally.
- The creator is prompted to re-authorize to restore messaging functionality.

---

## Test Credentials for Meta Reviewer

To review the Comment-to-DM automation flow:

**Eyebird dashboard:**  
URL: https://www.eyebird.in  
Test email: *(provide before submission)*  
Test password: *(provide before submission)*

**Flow to test:**
1. Log in to Eyebird at eyebird.in.
2. Navigate to **Automations** → **Create Automation**.
3. Set keyword: `REVIEW`
4. Write a DM: `Hey! Thanks for commenting. Here's what you asked for.`
5. Click **Activate Automation**.
6. On a connected Instagram test account, comment `REVIEW` on any post.
7. Within 10–30 seconds, the DM should be received.
8. Check **Automations** dashboard — the DM count should increment by 1.

**Webhook endpoint (public, no auth):**  
`https://www.eyebird.in/api/webhooks/instagram`  
Verify token: `eyebird_webhook_2024_secure`

---

## Platform Comparison

| Feature | Eyebird | ManyChat | CreatorFlow |
|---|---|---|---|
| Comment-to-DM | ✅ | ✅ | ✅ |
| Keyword triggers | ✅ | ✅ | ✅ |
| Creator-written messages | ✅ | ✅ | ✅ |
| Recipient initiates via comment | ✅ | ✅ | ✅ |
| No cold outreach | ✅ | ✅ | ✅ |
| Duplicate guard | ✅ | ✅ | ✅ |
| Meta webhook integration | ✅ | ✅ | ✅ |

ManyChat (App ID: 1272419186149022) and CreatorFlow are approved by Meta for the same `instagram_manage_comments` + `instagram_manage_messages` use case. Eyebird's implementation is functionally identical.

---

## Data Handling

- **Comment data retained:** commenter username, comment text snippet, timestamp, automation ID — for duplicate guard and creator analytics only.
- **Message content:** not stored after delivery. Only delivery status (sent/failed) is logged.
- **Access tokens:** stored encrypted in Supabase (Postgres), never exposed client-side.
- **Data deletion:** creators can disconnect their Instagram account at any time from Settings, which deletes all associated data. Eyebird maintains a `/data-deletion` endpoint per Meta's requirements.
- **No data sold or shared with third parties.**

---

*Document prepared for Meta App Review — Eyebird-IG (App ID: 4558141794468791)*

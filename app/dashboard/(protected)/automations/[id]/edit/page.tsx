import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { notFound } from 'next/navigation';
import AutomationBuilderClient from '@/components/dashboard/AutomationBuilderClient';

export default async function EditAutomationPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAuth();
  const userId = session.user.id;

  const { data: automation } = await supabaseAdmin
    .from('automations')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single();

  if (!automation) notFound();

  const { data: igAccount } = await supabaseAdmin
    .from('instagram_accounts')
    .select('id, ig_user_id, username, profile_picture_url, followers_count, biography')
    .eq('user_id', userId)
    .single();

  let niche = 'content creation';
  if (igAccount?.ig_user_id) {
    const { data: audits } = await supabaseAdmin
      .from('audits')
      .select('ai_analysis')
      .eq('ig_user_id', igAccount.ig_user_id)
      .order('created_at', { ascending: false })
      .limit(1);
    niche = audits?.[0]?.ai_analysis?.niche || 'content creation';
  }

  return (
    <AutomationBuilderClient
      igAccount={igAccount}
      niche={niche}
      existingAutomation={automation}
    />
  );
}

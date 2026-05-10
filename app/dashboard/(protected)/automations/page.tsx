import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import AutomationsClient from '@/components/dashboard/AutomationsClient';

export default async function AutomationsPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [automationsResult, igResult] = await Promise.allSettled([
    supabaseAdmin
      .from('automations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('instagram_accounts')
      .select('id, ig_user_id, username, profile_picture_url, followers_count, biography')
      .eq('user_id', userId)
      .single(),
  ]);

  const automations = automationsResult.status === 'fulfilled'
    ? (automationsResult.value.data || [])
    : [];

  const igAccount = igResult.status === 'fulfilled'
    ? igResult.value.data
    : null;

  return (
    <AutomationsClient
      initialAutomations={automations}
      igAccount={igAccount}
    />
  );
}

import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  const userId = session.user.id;

  const [profileResult, igResult] = await Promise.allSettled([
    supabaseAdmin
      .from('user_profiles')
      .select('full_name, avatar_url, plan')
      .eq('id', userId)
      .single(),
    supabaseAdmin
      .from('instagram_accounts')
      .select('username, profile_picture_url, followers_count')
      .eq('user_id', userId)
      .single(),
  ]);

  const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
  const igAccount = igResult.status === 'fulfilled' ? igResult.value.data : null;

  const displayName =
    profile?.full_name ||
    session.user.user_metadata?.full_name ||
    session.user.email?.split('@')[0] ||
    'Creator';

  const avatarUrl =
    igAccount?.profile_picture_url ||
    profile?.avatar_url ||
    session.user.user_metadata?.avatar_url ||
    null;

  return (
    <DashboardShell
      displayName={displayName}
      avatarUrl={avatarUrl}
      plan={profile?.plan || 'free'}
      igUsername={igAccount?.username || null}
      igFollowers={igAccount?.followers_count ?? null}
      userEmail={session.user.email || ''}
    >
      {children}
    </DashboardShell>
  );
}

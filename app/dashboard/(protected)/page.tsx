import { requireAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { DashboardOverviewClient } from '@/components/dashboard/DashboardOverviewClient'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { instagram_connected?: string; upgrade?: string }
}) {
  const session = await requireAuth()
  const userId = session.user.id

  // Fetch Instagram account linked to this user
  let igAccount = null
  try {
    const result = await supabaseAdmin
      .from('instagram_accounts')
      .select('ig_user_id, username, followers_count, profile_picture_url, media_count, biography, updated_at')
      .eq('user_id', userId)
      .single()
    igAccount = result.data
  } catch {
    igAccount = null
  }

  // Fetch latest audit if Instagram is connected
  let audit = null
  if (igAccount?.ig_user_id) {
    try {
      const result = await supabaseAdmin
        .from('audits')
        .select('id, overall_score, computed_metrics, ai_analysis, is_paid, created_at')
        .eq('ig_user_id', igAccount.ig_user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      audit = result.data
    } catch {
      audit = null
    }
  }

  // Fetch user profile for plan info
  let userProfile = null
  try {
    const result = await supabaseAdmin
      .from('user_profiles')
      .select('plan, full_name, avatar_url')
      .eq('id', userId)
      .single()
    userProfile = result.data
  } catch {
    userProfile = null
  }

  const autoStart = searchParams?.instagram_connected === 'true'
  const autoUpgrade = searchParams?.upgrade === '1'

  return (
    <DashboardOverviewClient
      igAccount={igAccount}
      audit={audit}
      userProfile={userProfile}
      autoStart={autoStart}
      userId={userId}
      userEmail={session.user.email ?? ''}
      autoUpgrade={autoUpgrade}
    />
  )
}

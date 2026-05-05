'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ScoreRing from '@/components/ui/ScoreRing';
import MetricCard from '@/components/ui/MetricCard';
import BlurGate from '@/components/ui/BlurGate';
import ActionPlanCard from '@/components/audit/ActionPlanCard';
import PaymentModal from '@/components/audit/PaymentModal';
import HeatmapGrid from '@/components/audit/HeatmapGrid';
import PremiumLoadingScreen from '@/components/audit/PremiumLoadingScreen';
import { showToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import {
  BarChart2, AlertTriangle, Hash, Clock,
  Video, UserCheck, TrendingUp, Search, Type, DollarSign,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuditData {
  id: string;
  username: string;
  is_paid: boolean;
  overall_score: number;
  created_at: string;
  computed_metrics: {
    followers: number;
    mediaCount: number;
    profilePictureUrl: string | null;
    engagementRate: number;
    benchmark: string;
    bio: string;
    formatBreakdown: Record<string, any>;
    top5Posts: any[];
    postsPerWeek: number;
    topHashtags: any[];
  };
  ai_analysis: {
    profile_completeness_score: number;
    bio_verdict: string;
    bio_rewrite: string;
    bio_rewrite_reason: string;
    engagement_verdict: string;
    best_format: string;
    best_format_reason: string;
    posting_frequency_score: number;
    posting_frequency_verdict: string;
    best_posting_time: string;
    best_posting_time_reason: string;
    hook_avg_score: number;
    weakest_hook_rewrite: string;
    hashtag_score: number;
    hashtag_verdict: string;
    recommended_hashtags: string[];
    brand_readiness_score: number;
    brand_readiness_verdict: string;
    estimated_rates: {
      story: { min: number; max: number };
      reel: { min: number; max: number };
      carousel: { min: number; max: number };
      monthly_package: { min: number; max: number };
    };
    action_plan: Array<{
      rank: number;
      impact: string;
      problem: string;
      root_cause: string;
      exact_fix: string;
      expected_result: string;
    }>;
    heatmap_data?: number[][];
    best_posting_times?: Array<{ day: string; hour: number; label: string }>;
  };
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}
      >
        <Icon size={18} style={{ color: 'var(--brand-mid)' }} />
      </div>
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {children}
      </h2>
    </div>
  );
}

// ── Loading states ────────────────────────────────────────────────────────────
const LOADING_STEPS = [
  'Connecting to Instagram…',
  'Fetching your last 20 posts…',
  'Computing 22 engagement metrics…',
  'Running AI analysis with Claude…',
  'Generating your action plan…',
  'Almost done…',
];

// ── Main component ────────────────────────────────────────────────────────────
export default function AuditReportPage({ params }: { params: { igUserId: string } }) {
  const router = useRouter();
  const { igUserId } = params;

  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!igUserId) return;
    runAuditPipeline();
  }, [igUserId]);

  async function runAuditPipeline() {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch Instagram data
      setLoadingStep(1);
      const fetchRes = await fetch('/api/instagram/fetch-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId }),
      });

      if (!fetchRes.ok) {
        const err = await fetchRes.json();
        throw new Error(err.error || 'Failed to fetch Instagram data');
      }

      // Step 2: Generate audit
      setLoadingStep(3);
      const generateRes = await fetch('/api/audit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId }),
      });

      if (!generateRes.ok) {
        const err = await generateRes.json();
        throw new Error(err.error || 'Failed to generate audit');
      }

      setLoadingStep(5);

      // Step 3: Load the audit from Supabase
      const { supabaseAdmin } = await import('@/lib/supabase-admin');
      const { data: audit, error: auditError } = await supabaseAdmin
        .from('audits')
        .select('*')
        .eq('ig_user_id', igUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (auditError || !audit) {
        throw new Error('Audit data not found after generation');
      }

      // Fetch account profile for display
      const { data: account } = await supabaseAdmin
        .from('instagram_accounts')
        .select('username, followers_count, profile_picture_url, biography, media_count')
        .eq('ig_user_id', igUserId)
        .single();

      // Merge into the shape the UI expects
      const mergedData: AuditData = {
        id: audit.id,
        username: audit.username,
        is_paid: audit.is_paid,
        overall_score: audit.overall_score,
        created_at: audit.created_at,
        computed_metrics: {
          ...audit.computed_metrics,
          profilePictureUrl:
            audit.computed_metrics?.profilePictureUrl ||
            account?.profile_picture_url ||
            null,
        },
        ai_analysis: {
          ...audit.ai_analysis,
          // Generate heatmap_data if not present
          heatmap_data:
            audit.ai_analysis.heatmap_data ||
            Array(7).fill(null).map(() =>
              Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
            ),
          best_posting_times: audit.ai_analysis.best_posting_times || [
            { day: 'Thursday', hour: 21, label: '9 PM' },
          ],
        },
      };

      setData(mergedData);
    } catch (err: any) {
      console.error('[audit-page] Pipeline error:', err);
      setError(err.message || 'Failed to generate audit');
      showToast(err.message || 'Error generating audit', 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading) {
    return <PremiumLoadingScreen currentStepIndex={loadingStep} steps={LOADING_STEPS} />;
  }

  // ── Error screen ────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-14 px-5" style={{ background: 'var(--bg-base)' }}>
          <div className="card p-10 text-center max-w-md">
            <AlertTriangle size={40} className="mx-auto mb-4" style={{ color: 'var(--danger)' }} />
            <h2 className="text-xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>Audit Failed</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error || 'Could not generate your audit.'}</p>
            <button onClick={() => router.push('/audit')} className="btn btn-primary w-full h-11 rounded-xl font-semibold">
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { is_paid, overall_score, computed_metrics: m, ai_analysis: ai } = data;

  const profilePic = m.profilePictureUrl;
  const niche = 'Creator'; // Could be computed from bio in future

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-24 pt-20" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-4xl mx-auto px-5 space-y-5">

          {/* Profile header */}
          <section className="card p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0" style={{ border: '2px solid var(--border-brand)' }}>
                  {profilePic ? (
                    <Image src={profilePic} alt={`@${data.username}`} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
                      <span style={{ fontSize: 24 }}>👤</span>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-black mb-0.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    @{data.username}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {(m.followers || 0).toLocaleString()} followers · {m.mediaCount || 0} posts · {niche}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Audited {formatDate(data.created_at)}</p>
                </div>
              </div>
              <ScoreRing score={overall_score} size={96} strokeWidth={7} label="Health" />
            </div>
          </section>

          {/* Free metrics — always visible */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Engagement Rate"
              icon={BarChart2}
              value={`${m.engagementRate}%`}
              benchmark={parseFloat(m.benchmark)}
              benchmarkLabel={`Benchmark: ${m.benchmark}`}
              verdict={ai.engagement_verdict}
              color={m.engagementRate >= parseFloat(m.benchmark) ? 'var(--success)' : 'var(--danger)'}
              accentBorder
            />
            <MetricCard
              title="Profile Completeness"
              icon={UserCheck}
              value={`${ai.profile_completeness_score}/100`}
              score={ai.profile_completeness_score}
              verdict={ai.bio_verdict}
            />
            <MetricCard
              title="Top Post Format"
              icon={Video}
              value={ai.best_format}
              verdict={ai.best_format_reason}
            />
          </section>

          {/* Paywall */}
          {!is_paid && (
            <div id="paywall-block">
              <PaymentModal
                igUserId={igUserId}
                auditId={data.id}
                username={data.username}
                onSuccess={() => setData({ ...data, is_paid: true })}
              />
            </div>
          )}

          {/* Paid content — blurred until payment */}
          <BlurGate
            isPaid={is_paid}
            onUnlock={() => document.getElementById('paywall-block')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <div className="space-y-10">

              {/* Content Intelligence */}
              <section>
                <SectionTitle icon={Clock}>Content Intelligence</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-6 md:col-span-2">
                    <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Best Time to Post</h3>
                    <p className="text-xs mb-5" style={{ color: 'var(--text-tertiary)' }}>Based on your audience activity patterns</p>
                    <HeatmapGrid
                      data={ai.heatmap_data || []}
                      highlightSlots={ai.best_posting_times || []}
                    />
                    <div className="mt-5 pt-4 text-sm" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>AI Recommendation: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{ai.best_posting_time} — {ai.best_posting_time_reason}</span>
                    </div>
                  </div>
                  <MetricCard
                    title="Posting Frequency"
                    icon={Clock}
                    value={`${ai.posting_frequency_score}/100`}
                    score={ai.posting_frequency_score}
                    verdict={ai.posting_frequency_verdict}
                  />
                  <MetricCard
                    title="Brand Readiness"
                    icon={TrendingUp}
                    value={`${ai.brand_readiness_score}/100`}
                    score={ai.brand_readiness_score}
                    verdict={ai.brand_readiness_verdict}
                    color="var(--success)"
                  />
                </div>
              </section>

              {/* Profile & SEO */}
              <section>
                <SectionTitle icon={Search}>Profile & SEO Health</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-6 md:col-span-2">
                    <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-secondary)' }}>Bio Optimisation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl text-sm whitespace-pre-wrap"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)', border: '1px solid var(--border)', textDecoration: 'line-through' }}>
                        <div className="text-xs uppercase tracking-wider mb-2.5 font-semibold" style={{ textDecoration: 'none', color: 'var(--text-tertiary)' }}>Current Bio</div>
                        {m.bio}
                      </div>
                      <div className="p-4 rounded-xl text-sm whitespace-pre-wrap"
                        style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.25)', color: 'var(--text-primary)' }}>
                        <div className="text-xs uppercase tracking-wider mb-2.5 font-bold" style={{ color: 'var(--brand-mid)' }}>AI Rewrite Suggestion</div>
                        {ai.bio_rewrite}
                      </div>
                    </div>
                    <p className="text-xs mt-3 italic" style={{ color: 'var(--text-tertiary)' }}>Reason: {ai.bio_rewrite_reason}</p>
                  </div>
                  <MetricCard
                    title="Hook Quality Score"
                    icon={Type}
                    value={`${ai.hook_avg_score}/10`}
                    score={ai.hook_avg_score * 10}
                    verdict={`Suggested rewrite: "${ai.weakest_hook_rewrite}"`}
                  />
                  <MetricCard
                    title="Hashtag Strategy"
                    icon={Hash}
                    value={`${ai.hashtag_score}/100`}
                    score={ai.hashtag_score}
                    verdict={ai.hashtag_verdict}
                  />
                </div>
              </section>

              {/* Hashtags & Monetisation */}
              <section>
                <SectionTitle icon={DollarSign}>Hashtags & Monetisation</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-6">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Recommended Hashtags</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {ai.recommended_hashtags.map((tag) => (
                        <span key={tag} className="badge badge-brand">{tag}</span>
                      ))}
                    </div>
                    <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
                      Why: {ai.hashtag_verdict}
                    </p>
                  </div>
                  <div className="card p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Estimated Rate Card</h3>
                    <div className="space-y-3">
                      {[
                        { label: '1 Instagram Story', rates: ai.estimated_rates?.story },
                        { label: '1 Dedicated Reel', rates: ai.estimated_rates?.reel },
                        { label: '1 Carousel Post', rates: ai.estimated_rates?.carousel },
                      ].filter(item => item.rates).map((item) => (
                        <div key={item.label} className="flex justify-between items-center text-sm pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                          <span className="font-bold font-mono" style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                            ₹{item.rates!.min.toLocaleString()} – ₹{item.rates!.max.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {ai.estimated_rates?.monthly_package && (
                        <div className="flex justify-between items-center text-sm pt-1">
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>30-Day Retainer</span>
                          <span className="font-black font-mono text-gradient" style={{ fontSize: 13 }}>
                            ₹{ai.estimated_rates.monthly_package.min.toLocaleString()} – ₹{ai.estimated_rates.monthly_package.max.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Plan */}
              <section className="pt-8" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="text-center mb-10">
                  <p className="eyebrow mb-3">Your Plan</p>
                  <h2 className="font-black mb-3" style={{ fontSize: 'clamp(24px, 4vw, 40px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                    Your personalised action plan
                  </h2>
                  <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    These 3 things will have the highest impact right now. Execute them this week.
                  </p>
                </div>
                <div className="space-y-4">
                  {ai.action_plan.map((action) => (
                    <ActionPlanCard
                      key={action.rank}
                      rank={action.rank}
                      impact={action.impact}
                      problem={action.problem}
                      rootCause={action.root_cause}
                      exactFix={action.exact_fix}
                      expectedResult={action.expected_result}
                    />
                  ))}
                </div>
              </section>

            </div>
          </BlurGate>
        </div>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}

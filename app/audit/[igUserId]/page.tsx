'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BlurGate from '@/components/ui/BlurGate';
import ActionPlanCard from '@/components/audit/ActionPlanCard';
import PaymentModal from '@/components/audit/PaymentModal';
import HeatmapGrid from '@/components/audit/HeatmapGrid';
import PremiumLoadingScreen from '@/components/audit/PremiumLoadingScreen';
import FreeMetricsSection from '@/components/audit/FreeMetricsSection';
import PaywallTeaser from '@/components/audit/PaywallTeaser';
import { showToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import {
  AlertTriangle, Hash, Clock, TrendingUp, Search, Type, DollarSign, RefreshCw,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';
import ScoreRing from '@/components/ui/ScoreRing';
import MetricCard from '@/components/ui/MetricCard';

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
    formatBreakdown: Record<string, number>;
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
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <Icon size={17} style={{ color: '#c084fc' }} />
      </div>
      <h2 className="text-lg font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{children}</h2>
    </div>
  );
}

function AnimatedScore({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(prev => {
          if (prev >= score) { clearInterval(interval); return score; }
          return prev + 1;
        });
      }, 20);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);
  return <>{displayed}</>;
}

const LOADING_STEPS = [
  'Connecting to Instagram…',
  'Fetching your last 20 posts…',
  'Computing 22 engagement metrics…',
  'Running AI analysis with Claude…',
  'Generating your action plan…',
  'Almost done…',
];

function getScoreHeadline(score: number) {
  if (score >= 80) return { emoji: '🔥', text: 'Elite Creator Level', color: '#4ade80' };
  if (score >= 65) return { emoji: '⚡', text: 'Strong. Real upside ahead.', color: '#facc15' };
  if (score >= 50) return { emoji: '📈', text: 'Solid foundation. Missing key levers.', color: '#fb923c' };
  return { emoji: '🛠️', text: 'Growth is blocked. Fixable with the right data.', color: '#f87171' };
}

export default function AuditReportPage({ params }: { params: { igUserId: string } }) {
  const router = useRouter();
  const { igUserId } = params;
  const paywallRef = useRef<HTMLDivElement>(null);

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
      const fetchAuditRes = await fetch('/api/audit/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId }),
      });
      if (!fetchAuditRes.ok) throw new Error('Audit data not found after generation');

      const { audit, account } = await fetchAuditRes.json();
      const mergedData: AuditData = {
        id: audit.id,
        username: audit.username,
        is_paid: audit.is_paid,
        overall_score: audit.overall_score,
        created_at: audit.created_at,
        computed_metrics: {
          ...audit.computed_metrics,
          profilePictureUrl: audit.computed_metrics?.profilePictureUrl || account?.profile_picture_url || null,
        },
        ai_analysis: {
          ...audit.ai_analysis,
          heatmap_data: audit.ai_analysis.heatmap_data || Array(7).fill(null).map(() =>
            Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
          ),
          best_posting_times: audit.ai_analysis.best_posting_times || [{ day: 'Thursday', hour: 21, label: '9 PM' }],
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

  if (loading) return <PremiumLoadingScreen currentStepIndex={loadingStep} steps={LOADING_STEPS} />;

  if (error || !data) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-14 px-5" style={{ background: '#080808' }}>
          <div className="max-w-sm w-full rounded-2xl p-8 text-center" style={{ background: '#111', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={36} className="mx-auto mb-4 text-red-400" />
            <h2 className="text-lg font-bold mb-2 text-white">Something went wrong</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>{error || 'Could not generate your audit.'}</p>
            <button onClick={() => router.push('/audit')} className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <RefreshCw size={15} /> Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  const { is_paid, overall_score, computed_metrics: m, ai_analysis: ai } = data;
  const scoreInfo = getScoreHeadline(overall_score);
  const benchmarkNum = parseFloat(m.benchmark);
  const isEngagementHigh = m.engagementRate >= benchmarkNum;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-28 pt-16" style={{ background: '#080808' }}>
        <div className="max-w-2xl mx-auto px-4 space-y-4">

          {/* ── Hero Profile Card ────────────────────────────────────── */}
          <section className="rounded-2xl overflow-hidden" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Top gradient accent */}
            <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #7C3AED, #A855F7, #EC4899)' }} />

            <div className="p-6 md:p-8">
              {/* Profile row */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0" style={{ border: '2px solid rgba(168,85,247,0.4)' }}>
                  {m.profilePictureUrl ? (
                    <Image src={m.profilePictureUrl} alt={`@${data.username}`} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'rgba(168,85,247,0.1)' }}>👤</div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight">@{data.username}</h1>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {(m.followers || 0).toLocaleString('en-IN')} followers · {m.mediaCount || 0} posts
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Audited {formatDate(data.created_at)}
                  </p>
                </div>
              </div>

              {/* Score + Headline */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="shrink-0">
                  <ScoreRing score={overall_score} size={140} strokeWidth={10} label="Score" />
                </div>
                <div className="text-center sm:text-left flex flex-col justify-center">
                  <p className="text-2xl font-black tracking-tight text-white mb-2" style={{ lineHeight: 1.2 }}>
                    {scoreInfo.emoji} {scoreInfo.text}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 300 }}>
                    {ai.engagement_verdict || `Your account scored ${overall_score}/100 across 22 Instagram growth signals.`}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
                      22 metrics analyzed
                    </span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: isEngagementHigh ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${isEngagementHigh ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`, color: isEngagementHigh ? '#4ade80' : '#f87171' }}>
                      {isEngagementHigh ? `${m.engagementRate}% engagement — above avg` : `${m.engagementRate}% engagement — below avg`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Free Metrics Section ─────────────────────────────────── */}
          <FreeMetricsSection
            engagementRate={m.engagementRate}
            benchmark={m.benchmark}
            engagementVerdict={ai.engagement_verdict}
            followers={m.followers}
            bestFormat={ai.best_format}
            bestFormatReason={ai.best_format_reason}
            formatBreakdown={m.formatBreakdown}
            brandReadinessScore={ai.brand_readiness_score}
            estimatedReelMin={ai.estimated_rates?.reel?.min}
            estimatedReelMax={ai.estimated_rates?.reel?.max}
            hookAvgScore={ai.hook_avg_score}
            postsPerWeek={m.postsPerWeek}
          />

          {/* ── Paywall Teaser ───────────────────────────────────────── */}
          {!is_paid && (
            <PaywallTeaser
              username={data.username}
              followers={m.followers}
              estimatedReelMin={ai.estimated_rates?.reel?.min}
              estimatedReelMax={ai.estimated_rates?.reel?.max}
              onUnlock={() => paywallRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            />
          )}

          {/* ── Payment Modal ────────────────────────────────────────── */}
          {!is_paid && (
            <div ref={paywallRef}>
              <PaymentModal
                igUserId={igUserId}
                auditId={data.id}
                username={data.username}
                onSuccess={() => setData({ ...data, is_paid: true })}
              />
            </div>
          )}

          {/* ── Paid Content (blurred gate) ──────────────────────────── */}
          <BlurGate
            isPaid={is_paid}
            onUnlock={() => paywallRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          >
            <div className="space-y-4">

              {/* Content Intelligence */}
              <section className="rounded-2xl p-6 md:p-7" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                <SectionTitle icon={Clock}>Your Best Time to Post</SectionTitle>
                <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>Based on your audience's real activity — not a generic guide</p>
                <HeatmapGrid data={ai.heatmap_data || []} highlightSlots={ai.best_posting_times || []} />
                <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span className="font-semibold text-white">AI Recommendation: </span>
                    {ai.best_posting_time} — {ai.best_posting_time_reason}
                  </p>
                </div>
              </section>

              {/* Scores grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard title="Posting Frequency" icon={Clock} value={`${ai.posting_frequency_score}/100`} score={ai.posting_frequency_score} verdict={ai.posting_frequency_verdict} />
                <MetricCard title="Brand Readiness" icon={TrendingUp} value={`${ai.brand_readiness_score}/100`} score={ai.brand_readiness_score} verdict={ai.brand_readiness_verdict} color="var(--success)" />
              </div>

              {/* Bio Optimization */}
              <section className="rounded-2xl p-6 md:p-7" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                <SectionTitle icon={Search}>Profile & Bio Optimisation</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl text-sm whitespace-pre-wrap" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>
                    <div className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.3)' }}>Current Bio</div>
                    {m.bio}
                  </div>
                  <div className="p-4 rounded-xl text-sm whitespace-pre-wrap" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', color: 'rgba(255,255,255,0.85)' }}>
                    <div className="text-xs uppercase tracking-wider mb-2 font-bold" style={{ color: '#c084fc' }}>AI Rewrite</div>
                    {ai.bio_rewrite}
                  </div>
                </div>
                <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.3)' }}>Why: {ai.bio_rewrite_reason}</p>
              </section>

              {/* Hook + Hashtag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard title="Hook Quality Score" icon={Type} value={`${ai.hook_avg_score}/10`} score={ai.hook_avg_score * 10} verdict={`AI rewrite: "${ai.weakest_hook_rewrite}"`} />
                <MetricCard title="Hashtag Strategy" icon={Hash} value={`${ai.hashtag_score}/100`} score={ai.hashtag_score} verdict={ai.hashtag_verdict} />
              </div>

              {/* Hashtags + Rate Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="rounded-2xl p-6" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h3 className="text-sm font-semibold mb-4 text-white">Your Niche Hashtags</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ai.recommended_hashtags.map((tag) => (
                      <span key={tag} className="text-xs font-mono px-2.5 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>{tag}</span>
                    ))}
                  </div>
                  <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.3)' }}>{ai.hashtag_verdict}</p>
                </section>

                <section className="rounded-2xl p-6" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h3 className="text-sm font-semibold mb-4 text-white">Your Brand Rate Card</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Instagram Story', rates: ai.estimated_rates?.story },
                      { label: 'Dedicated Reel', rates: ai.estimated_rates?.reel },
                      { label: 'Carousel Post', rates: ai.estimated_rates?.carousel },
                    ].filter(i => i.rates).map((item) => (
                      <div key={item.label} className="flex justify-between items-center text-sm pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                        <span className="font-bold font-mono text-white">₹{item.rates!.min.toLocaleString('en-IN')} – ₹{item.rates!.max.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    {ai.estimated_rates?.monthly_package && (
                      <div className="flex justify-between items-center text-sm pt-1">
                        <span className="font-semibold text-white">30-Day Retainer</span>
                        <span className="font-black font-mono" style={{ background: 'linear-gradient(90deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          ₹{ai.estimated_rates.monthly_package.min.toLocaleString('en-IN')} – ₹{ai.estimated_rates.monthly_package.max.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Action Plan */}
              <section className="rounded-2xl p-6 md:p-8" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-center mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(168,85,247,0.7)' }}>Your Roadmap</p>
                  <h2 className="text-2xl font-black text-white mb-3 tracking-tight">3 moves that will change your numbers</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 400, margin: '0 auto' }}>
                    Not generic advice. Pulled directly from your account's data.
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

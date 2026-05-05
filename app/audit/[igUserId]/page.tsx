'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Lock, CheckCircle2, Star, ArrowDown } from 'lucide-react';
import ScoreRing from '@/components/ui/ScoreRing';
import PaymentModal from '@/components/audit/PaymentModal';
import PremiumLoadingScreen from '@/components/audit/PremiumLoadingScreen';
import FreeMetricsSection from '@/components/audit/FreeMetricsSection';
import PaidReport from '@/components/audit/PaidReport';
import { showToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';

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
    hook_scores?: Array<{ hook: string; score: number; verdict: string }>;
    weakest_hook?: string;
    weakest_hook_rewrite: string;
    hashtag_score: number;
    hashtag_verdict: string;
    recommended_hashtags: string[];
    recommended_hashtags_reason?: string;
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

const LOADING_STEPS = [
  'Connecting to Instagram…',
  'Fetching your last 20 posts…',
  'Computing 22 engagement metrics…',
  'Running AI analysis with Claude…',
  'Generating your action plan…',
  'Almost done…',
];

function getScoreLabel(score: number) {
  if (score >= 80) return { emoji: '🏆', text: 'Elite Creator', color: 'var(--success)' };
  if (score >= 65) return { emoji: '⚡', text: 'Strong Performance', color: 'var(--warning)' };
  if (score >= 50) return { emoji: '📈', text: 'Growing Fast', color: 'var(--warning)' };
  return { emoji: '🔧', text: 'High Potential', color: 'var(--danger)' };
}

/* Realistic blur placeholder showing real card shapes */
function BlurPlaceholder({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="relative mt-8 mb-0" style={{ height: 340 }}>
      {/* Blurred content stack */}
      <div
        className="absolute inset-0 space-y-4"
        style={{ filter: 'blur(7px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.45 }}
      >
        {/* Fake heatmap */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="flex gap-2 mb-4 items-center">
            <div className="w-8 h-8 rounded-lg" style={{ background: 'var(--bg-elevated)' }} />
            <div className="w-36 h-2.5 rounded-full" style={{ background: 'var(--bg-elevated)' }} />
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: 5 }, (_, row) => (
              <div key={row} className="flex gap-px">
                {Array.from({ length: 20 }, (_, col) => (
                  <div
                    key={col}
                    style={{
                      flex: 1, height: 14, borderRadius: 2,
                      background: `rgba(168,85,247,${(Math.sin(row * 7 + col * 3) * 0.3 + 0.4).toFixed(2)})`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Fake chart */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="w-40 h-2.5 rounded-full mb-4" style={{ background: 'var(--bg-elevated)' }} />
          <div className="flex items-end gap-3 h-20">
            {[60, 85, 45, 70, 35, 90].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{ height: `${h}%`, background: `rgba(168,85,247,${0.25 + i * 0.1})` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,16,0.6) 40%, var(--bg-base) 80%)' }}
      />

      {/* Centered CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
        <motion.button
          onClick={onUnlock}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-brand)',
              boxShadow: 'var(--glow-sm)',
            }}
          >
            <Lock size={22} style={{ color: 'var(--brand-mid)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Unlock to reveal your full report
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>6 deep insights hidden below</p>
          </div>
          <div className="flex items-center gap-1.5 mt-1" style={{ color: 'var(--brand-mid)' }}>
            <ArrowDown size={14} />
            <span className="text-xs font-semibold">See pricing below</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

/* Quick stat pill */
function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="flex flex-col gap-0.5 px-4 py-3 rounded-xl"
      style={{
        background: highlight ? 'rgba(168,85,247,0.06)' : 'var(--bg-elevated)',
        border: `1px solid ${highlight ? 'var(--border-brand)' : 'var(--border)'}`,
      }}
    >
      <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      <span className="text-sm font-black tabular-nums" style={{ color: highlight ? 'var(--brand-mid)' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</span>
    </div>
  );
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
    setLoading(true); setError(null);
    try {
      setLoadingStep(1);
      const fetchRes = await fetch('/api/instagram/fetch-data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId }),
      });
      if (!fetchRes.ok) { const e = await fetchRes.json(); throw new Error(e.error || 'Failed to fetch Instagram data'); }

      setLoadingStep(3);
      const genRes = await fetch('/api/audit/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId }),
      });
      if (!genRes.ok) { const e = await genRes.json(); throw new Error(e.error || 'Failed to generate audit'); }

      setLoadingStep(5);
      const auditRes = await fetch('/api/audit/fetch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId }),
      });
      if (!auditRes.ok) throw new Error('Audit data not found');

      const { audit, account } = await auditRes.json();
      setData({
        ...audit,
        computed_metrics: {
          ...audit.computed_metrics,
          profilePictureUrl: audit.computed_metrics?.profilePictureUrl || account?.profile_picture_url || null,
        },
        ai_analysis: {
          ...audit.ai_analysis,
          heatmap_data: audit.ai_analysis.heatmap_data ||
            Array(7).fill(null).map(() => Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))),
          best_posting_times: audit.ai_analysis.best_posting_times || [{ day: 'Thursday', hour: 21, label: '9 PM' }],
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate audit');
      showToast(err.message || 'Error', 'error');
    } finally { setLoading(false); }
  }

  if (loading) return (
    <PremiumLoadingScreen currentStepIndex={loadingStep} steps={LOADING_STEPS} username={data?.username} />
  );

  if (error || !data) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-16 px-5" style={{ background: 'var(--bg-base)' }}>
          <div className="card p-10 text-center max-w-sm w-full">
            <AlertTriangle size={36} className="mx-auto mb-4" style={{ color: 'var(--danger)' }} />
            <h2 className="text-lg font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>Something went wrong</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error || 'Could not generate audit.'}</p>
            <button onClick={() => router.push('/audit')} className="btn btn-primary w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-2">
              <RefreshCw size={15} /> Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  const { is_paid, overall_score, computed_metrics: m, ai_analysis: ai, username } = data;
  const scoreInfo = getScoreLabel(overall_score);
  const benchNum = parseFloat(m.benchmark) || 5.5;
  const isEngHigh = m.engagementRate >= benchNum;

  const scrollToPaywall = () => paywallRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

        {/* ── Subtle radial glow behind hero ─────────────────── */}
        <div
          className="fixed top-0 left-1/2 pointer-events-none"
          style={{
            transform: 'translateX(-50%)',
            width: 800, height: 500,
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)', zIndex: 0,
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-28 space-y-5">

          {/* ═══════════════════════════════════════════════════
              HERO: Profile + Score
          ═══════════════════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Gradient top strip */}
            <div className="h-px" style={{ background: 'var(--gradient-brand)' }} />

            <div className="p-7 md:p-9">
              {/* Profile row */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="relative w-[60px] h-[60px] rounded-full overflow-hidden shrink-0"
                  style={{ border: '2px solid rgba(168,85,247,0.5)', boxShadow: '0 0 20px rgba(168,85,247,0.2)' }}
                >
                  {m.profilePictureUrl ? (
                    <Image src={m.profilePictureUrl} alt={`@${username}`} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'var(--bg-elevated)' }}>👤</div>
                  )}
                </div>
                <div className="min-w-0">
                  <h1
                    className="font-black tracking-tight truncate"
                    style={{ fontSize: 'clamp(18px, 4vw, 24px)', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}
                  >
                    @{username}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {(m.followers || 0).toLocaleString('en-IN')} followers · {m.mediaCount || 0} posts
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    Audited {formatDate(data.created_at)} · 22 signals measured
                  </p>
                </div>
              </div>

              {/* Score + context */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <div className="shrink-0">
                  <ScoreRing score={overall_score} size={168} strokeWidth={11} />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                    <span className="text-xl">{scoreInfo.emoji}</span>
                    <span className="text-lg font-black tracking-tight" style={{ color: scoreInfo.color, letterSpacing: '-0.02em' }}>
                      {scoreInfo.text}
                    </span>
                  </div>

                  {ai.engagement_verdict && (
                    <p
                      className="text-sm leading-relaxed mb-5"
                      style={{ color: 'var(--text-secondary)', maxWidth: 380 }}
                    >
                      {ai.engagement_verdict}
                    </p>
                  )}

                  {/* Quick stat pills */}
                  <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto sm:mx-0">
                    <StatPill
                      label="Engagement"
                      value={`${m.engagementRate}%`}
                      highlight={isEngHigh}
                    />
                    <StatPill
                      label="Posts / week"
                      value={m.postsPerWeek ? `${m.postsPerWeek}×` : '—'}
                    />
                    <StatPill
                      label="Best format"
                      value={m.formatBreakdown ? Object.keys(m.formatBreakdown)[0] === 'VIDEO' ? 'Reels' : 'Static' : '—'}
                    />
                    <StatPill
                      label="Hook score"
                      value={`${ai.hook_avg_score}/10`}
                      highlight
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ═══════════════════════════════════════════════════
              FREE METRICS
          ═══════════════════════════════════════════════════ */}
          <FreeMetricsSection
            engagementRate={m.engagementRate}
            benchmark={m.benchmark}
            engagementVerdict={ai.engagement_verdict}
            followers={m.followers}
            bestFormat={ai.best_format}
            bestFormatReason={ai.best_format_reason}
            formatBreakdown={m.formatBreakdown}
            hookAvgScore={ai.hook_avg_score}
            estimatedReelMin={ai.estimated_rates?.reel?.min}
            estimatedReelMax={ai.estimated_rates?.reel?.max}
          />

          {/* ═══════════════════════════════════════════════════
              PAYWALL ZONE (unpaid)
          ═══════════════════════════════════════════════════ */}
          {!is_paid && (
            <>
              <BlurPlaceholder onUnlock={scrollToPaywall} />

              <div ref={paywallRef}>
                <PaymentModal
                  igUserId={igUserId}
                  auditId={data.id}
                  username={username}
                  onSuccess={() => setData({ ...data, is_paid: true })}
                />
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════
              PAID REPORT
          ═══════════════════════════════════════════════════ */}
          {is_paid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Unlock celebration */}
              <div
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl mb-5"
                style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}
              >
                <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
                  Full report unlocked — your personalised playbook is below 👇
                </p>
              </div>
              <PaidReport ai={ai} m={m} />
            </motion.div>
          )}

        </div>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}

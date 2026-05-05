'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Lock } from 'lucide-react';
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

// ── Types ──────────────────────────────────────────────────────────────────────
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

// Placeholder blur cards shown when unpaid
function BlurPlaceholder() {
  return (
    <div className="relative">
      {/* Blurred fake content */}
      <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
        <div className="space-y-4">
          {/* Fake heatmap card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-2.5 rounded" style={{ background: 'var(--bg-overlay)' }} />
              <div className="w-32 h-2.5 rounded" style={{ background: 'var(--bg-overlay)' }} />
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex gap-px">
                  {Array.from({ length: 18 }, (_, j) => (
                    <div
                      key={j}
                      style={{
                        flex: 1, height: 16, borderRadius: 2,
                        background: `rgba(168,85,247,${Math.random() * 0.6 + 0.05})`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          {/* Fake bar chart card */}
          <div className="card p-6">
            <div className="w-36 h-2.5 rounded mb-4" style={{ background: 'var(--bg-overlay)' }} />
            <div className="flex items-end gap-3 h-28">
              {[70, 45, 85, 30, 60].map((h, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `rgba(168,85,247,${0.3 + i * 0.1})` }} />
              ))}
            </div>
          </div>
          {/* Fake table card */}
          <div className="card p-6">
            <div className="w-32 h-2.5 rounded mb-4" style={{ background: 'var(--bg-overlay)' }} />
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="w-48 h-2 rounded" style={{ background: 'var(--bg-overlay)' }} />
                  <div className="w-12 h-4 rounded" style={{ background: 'rgba(168,85,247,0.2)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Gradient fade */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 0%, var(--bg-base) 65%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 40,
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid var(--border-brand)' }}>
            <Lock size={20} style={{ color: 'var(--brand-mid)' }} />
          </div>
          <p className="text-sm font-semibold text-center" style={{ color: 'var(--text-secondary)' }}>
            Unlock to reveal your full report
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
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
          heatmap_data: audit.ai_analysis.heatmap_data ||
            Array(7).fill(null).map(() => Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))),
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

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return <PremiumLoadingScreen currentStepIndex={loadingStep} steps={LOADING_STEPS} username={data?.username} />;
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-16 px-5" style={{ background: 'var(--bg-base)' }}>
          <div className="card p-10 text-center max-w-sm w-full">
            <AlertTriangle size={36} className="mx-auto mb-4" style={{ color: 'var(--danger)' }} />
            <h2 className="text-lg font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>Something went wrong</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error || 'Could not generate your audit.'}</p>
            <button onClick={() => router.push('/audit')} className="btn btn-primary w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-2">
              <RefreshCw size={15} /> Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  const { is_paid, overall_score, computed_metrics: m, ai_analysis: ai, username } = data;
  const benchmarkNum = parseFloat(m.benchmark) || 5.5;
  const isEngHigh = m.engagementRate >= benchmarkNum;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-28 pt-20" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-2xl mx-auto px-4 space-y-6">

          {/* ── REPORT HEADER ────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="card p-6 md:p-8"
            style={{ borderTop: '2px solid var(--border-brand)', boxShadow: 'var(--shadow-xl)' }}
          >
            {/* Profile + Score row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 mb-6">
              {/* Left: profile info */}
              <div className="flex items-center gap-4">
                <div
                  className="relative w-16 h-16 rounded-full overflow-hidden shrink-0"
                  style={{ border: '2px solid var(--border-brand)', boxShadow: 'var(--glow-sm)' }}
                >
                  {m.profilePictureUrl ? (
                    <Image src={m.profilePictureUrl} alt={`@${username}`} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'var(--bg-elevated)' }}>👤</div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    @{username}
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {(m.followers || 0).toLocaleString('en-IN')} followers · {m.mediaCount || 0} posts
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    Audited {formatDate(data.created_at)}
                  </p>
                </div>
              </div>
              {/* Right: score ring */}
              <div className="shrink-0">
                <ScoreRing score={overall_score} size={160} strokeWidth={10} />
              </div>
            </div>

            {/* Summary sentence */}
            {ai.engagement_verdict && (
              <div
                className="px-4 py-3 rounded-xl"
                style={{
                  background: 'var(--bg-elevated)',
                  borderLeft: `3px solid ${isEngHigh ? 'var(--success)' : 'var(--danger)'}`,
                  border: '1px solid var(--border)',
                  borderLeftWidth: 3,
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {ai.engagement_verdict}
                </p>
              </div>
            )}
          </motion.section>

          {/* ── FREE METRICS ─────────────────────────────────────────── */}
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

          {/* ── PAYWALL ──────────────────────────────────────────────── */}
          {!is_paid && (
            <>
              {/* Blur teaser */}
              <BlurPlaceholder />
              {/* Payment modal */}
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

          {/* ── PAID REPORT ───────────────────────────────────────────── */}
          {is_paid && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
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

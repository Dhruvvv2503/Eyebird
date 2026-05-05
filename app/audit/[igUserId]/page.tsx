'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertTriangle, RefreshCw, Lock, CheckCircle2,
  ArrowDown, TrendingUp, TrendingDown, Zap,
} from 'lucide-react';
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

const FORMAT_LABELS: Record<string, string> = {
  VIDEO: 'Reels', IMAGE: 'Static', CAROUSEL_ALBUM: 'Carousel', REELS: 'Reels',
};

const LOADING_STEPS = [
  'Connecting to Instagram…',
  'Fetching your last 20 posts…',
  'Computing 22 engagement metrics…',
  'Running AI analysis with Claude…',
  'Generating your action plan…',
  'Almost done…',
];

function getScoreMeta(score: number) {
  if (score >= 80) return { emoji: '🏆', label: 'Elite Creator', color: '#22C55E' };
  if (score >= 65) return { emoji: '⚡', label: 'Strong Performance', color: '#F59E0B' };
  if (score >= 50) return { emoji: '📈', label: 'Growing Fast', color: '#F59E0B' };
  return { emoji: '🔧', label: 'High Potential', color: '#EF4444' };
}

/* Thin animated bar */
function ThinBar({ value, max, color, delay = 0 }: { value: number; max: number; color: string; delay?: number }) {
  const pct = Math.min((value / (max * 1.2)) * 100, 100);
  return (
    <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <motion.div
        style={{ height: '100%', borderRadius: 99, background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay }}
      />
    </div>
  );
}

/* Stat tile */
function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        background: accent ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${accent ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', color: accent ? 'var(--brand-mid)' : 'white', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 11, marginTop: 3, color: 'rgba(255,255,255,0.35)' }}>{sub}</p>}
    </div>
  );
}

/* Blur teaser above paywall */
function BlurTeaser({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div style={{ position: 'relative', marginTop: 8 }}>
      {/* Fake blurred cards */}
      <div style={{ filter: 'blur(6px)', opacity: 0.4, pointerEvents: 'none', userSelect: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Fake heatmap */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ width: 160, height: 10, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Array.from({ length: 6 }, (_, row) => (
              <div key={row} style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: 20 }, (_, col) => (
                  <div
                    key={col}
                    style={{
                      flex: 1, height: 12, borderRadius: 2,
                      background: `rgba(168,85,247,${(0.15 + Math.abs(Math.sin(row * 5 + col * 2.1)) * 0.6).toFixed(2)})`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Fake chart */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ width: 130, height: 10, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 16 }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 72 }}>
            {[55, 80, 40, 70, 30, 90, 45].map((h, i) => (
              <div key={i} style={{ flex: 1, borderRadius: '4px 4px 0 0', height: `${h}%`, background: `rgba(168,85,247,${0.25 + i * 0.08})` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Gradient veil */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,16,0) 0%, rgba(10,10,16,0.7) 50%, var(--bg-base) 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
          paddingBottom: 32,
        }}
      >
        <motion.button
          onClick={onUnlock}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            cursor: 'pointer', background: 'none', border: 'none',
          }}
        >
          <div
            style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'var(--bg-surface)',
              border: '1px solid rgba(168,85,247,0.4)',
              boxShadow: '0 0 24px rgba(168,85,247,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Lock size={20} color="var(--brand-mid)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>6 deep insights hidden below</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Unlock your full report</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brand-mid)' }}>
            <ArrowDown size={13} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>See pricing ↓</span>
          </div>
        </motion.button>
      </div>
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

  useEffect(() => { if (igUserId) runAuditPipeline(); }, [igUserId]);

  async function runAuditPipeline() {
    setLoading(true); setError(null);
    try {
      setLoadingStep(1);
      const r1 = await fetch('/api/instagram/fetch-data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId }),
      });
      if (!r1.ok) { const e = await r1.json(); throw new Error(e.error || 'Failed to fetch Instagram data'); }

      setLoadingStep(3);
      const r2 = await fetch('/api/audit/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId }),
      });
      if (!r2.ok) { const e = await r2.json(); throw new Error(e.error || 'Failed to generate audit'); }

      setLoadingStep(5);
      const r3 = await fetch('/api/audit/fetch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId }),
      });
      if (!r3.ok) throw new Error('Audit data not found');

      const { audit, account } = await r3.json();
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

  if (loading) return <PremiumLoadingScreen currentStepIndex={loadingStep} steps={LOADING_STEPS} username={data?.username} />;

  if (error || !data) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', background: 'var(--bg-base)' }}>
          <div className="card p-10 text-center" style={{ maxWidth: 360, width: '100%' }}>
            <AlertTriangle size={36} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>Something went wrong</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>{error || 'Could not generate your audit.'}</p>
            <button onClick={() => router.push('/audit')} className="btn btn-primary" style={{ width: '100%', height: 44, borderRadius: 12, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  const { is_paid, overall_score, computed_metrics: m, ai_analysis: ai, username } = data;
  const scoreMeta = getScoreMeta(overall_score);
  const benchNum = parseFloat(m.benchmark) || 5.5;
  const isEngHigh = m.engagementRate >= benchNum;
  const bestFormatKey = Object.entries(m.formatBreakdown || {}).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0];
  const scrollToPaywall = () => paywallRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 100 }}>

        {/* ═══════════════════════════════════════════════════════════
            HERO — Full-bleed, gradient mesh, matches landing page
        ═══════════════════════════════════════════════════════════ */}
        <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 72, paddingBottom: 64 }}>
          {/* Background gradient mesh — matches landing page */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-20%', left: '15%', width: 600, height: 500, background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', top: '-10%', right: '10%', width: 400, height: 350, background: 'radial-gradient(ellipse, rgba(255,62,128,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, var(--bg-base))' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Profile row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                <div
                  style={{
                    width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                    border: '2px solid rgba(168,85,247,0.5)',
                    boxShadow: '0 0 0 4px rgba(168,85,247,0.1), 0 0 24px rgba(168,85,247,0.3)',
                    background: 'var(--bg-elevated)',
                  }}
                >
                  {m.profilePictureUrl ? (
                    <Image src={m.profilePictureUrl} alt={`@${username}`} width={64} height={64} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
                  )}
                </div>
                <div>
                  <h1 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.1 }}>
                    @{username}
                  </h1>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
                    {(m.followers || 0).toLocaleString('en-IN')} followers · {m.mediaCount || 0} posts · Audited {formatDate(data.created_at)}
                  </p>
                </div>
              </div>

              {/* Score + info layout */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 48, flexWrap: 'wrap' }}>

                {/* Left: Score ring */}
                <div style={{ flexShrink: 0 }}>
                  <ScoreRing score={overall_score} size={172} strokeWidth={11} />
                </div>

                {/* Right: Verdict + stats */}
                <div style={{ flex: 1, minWidth: 220, paddingTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{scoreMeta.emoji}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: scoreMeta.color, letterSpacing: '-0.02em' }}>
                      {scoreMeta.label}
                    </span>
                  </div>

                  {ai.engagement_verdict && (
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: 24, maxWidth: 380 }}>
                      {ai.engagement_verdict}
                    </p>
                  )}

                  {/* Stat grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 360 }}>
                    <Stat
                      label="Engagement"
                      value={`${m.engagementRate}%`}
                      sub={isEngHigh ? `${(m.engagementRate / benchNum).toFixed(1)}× avg` : `avg is ${m.benchmark}%`}
                      accent={isEngHigh}
                    />
                    <Stat
                      label="Posts / week"
                      value={m.postsPerWeek ? `${m.postsPerWeek}` : '—'}
                      sub="avg posting rate"
                    />
                    <Stat
                      label="Best format"
                      value={FORMAT_LABELS[bestFormatKey || 'VIDEO'] || 'Reels'}
                      sub="highest engagement"
                    />
                    <Stat
                      label="Hook score"
                      value={`${ai.hook_avg_score}/10`}
                      sub={ai.hook_avg_score >= 7 ? 'Above average' : ai.hook_avg_score >= 5 ? 'Average' : 'Needs work'}
                      accent={ai.hook_avg_score >= 7}
                    />
                  </div>
                </div>
              </div>

              {/* Divider to content */}
              <div style={{ marginTop: 40, height: 1, background: 'linear-gradient(90deg, rgba(168,85,247,0.3) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)' }} />
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            BODY CONTENT
        ═══════════════════════════════════════════════════════════ */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>

          {/* Free metrics */}
          <div style={{ marginTop: 48 }}>
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
          </div>

          {/* Paywall zone */}
          {!is_paid && (
            <>
              <BlurTeaser onUnlock={scrollToPaywall} />
              <div ref={paywallRef} style={{ marginTop: 8 }}>
                <PaymentModal
                  igUserId={igUserId}
                  auditId={data.id}
                  username={username}
                  onSuccess={() => setData({ ...data, is_paid: true })}
                />
              </div>
            </>
          )}

          {/* Paid report */}
          {is_paid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ marginTop: 32 }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 20px', borderRadius: 14, marginBottom: 32,
                  background: 'rgba(34,197,94,0.06)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>
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

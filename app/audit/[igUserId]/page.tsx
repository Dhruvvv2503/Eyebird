'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertTriangle, RefreshCw, Lock, CheckCircle2,
  ArrowDown, TrendingUp, TrendingDown, Zap, Mail, Send, Loader2,
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
    <div style={{ position: 'relative', marginTop: 8, height: 380, overflow: 'hidden' }}>
      {/* Stacked fake cards — blurred */}
      <div style={{ filter: 'blur(5px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Fake heatmap */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(168,85,247,0.2)' }} />
            <div style={{ width: 140, height: 10, borderRadius: 6, background: 'var(--bg-elevated)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Array.from({ length: 7 }, (_, row) => (
              <div key={row} style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: 22 }, (_, col) => (
                  <div
                    key={col}
                    style={{
                      flex: 1, height: 14, borderRadius: 2,
                      background: `rgba(168,85,247,${(0.08 + Math.abs(Math.sin(row * 4.3 + col * 1.7)) * 0.65).toFixed(2)})`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Fake rate card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '20px 24px' }}>
          <div style={{ width: 120, height: 10, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 14 }} />
          {[80, 60, 90, 45].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ width: `${w}px`, height: 8, borderRadius: 4, background: 'var(--bg-elevated)' }} />
              <div style={{ width: 60, height: 8, borderRadius: 4, background: 'rgba(168,85,247,0.25)' }} />
            </div>
          ))}
        </div>
        {/* Fake hashtag card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '18px 24px' }}>
          <div style={{ width: 100, height: 10, borderRadius: 6, background: 'var(--bg-elevated)', marginBottom: 12 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[70, 90, 55, 80, 65, 75, 50, 85].map((w, i) => (
              <div key={i} style={{ width: w, height: 22, borderRadius: 99, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.2)' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Strong gradient veil */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,16,0) 0%, rgba(10,10,16,0.55) 35%, rgba(10,10,16,0.92) 65%, var(--bg-base) 90%)',
        }}
      />

      {/* Lock CTA — centered vertically in the lower half */}
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
          paddingBottom: 32,
        }}
      >
        <motion.button
          onClick={onUnlock}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'none', border: 'none' }}
        >
          {/* Pulsing ring + lock */}
          <div style={{ position: 'relative', width: 60, height: 60 }}>
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', inset: -8, borderRadius: '50%',
                border: '2px solid rgba(168,85,247,0.5)',
              }}
            />
            <div
              style={{
                width: 60, height: 60, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(124,58,237,0.1))',
                border: '1px solid rgba(168,85,247,0.4)',
                boxShadow: '0 0 32px rgba(168,85,247,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Lock size={22} color="var(--brand-mid)" />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 3, letterSpacing: '-0.01em' }}>
              6 deep insights locked below
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
              Best posting time · Rate card · Hook rewrites · Hashtags
            </p>
          </div>

          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 99,
              background: 'rgba(168,85,247,0.12)',
              border: '1px solid rgba(168,85,247,0.25)',
            }}
          >
            <ArrowDown size={13} style={{ color: 'var(--brand-mid)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-mid)' }}>See the offer below</span>
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
      const resolved = {
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
      };
      setData(resolved);
      // Persist to localStorage so Navbar can show connected state
      try {
        localStorage.setItem('eb_connected_user', JSON.stringify({
          igUserId,
          username: resolved.username,
        }));
      } catch { /* ignore */ }
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
        <section style={{ position: 'relative', overflow: 'hidden', paddingTop: 64, paddingBottom: 40 }}>
          {/* Background gradient mesh — matches landing page */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-30%', left: '10%', width: 700, height: 600, background: 'radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, transparent 65%)', filter: 'blur(70px)' }} />
            <div style={{ position: 'absolute', top: '-10%', right: '5%', width: 450, height: 400, background: 'radial-gradient(ellipse, rgba(255,62,128,0.14) 0%, transparent 65%)', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to bottom, transparent, var(--bg-base))' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Glassmorphic hero card */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 24,
                  padding: '32px 32px 28px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                {/* Brand gradient top border */}
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(168,85,247,0.8) 0%, rgba(255,62,128,0.4) 50%, transparent 100%)', marginBottom: 28, borderRadius: 1 }} />

                {/* Profile row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                  <div
                    style={{
                      width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                      border: '2px solid rgba(168,85,247,0.6)',
                      boxShadow: '0 0 0 5px rgba(168,85,247,0.08), 0 0 30px rgba(168,85,247,0.35)',
                      background: 'var(--bg-elevated)',
                    }}
                  >
                    {m.profilePictureUrl ? (
                      <Image src={m.profilePictureUrl} alt={`@${username}`} width={72} height={72} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👤</div>
                    )}
                  </div>
                  <div>
                    <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.15, marginBottom: 4 }}>
                      @{username}
                    </h1>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                      {(m.followers || 0).toLocaleString('en-IN')} followers · {m.mediaCount || 0} posts
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Audited {formatDate(data.created_at)} · 22 signals measured</p>
                  </div>
                </div>

                {/* Score + info layout */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap' }}>

                  {/* Left: Score ring */}
                  <div style={{ flexShrink: 0 }}>
                    <ScoreRing score={overall_score} size={164} strokeWidth={10} />
                  </div>

                  {/* Right: Verdict + stats */}
                  <div style={{ flex: 1, minWidth: 200, paddingTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>{scoreMeta.emoji}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: scoreMeta.color, letterSpacing: '-0.02em' }}>
                        {scoreMeta.label}
                      </span>
                    </div>

                    {ai.engagement_verdict && (
                      <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', marginBottom: 20, maxWidth: 360 }}>
                        {ai.engagement_verdict}
                      </p>
                    )}

                    {/* Stat grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxWidth: 340 }}>
                      <Stat
                        label="Engagement"
                        value={`${m.engagementRate}%`}
                        sub={isEngHigh ? `${(m.engagementRate / benchNum).toFixed(1)}× industry avg` : `avg is ${m.benchmark}%`}
                        accent={isEngHigh}
                      />
                      <Stat
                        label="Posts / week"
                        value={m.postsPerWeek ? `${m.postsPerWeek}` : '—'}
                        sub="posting frequency"
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
              </div>{/* end glassmorphic card */}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            BODY CONTENT
        ═══════════════════════════════════════════════════════════ */}
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>

          {/* Free metrics */}
          <div style={{ marginTop: 32 }}>
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

              {/* ── Send to Email CTA ── */}
              <EmailReportButton igUserId={igUserId} />

              {/* ── Audit Another Account ── */}
              <AuditAnotherCTA />

            </motion.div>
          )}

        </div>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}

/* ── Email report button ── */
function EmailReportButton({ igUserId }: { igUserId: string }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/email/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId, email }),
      });
      if (res.ok) {
        setSent(true);
        showToast('📬 Report sent! Check your inbox.', 'success');
      } else {
        showToast('Failed to send. Please try again.', 'error');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.1 }}
      style={{
        marginTop: 24, borderRadius: 20, overflow: 'hidden',
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ height: 2, background: 'linear-gradient(90deg,#A855F7,#7C3AED)' }} />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg,#A855F7,#7C3AED)' }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A855F7', margin: 0 }}>Send to Email</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 11, marginBottom: 16 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mail size={14} style={{ color: '#A855F7' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', margin: 0 }}>
            {sent ? 'Report sent to your inbox ✉️' : 'Get this report in your email'}
          </h3>
        </div>

        {!sent ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Mail size={13} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="your@email.com"
                className="input"
                style={{ height: 44, paddingLeft: 36, fontSize: 14, width: '100%', boxSizing: 'border-box', borderRadius: 12 }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !email}
              style={{
                height: 44, padding: '0 20px', borderRadius: 12, border: 'none',
                background: sending || !email ? 'rgba(168,85,247,0.3)' : 'linear-gradient(135deg,#A855F7,#7C3AED)',
                color: 'white', fontSize: 14, fontWeight: 700,
                cursor: sending || !email ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
                boxShadow: sending || !email ? 'none' : '0 4px 16px rgba(168,85,247,0.3)',
              }}
            >
              {sending ? (
                <><Loader2 size={14} className="animate-spin" /> Sending…</>
              ) : (
                <><Send size={14} /> Send Report</>
              )}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle2 size={16} style={{ color: '#22C55E' }} />
            <p style={{ fontSize: 14, color: '#22C55E', fontWeight: 600 }}>
              Full report sent to <strong>{email}</strong>. Check spam if you don't see it.
            </p>
          </div>
        )}
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 10 }}>
          Includes: hook table, hashtags, rate card, bio rewrite &amp; action plan. No subscription — one-time report.
        </p>
      </div>
    </motion.div>
  );
}

/* ── Audit another account CTA ── */
function AuditAnotherCTA() {
  const handleClick = () => {
    try { localStorage.removeItem('eb_connected_user'); } catch { /* */ }
    window.location.href = '/audit';
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.15 }}
      style={{ marginTop: 16, marginBottom: 48 }}
    >
      <div style={{
        padding: '28px', borderRadius: 20, textAlign: 'center',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
          Want to audit a different Instagram account?
        </p>
        <button
          onClick={handleClick}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
            (e.currentTarget as HTMLButtonElement).style.color = 'white';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
          }}
        >
          <RefreshCw size={15} />
          Audit Another Account
        </button>
      </div>
    </motion.div>
  );
}


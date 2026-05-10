'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown, Lock } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import PremiumLoadingScreen from '@/components/audit/PremiumLoadingScreen';
import FreeMetricsSection from '@/components/audit/FreeMetricsSection';
import PaymentModal from '@/components/audit/PaymentModal';
import PaidReport from '@/components/audit/PaidReport';

interface Props {
  igAccount: { ig_user_id: string; username: string; followers_count?: number; profile_picture_url?: string } | null;
  audits: any[];
  autoStart: boolean;
}

const LOADING_STEPS = [
  'Connected to Instagram',
  'Fetching your last 20 posts…',
  'Analysing engagement patterns…',
  'Scoring your content…',
  'Generating your action plan…',
];

const LOCKED_ITEMS = [
  { emoji: '📅', label: 'Best Time to Post Heatmap', hint: 'Hour-by-hour engagement heatmap for your audience' },
  { emoji: '🎣', label: 'Hook Quality Report', hint: 'Line-by-line hook analysis with AI rewrites' },
  { emoji: '#️⃣', label: 'Hashtag Strategy', hint: '30 targeted hashtags ranked by reach potential' },
  { emoji: '💰', label: 'Creator Rate Card', hint: 'What brands should actually pay you' },
  { emoji: '✍️', label: 'Bio Rewrite', hint: 'AI-optimized bio that converts profile visitors' },
  { emoji: '🗓️', label: '90-Day Action Plan', hint: 'Week-by-week growth roadmap personalized for you' },
];

const RING_R = 41;
const RING_CIRC = 2 * Math.PI * RING_R;

function ChapterDivider() {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        marginBlock: '48px',
        transformOrigin: 'left center',
      }}
    />
  );
}

export function DashboardAuditClient({ igAccount, audits, autoStart }: Props) {
  const router = useRouter();
  const [state, setState] = useState<'empty' | 'loading' | 'report' | 'history'>('empty');
  const [currentAudit, setCurrentAudit] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paidLoading, setPaidLoading] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (audits.length > 0) {
      setCurrentAudit(audits[0]);
      setIsPaid(audits[0]?.is_paid ?? false);
      setState('report');
    } else if (autoStart && igAccount) {
      startAudit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state !== 'loading') return;
    const interval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [state]);

  async function startAudit() {
    if (!igAccount) return;
    setState('loading');
    setLoadingStep(0);
    try {
      await fetch('/api/instagram/fetch-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId: igAccount.ig_user_id }),
      });
      setLoadingStep(2);

      const res = await fetch('/api/audit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId: igAccount.ig_user_id }),
      });
      const data = await res.json();

      if (data.success || data.audit) {
        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();
        const { data: audit } = await supabase
          .from('audits')
          .select('*')
          .eq('ig_user_id', igAccount.ig_user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        setCurrentAudit(audit);
        setIsPaid(audit?.is_paid ?? false);
        setState('report');
        router.replace('/dashboard/audit');
      } else {
        setState('empty');
      }
    } catch (err) {
      console.error('Audit failed:', err);
      setState('empty');
    }
  }

  async function handlePaymentSuccess() {
    setShowPaymentModal(false);
    setPaidLoading(true);
    try {
      if (igAccount) {
        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();
        const { data: audit } = await supabase
          .from('audits')
          .select('*')
          .eq('ig_user_id', igAccount.ig_user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (audit) setCurrentAudit(audit);
      }
    } catch (err) {
      console.error('Failed to reload audit after payment:', err);
    } finally {
      setPaidLoading(false);
      setIsPaid(true);
    }
  }

  /* ─── EMPTY ─────────────────────────────────────────────── */
  if (state === 'empty') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24, animation: 'pulse 3s ease-in-out infinite' }}>
          👁️
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 12, lineHeight: 1.2 }}>
          Ready to see your Instagram clearly?
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 32, maxWidth: 400, lineHeight: 1.6 }}>
          We&apos;ll analyse 22 things about your account in under 60 seconds.{!igAccount && ' Connect your Instagram account first.'}
        </p>
        {igAccount ? (
          <button
            onClick={startAudit}
            style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            Run my first audit →
          </button>
        ) : (
          <a href="/api/instagram/auth" style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
            Connect Instagram first →
          </a>
        )}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>🔒 Read-only access · Never posts · Official Instagram API</div>
      </div>
    );
  }

  /* ─── LOADING ────────────────────────────────────────────── */
  if (state === 'loading') {
    return (
      <PremiumLoadingScreen
        currentStepIndex={loadingStep}
        steps={LOADING_STEPS}
        username={igAccount?.username}
      />
    );
  }

  /* ─── REPORT ─────────────────────────────────────────────── */
  if (state === 'report' && currentAudit) {
    const igUsername = currentAudit?.username || igAccount?.username || '';

    if (paidLoading) {
      return (
        <PremiumLoadingScreen
          currentStepIndex={4}
          steps={LOADING_STEPS}
          username={igUsername}
        />
      );
    }

    const overallScore = currentAudit?.overall_score ?? 72;
    const erNum = parseFloat(String(currentAudit?.computed_metrics?.engagementRate || 0));
    const hookNum = currentAudit?.ai_analysis?.hook_avg_score ?? 6.3;
    const hashtagScore = currentAudit?.ai_analysis?.hashtag_score ?? 62;
    const auditDate = currentAudit?.created_at
      ? new Date(currentAudit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Recently';
    const followers = (currentAudit?.computed_metrics?.followers as number) || igAccount?.followers_count || 0;

    const rawFormatBreakdown = currentAudit?.computed_metrics?.formatBreakdown || {};
    const formats = Object.entries(rawFormatBreakdown) as [string, any][];
    const bestFormatEntry = [...formats].sort(([, a], [, b]) =>
      (parseFloat(b?.avgEngagementRate) || 0) - (parseFloat(a?.avgEngagementRate) || 0)
    )[0];
    const bestFormatKey = bestFormatEntry?.[0] || 'VIDEO';
    const bestFormatData = bestFormatEntry?.[1] as any;
    const formatEmoji = bestFormatKey === 'VIDEO' ? '🎬' : bestFormatKey === 'CAROUSEL_ALBUM' ? '🖼️' : '📸';
    let formatName = 'Reels';
    if (bestFormatKey === 'CAROUSEL_ALBUM') formatName = 'Carousels';
    else if (bestFormatKey === 'IMAGE') formatName = 'Photos';
    const formatAvgEr = parseFloat(bestFormatData?.avgEngagementRate || '0').toFixed(1);

    const formatBreakdownCounts: Record<string, number> = {};
    Object.entries(rawFormatBreakdown).forEach(([k, v]: [string, any]) => {
      formatBreakdownCounts[k] = typeof v === 'number' ? v : (v?.count ?? v?.postCount ?? 0);
    });

    const ringColor1 = overallScore >= 70 ? '#00E5A0' : overallScore >= 50 ? '#FF6B35' : '#FF3CAC';
    const ringColor2 = overallScore >= 70 ? '#00B4D8' : overallScore >= 50 ? '#FBBF24' : '#A78BFA';

    return (
      <div style={{ fontFamily: 'var(--font-body)', minHeight: '100vh', background: '#0A0A0F', position: 'relative' }}>

        {/* Sticky scroll progress bar */}
        <motion.div
          className="audit-sticky-bar"
          style={{
            scaleX,
            background: 'linear-gradient(90deg, #00E5A0, #A78BFA, #FF3CAC)',
            transformOrigin: 'left center',
          }}
        />

        {/* Atmosphere */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(ellipse 60% 45% at 8% -5%, rgba(0,229,160,0.09) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 92% 8%, rgba(167,139,250,0.07) 0%, transparent 55%)` }} />
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 90% 50% at 50% 0%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 50% at 50% 0%, black 0%, transparent 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(24px, 4vw, 48px) clamp(20px, 5vw, 48px) 120px', maxWidth: 1200, marginInline: 'auto' }}>

          {/* ═══════════════════════════════════════
              CHAPTER 1 — HERO HEADER
          ═══════════════════════════════════════ */}
          <div className="audit-hero-flex" style={{ marginBottom: 48 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8B8B9E', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 8 }}>
                Instagram Audit
              </div>
              <h1
                className="grad-brand-audit"
                style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1, margin: '0 0 10px', display: 'inline-block' }}
              >
                Your Audit Report
              </h1>
              <div style={{ fontSize: 13, color: '#8B8B9E', fontWeight: 500 }}>
                @{igUsername} · Audited {auditDate}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}
            >
              <button
                onClick={() => setState('history')}
                style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
              >
                View history
              </button>
              <button onClick={startAudit} className="btn-audit-new">
                + Run new audit
              </button>
            </motion.div>
          </div>

          {/* ═══════════════════════════════════════
              CHAPTER 2 — ACCOUNT HEALTH + KPI CARDS
          ═══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="audit-score-layout"
            style={{ marginBottom: 16 }}
          >
            {/* Score ring card */}
            <div
              className="audit-card"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
                background: `linear-gradient(165deg, ${ringColor1}14 0%, #111118 60%)`,
                borderColor: `${ringColor1}30`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 1, background: `linear-gradient(90deg, transparent, ${ringColor1}60, transparent)` }} />

              <div style={{ fontSize: 10, fontWeight: 700, color: ringColor1, letterSpacing: '0.12em', textTransform: 'uppercase' as const, alignSelf: 'flex-start' }}>
                Account Health
              </div>

              <div style={{ position: 'relative', width: 100, height: 100 }}>
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={ringColor1} />
                      <stop offset="100%" stopColor={ringColor2} />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r={RING_R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r={RING_R}
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRC}
                    initial={{ strokeDashoffset: RING_CIRC }}
                    animate={{ strokeDashoffset: RING_CIRC * (1 - overallScore / 100) }}
                    transition={{ duration: 1.5, ease: [0.34, 1.2, 0.64, 1], delay: 0.3 }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: '#F0F0F5', letterSpacing: '-2px', lineHeight: 1 }}>
                    {overallScore}
                  </span>
                  <span style={{ fontSize: 10, color: '#4A4A5E', marginTop: 2 }}>/100</span>
                </div>
              </div>

              <div style={{
                padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif",
                color: ringColor1,
                background: `${ringColor1}18`,
                border: `1px solid ${ringColor1}40`,
              }}>
                {overallScore >= 70 ? '⚡ Strong' : overallScore >= 50 ? '📈 Growing' : '🔧 Needs Work'}
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Engagement', pct: Math.min((erNum / 15) * 100, 100), color: '#00E5A0' },
                  { label: 'Hook quality', pct: (hookNum / 10) * 100, color: '#FF3CAC' },
                  { label: 'Hashtags', pct: hashtagScore, color: '#A78BFA' },
                ].map(b => (
                  <div key={b.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: '#8B8B9E', fontWeight: 500 }}>{b.label}</span>
                      <span style={{ fontSize: 10, color: b.color, fontWeight: 700 }}>{Math.round(b.pct)}%</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{ duration: 1.2, delay: 0.5 + 0.1 * ['Engagement', 'Hook quality', 'Hashtags'].indexOf(b.label), ease: 'easeOut' }}
                        style={{ height: '100%', background: `linear-gradient(90deg, ${b.color}80, ${b.color})`, borderRadius: 2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 KPI cards */}
            <div className="audit-kpi-grid">

              {/* Engagement Rate */}
              <div
                className="audit-card"
                style={{ background: 'linear-gradient(135deg, rgba(0,229,160,0.07) 0%, #111118 60%)', borderColor: 'rgba(0,229,160,0.15)', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #00E5A0, transparent)', borderRadius: '16px 16px 0 0' }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,229,160,0.75)', textTransform: 'uppercase' as const, letterSpacing: '0.09em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00E5A0', boxShadow: '0 0 6px #00E5A0', display: 'inline-block', flexShrink: 0 }} />
                  Engagement Rate
                </div>
                <div style={{ marginBottom: 10 }}>
                  <span className="grad-growth" style={{ fontFamily: "'Syne', sans-serif", fontSize: 42, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}>
                    {erNum.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 18, color: '#4A4A5E', marginLeft: 3 }}>%</span>
                </div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 10 }}>
                  {[...Array(5)].map((_, i) => {
                    const filled = i < Math.round(Math.min((erNum / 15) * 5, 5));
                    return <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: filled ? '#00E5A0' : 'rgba(255,255,255,0.1)', boxShadow: filled ? '0 0 5px #00E5A0' : 'none', transition: 'all 0.3s' }} />;
                  })}
                </div>
                <div style={{ fontSize: 12, color: '#8B8B9E', fontWeight: 500, lineHeight: 1.5 }}>
                  {(erNum / 3).toFixed(1)}× above industry avg
                </div>
              </div>

              {/* Hook Strength */}
              <div
                className="audit-card"
                style={{ background: 'linear-gradient(135deg, rgba(255,60,172,0.07) 0%, #111118 60%)', borderColor: 'rgba(255,60,172,0.15)', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #FF3CAC, transparent)', borderRadius: '16px 16px 0 0' }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,60,172,0.75)', textTransform: 'uppercase' as const, letterSpacing: '0.09em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF3CAC', boxShadow: '0 0 6px #FF3CAC', display: 'inline-block', flexShrink: 0 }} />
                  Hook Strength
                </div>
                <div style={{ marginBottom: 10 }}>
                  <span className="grad-viral" style={{ fontFamily: "'Syne', sans-serif", fontSize: 42, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}>
                    {hookNum.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 18, color: '#4A4A5E', marginLeft: 3 }}>/10</span>
                </div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 10 }}>
                  {[...Array(10)].map((_, i) => {
                    const filled = i < Math.round(hookNum);
                    return <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: filled ? '#FF3CAC' : 'rgba(255,255,255,0.1)', boxShadow: filled ? '0 0 5px #FF3CAC' : 'none', transition: 'all 0.3s' }} />;
                  })}
                </div>
                <div style={{ fontSize: 12, color: '#8B8B9E', fontWeight: 500, lineHeight: 1.5 }}>
                  {hookNum >= 8 ? 'Retaining viewers well' : hookNum >= 6 ? 'Some hooks losing viewers early' : 'Losing viewers in first 3s'}
                </div>
              </div>

              {/* Best Format */}
              <div
                className="audit-card"
                style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.07) 0%, #111118 60%)', borderColor: 'rgba(167,139,250,0.15)', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #A78BFA, transparent)', borderRadius: '16px 16px 0 0' }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(167,139,250,0.75)', textTransform: 'uppercase' as const, letterSpacing: '0.09em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#A78BFA', boxShadow: '0 0 6px #A78BFA', display: 'inline-block', flexShrink: 0 }} />
                  Best Format
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {formatEmoji}
                  </div>
                  <span className="grad-premium" style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>
                    {formatName}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#8B8B9E', fontWeight: 500, lineHeight: 1.5 }}>
                  {formatAvgEr && formatAvgEr !== '0.0' ? `${formatAvgEr}% avg ER — your strongest format` : 'Highest-performing content type'}
                </div>
              </div>

              {/* Hashtag Health */}
              <div
                className="audit-card"
                style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.07) 0%, #111118 60%)', borderColor: 'rgba(255,107,53,0.15)', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #FF6B35, transparent)', borderRadius: '16px 16px 0 0' }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,107,53,0.75)', textTransform: 'uppercase' as const, letterSpacing: '0.09em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF6B35', boxShadow: '0 0 6px #FF6B35', display: 'inline-block', flexShrink: 0 }} />
                  Hashtag Health
                </div>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 42, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, color: '#FF6B35' }}>
                    {hashtagScore}
                  </span>
                  <span style={{ fontSize: 18, color: '#4A4A5E', marginLeft: 3 }}>/100</span>
                </div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 10 }}>
                  {[...Array(5)].map((_, i) => {
                    const filled = i < Math.round(hashtagScore / 20);
                    return <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: filled ? '#FF6B35' : 'rgba(255,255,255,0.1)', boxShadow: filled ? '0 0 5px #FF6B35' : 'none', transition: 'all 0.3s' }} />;
                  })}
                </div>
                <div style={{ fontSize: 12, color: '#8B8B9E', fontWeight: 500, lineHeight: 1.5 }}>
                  {hashtagScore >= 70 ? 'Good niche targeting' : hashtagScore >= 50 ? 'Some over-saturated tags' : 'Using too many mass hashtags'}
                </div>
              </div>

            </div>
          </motion.div>

          <ChapterDivider />

          {/* ═══════════════════════════════════════
              CHAPTERS 3+4 — FREE METRICS
          ═══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <FreeMetricsSection
              engagementRate={erNum}
              benchmark="5.5"
              engagementVerdict={currentAudit?.ai_analysis?.engagement_verdict || ''}
              followers={followers}
              bestFormat={bestFormatKey}
              bestFormatReason={currentAudit?.ai_analysis?.best_format_reason || ''}
              formatBreakdown={formatBreakdownCounts}
              hookAvgScore={hookNum}
              estimatedReelMin={currentAudit?.ai_analysis?.estimated_rates?.reel?.min}
              estimatedReelMax={currentAudit?.ai_analysis?.estimated_rates?.reel?.max}
            />
          </motion.div>

          <ChapterDivider />

          {/* ═══════════════════════════════════════
              CHAPTERS 5-13 — PAID REPORT
              or
              CHAPTER 14 — PAYWALL GATE
          ═══════════════════════════════════════ */}
          {isPaid ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
            >
              <PaidReport
                ai={currentAudit?.ai_analysis}
                m={{
                  bio: currentAudit?.computed_metrics?.bio || '',
                  formatBreakdown: formatBreakdownCounts,
                  engagementRate: erNum,
                  followers,
                  topHashtags: currentAudit?.computed_metrics?.topHashtags,
                  allPostsTimeline: currentAudit?.computed_metrics?.allPostsTimeline,
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
            >
              {/* Locked chapters list */}
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: '#F0F0F5', marginBottom: 6 }}>
                  What&apos;s inside the full report
                </h2>
                <p style={{ fontSize: 14, color: '#8B8B9E', marginBottom: 28 }}>
                  6 more chapters. Personalised for @{igUsername}.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {LOCKED_ITEMS.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.07 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#8B8B9E', marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: '#4A4A5E' }}>{item.hint}</div>
                      </div>
                      <Lock size={14} color="#4A4A5E" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Unlock card */}
              <div
                className="audit-card"
                style={{
                  textAlign: 'center', padding: '48px 32px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, #111118 60%)',
                  borderColor: 'rgba(99,102,241,0.25)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />
                <div style={{ position: 'absolute', bottom: -80, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

                {/* Crown SVG */}
                <div style={{ marginBottom: 20, position: 'relative', zIndex: 1 }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M8 36L4 16L16 24L24 8L32 24L44 16L40 36H8Z" fill="url(#crownGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinejoin="round" />
                    <rect x="7" y="37" width="34" height="4" rx="2" fill="url(#crownGrad)" opacity="0.7" />
                    <defs>
                      <linearGradient id="crownGrad" x1="4" y1="8" x2="44" y2="36" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#A78BFA" />
                        <stop offset="1" stopColor="#6366F1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#F0F0F5', letterSpacing: '-0.5px', marginBottom: 10, position: 'relative', zIndex: 1 }}>
                  Unlock your full report
                </h2>
                <p style={{ fontSize: 15, color: '#8B8B9E', marginBottom: 6, maxWidth: 420, marginInline: 'auto', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                  Get 6 more chapters — heatmap, hook rewrites, hashtag strategy, rate card, bio rewrite, and your 90-day plan.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: 15, color: '#4A4A5E', textDecoration: 'line-through' }}>₹299</span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 38, fontWeight: 800, color: '#F0F0F5', letterSpacing: '-1px' }}>₹99</span>
                  <span style={{ fontSize: 12, background: 'rgba(0,229,160,0.12)', color: '#00E5A0', border: '1px solid rgba(0,229,160,0.25)', borderRadius: 8, padding: '3px 10px', fontWeight: 700 }}>
                    Save 67%
                  </span>
                </div>

                <button
                  className="btn-paywall-unlock"
                  onClick={() => setShowPaymentModal(true)}
                  style={{ padding: '14px 44px', fontSize: 16, fontWeight: 700, position: 'relative', zIndex: 1 }}
                >
                  Unlock for ₹99 →
                </button>

                <div style={{ marginTop: 16, fontSize: 12, color: '#4A4A5E', position: 'relative', zIndex: 1 }}>
                  One-time payment · Instant access ·{' '}
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    style={{ background: 'none', border: 'none', color: '#A78BFA', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}
                  >
                    Have a promo code?
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* ═══════════════════════════════════════
            PAYMENT MODAL OVERLAY
        ═══════════════════════════════════════ */}
        {showPaymentModal && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.78)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              padding: '24px',
              overflowY: 'auto',
            }}
            onClick={e => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}
          >
            <div style={{ width: '100%', maxWidth: 520, position: 'relative', margin: 'auto' }}>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  position: 'absolute', top: -14, right: -14, zIndex: 10,
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(20,20,32,0.95)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.75)', fontSize: 20, lineHeight: '1',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-body)',
                }}
              >
                ×
              </button>
              <PaymentModal
                igUserId={currentAudit?.ig_user_id || igAccount?.ig_user_id || ''}
                auditId={currentAudit?.id || ''}
                username={igUsername}
                onSuccess={handlePaymentSuccess}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── HISTORY ────────────────────────────────────────────── */
  if (state === 'history') {
    return (
      <div style={{ padding: 'clamp(20px,4vw,32px)', paddingBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>Audit History</h1>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{audits.length} audit{audits.length !== 1 ? 's' : ''} completed</div>
          </div>
          <button onClick={startAudit} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            + Run new audit
          </button>
        </div>

        {audits.length >= 2 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Score trend</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {audits.slice().reverse().map((audit: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>{audit.overall_score}</span>
                  {i < audits.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>→</span>}
                </div>
              ))}
              {(() => {
                const first = audits[audits.length - 1]?.overall_score || 0;
                const last = audits[0]?.overall_score || 0;
                const diff = last - first;
                return diff !== 0 ? (
                  <span style={{ fontSize: 13, fontWeight: 700, color: diff > 0 ? '#22c55e' : '#ef4444', background: diff > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${diff > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 8, padding: '2px 10px' }}>
                    {diff > 0 ? '↑' : '↓'} {Math.abs(diff)} points
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {audits.map((audit: any, i: number) => {
            const prev = audits[i + 1];
            const scoreDiff = prev ? audit.overall_score - prev.overall_score : null;
            const igUserId = igAccount?.ig_user_id || audit.ig_user_id;
            return (
              <div
                key={audit.id}
                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${scoreDiff !== null && scoreDiff > 0 ? 'rgba(34,197,94,0.15)' : scoreDiff !== null && scoreDiff < 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: '20px 24px', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
                onClick={() => { setCurrentAudit(audit); setIsPaid(audit?.is_paid ?? false); setState('report'); }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = scoreDiff !== null && scoreDiff > 0 ? 'rgba(34,197,94,0.15)' : scoreDiff !== null && scoreDiff < 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {new Date(audit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {i === 0 && <span style={{ fontSize: 11, background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>Latest</span>}
                    {audit.is_paid && <span style={{ fontSize: 11, background: 'rgba(34,197,94,0.12)', color: '#4ade80', borderRadius: 6, padding: '2px 8px', fontWeight: 600, border: '1px solid rgba(34,197,94,0.2)' }}>Full Report</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    @{audit.username}{audit.computed_metrics?.engagementRate ? ` · ${audit.computed_metrics.engagementRate}% ER` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {scoreDiff !== null && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: scoreDiff > 0 ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                      {scoreDiff > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                    </span>
                  )}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: 'monospace', lineHeight: 1 }}>{audit.overall_score}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/100</div>
                  </div>
                  <Link
                    href={`/audit/${igUserId}?auditId=${audit.id}`}
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: audit.is_paid ? 'linear-gradient(135deg,#A855F7,#7C3AED)' : 'rgba(255,255,255,0.06)', color: audit.is_paid ? 'white' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}
                  >
                    {audit.is_paid ? 'View' : 'Unlock'} <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

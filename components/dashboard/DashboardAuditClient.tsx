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

function ScoringRing({ value, max, color, unit, label }: {
  value: number; max: number; color: string; unit: string; label?: string;
}) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);
  const displayNum = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return (
    <div style={{ position: 'relative', width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
        <span style={{
          fontSize: label ? '16px' : (value >= 100 ? '20px' : '24px'),
          fontWeight: 800,
          color: 'white',
          fontFamily: 'inherit',
          letterSpacing: '-0.02em',
        }}>
          {label || displayNum}
        </span>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
          {unit}
        </span>
      </div>
    </div>
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
    let formatName = 'Reels';
    if (bestFormatKey === 'CAROUSEL_ALBUM') formatName = 'Carousels';
    else if (bestFormatKey === 'IMAGE') formatName = 'Photos';
    const formatAvgEr = parseFloat(bestFormatData?.avgEngagementRate || '0').toFixed(1);

    const formatBreakdownCounts: Record<string, number> = {};
    Object.entries(rawFormatBreakdown).forEach(([k, v]: [string, any]) => {
      formatBreakdownCounts[k] = typeof v === 'number' ? v : (v?.count ?? v?.postCount ?? 0);
    });

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
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 8 }}>
                Instagram Audit
              </div>
              <h1
                style={{ fontFamily: 'inherit', fontSize: 'clamp(32px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, color: '#f0f0f5', margin: '0 0 10px' }}
              >
                Your Audit Report
              </h1>
              <div style={{ fontSize: 14, color: '#9ca3af', fontWeight: 400 }}>
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
              CHAPTER 2 — KPI CARDS
          ═══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', width: '100%', alignItems: 'stretch', marginBottom: 16 }}
          >
            {/* Card 1 — Account Health */}
            <div style={{ position: 'relative', overflow: 'hidden', height: '280px', padding: '20px', background: 'linear-gradient(160deg, #0a1f1c 0%, #111118 70%)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #00d4aa, transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '9999px', background: '#00d4aa' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#00d4aa', textTransform: 'uppercase' as const }}>Account Health</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScoringRing value={overallScore} max={100} color="#00d4aa" unit="/100" />
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '9999px', border: '1px solid rgba(0,212,170,0.4)', background: 'rgba(0,212,170,0.18)', color: '#00d4aa', fontSize: '12px', fontWeight: 600 }}>
                {overallScore >= 70 ? '⚡ Strong' : overallScore >= 50 ? '📈 Growing' : '🔧 Needs Work'}
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.4, margin: 0, maxWidth: '140px' }}>
                Overall profile strength
              </p>
            </div>

            {/* Card 2 — Engagement Rate */}
            <div style={{ position: 'relative', overflow: 'hidden', height: '280px', padding: '20px', background: 'linear-gradient(160deg, #0a1f1c 0%, #111118 70%)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #00d4aa, transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '9999px', background: '#00d4aa' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#00d4aa', textTransform: 'uppercase' as const }}>Engagement Rate</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScoringRing value={erNum} max={100} color="#00d4aa" unit="% ER" />
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '9999px', border: '1px solid rgba(0,212,170,0.4)', background: 'rgba(0,212,170,0.18)', color: '#00d4aa', fontSize: '12px', fontWeight: 600 }}>
                {(erNum / 3).toFixed(1)}× industry avg
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.4, margin: 0, maxWidth: '140px' }}>
                {erNum >= 5 ? 'Above average' : erNum >= 2 ? 'Near industry average' : 'Below industry average'}
              </p>
            </div>

            {/* Card 3 — Hook Strength */}
            <div style={{ position: 'relative', overflow: 'hidden', height: '280px', padding: '20px', background: 'linear-gradient(160deg, #1f0a14 0%, #111118 70%)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #ec4899, transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '9999px', background: '#ec4899' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#ec4899', textTransform: 'uppercase' as const }}>Hook Strength</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScoringRing value={hookNum} max={10} color="#ec4899" unit="/10" />
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '9999px', border: '1px solid rgba(236,72,153,0.4)', background: 'rgba(236,72,153,0.18)', color: '#ec4899', fontSize: '12px', fontWeight: 600 }}>
                {hookNum >= 8 ? 'Excellent' : hookNum >= 6 ? 'Average' : 'Needs Work'}
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.4, margin: 0, maxWidth: '140px' }}>
                {hookNum >= 8 ? 'Retaining viewers well' : hookNum >= 6 ? 'Some hooks lose viewers early' : 'Losing viewers in first 3s'}
              </p>
            </div>

            {/* Card 4 — Best Format */}
            <div style={{ position: 'relative', overflow: 'hidden', height: '280px', padding: '20px', background: 'linear-gradient(160deg, #0e0e1f 0%, #111118 70%)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #818cf8, transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '9999px', background: '#818cf8' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#818cf8', textTransform: 'uppercase' as const }}>Best Format</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScoringRing value={parseFloat(formatAvgEr)} max={30} color="#818cf8" unit="% ER" label={formatName} />
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '9999px', border: '1px solid rgba(129,140,248,0.4)', background: 'rgba(129,140,248,0.18)', color: '#818cf8', fontSize: '12px', fontWeight: 600 }}>
                {formatAvgEr !== '0.0' ? `${formatAvgEr}% avg ER` : 'Top performing'}
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.4, margin: 0, maxWidth: '140px' }}>
                Your strongest format
              </p>
            </div>

            {/* Card 5 — Hashtag Health */}
            <div style={{ position: 'relative', overflow: 'hidden', height: '280px', padding: '20px', background: 'linear-gradient(160deg, #1f1208 0%, #111118 70%)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #f97316, transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '9999px', background: '#f97316' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#f97316', textTransform: 'uppercase' as const }}>Hashtag Health</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScoringRing value={hashtagScore} max={100} color="#f97316" unit="/100" />
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '9999px', border: '1px solid rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.18)', color: '#f97316', fontSize: '12px', fontWeight: 600 }}>
                {hashtagScore}/100
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.4, margin: 0, maxWidth: '140px' }}>
                {hashtagScore >= 70 ? 'Good niche targeting' : hashtagScore >= 50 ? 'Some over-saturated tags' : 'Using too many mass hashtags'}
              </p>
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

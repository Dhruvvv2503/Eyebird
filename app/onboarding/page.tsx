'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, ArrowRight, CheckCircle2, Shield, Eye, EyeOff } from 'lucide-react';
import ScoreRing from '@/components/ui/ScoreRing';

const STEPS = ['Connect Instagram', 'Run Your Audit', 'See Your Score'];

const AUDIT_FACTS = [
  'Reels posted between 9–11 PM get 2.1× more reach on average.',
  'Hooks under 7 words perform 38% better on Indian audiences.',
  'Accounts posting 4–5 times per week see 3× more follower growth.',
  'Carousels drive 3× more saves than static posts.',
  'Comment replies within 30 minutes boost reach by up to 25%.',
  'Using 5–8 hashtags outperforms 20–30 hashtag strategies.',
  'Creators who post consistently for 60 days see exponential reach growth.',
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 48 }}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? 'linear-gradient(135deg,#FF3E80,#7C3AED)' : active ? 'transparent' : 'var(--bg-elevated)',
                border: active ? '2px solid #A855F7' : done ? 'none' : '2px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: active ? '0 0 0 4px rgba(168,85,247,0.15)' : 'none',
                transition: 'all 0.3s ease',
              }}>
                {done
                  ? <CheckCircle2 size={16} color="white" />
                  : <span style={{ fontSize: 13, fontWeight: 700, color: active ? '#A855F7' : 'rgba(255,255,255,0.3)' }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#A855F7' : done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 60, height: 1, background: done ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.1)', margin: '0 8px', marginBottom: 22, transition: 'background 0.3s ease' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const igUserIdParam = searchParams.get('igUserId');
  const stepParam = searchParams.get('step');

  const [step, setStep] = useState(igUserIdParam ? 1 : 0);
  const [igUserId, setIgUserId] = useState(igUserIdParam || '');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFactIndex, setAuditFactIndex] = useState(0);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [auditError, setAuditError] = useState('');
  const [progress, setProgress] = useState(0);
  const [markingDone, setMarkingDone] = useState(false);

  // Rotate facts during loading
  useEffect(() => {
    if (step !== 1 || !auditLoading) return;
    const interval = setInterval(() => {
      setAuditFactIndex(v => (v + 1) % AUDIT_FACTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [step, auditLoading]);

  // Animate progress bar during audit
  useEffect(() => {
    if (step !== 1 || !auditLoading) return;
    let p = 0;
    const interval = setInterval(() => {
      p = Math.min(p + Math.random() * 3, 88);
      setProgress(p);
    }, 800);
    return () => clearInterval(interval);
  }, [step, auditLoading]);

  const runAudit = useCallback(async (id: string) => {
    setAuditLoading(true);
    setAuditError('');
    setProgress(5);
    try {
      // Step 1: Fetch Instagram data
      const fetchRes = await fetch('/api/instagram/fetch-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId: id }),
      });
      if (!fetchRes.ok) throw new Error('Failed to fetch Instagram data');
      setProgress(40);

      // Step 2: Generate AI audit
      const generateRes = await fetch('/api/audit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId: id }),
      });
      if (!generateRes.ok) throw new Error('Failed to generate audit');
      const data = await generateRes.json();
      setProgress(100);
      setAuditResult(data.audit || data);
      setTimeout(() => setStep(2), 600);
    } catch (err: any) {
      setAuditError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setAuditLoading(false);
    }
  }, []);

  // Auto-run audit when step 1 loads with igUserId
  useEffect(() => {
    if (step === 1 && igUserId && !auditResult && !auditLoading) {
      runAudit(igUserId);
    }
  }, [step, igUserId, auditResult, auditLoading, runAudit]);

  const handleConnectInstagram = () => {
    window.location.href = '/api/instagram/auth?intent=onboarding';
  };

  const handleGoToDashboard = async () => {
    setMarkingDone(true);
    try {
      // Mark onboarding complete via Supabase client
      const { getSupabaseClient } = await import('@/lib/supabase');
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ onboarding_completed: true, onboarding_step: 3 })
          .eq('id', user.id);
      }
    } catch { /* non-critical */ }
    router.push('/dashboard');
  };

  const score = auditResult?.overall_score ?? 72;
  const metrics = auditResult?.computed_metrics || {};
  const aiAnalysis = auditResult?.ai_analysis || {};

  return (
    <main style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 20px 80px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-5%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse 55% 50% at 50% 20%, rgba(124,58,237,0.2), transparent 65%)', filter: 'blur(40px)' }} />

      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, zIndex: 10, display: 'flex', alignItems: 'center', padding: '0 24px', background: 'rgba(10,10,16,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#FF3E80,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(168,85,247,0.4)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 9 }}>EB</span>
          </div>
          <span style={{ color: '#FAFAFA', fontWeight: 700, fontSize: 16, letterSpacing: '-0.03em' }}>Eyebird</span>
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: 560, marginTop: 56, position: 'relative', zIndex: 1 }}>
        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          {/* ── Step 0: Connect Instagram ── */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ width: 80, height: 80, borderRadius: 22, background: 'linear-gradient(135deg,#FF3E80,#A855F7,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(168,85,247,0.4)' }}>
                <Instagram size={40} color="white" />
              </div>
              <h1 style={{ fontSize: 'clamp(22px,5vw,32px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', marginBottom: 12, lineHeight: 1.2 }}>
                Connect your Instagram account
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
                We&apos;ll read your posts, engagement, and audience data using Instagram&apos;s official API. Read-only. We never post anything.
              </p>
              <button
                onClick={handleConnectInstagram}
                className="btn btn-primary"
                style={{ fontSize: 16, fontWeight: 700, height: 56, padding: '0 36px', borderRadius: 14, margin: '0 auto', display: 'inline-flex' }}
              >
                Connect Instagram <ArrowRight size={18} />
              </button>
              <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { icon: Shield, label: 'Official Instagram API' },
                  { icon: Eye, label: 'Read-only' },
                  { icon: EyeOff, label: 'Never posts' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                    <Icon size={13} style={{ color: '#A855F7' }} />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Run Audit ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              {auditError ? (
                <div>
                  <div style={{ padding: '20px', borderRadius: 12, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', marginBottom: 20, fontSize: 14 }}>
                    {auditError}
                  </div>
                  <button
                    onClick={() => runAudit(igUserId)}
                    className="btn btn-primary"
                    style={{ height: 48, padding: '0 28px' }}
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  {/* Spinner */}
                  <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.15)', borderTop: '3px solid #A855F7', animation: 'spin 0.9s linear infinite', margin: '0 auto 28px' }} />

                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#FAFAFA', marginBottom: 10, letterSpacing: '-0.03em' }}>
                    Analysing your account…
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
                    Our AI is going through your posts, engagement patterns, and content strategy.
                  </p>

                  {/* Progress bar */}
                  <div style={{ width: '100%', maxWidth: 400, margin: '0 auto 24px', height: 6, background: 'var(--bg-overlay)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', background: 'var(--gradient-brand)', borderRadius: 99 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Rotating fact */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={auditFactIndex}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        padding: '14px 20px', borderRadius: 12, maxWidth: 420, margin: '0 auto',
                        background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)',
                        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic',
                      }}
                    >
                      💡 {AUDIT_FACTS[auditFactIndex]}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

          {/* ── Step 2: See Your Score ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
                <ScoreRing score={score} size={180} strokeWidth={12} />
              </div>

              {/* 3 quick metric cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32, maxWidth: 460, margin: '0 auto 32px' }}>
                {[
                  { label: 'Engagement Rate', value: `${metrics.engagementRate ?? '—'}%`, color: '#22C55E' },
                  { label: 'Hook Score', value: `${aiAnalysis.hook_avg_score ?? '—'}/10`, color: '#A855F7' },
                  { label: 'Posts/Week', value: `${metrics.postsPerWeek ?? '—'}`, color: '#3B82F6' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ padding: '14px 10px', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color, letterSpacing: '-0.03em', marginBottom: 4 }}>{value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.65 }}>
                Your full report is waiting in your dashboard — including your top 3 actions for this week.
              </p>

              <button
                onClick={handleGoToDashboard}
                disabled={markingDone}
                className="btn btn-primary"
                style={{ fontSize: 16, fontWeight: 700, height: 56, padding: '0 36px', borderRadius: 14, display: 'inline-flex', margin: '0 auto' }}
              >
                {markingDone
                  ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTop: '2px solid white', animation: 'spin 0.7s linear infinite' }} /> Loading…</>
                  : <>Go to my dashboard <ArrowRight size={18} /></>
                }
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}

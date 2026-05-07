'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  TrendingUp, TrendingDown, Minus, ArrowRight, RefreshCw,
  Calendar, CheckCircle2, Lock, Star, BarChart2, Zap,
  Users, MessageCircle, Clock, Target, Plus,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';
import { showToast } from '@/components/ui/Toast';

interface AuditSummary {
  id: string;
  overall_score: number;
  computed_metrics: any;
  ai_analysis: any;
  is_paid: boolean;
  created_at: string;
  username: string;
}

interface Account {
  username: string;
  followers_count: number;
  profile_picture_url: string | null;
  biography: string;
  media_count: number;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function delta(curr: number, prev: number): { value: number; dir: 'up' | 'down' | 'same' } {
  const diff = parseFloat((curr - prev).toFixed(2));
  return { value: Math.abs(diff), dir: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same' };
}

function DeltaBadge({ curr, prev, suffix = '', higherIsBetter = true }: { curr: number; prev: number; suffix?: string; higherIsBetter?: boolean }) {
  const { value, dir } = delta(curr, prev);
  if (dir === 'same') return <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>No change</span>;
  const isGood = higherIsBetter ? dir === 'up' : dir === 'down';
  const color = isGood ? '#22C55E' : '#EF4444';
  const Icon = dir === 'up' ? TrendingUp : TrendingDown;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color }}>
      <Icon size={11} /> {dir === 'up' ? '+' : '-'}{value}{suffix}
    </span>
  );
}

function ScoreBar({ score, color = '#A855F7' }: { score: number; color?: string }) {
  return (
    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginTop: 6 }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ height: '100%', background: color, borderRadius: 99 }}
      />
    </div>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 75 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
      border: `3px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      background: `${color}12`,
      boxShadow: `0 0 16px ${color}30`,
    }}>
      <span style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>/100</span>
    </div>
  );
}

export default function DashboardPage({ params }: { params: { igUserId: string } }) {
  const router = useRouter();
  const { igUserId } = params;
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAuditLoading, setNewAuditLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId }),
      });
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      setAudits(data.audits || []);
      setAccount(data.account || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [igUserId]);

  useEffect(() => { load(); }, [load]);

  const handleNewAudit = async () => {
    setNewAuditLoading(true);
    // Redirect to fresh audit pipeline
    router.push(`/audit/${igUserId}`);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.2)', borderTop: '3px solid #A855F7', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Loading your dashboard…</p>
      </div>
    </div>
  );

  if (error || audits.length === 0) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>No audits found</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24, lineHeight: 1.6 }}>
            {error || "Looks like you haven't run an audit yet. Get started to see your Instagram insights."}
          </p>
          <button
            onClick={() => router.push('/audit')}
            style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#FF3E80,#A855F7)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Zap size={15} /> Run First Audit
          </button>
        </div>
      </div>
      <Footer />
    </>
  );

  const latest = audits[0];
  const prev = audits[1] || null;
  const lm = latest.computed_metrics || {};
  const pm = prev?.computed_metrics || {};
  const la = latest.ai_analysis || {};

  const comparisonMetrics = [
    { label: 'Overall Score', curr: latest.overall_score, prev: prev?.overall_score ?? null, suffix: '', icon: Star, color: '#A855F7' },
    { label: 'Engagement Rate', curr: lm.engagementRate ?? 0, prev: pm.engagementRate ?? null, suffix: '%', icon: TrendingUp, color: '#22C55E' },
    { label: 'Avg Likes', curr: lm.avgLikes ?? 0, prev: pm.avgLikes ?? null, suffix: '', icon: MessageCircle, color: '#F59E0B' },
    { label: 'Posts/Week', curr: lm.postsPerWeek ?? 0, prev: pm.postsPerWeek ?? null, suffix: '', icon: Clock, color: '#3B82F6' },
    { label: 'Hook Score', curr: la.hook_avg_score ?? 0, prev: prev?.ai_analysis?.hook_avg_score ?? null, suffix: '/10', icon: Target, color: '#FF3E80' },
    { label: 'Followers', curr: lm.followers ?? 0, prev: pm.followers ?? null, suffix: '', icon: Users, color: '#8B5CF6' },
  ];

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: 80 }}>

        {/* Background glow */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 400, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: -100, left: '20%', width: 600, height: 500, background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 65%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', top: -50, right: '10%', width: 400, height: 350, background: 'radial-gradient(ellipse, rgba(255,62,128,0.1) 0%, transparent 65%)', filter: 'blur(50px)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto', padding: '80px 24px 0' }}>

          {/* ── Profile Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 16, marginBottom: 36,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 68, height: 68, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                border: '2px solid rgba(168,85,247,0.5)',
                boxShadow: '0 0 0 4px rgba(168,85,247,0.08)',
                background: 'var(--bg-elevated)',
              }}>
                {account?.profile_picture_url
                  ? <Image src={account.profile_picture_url} alt={account.username} width={68} height={68} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👤</div>
                }
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.15, marginBottom: 4 }}>
                  @{account?.username || latest.username}
                </h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  {(account?.followers_count || lm.followers || 0).toLocaleString('en-IN')} followers · {audits.length} audit{audits.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <button
              onClick={handleNewAudit}
              disabled={newAuditLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#FF3E80,#A855F7)',
                color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(168,85,247,0.35)',
                opacity: newAuditLoading ? 0.7 : 1,
              }}
            >
              {newAuditLoading
                ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Running…</>
                : <><Plus size={14} /> New Audit</>
              }
            </button>
          </motion.div>

          {/* ── Score Timeline ── */}
          {audits.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ marginBottom: 24 }}
            >
              <div style={{ borderRadius: 20, background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{ height: 2, background: 'linear-gradient(90deg,#FF3E80,#A855F7,#7C3AED)' }} />
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <BarChart2 size={15} style={{ color: '#A855F7' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Score Timeline</span>
                  </div>

                  {/* Score bars — all audits reversed (oldest first) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[...audits].reverse().map((a, i) => {
                      const color = a.overall_score >= 75 ? '#22C55E' : a.overall_score >= 50 ? '#F59E0B' : '#EF4444';
                      return (
                        <div key={a.id}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{formatDate(a.created_at)}</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color }}>{a.overall_score}/100</span>
                          </div>
                          <ScoreBar score={a.overall_score} color={color} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Overall trend */}
                  {audits.length >= 2 && (() => {
                    const oldest = audits[audits.length - 1];
                    const { value, dir } = delta(latest.overall_score, oldest.overall_score);
                    const isGood = dir === 'up';
                    return (
                      <div style={{
                        marginTop: 18, padding: '12px 16px', borderRadius: 12,
                        background: isGood ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                        border: `1px solid ${isGood ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'}`,
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        {isGood ? <TrendingUp size={15} style={{ color: '#22C55E', flexShrink: 0 }} /> : <TrendingDown size={15} style={{ color: '#EF4444', flexShrink: 0 }} />}
                        <p style={{ fontSize: 13, fontWeight: 600, color: isGood ? '#22C55E' : '#EF4444', margin: 0 }}>
                          Overall score {isGood ? 'improved' : 'dropped'} by {value} points since your first audit
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Comparison Cards (Latest vs Previous) ── */}
          {prev && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ marginBottom: 24 }}
            >
              <div style={{ borderRadius: 20, background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{ height: 2, background: 'linear-gradient(90deg,#22C55E,#3B82F6)' }} />
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TrendingUp size={15} style={{ color: '#22C55E' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        Latest vs Previous
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                      {formatDate(latest.created_at)} vs {formatDate(prev.created_at)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginTop: 16 }}>
                    {comparisonMetrics.map((m) => {
                      const Icon = m.icon;
                      const hasPrev = m.prev !== null && m.prev !== undefined;
                      return (
                        <div key={m.label} style={{
                          padding: '14px 16px', borderRadius: 14,
                          background: 'rgba(255,255,255,0.025)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                            <div style={{ width: 26, height: 26, borderRadius: 8, background: `${m.color}18`, border: `1px solid ${m.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={12} style={{ color: m.color }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{m.label}</span>
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: 4 }}>
                            {m.curr.toLocaleString('en-IN')}{m.suffix}
                          </div>
                          {hasPrev && m.prev !== m.curr ? (
                            <DeltaBadge curr={m.curr} prev={m.prev!} suffix={m.suffix} />
                          ) : (
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                              {hasPrev ? 'No change' : 'First audit'}
                            </span>
                          )}
                          {hasPrev && (
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>
                              was {m.prev!.toLocaleString('en-IN')}{m.suffix}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Audit History List ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <div style={{ borderRadius: 20, background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <div style={{ height: 2, background: 'linear-gradient(90deg,#A855F7,#3B82F6)' }} />
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <Calendar size={15} style={{ color: '#A855F7' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>All Audits</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 9px', borderRadius: 99, background: 'rgba(168,85,247,0.1)', color: '#A855F7', fontWeight: 700 }}>{audits.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {audits.map((audit, i) => {
                    const m = audit.computed_metrics || {};
                    const scoreColor = audit.overall_score >= 75 ? '#22C55E' : audit.overall_score >= 50 ? '#F59E0B' : '#EF4444';
                    return (
                      <motion.div
                        key={audit.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                          padding: '14px 16px', borderRadius: 14,
                          background: i === 0 ? 'rgba(168,85,247,0.05)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${i === 0 ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)'}`,
                        }}
                      >
                        <ScoreCircle score={audit.overall_score} />

                        <div style={{ flex: 1, minWidth: 140 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{formatDate(audit.created_at)}</span>
                            {i === 0 && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(168,85,247,0.15)', color: '#A855F7', letterSpacing: '0.05em' }}>LATEST</span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                            ER {m.engagementRate ?? '—'}% · {(m.followers || 0).toLocaleString('en-IN')} followers · {m.totalPostsAnalyzed ?? '—'} posts
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          {audit.is_paid ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#22C55E', fontWeight: 600 }}>
                              <CheckCircle2 size={13} /> Unlocked
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                              <Lock size={12} /> Locked
                            </div>
                          )}
                          <button
                            onClick={() => {
                              if (i === 0) {
                                // Latest audit — go to report page fresh
                                window.location.href = `/audit/${igUserId}?auditId=${audit.id}`;
                              } else {
                                window.location.href = `/audit/${igUserId}?auditId=${audit.id}`;
                              }
                            }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '7px 14px', borderRadius: 10, border: 'none',
                              background: audit.is_paid
                                ? 'linear-gradient(135deg,#A855F7,#7C3AED)'
                                : 'rgba(255,255,255,0.06)',
                              color: audit.is_paid ? 'white' : 'rgba(255,255,255,0.5)',
                              fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              boxShadow: audit.is_paid ? '0 2px 10px rgba(168,85,247,0.3)' : 'none',
                            }}
                          >
                            {audit.is_paid ? 'View Report' : 'Unlock'} <ArrowRight size={12} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── New Audit CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ marginTop: 20, textAlign: 'center', padding: '28px', borderRadius: 20, background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.1)' }}
          >
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
              Ready to see how your account has improved?
            </p>
            <button
              onClick={handleNewAudit}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#FF3E80,#A855F7,#7C3AED)',
                color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(168,85,247,0.35)',
              }}
            >
              <Zap size={15} /> Run New Audit
            </button>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 10 }}>
              Each audit is a fresh snapshot · ₹99 one-time
            </p>
          </motion.div>

        </div>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}

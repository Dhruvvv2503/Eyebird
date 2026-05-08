'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, ArrowRight, BarChart2, Calendar, Lock, CheckCircle2, X } from 'lucide-react';

interface Audit {
  id: string;
  overall_score: number;
  computed_metrics: any;
  ai_analysis: any;
  is_paid: boolean;
  created_at: string;
  username: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getScoreColor(score: number) {
  if (score >= 70) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

export default function DashboardAuditPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [igAccount, setIgAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/data')
      .then(r => r.json())
      .then(d => {
        setAudits(d.audits || []);
        setIgAccount(d.igAccount || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRunAudit = () => {
    if (igAccount?.ig_user_id) {
      window.location.href = `/audit/${igAccount.ig_user_id}`;
    } else {
      window.location.href = '/onboarding';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.2)', borderTop: '3px solid #A855F7', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const latest = audits[0];
  const prev = audits[1] || null;
  const scoreDelta = latest && prev ? latest.overall_score - prev.overall_score : null;

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 32px)', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', marginBottom: 4 }}>
            Instagram Audit
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Track your account health over time.</p>
        </div>
        <button
          onClick={() => audits.length > 0 ? setShowConfirm(true) : handleRunAudit()}
          className="btn btn-primary"
          style={{ height: 44, padding: '0 20px', fontSize: 14, fontWeight: 700, borderRadius: 10, display: 'inline-flex', flexShrink: 0 }}
        >
          <Plus size={16} /> Run New Audit
        </button>
      </div>

      {/* Comparison bar (2+ audits) */}
      {latest && prev && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '16px 20px', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
        >
          <BarChart2 size={15} style={{ color: '#A855F7', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)' }}>
            <span><strong style={{ color: '#FAFAFA' }}>Score trend:</strong></span>
            <span>{formatDateShort(prev.created_at)} → {prev.overall_score}</span>
            <span>·</span>
            <span>{formatDateShort(latest.created_at)} → {latest.overall_score}</span>
            <span>·</span>
            <span style={{ fontWeight: 700, color: scoreDelta !== null ? (scoreDelta >= 0 ? '#22C55E' : '#EF4444') : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
              {scoreDelta !== null && (scoreDelta >= 0
                ? <TrendingUp size={12} />
                : <TrendingDown size={12} />)}
              {scoreDelta !== null && `${scoreDelta >= 0 ? '+' : ''}${scoreDelta} points`}
            </span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(() => {
              const lm = latest.computed_metrics || {};
              const pm = prev.computed_metrics || {};
              const erDelta = lm.engagementRate && pm.engagementRate
                ? (lm.engagementRate - pm.engagementRate).toFixed(1)
                : null;
              const hookDelta = latest.ai_analysis?.hook_avg_score && prev.ai_analysis?.hook_avg_score
                ? (latest.ai_analysis.hook_avg_score - prev.ai_analysis.hook_avg_score).toFixed(1)
                : null;
              return (
                <>
                  {erDelta && <span style={{ fontSize: 11, color: Number(erDelta) >= 0 ? '#22C55E' : '#EF4444' }}>ER: {Number(erDelta) >= 0 ? '+' : ''}{erDelta}%</span>}
                  {hookDelta && <span style={{ fontSize: 11, color: Number(hookDelta) >= 0 ? '#22C55E' : '#EF4444' }}>Hook: {Number(hookDelta) >= 0 ? '+' : ''}{hookDelta}</span>}
                </>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* Audit list */}
      {audits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)' }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#FAFAFA', marginBottom: 8, letterSpacing: '-0.03em' }}>No audits yet.</h2>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.65, marginBottom: 24, maxWidth: 320, margin: '0 auto 24px' }}>
            Your growth story starts with your first audit. Takes 2 minutes.
          </p>
          <button onClick={handleRunAudit} className="btn btn-primary" style={{ height: 48, padding: '0 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'inline-flex' }}>
            Run my first audit →
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {audits.map((audit, i) => {
            const m = audit.computed_metrics || {};
            const scoreColor = getScoreColor(audit.overall_score);
            const auditDelta = i < audits.length - 1 ? audit.overall_score - audits[i + 1].overall_score : null;
            const borderColor = auditDelta === null
              ? 'var(--border)'
              : auditDelta > 0 ? 'rgba(34,197,94,0.25)' : auditDelta < 0 ? 'rgba(239,68,68,0.2)' : 'var(--border)';

            return (
              <motion.div
                key={audit.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{
                  padding: '20px', borderRadius: 14, background: 'var(--bg-surface)',
                  border: `1px solid ${borderColor}`,
                  borderLeft: `3px solid ${auditDelta === null ? 'rgba(168,85,247,0.3)' : auditDelta > 0 ? '#22C55E' : auditDelta < 0 ? '#EF4444' : 'var(--border)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#FAFAFA' }}>{formatDate(audit.created_at)}</span>
                      {i === 0 && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(168,85,247,0.12)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest</span>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: scoreColor, letterSpacing: '-0.03em' }}>
                          {audit.overall_score}/100
                        </span>
                        {auditDelta !== null && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: auditDelta > 0 ? '#22C55E' : '#EF4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                            {auditDelta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {auditDelta > 0 ? '+' : ''}{auditDelta}
                          </span>
                        )}
                      </div>
                    </div>
                    {audit.username && (
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                        @{audit.username} · {(m.followers || 0).toLocaleString('en-IN')} followers
                      </p>
                    )}
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      {m.engagementRate ?? '—'}% ER · Hook {audit.ai_analysis?.hook_avg_score?.toFixed(1) ?? '—'}/10 · Hashtags {audit.ai_analysis?.hashtag_score ?? '—'}/100
                    </p>
                    {audit.ai_analysis?.top_actions?.[0] && (
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                        Top action: {audit.ai_analysis.top_actions[0]}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: audit.is_paid ? '#22C55E' : 'var(--text-tertiary)', fontWeight: 600 }}>
                      {audit.is_paid ? <CheckCircle2 size={13} /> : <Lock size={12} />}
                      {audit.is_paid ? 'Unlocked' : 'Locked'}
                    </div>
                    <Link
                      href={`/audit/${igAccount?.ig_user_id}?auditId=${audit.id}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9,
                        background: audit.is_paid ? 'linear-gradient(135deg,#A855F7,#7C3AED)' : 'rgba(255,255,255,0.06)',
                        color: audit.is_paid ? 'white' : 'rgba(255,255,255,0.5)',
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                        boxShadow: audit.is_paid ? '0 2px 10px rgba(168,85,247,0.3)' : 'none',
                      }}
                    >
                      {audit.is_paid ? 'View report' : 'Unlock'} <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: '90%', maxWidth: 400, background: 'var(--bg-elevated)',
                border: '1px solid var(--border-bright)', borderRadius: 16,
                padding: '28px', zIndex: 101, boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.03em' }}>Run a new audit?</h3>
                <button onClick={() => setShowConfirm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <X size={18} />
                </button>
              </div>
              {igAccount?.username && (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 8 }}>
                  We&apos;ll re-analyse <strong style={{ color: '#FAFAFA' }}>@{igAccount.username}</strong> and update your score.
                </p>
              )}
              {latest && (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24 }}>
                  Last audit: {formatDate(latest.created_at)}
                </p>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, height: 44, fontSize: 14 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowConfirm(false); handleRunAudit(); }}
                  className="btn btn-primary"
                  style={{ flex: 1, height: 44, fontSize: 14, fontWeight: 700 }}
                >
                  Run audit →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

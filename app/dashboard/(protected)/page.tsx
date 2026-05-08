'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, CheckCircle2, ArrowRight, RefreshCw, BarChart2, Instagram } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface DashboardData {
  profile: any;
  igAccount: any;
  audits: any[];
  user: any;
}

function getIndianGreeting(): string {
  const now = new Date();
  const hour = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Working late?';
}

function getScoreColor(score: number) {
  if (score >= 70) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function ScoreCircle({ score, size = 56 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      border: `3px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      background: `${color}10`, boxShadow: `0 0 16px ${color}25`,
    }}>
      <span style={{ fontSize: size * 0.32, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: size * 0.16, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>/100</span>
    </div>
  );
}

function StatCard({ title, value, subtitle, subtitleColor, emptyText, emptyLink, delay = 0 }: {
  title: string; value?: string | number; subtitle?: string; subtitleColor?: string;
  emptyText?: string; emptyLink?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      style={{ padding: '20px', borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{title}</div>
      {value !== undefined ? (
        <>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#FAFAFA', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{value}</div>
          {subtitle && <div style={{ fontSize: 12, fontWeight: 600, color: subtitleColor || 'var(--text-tertiary)' }}>{subtitle}</div>}
        </>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.55 }}>
          {emptyText}
          {emptyLink && (
            <Link href={emptyLink} style={{ display: 'block', marginTop: 8, color: 'var(--brand-mid)', fontWeight: 600, textDecoration: 'none', fontSize: 12 }}>
              Get started →
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function DashboardOverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/data')
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.2)', borderTop: '3px solid #A855F7', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const greeting = getIndianGreeting();
  const latestAudit = data?.audits?.[0] ?? null;
  const prevAudit = data?.audits?.[1] ?? null;
  const latestScore = latestAudit?.overall_score ?? 0;
  const prevScore = prevAudit?.overall_score ?? null;
  const scoreDelta = prevScore !== null ? latestScore - prevScore : null;
  const username = data?.igAccount?.username
    ? `@${data.igAccount.username}`
    : data?.user?.full_name || data?.user?.email?.split('@')[0] || 'Creator';

  const actionText = latestAudit?.ai_analysis?.action_plan?.[0] || null;
  const topAction = latestAudit?.ai_analysis?.top_actions?.[0] ||
    latestAudit?.ai_analysis?.weekly_actions?.[0] || null;

  // Chart data
  const chartData = data?.audits
    ? [...data.audits].reverse().map((a: any) => ({
        date: new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        score: a.overall_score,
      }))
    : [];

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 32px)', maxWidth: 960, margin: '0 auto' }}>
      {/* Connect Instagram banner */}
      {!data?.igAccount && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{
            marginBottom: 24, padding: '18px 20px', borderRadius: 14,
            background: 'linear-gradient(135deg,rgba(255,62,128,0.07),rgba(168,85,247,0.07))',
            border: '1px solid rgba(168,85,247,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#FF3E80,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Instagram size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#FAFAFA', marginBottom: 2 }}>📱 Connect your Instagram account</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                Connect Instagram to run your audit and unlock all Eyebird features.
              </div>
            </div>
          </div>
          <a
            href="/api/instagram/auth"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg,#FF3E80,#A855F7)',
              color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(168,85,247,0.3)',
            }}
          >
            Connect Instagram <ArrowRight size={13} />
          </a>
        </motion.div>
      )}

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', marginBottom: 6 }}>
          {greeting}, {username} {greeting === 'Working late?' ? '🌙' : '👋'}
        </h1>
        {latestAudit ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <ScoreCircle score={latestScore} size={36} />
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Account health: <strong style={{ color: '#FAFAFA' }}>{latestScore}/100</strong>
              {scoreDelta !== null && (
                <span style={{ marginLeft: 6, fontSize: 13, fontWeight: 700, color: scoreDelta >= 0 ? '#22C55E' : '#EF4444' }}>
                  {scoreDelta >= 0 ? <TrendingUp size={13} style={{ display: 'inline', marginRight: 2 }} /> : <TrendingDown size={13} style={{ display: 'inline', marginRight: 2 }} />}
                  {scoreDelta >= 0 ? '+' : ''}{scoreDelta} pts
                </span>
              )}
            </span>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            Your growth story starts with your first audit. Takes 2 minutes.
          </p>
        )}
      </motion.div>

      {/* Today's action card */}
      {(topAction || actionText) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{
            padding: '20px 24px', borderRadius: 14, marginBottom: 24,
            background: 'linear-gradient(135deg,rgba(255,62,128,0.06),rgba(168,85,247,0.06))',
            border: '1px solid rgba(168,85,247,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Zap size={14} style={{ color: '#A855F7', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#A855F7', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Today&apos;s Top Action</span>
          </div>
          <p style={{ fontSize: 15, color: '#FAFAFA', fontWeight: 600, lineHeight: 1.55, marginBottom: 12 }}>
            {topAction || actionText}
          </p>
          <Link
            href="/dashboard/audit"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--brand-mid)', fontWeight: 600, textDecoration: 'none' }}
          >
            View full action plan <ArrowRight size={12} />
          </Link>
        </motion.div>
      )}

      {/* No audit CTA */}
      {!latestAudit && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ padding: '32px', borderRadius: 14, marginBottom: 24, background: 'var(--bg-surface)', border: '1px solid var(--border)', textAlign: 'center' }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#FAFAFA', marginBottom: 8, letterSpacing: '-0.03em' }}>
            Run your first audit to get today&apos;s action item.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 20, lineHeight: 1.6 }}>
            Your growth story starts with your first audit. Takes 2 minutes.
          </p>
          <Link href="/dashboard/audit" className="btn btn-primary" style={{ height: 44, padding: '0 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'inline-flex' }}>
            <Zap size={14} /> Run my first audit
          </Link>
        </motion.div>
      )}

      {/* Quick stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard
          title="Account Health Score"
          value={latestAudit ? latestScore : undefined}
          subtitle={scoreDelta !== null ? `${scoreDelta >= 0 ? '↑' : '↓'} ${Math.abs(scoreDelta)} pts since last audit` : 'First audit'}
          subtitleColor={scoreDelta !== null ? (scoreDelta >= 0 ? '#22C55E' : '#EF4444') : undefined}
          emptyText="No audits yet."
          emptyLink="/dashboard/audit"
          delay={0.1}
        />
        <StatCard
          title="Automations"
          emptyText="Set up your first automation to send DMs while you sleep."
          emptyLink="/dashboard/automations"
          delay={0.15}
        />
        <StatCard
          title="Leads Collected"
          emptyText="Every creator you've helped will show up here."
          emptyLink="/dashboard/contacts"
          delay={0.2}
        />
      </div>

      {/* Score history chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ padding: '20px 24px', borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <BarChart2 size={15} style={{ color: '#A855F7' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em' }}>Your growth over time</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 20 }}>Account health score across all your audits</p>
          {chartData.length === 1 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📈</div>
              Run your next audit in 30 days to see your growth trend.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: '#FAFAFA', fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-secondary)' }}
                />
                <Area type="monotone" dataKey="score" stroke="#A855F7" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: '#A855F7', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      )}

      {/* Latest audit snapshot */}
      {latestAudit && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ padding: '18px 20px', borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Latest Audit</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                — {new Date(latestAudit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {latestAudit.computed_metrics?.engagementRate}% ER · {latestAudit.overall_score}/100 ·{' '}
              {latestAudit.ai_analysis?.hook_avg_score?.toFixed(1)}/10 hook score
            </p>
          </div>
          <Link
            href="/dashboard/audit"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#A855F7', fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}
          >
            View full report <ArrowRight size={13} />
          </Link>
        </motion.div>
      )}

      {/* Upgrade CTA — free plan */}
      {data?.profile?.plan === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ padding: '24px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(255,62,128,0.06),rgba(168,85,247,0.06))', border: '1px solid rgba(168,85,247,0.2)' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#A855F7', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>🔒 Unlock Your Growth Tools</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FAFAFA', marginBottom: 10, letterSpacing: '-0.02em' }}>Creator Plan — ₹799/month</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['Automations (comment → DM, story reply, welcome DM)', 'Monthly re-audit — track your score growth', 'Smart Reply AI inbox', 'Unlimited DMs'].map(feat => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={13} style={{ color: '#22C55E', flexShrink: 0, marginTop: 2 }} />
                    {feat}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
              <Link href="/#pricing" className="btn btn-primary" style={{ height: 44, padding: '0 20px', fontSize: 14, fontWeight: 700, borderRadius: 10, display: 'inline-flex', whiteSpace: 'nowrap' }}>
                Upgrade now →
              </Link>
              <Link href="/#pricing" style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'none' }}>
                See all features
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Lock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FORMAT_LABELS: Record<string, string> = {
  VIDEO: 'Reels', IMAGE: 'Static', CAROUSEL_ALBUM: 'Carousel', REELS: 'Reels',
};
const FORMAT_EMOJI: Record<string, string> = {
  VIDEO: '🎬', IMAGE: '📸', CAROUSEL_ALBUM: '🎠', REELS: '🎬',
};

interface Props {
  engagementRate: number;
  benchmark: string;
  engagementVerdict: string;
  followers: number;
  bestFormat: string;
  bestFormatReason: string;
  formatBreakdown: Record<string, number>;
  hookAvgScore: number;
  estimatedReelMin?: number;
  estimatedReelMax?: number;
}

/* Thin, elegant single bar */
function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / (max * 1.25)) * 100, 100);
  return (
    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        style={{ background: color }}
      />
    </div>
  );
}

/* Animated count-up */
function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const steps = 60;
    const inc = to / steps;
    const timer = setInterval(() => {
      cur += inc;
      if (cur >= to) { setVal(to); clearInterval(timer); return; }
      setVal(cur);
    }, 18);
    return () => clearInterval(timer);
  }, [to]);
  return <>{val.toFixed(decimals)}</>;
}

export default function FreeMetricsSection({
  engagementRate, benchmark, bestFormat, bestFormatReason,
  formatBreakdown, hookAvgScore, estimatedReelMin, estimatedReelMax,
}: Props) {
  const benchNum = parseFloat(benchmark) || 5.5;
  const isHigh = engagementRate >= benchNum;
  const multiple = (engagementRate / benchNum).toFixed(1);
  const engColor = isHigh ? 'var(--success)' : 'var(--danger)';
  const hookColor = hookAvgScore >= 7 ? 'var(--success)' : hookAvgScore >= 5 ? 'var(--warning)' : 'var(--danger)';
  const hookLabel = hookAvgScore >= 9 ? 'Excellent' : hookAvgScore >= 7 ? 'Strong' : hookAvgScore >= 5 ? 'Average' : 'Needs Work';

  const formatData = Object.entries(formatBreakdown || {})
    .map(([k, v]) => ({ name: FORMAT_LABELS[k] || k, posts: v as number, key: k }))
    .filter(d => d.posts > 0)
    .sort((a, b) => b.posts - a.posts).slice(0, 4);

  const totalPosts = formatData.reduce((s, d) => s + d.posts, 0);

  return (
    <div>
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: 'var(--gradient-brand)' }} />
          <p className="eyebrow" style={{ marginBottom: 0 }}>Your snapshot</p>
        </div>
        <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', paddingLeft: 13 }}>
          Here's what we found.
        </h2>
      </motion.div>

      {/* ── CARD 1: Engagement Rate — full-width spotlight ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.05 }}
        whileHover={{ y: -1 }}
        className="mb-4 rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        {/* Top color bar */}
        <div className="h-0.5" style={{ background: isHigh ? 'var(--success)' : 'var(--danger)' }} />

        <div style={{ padding: '28px 28px 24px' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            {/* Left: big number */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="eyebrow">Engagement Rate</p>
                <span
                  className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: isHigh ? 'var(--success-bg)' : 'var(--danger-bg)', color: isHigh ? 'var(--success)' : 'var(--danger)', border: `1px solid ${isHigh ? 'var(--success-border)' : 'var(--danger-border)'}` }}
                >
                  {isHigh ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {isHigh ? 'Above avg' : 'Below avg'}
                </span>
              </div>
              <div className="flex items-end gap-3 mb-5">
                <span className="font-black tabular-nums" style={{ fontSize: 72, letterSpacing: '-0.05em', lineHeight: 1, color: engColor }}>
                  <CountUp to={engagementRate} decimals={2} />%
                </span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                {isHigh
                  ? `You're ${multiple}× the industry average. Your audience is genuinely engaged — rare for your follower count.`
                  : `Below the ${benchmark}% benchmark. You're getting reach but losing it fast. The fix is data-backed.`}
              </p>
            </div>

            {/* Right: comparison visual */}
            <div className="md:w-56 shrink-0">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>Your rate</span>
                    <span className="text-xs font-black tabular-nums" style={{ color: engColor }}>{engagementRate}%</span>
                  </div>
                  <StatBar value={engagementRate} max={Math.max(engagementRate, benchNum)} color={engColor} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>Industry avg</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{benchmark}%</span>
                  </div>
                  <StatBar value={benchNum} max={Math.max(engagementRate, benchNum)} color="rgba(255,255,255,0.2)" />
                </div>
                {isHigh && (
                  <div
                    className="mt-4 px-3 py-2.5 rounded-xl text-center"
                    style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
                  >
                    <p className="text-xs font-bold" style={{ color: 'var(--success)' }}>
                      🔥 {multiple}× industry average
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* ── CARDS 2+3: Side by side ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        {/* Card 2: Content Superpower */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.1 }}
          whileHover={{ y: -1 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="h-0.5" style={{ background: 'var(--brand-mid)' }} />
          <div style={{ padding: '28px 28px 24px' }}>
            <p className="eyebrow mb-4">Content Superpower</p>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{FORMAT_EMOJI[bestFormat] || '📹'}</span>
              <span className="font-black tracking-tight" style={{ fontSize: 36, letterSpacing: '-0.04em', color: 'var(--brand-mid)' }}>
                {FORMAT_LABELS[bestFormat] || bestFormat}
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
              {bestFormatReason}
            </p>

            {/* Format breakdown mini bars */}
            {formatData.length > 0 && (
              <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {formatData.map((d, i) => {
                  const pct = totalPosts > 0 ? Math.round((d.posts / totalPosts) * 100) : 0;
                  const isTop = i === 0;
                  return (
                    <div key={d.key}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium" style={{ color: isTop ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{d.name}</span>
                        <span className="text-xs font-bold tabular-nums" style={{ color: isTop ? 'var(--brand-mid)' : 'var(--text-tertiary)' }}>{pct}%</span>
                      </div>
                      <StatBar value={pct} max={100} color={isTop ? 'var(--brand-mid)' : 'rgba(255,255,255,0.12)'} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Card 3: Hook Strength */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.15 }}
          whileHover={{ y: -1 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="h-0.5" style={{ background: hookColor }} />
          <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="flex items-start justify-between mb-4">
              <p className="eyebrow">Hook Strength</p>
              <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: 'var(--text-tertiary)' }}>
                <Lock size={9} /> Full in paid
              </span>
            </div>

            {/* Score visual */}
            <div className="flex items-end gap-4 mb-5">
              <div>
                <span className="font-black tabular-nums" style={{ fontSize: 64, letterSpacing: '-0.05em', lineHeight: 1, color: hookColor }}>
                  {hookAvgScore}
                </span>
                <span className="text-lg font-bold ml-1" style={{ color: 'var(--text-tertiary)' }}>/10</span>
              </div>
              <div className="mb-2">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${hookColor}15`, color: hookColor, border: `1px solid ${hookColor}30` }}
                >
                  {hookLabel}
                </span>
              </div>
            </div>

            {/* Segmented bar */}
            <div className="flex gap-1 mb-5">
              {Array.from({ length: 10 }, (_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 h-2 rounded-full"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.04, duration: 0.3 }}
                  style={{
                    background: i < Math.round(hookAvgScore)
                      ? hookColor
                      : 'rgba(255,255,255,0.06)',
                  }}
                />
              ))}
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {hookAvgScore >= 7
                ? 'Your opening lines stop the scroll. That\'s rare. Your audience actually wants to watch.'
                : hookAvgScore >= 5
                  ? 'Some hooks land, others lose people in the first second. The difference is in your wording.'
                  : 'Most viewers are skipping before your content even starts. This is your biggest lever.'}
            </p>

            <div className="mt-auto pt-4">
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}
              >
                <Zap size={13} style={{ color: 'var(--brand-mid)', flexShrink: 0 }} />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  AI rewrites your weakest hooks — unlocked in full report
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

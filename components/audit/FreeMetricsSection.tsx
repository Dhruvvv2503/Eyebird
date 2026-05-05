'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Zap, Film, Hash, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface FreeMetricsSectionProps {
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

const FORMAT_LABELS: Record<string, string> = {
  VIDEO: 'Reels',
  IMAGE: 'Static',
  CAROUSEL_ALBUM: 'Carousel',
  REELS: 'Reels',
};

const FORMAT_ICONS: Record<string, string> = {
  VIDEO: '📹',
  IMAGE: '📸',
  CAROUSEL_ALBUM: '🖼️',
  REELS: '📹',
};

function HookDots({ score }: { score: number }) {
  const rounded = Math.round(score);
  return (
    <div className="flex gap-1.5 mt-2">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="w-3.5 h-3.5 rounded-full"
          style={{
            background: i < rounded
              ? (rounded >= 7 ? 'var(--success)' : rounded >= 5 ? 'var(--warning)' : 'var(--danger)')
              : 'var(--bg-overlay)',
            border: '1px solid var(--border)',
          }}
        />
      ))}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function FreeMetricsSection({
  engagementRate, benchmark, engagementVerdict,
  bestFormat, bestFormatReason, formatBreakdown,
  hookAvgScore, estimatedReelMin, estimatedReelMax,
}: FreeMetricsSectionProps) {
  const benchmarkNum = parseFloat(benchmark) || 5.5;
  const isHigh = engagementRate >= benchmarkNum;
  const multiple = benchmarkNum > 0 ? (engagementRate / benchmarkNum).toFixed(1) : '?';

  // Bar chart data for engagement comparison
  const engagementChartData = [
    { name: 'You', value: engagementRate, fill: isHigh ? 'var(--success)' : 'var(--danger)' },
    { name: 'Industry', value: benchmarkNum, fill: 'var(--text-tertiary)' },
  ];

  // Format breakdown chart
  const formatChartData = Object.entries(formatBreakdown || {})
    .map(([key, count]) => ({
      name: FORMAT_LABELS[key] || key,
      posts: count as number,
    }))
    .sort((a, b) => b.posts - a.posts)
    .slice(0, 4);

  const hookColor = hookAvgScore >= 7 ? 'var(--success)' : hookAvgScore >= 5 ? 'var(--warning)' : 'var(--danger)';
  const hookLabel = hookAvgScore >= 9 ? 'Excellent' : hookAvgScore >= 7 ? 'Strong' : hookAvgScore >= 5 ? 'Average' : 'Needs Work';

  return (
    <div className="space-y-4">
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible"
        viewport={{ once: true }} transition={{ duration: 0.4 }}
      >
        <p className="eyebrow mb-1">Here's what we found</p>
        <h2 className="text-2xl font-black text-white tracking-tight" style={{ letterSpacing: '-0.03em' }}>
          Your account, by the numbers.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Card 1 — Engagement Rate */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -2 }}
          className="card p-5 md:col-span-1"
          style={{ borderLeft: `3px solid ${isHigh ? 'var(--success)' : 'var(--danger)'}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="eyebrow">Engagement Rate</p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: isHigh ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: isHigh ? 'var(--success)' : 'var(--danger)',
                border: `1px solid ${isHigh ? 'var(--success-border)' : 'var(--danger-border)'}`,
              }}
            >
              {isHigh ? '✓ Above avg' : '↓ Below avg'}
            </span>
          </div>

          <motion.p
            className="font-black tabular-nums mb-1"
            style={{ fontSize: 44, letterSpacing: '-0.05em', lineHeight: 1, color: isHigh ? 'var(--success)' : 'var(--danger)' }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
          >
            {engagementRate}%
          </motion.p>

          {/* Comparison bars */}
          <div className="my-3 space-y-2">
            {engagementChartData.map(d => {
              const max = Math.max(engagementRate, benchmarkNum) * 1.3;
              const pct = Math.min((d.value / max) * 100, 100);
              return (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="text-xs w-14 shrink-0" style={{ color: 'var(--text-tertiary)' }}>{d.name}</span>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                    <motion.div
                      className="h-full rounded-full flex items-center pl-2 text-xs font-bold text-white"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                      style={{ background: d.fill, minWidth: 36 }}
                    >
                      {d.value}%
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {isHigh
              ? `You're ${multiple}× the industry average. Top tier for brand deals.`
              : `Below the ${benchmark}% benchmark. The fix is in your data.`}
          </p>
        </motion.div>

        {/* Card 2 — Content Superpower */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -2 }}
          className="card p-5 md:col-span-1"
          style={{ borderLeft: '3px solid var(--brand-mid)' }}
        >
          <p className="eyebrow mb-3">Content Superpower</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl">{FORMAT_ICONS[bestFormat] || '📹'}</span>
            <span
              className="font-black"
              style={{ fontSize: 32, letterSpacing: '-0.04em', color: 'var(--brand-mid)' }}
            >
              {FORMAT_LABELS[bestFormat] || bestFormat}
            </span>
          </div>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {bestFormatReason}
          </p>

          {formatChartData.length > 0 && (
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData} margin={{ top: 4, right: 0, bottom: 0, left: -30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="posts" fill="var(--brand-mid)" radius={[3, 3, 0, 0]} name="Posts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Card 3 — Hook Strength */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -2 }}
          className="card p-5 md:col-span-1"
          style={{ borderLeft: `3px solid ${hookColor}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="eyebrow">Hook Strength</p>
            <span className="text-xs font-bold" style={{ color: 'var(--text-tertiary)' }}>
              🔒 Full in paid
            </span>
          </div>
          <p
            className="font-black tabular-nums mb-1"
            style={{ fontSize: 44, letterSpacing: '-0.05em', lineHeight: 1, color: hookColor }}
          >
            {hookAvgScore}<span style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>/10</span>
          </p>
          <div className="flex items-center gap-2 mb-3">
            <HookDots score={hookAvgScore} />
            <span className="text-xs font-semibold" style={{ color: hookColor }}>{hookLabel}</span>
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            {hookAvgScore >= 7
              ? 'Your opening lines stop the scroll. Rare and valuable.'
              : hookAvgScore >= 5
              ? 'Some hooks land, others lose people in the first second.'
              : 'Most of your audience is skipping before they see your content.'}
          </p>
          <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Full breakdown + AI rewrites → unlocked in paid report
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

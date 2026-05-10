'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Lock } from 'lucide-react';

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

/* Count-up number */
function CountUp({ to, decimals = 0, suffix = '' }: { to: number; decimals?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const steps = 60;
    const timer = setInterval(() => {
      cur += to / steps;
      if (cur >= to) { setVal(to); clearInterval(timer); return; }
      setVal(cur);
    }, 18);
    return () => clearInterval(timer);
  }, [to]);
  return <>{val.toFixed(decimals)}{suffix}</>;
}

/* Premium metric card shell */
function MetricCard({
  children,
  accentColor,
  delay = 0,
}: {
  children: React.ReactNode;
  accentColor: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.07)',
        position: 'relative',
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 2, background: accentColor }} />
      {children}
    </motion.div>
  );
}

/* Thin 3px animated bar */
function Bar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  return (
    <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.min(pct, 100)}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
        style={{ height: '100%', borderRadius: 99, background: color }}
      />
    </div>
  );
}

export default function FreeMetricsSection({
  engagementRate, benchmark,
  bestFormat, bestFormatReason,
  formatBreakdown, hookAvgScore,
  estimatedReelMin, estimatedReelMax,
}: Props) {
  const benchNum = parseFloat(benchmark) || 5.5;
  const isHigh = engagementRate >= benchNum;
  const multiple = (engagementRate / benchNum).toFixed(1);
  const engColor = isHigh ? '#22C55E' : '#EF4444';
  const hookColor = hookAvgScore >= 7 ? '#22C55E' : hookAvgScore >= 5 ? '#F59E0B' : '#EF4444';
  const hookLabel = hookAvgScore >= 9 ? 'Excellent' : hookAvgScore >= 7 ? 'Strong' : hookAvgScore >= 5 ? 'Average' : 'Needs Work';

  const formatData = Object.entries(formatBreakdown || {})
    .map(([k, v]) => ({ name: FORMAT_LABELS[k] || k, posts: v as number, key: k }))
    .filter(d => d.posts > 0)
    .sort((a, b) => b.posts - a.posts);

  const totalPosts = formatData.reduce((s, d) => s + d.posts, 0);
  const maxPct = totalPosts > 0 && formatData[0] ? (formatData[0].posts / totalPosts) * 100 : 0;

  return (
    <div>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.4 }}
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: '#7c3aed' }} />
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', margin: 0 }}>
            Your Snapshot
          </p>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', margin: '8px 0 0 0', paddingLeft: 13 }}>
          Here&apos;s what we found.
        </h2>
      </motion.div>

      {/* ── CARD 1: Engagement Rate — full width ── */}
      <div style={{ marginBottom: 16 }}>
        <MetricCard accentColor={isHigh ? '#22C55E' : '#EF4444'} delay={0.05}>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  Engagement Rate
                </p>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                  background: isHigh ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: isHigh ? '#22C55E' : '#EF4444',
                  border: `1px solid ${isHigh ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                }}>
                  {isHigh ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {isHigh ? 'Above average' : 'Below average'}
                </span>
              </div>

              {/* Split layout: big number left, comparison right */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>

                {/* Left: number */}
                <div style={{ flexShrink: 0 }}>
                  <p style={{ fontSize: 72, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: engColor, margin: 0 }}>
                    <CountUp to={engagementRate} decimals={2} />%
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8, lineHeight: 1.6, maxWidth: 280 }}>
                    {isHigh
                      ? `You're ${multiple}× the industry average. Your audience is genuinely engaged — rare for your follower count.`
                      : `Below the ${benchmark}% benchmark. Your audience isn't converting reach into engagement yet.`}
                  </p>
                </div>

                {/* Right: comparison bars */}
                <div style={{ flex: 1, minWidth: 160, paddingTop: 8 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Your rate</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: engColor }}>{engagementRate}%</span>
                    </div>
                    <Bar pct={(engagementRate / (engagementRate * 1.3)) * 100} color={engColor} delay={0.2} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Industry avg</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>5–8%</span>
                    </div>
                    <Bar pct={(benchNum / (engagementRate * 1.3)) * 100} color="rgba(255,255,255,0.18)" delay={0.35} />
                  </div>
                  {isHigh && (
                    <div style={{
                      padding: '10px 14px', borderRadius: 12, textAlign: 'center',
                      background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                    }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#22C55E', margin: 0 }}>
                        🔥 {multiple}× industry average
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </MetricCard>
      </div>

      {/* ── CARDS 2 + 3: Side by side ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Card 2: Content Superpower */}
        <MetricCard accentColor="linear-gradient(90deg, #A855F7, #7C3AED)" delay={0.1}>
          <div style={{ padding: '24px 28px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
              Content Superpower
            </p>

            {/* Big format display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>
                {FORMAT_EMOJI[bestFormat] || '🎬'}
              </div>
              <div>
                <p style={{
                  fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1,
                  background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  margin: 0,
                }}>
                  {FORMAT_LABELS[bestFormat] || bestFormat}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3, fontWeight: 500 }}>
                  Your highest-performing format
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', marginBottom: 18 }}>
              {bestFormatReason}
            </p>

            {/* Format breakdown — only if there's data with > 0 posts */}
            {formatData.length > 0 && (
              <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {formatData.slice(0, 3).map((d, i) => {
                  const pct = totalPosts > 0 ? Math.round((d.posts / totalPosts) * 100) : 0;
                  return (
                    <div key={d.key} style={{ marginBottom: i < formatData.length - 1 ? 10 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)', fontWeight: i === 0 ? 600 : 400 }}>{d.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? '#A855F7' : 'rgba(255,255,255,0.3)' }}>{pct}%</span>
                      </div>
                      <Bar pct={pct} color={i === 0 ? '#A855F7' : 'rgba(255,255,255,0.1)'} delay={0.1 + i * 0.08} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </MetricCard>

        {/* Card 3: Hook Strength */}
        <MetricCard accentColor={hookColor} delay={0.15}>
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Hook Strength
              </p>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>
                <Lock size={9} /> Full in paid
              </span>
            </div>

            {/* Score display */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 72, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: hookColor, margin: 0 }}>
                {hookAvgScore}
              </p>
              <div style={{ paddingBottom: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.25)' }}>/10</span>
                <div style={{ marginTop: 3 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 99,
                    background: `${hookColor}18`, color: hookColor,
                    border: `1px solid ${hookColor}30`,
                  }}>
                    {hookLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* 10-segment visual bar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
              {Array.from({ length: 10 }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scaleY: 0 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 4,
                    background: i < Math.round(hookAvgScore)
                      ? hookColor
                      : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${i < Math.round(hookAvgScore) ? `${hookColor}60` : 'rgba(255,255,255,0.04)'}`,
                    transformOrigin: 'bottom',
                  }}
                />
              ))}
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>
              {hookAvgScore >= 7
                ? 'Your opening lines stop the scroll. That\'s rare. Your audience actually watches.'
                : hookAvgScore >= 5
                  ? 'Some hooks land, others lose people in the first second. The difference is in your wording.'
                  : 'Most viewers are skipping before your content starts. This is your biggest lever.'}
            </p>

            {/* Teaser pill */}
            <div style={{
              marginTop: 'auto',
              padding: '10px 14px', borderRadius: 12,
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.15)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 13 }}>⚡</span>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
                AI rewrites your weakest hooks — unlocked in full report
              </p>
            </div>
          </div>
        </MetricCard>
      </div>
    </div>
  );
}

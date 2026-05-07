'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Flame, Zap, Target } from 'lucide-react';

const TYPE_COLOR: Record<string, string> = {
  REELS: '#A855F7', VIDEO: '#A855F7',
  CAROUSEL_ALBUM: '#F59E0B',
  IMAGE: '#3B82F6',
};
const TYPE_LABEL: Record<string, string> = {
  REELS: 'Reel', VIDEO: 'Video', CAROUSEL_ALBUM: 'Carousel', IMAGE: 'Static',
};

// ── Tiny SVG line chart ────────────────────────────────────────────────────────
function LineChart({ points, color = '#A855F7', height = 60 }: {
  points: { x: number; y: number }[];
  color?: string;
  height?: number;
}) {
  if (points.length < 2) return null;
  const W = 300;
  const H = height;
  const pad = 4;
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const scaleX = (x: number) => pad + ((x - minX) / (maxX - minX || 1)) * (W - pad * 2);
  const scaleY = (y: number) => H - pad - ((y - minY) / (maxY - minY || 1)) * (H - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(p.x).toFixed(1)},${scaleY(p.y).toFixed(1)}`).join(' ');
  const fill = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(p.x).toFixed(1)},${scaleY(p.y).toFixed(1)}`).join(' ')
    + ` L${scaleX(xs[xs.length - 1]).toFixed(1)},${H} L${scaleX(xs[0]).toFixed(1)},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={scaleX(p.x)} cy={scaleY(p.y)} r="3" fill={color} opacity="0.8" />
      ))}
    </svg>
  );
}

// ── Content Performance Timeline ───────────────────────────────────────────────
export function ContentTimeline({ allPostsTimeline }: { allPostsTimeline: any[] }) {
  if (!allPostsTimeline || allPostsTimeline.length < 3) return null;

  const byType: Record<string, any[]> = {};
  allPostsTimeline.forEach(p => {
    const t = p.type || 'IMAGE';
    if (!byType[t]) byType[t] = [];
    byType[t].push(p);
  });

  // Build chart points: x = epoch ms, y = engagementRate
  const allPoints = allPostsTimeline.map(p => ({
    x: new Date(p.date).getTime(),
    y: p.engagementRate,
    type: p.type || 'IMAGE',
  }));

  const globalPoints = allPoints.map(p => ({ x: p.x, y: p.y }));
  const maxER = Math.max(...allPoints.map(p => p.y), 0.1);
  const avgER = parseFloat((allPoints.reduce((s, p) => s + p.y, 0) / allPoints.length).toFixed(2));

  // Best performing type
  const typeAvgs = Object.entries(byType).map(([type, posts]) => ({
    type,
    avg: posts.reduce((s, p) => s + p.engagementRate, 0) / posts.length,
    count: posts.length,
  })).sort((a, b) => b.avg - a.avg);
  const bestType = typeAvgs[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5 }}
      style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
    >
      <div style={{ height: 2, background: 'linear-gradient(90deg,#3B82F6,#A855F7)' }} />
      <div style={{ padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg,#3B82F6,#A855F7)' }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A855F7', margin: 0 }}>Content Performance</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingLeft: 11 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={15} style={{ color: '#3B82F6' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', margin: 0 }}>Engagement Rate Over Time</h3>
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Avg ER', value: `${avgER}%`, color: '#A855F7' },
            { label: 'Peak ER', value: `${maxER.toFixed(2)}%`, color: '#22C55E' },
            { label: 'Posts', value: allPostsTimeline.length, color: '#3B82F6' },
            { label: 'Best Format', value: TYPE_LABEL[bestType?.type] || bestType?.type, color: TYPE_COLOR[bestType?.type] || '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ padding: '6px 12px', borderRadius: 10, background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label} </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Main line chart */}
        <div style={{ marginBottom: 20 }}>
          <LineChart points={globalPoints} color="#A855F7" height={80} />
        </div>

        {/* Per-type mini charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {typeAvgs.map(({ type, avg, count }) => {
            const pts = byType[type].map(p => ({ x: new Date(p.date).getTime(), y: p.engagementRate }));
            const color = TYPE_COLOR[type] || '#6B7280';
            return (
              <div key={type} style={{ padding: '12px 14px', borderRadius: 14, background: `${color}08`, border: `1px solid ${color}20` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{TYPE_LABEL[type] || type}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{count} posts</span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <LineChart points={pts} color={color} height={36} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 900, color }}>{avg.toFixed(2)}%</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>avg ER</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ── 90-Day Growth Projection ───────────────────────────────────────────────────
export function GrowthProjection({ projection, followers }: { projection: any; followers: number }) {
  if (!projection) return null;

  const scenarios = [
    { key: 'conservative', label: projection.conservative?.label || 'Conservative', color: '#3B82F6', data: projection.conservative },
    { key: 'moderate', label: projection.moderate?.label || 'Moderate', color: '#A855F7', data: projection.moderate },
    { key: 'aggressive', label: projection.aggressive?.label || 'Aggressive', color: '#22C55E', data: projection.aggressive },
  ].filter(s => s.data);

  const maxGain = Math.max(...scenarios.map(s => s.data?.day90 || 0), 1);

  const contentTypes = projection.by_content_type || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5 }}
      style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
    >
      <div style={{ height: 2, background: 'linear-gradient(90deg,#22C55E,#A855F7,#3B82F6)' }} />
      <div style={{ padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg,#22C55E,#A855F7)' }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#22C55E', margin: 0 }}>Growth Forecast</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, paddingLeft: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={15} style={{ color: '#22C55E' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', margin: 0 }}>90-Day Growth Projection</h3>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>Current baseline</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>+{(projection.baseline_monthly_growth || 0).toLocaleString('en-IN')}/mo</div>
          </div>
        </div>

        {/* Scenario bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {scenarios.map(({ key, label, color, data }) => (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{label}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>{data?.er_improvement} ER</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums' }}>
                  +{(data?.day90 || 0).toLocaleString('en-IN')} followers
                </span>
              </div>
              {/* 30/60/90 day bar segments */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {[
                  { day: '30d', val: data?.day30 || 0, label: `+${(data?.day30 || 0).toLocaleString()}` },
                  { day: '60d', val: data?.day60 || 0, label: `+${(data?.day60 || 0).toLocaleString()}` },
                  { day: '90d', val: data?.day90 || 0, label: `+${(data?.day90 || 0).toLocaleString()}` },
                ].map(({ day, val, label }) => (
                  <div key={day} style={{ flex: 1 }}>
                    <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 4 }}>
                      <motion.div
                        initial={{ width: 0 }} whileInView={{ width: `${(val / maxGain) * 100}%` }}
                        viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: '100%', background: color, borderRadius: 99 }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase' }}>{day}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color }}>{label}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Actions */}
              {data?.actions && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {data.actions.map((a: string, i: number) => (
                    <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: `${color}10`, border: `1px solid ${color}25`, color: 'rgba(255,255,255,0.5)' }}>
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* By content type */}
        {Object.keys(contentTypes).length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
              Weekly Content Mix
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
              {Object.entries(contentTypes).map(([type, info]: [string, any]) => {
                const color = type === 'reels' ? '#A855F7' : type === 'carousels' ? '#F59E0B' : '#3B82F6';
                return (
                  <div key={type} style={{ padding: '12px 14px', borderRadius: 12, background: `${color}08`, border: `1px solid ${color}20` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'capitalize' }}>{type}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color }}>{info.weekly_target}×/wk</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#22C55E', fontWeight: 700, marginBottom: 4 }}>
                      {info.expected_reach_multiplier}× reach multiplier
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: 0 }}>{info.reason}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.5 }}>
            ⚠️ Projections are AI estimates based on your current metrics and industry benchmarks. Actual results depend on content quality and consistency.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Viral Post Reverse Engineering ─────────────────────────────────────────────
export function ViralReverseEngineering({ viral }: { viral: any }) {
  if (!viral || !viral.posts || viral.posts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5 }}
      style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
    >
      <div style={{ height: 2, background: 'linear-gradient(90deg,#FF3E80,#F59E0B)' }} />
      <div style={{ padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg,#FF3E80,#F59E0B)' }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FF3E80', margin: 0 }}>Viral Reverse Engineering</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingLeft: 11 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,62,128,0.1)', border: '1px solid rgba(255,62,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={15} style={{ color: '#FF3E80' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', margin: 0 }}>Why Your Best Posts Went Viral</h3>
        </div>

        {/* Viral formula */}
        {viral.viral_formula && (
          <div style={{ marginBottom: 20, padding: '16px 18px', borderRadius: 14, background: 'rgba(255,62,128,0.07)', border: '1px solid rgba(255,62,128,0.2)', borderLeft: '3px solid #FF3E80' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FF3E80', marginBottom: 6 }}>🔥 Your Viral Formula</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'white', lineHeight: 1.65, margin: 0 }}>{viral.viral_formula}</p>
          </div>
        )}

        {/* Post cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {viral.posts.slice(0, 5).map((post: any, i: number) => {
            const color = TYPE_COLOR[post.format] || '#6B7280';
            const scoreColor = post.score >= 8 ? '#22C55E' : post.score >= 6 ? '#F59E0B' : '#EF4444';
            return (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ height: 2, background: `linear-gradient(90deg,${color},#FF3E80)` }} />
                <div style={{ padding: '16px 18px' }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: `${color}18`, color, border: `1px solid ${color}30`, fontWeight: 700 }}>
                          {TYPE_LABEL[post.format] || post.format}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                          {post.likes?.toLocaleString('en-IN')} likes · {post.comments?.toLocaleString('en-IN')} comments · {post.engagement_rate}% ER
                        </span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, margin: 0 }}>
                        "{post.hook}"
                      </p>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'center', padding: '8px 12px', borderRadius: 12, background: `${scoreColor}10`, border: `1px solid ${scoreColor}25` }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{post.score}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>/10</div>
                    </div>
                  </div>

                  {/* Why it worked */}
                  {post.why_it_worked && post.why_it_worked.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>Why it worked</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {post.why_it_worked.map((reason: string, j: number) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <Zap size={11} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, margin: 0 }}>{reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Replication template */}
                  {post.replication_template && (
                    <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,62,128,0.06)', border: '1px solid rgba(255,62,128,0.18)' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#FF3E80', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>🔁 Replicate This</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, margin: 0 }}>{post.replication_template}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

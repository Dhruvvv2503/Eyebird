'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Flame, Zap, Target, ArrowRight, CheckCircle2, Info } from 'lucide-react';

const TYPE_COLOR: Record<string, string> = { REELS: '#A855F7', VIDEO: '#A855F7', CAROUSEL_ALBUM: '#F59E0B', IMAGE: '#3B82F6' };
const TYPE_LABEL: Record<string, string> = { REELS: 'Reels', VIDEO: 'Video', CAROUSEL_ALBUM: 'Carousel', IMAGE: 'Static Posts' };

// ── Mini SVG sparkline ──────────────────────────────────────────────────────────
function Sparkline({ points, color = '#A855F7' }: { points: { x: number; y: number }[]; color?: string }) {
  if (points.length < 2) return null;
  const W = 200; const H = 48; const pad = 4;
  const xs = points.map(p => p.x); const ys = points.map(p => p.y);
  const minX = Math.min(...xs); const maxX = Math.max(...xs);
  const minY = Math.min(...ys); const maxY = Math.max(...ys);
  const sx = (x: number) => pad + ((x - minX) / (maxX - minX || 1)) * (W - pad * 2);
  const sy = (y: number) => H - pad - ((y - minY) / (maxY - minY || 1)) * (H - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const fill = d + ` L${sx(xs[xs.length - 1]).toFixed(1)},${H} L${sx(xs[0]).toFixed(1)},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gl${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#gl${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Content Performance Timeline ────────────────────────────────────────────────
export function ContentTimeline({ allPostsTimeline }: { allPostsTimeline: any[] }) {
  if (!allPostsTimeline || allPostsTimeline.length < 3) return null;

  const byType: Record<string, any[]> = {};
  allPostsTimeline.forEach(p => {
    const t = p.type || 'IMAGE';
    if (!byType[t]) byType[t] = [];
    byType[t].push(p);
  });

  const globalPts = allPostsTimeline.map(p => ({ x: new Date(p.date).getTime(), y: p.engagementRate }));
  const avgER = (globalPts.reduce((s, p) => s + p.y, 0) / globalPts.length).toFixed(2);
  const peakER = Math.max(...globalPts.map(p => p.y)).toFixed(2);
  const typeAvgs = Object.entries(byType).map(([type, posts]) => ({
    type, count: posts.length,
    avg: (posts.reduce((s, p) => s + p.engagementRate, 0) / posts.length).toFixed(2),
    pts: posts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(p => ({ x: new Date(p.date).getTime(), y: p.engagementRate })),
  })).sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
      <div style={{ height: 2, background: 'linear-gradient(90deg,#3B82F6,#A855F7)' }} />
      <div style={{ padding: '24px 28px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3B82F6', marginBottom: 4 }}>Content Performance</p>
        <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', marginBottom: 6 }}>Engagement Rate Over Time</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.6 }}>
          How each post performed across your last {allPostsTimeline.length} posts — broken down by format.
        </p>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Average ER', value: `${avgER}%`, sub: 'across all posts', color: '#A855F7' },
            { label: 'Peak ER', value: `${peakER}%`, sub: 'single best post', color: '#22C55E' },
            { label: 'Posts Analysed', value: allPostsTimeline.length, sub: 'total data points', color: '#3B82F6' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px', borderRadius: 14, background: `${s.color}0A`, border: `1px solid ${s.color}22` }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Per-format breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {typeAvgs.map(({ type, avg, count, pts }) => {
            const color = TYPE_COLOR[type] || '#6B7280';
            return (
              <div key={type} style={{ padding: '16px', borderRadius: 14, background: `${color}08`, border: `1px solid ${color}20` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{TYPE_LABEL[type] || type}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{count} posts</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1, marginBottom: 2 }}>{avg}%</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>avg engagement rate</div>
                <Sparkline points={pts} color={color} />
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ── Growth Projection ───────────────────────────────────────────────────────────
export function GrowthProjection({ projection, followers }: { projection: any; followers: number }) {
  if (!projection) return null;

  const scenarios = [
    { key: 'conservative', emoji: '🌱', color: '#3B82F6', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.15)', data: projection.conservative },
    { key: 'moderate',     emoji: '🚀', color: '#A855F7', bg: 'rgba(168,85,247,0.06)',  border: 'rgba(168,85,247,0.15)',  data: projection.moderate },
    { key: 'aggressive',   emoji: '⚡', color: '#22C55E', bg: 'rgba(34,197,94,0.06)',   border: 'rgba(34,197,94,0.15)',   data: projection.aggressive },
  ].filter(s => s.data);

  const contentTypes = projection.by_content_type || {};
  const typeColorMap: Record<string, string> = { reels: '#A855F7', carousels: '#F59E0B', static: '#3B82F6' };
  const typeEmojiMap: Record<string, string> = { reels: '🎬', carousels: '🎠', static: '🖼️' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
      <div style={{ height: 2, background: 'linear-gradient(90deg,#22C55E,#A855F7,#3B82F6)' }} />
      <div style={{ padding: '24px 28px' }}>
        {/* Header */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#22C55E', marginBottom: 4 }}>Growth Forecast</p>
        <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', marginBottom: 6 }}>90-Day Growth Projection</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 8 }}>
          Three paths depending on how aggressively you follow the plan. Pick one and commit.
        </p>

        {/* Current baseline callout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 24 }}>
          <Info size={14} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Without any changes</span>, you're on track for ~<span style={{ fontWeight: 700, color: 'white' }}>+{(projection.baseline_monthly_growth || 0).toLocaleString('en-IN')} followers/month</span> at your current pace.
          </p>
        </div>

        {/* Scenario cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
          {scenarios.map(({ key, emoji, color, bg, border, data }) => (
            <div key={key} style={{ borderRadius: 16, background: bg, border: `1px solid ${border}`, overflow: 'hidden' }}>
              <div style={{ height: 2, background: color }} />
              <div style={{ padding: '20px 22px' }}>

                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{emoji}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{data.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      Engagement rate improves by <span style={{ color, fontWeight: 700 }}>{data.er_improvement}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>In 90 days</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>+{(data.day90 || 0).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>followers</div>
                  </div>
                </div>

                {/* 30 / 60 / 90 day milestones */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[
                    { label: 'Month 1', sub: '30 days', val: data.day30 || 0 },
                    { label: 'Month 2', sub: '60 days', val: data.day60 || 0 },
                    { label: 'Month 3', sub: '90 days', val: data.day90 || 0 },
                  ].map(({ label, sub, val }) => (
                    <div key={sub} style={{ padding: '12px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>+{val.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Actions as numbered steps */}
                {data.actions && data.actions.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                      What to do
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {data.actions.map((action: string, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color }}>{i + 1}</span>
                          </div>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: 0 }}>{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly content mix */}
        {Object.keys(contentTypes).length > 0 && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Weekly Content Mix</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>How many posts of each type to publish every week, and why</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: '100%' }}>
              {Object.entries(contentTypes).map(([type, info]: [string, any]) => {
                const color = typeColorMap[type] || '#6B7280';
                const emoji = typeEmojiMap[type] || '📄';
                return (
                  <div key={type} style={{ padding: '16px', borderRadius: 14, background: `${color}08`, border: `1px solid ${color}20` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>{emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color, textTransform: 'capitalize' }}>{type}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                      <span style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{info.weekly_target}</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>posts/week</span>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: '#22C55E18', border: '1px solid #22C55E25', marginBottom: 10 }}>
                      <TrendingUp size={10} style={{ color: '#22C55E' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E' }}>{info.expected_reach_multiplier}× reach multiplier</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, margin: 0 }}>{info.reason}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.5 }}>
            ⚠️ AI-estimated projections based on your current metrics + industry benchmarks. Actual results depend on content quality and consistency.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Viral Post Reverse Engineering ──────────────────────────────────────────────
export function ViralReverseEngineering({ viral }: { viral: any }) {
  if (!viral || !viral.posts || viral.posts.length === 0) return null;
  const scoreColor = (s: number) => s >= 8 ? '#22C55E' : s >= 6 ? '#F59E0B' : '#EF4444';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
      <div style={{ height: 2, background: 'linear-gradient(90deg,#FF3E80,#F59E0B)' }} />
      <div style={{ padding: '24px 28px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FF3E80', marginBottom: 4 }}>Viral Reverse Engineering</p>
        <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', marginBottom: 6 }}>Why Your Best Posts Went Viral</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.6 }}>
          AI breakdown of your top posts — the exact patterns that drove engagement, and a copy-paste template to replicate each one.
        </p>

        {viral.viral_formula && (
          <div style={{ marginBottom: 20, padding: '18px', borderRadius: 14, background: 'rgba(255,62,128,0.07)', border: '1px solid rgba(255,62,128,0.22)', borderLeft: '3px solid #FF3E80' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FF3E80', marginBottom: 8 }}>🔥 Your Viral Formula</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'white', lineHeight: 1.65, margin: 0 }}>{viral.viral_formula}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {viral.posts.slice(0, 5).map((post: any, i: number) => {
            const color = TYPE_COLOR[post.format] || '#6B7280';
            const sc = scoreColor(post.score);
            return (
              <div key={i} style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                <div style={{ height: 2, background: `linear-gradient(90deg,${color},#FF3E80)` }} />
                <div style={{ padding: '18px 20px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: `${color}18`, color, border: `1px solid ${color}30`, fontWeight: 700 }}>
                          {TYPE_LABEL[post.format] || post.format}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                          ❤️ {(post.likes || 0).toLocaleString('en-IN')} &nbsp;💬 {(post.comments || 0).toLocaleString('en-IN')} &nbsp;📈 {post.engagement_rate}% ER
                        </span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                        "{post.hook}"
                      </p>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'center', padding: '10px 14px', borderRadius: 12, background: `${sc}10`, border: `1px solid ${sc}25` }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: sc, lineHeight: 1 }}>{post.score}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>/10 viral</div>
                    </div>
                  </div>

                  {/* Why it worked */}
                  {post.why_it_worked?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Why it worked</div>
                      {post.why_it_worked.map((r: string, j: number) => (
                        <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                          <Zap size={11} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>{r}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Replicate */}
                  {post.replication_template && (
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,62,128,0.06)', border: '1px solid rgba(255,62,128,0.18)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <ArrowRight size={11} style={{ color: '#FF3E80' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#FF3E80', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Replicate This</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>{post.replication_template}</p>
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

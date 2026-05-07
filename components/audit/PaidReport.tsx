'use client';

import { motion } from 'framer-motion';
import { Clock, Hash, Zap, IndianRupee, Search, TrendingUp } from 'lucide-react';
import HeatmapGrid from '@/components/audit/HeatmapGrid';
import { ContentTimeline, GrowthProjection, ViralReverseEngineering } from '@/components/audit/InsightSections';

const FORMAT_LABELS: Record<string, string> = {
  VIDEO: 'Reels', IMAGE: 'Static', CAROUSEL_ALBUM: 'Carousel', REELS: 'Reels',
};

/* ── Shared shell matching FreeMetricsSection MetricCard ── */
function PCard({ children, accent, delay = 0 }: { children: React.ReactNode; accent: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      style={{
        borderRadius: 20, overflow: 'hidden',
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ height: 2, background: accent }} />
      {children}
    </motion.div>
  );
}

/* ── Section header with left accent bar ── */
function SHead({ icon: Icon, label, title }: { icon: React.ElementType; label: string; title: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: 'linear-gradient(180deg, #FF3E80, #A855F7)' }} />
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-mid)', margin: 0 }}>{label}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 11 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} style={{ color: 'var(--brand-mid)' }} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', margin: 0 }}>{title}</h3>
      </div>
    </div>
  );
}

/* ── Animated progress bar ── */
function PBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{score}/100</span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }} whileInView={{ width: `${score}%` }} viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ height: '100%', borderRadius: 99, background: color }}
        />
      </div>
    </div>
  );
}

interface PaidReportProps {
  ai: {
    profile_completeness_score: number;
    bio_verdict: string;
    bio_rewrite: string;
    bio_rewrite_reason: string;
    best_format: string;
    best_format_reason: string;
    posting_frequency_score: number;
    posting_frequency_verdict: string;
    best_posting_time: string;
    best_posting_time_reason: string;
    hook_avg_score: number;
    hook_scores?: Array<{ hook: string; score: number; verdict: string }>;
    weakest_hook?: string;
    weakest_hook_rewrite: string;
    hashtag_score: number;
    hashtag_verdict: string;
    recommended_hashtags: string[];
    recommended_hashtags_reason?: string;
    brand_readiness_score: number;
    brand_readiness_verdict: string;
    estimated_rates: {
      story: { min: number; max: number };
      reel: { min: number; max: number };
      carousel: { min: number; max: number };
      monthly_package: { min: number; max: number };
    };
    action_plan: Array<{
      rank: number;
      impact: string;
      problem: string;
      root_cause: string;
      exact_fix: string;
      expected_result: string;
    }>;
    heatmap_data?: number[][];
    best_posting_times?: Array<{ day: string; hour: number; label: string }>;
    viral_reverse_engineering?: any;
    growth_projection?: any;
  };
  m: {
    bio: string;
    formatBreakdown: Record<string, number>;
    engagementRate: number;
    followers: number;
    topHashtags?: Array<{ tag: string; count: number }>;
    allPostsTimeline?: any[];
  };
}

const hookColor = (s: number) => s >= 7 ? '#22C55E' : s >= 5 ? '#F59E0B' : '#EF4444';
const hookVerdict = (s: number) => s >= 9 ? 'Great' : s >= 7 ? 'Strong' : s >= 5 ? 'Average' : 'Weak';

export default function PaidReport({ ai, m }: PaidReportProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── NEW: Content Performance Timeline ── */}
      <ContentTimeline allPostsTimeline={m.allPostsTimeline || []} />

      {/* ── NEW: Growth Projection ── */}
      <GrowthProjection projection={ai.growth_projection} followers={m.followers} />

      {/* ── NEW: Viral Reverse Engineering ── */}
      <ViralReverseEngineering viral={ai.viral_reverse_engineering} />

      {/* ── A: Best Time to Post ── */}
      <PCard accent="linear-gradient(90deg,#A855F7,#7C3AED)" delay={0}>
        <div style={{ padding: '24px 28px' }}>
          <SHead icon={Clock} label="Best Time to Post" title="When your audience is most active" />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.6 }}>
            Based on your audience's real activity patterns — not a generic guide.
          </p>
          <HeatmapGrid data={ai.heatmap_data || []} highlightSlots={ai.best_posting_times || []} />
          <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 14, background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)', borderLeft: '3px solid #A855F7' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#A855F7', marginBottom: 4 }}>AI Recommendation</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>{ai.best_posting_time}</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{ai.best_posting_time_reason}</p>
          </div>
          <PBar score={ai.posting_frequency_score} label="Posting Frequency" />
        </div>
      </PCard>

      {/* ── B: Hook Quality ── */}
      <PCard accent="linear-gradient(90deg,#F59E0B,#EF4444)" delay={0.05}>
        <div style={{ padding: '24px 28px' }}>
          <SHead icon={Zap} label="Hook Quality Analysis" title="How well your hooks stop the scroll" />
          {ai.hook_scores && ai.hook_scores.length > 0 ? (
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', padding: '10px 16px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Hook</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginRight: 16 }}>Score</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Grade</span>
              </div>
              {ai.hook_scores.slice(0, 10).map((h, i) => {
                const c = hookColor(h.score);
                return (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '1fr auto auto',
                    padding: '12px 16px', alignItems: 'center',
                    borderBottom: i < ai.hook_scores!.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, paddingRight: 12 }}>
                      "{h.hook.length > 55 ? h.hook.slice(0, 52) + '…' : h.hook}"
                    </p>
                    <span style={{ fontSize: 16, fontWeight: 900, color: c, marginRight: 16, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                      {h.score}/10
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${c}18`, color: c, border: `1px solid ${c}30`, whiteSpace: 'nowrap' }}>
                      {hookVerdict(h.score)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Weakest hook rewrite */}
          {ai.weakest_hook_rewrite && (
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(168,85,247,0.25)' }}>
              <div style={{ height: 2, background: 'linear-gradient(90deg,#FF3E80,#A855F7)' }} />
              <div style={{ padding: '16px 18px', background: 'rgba(168,85,247,0.06)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#A855F7', marginBottom: 10 }}>🔁 Your weakest hook — rewritten by AI</p>
                {ai.weakest_hook && (
                  <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Original:</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', fontStyle: 'italic' }}>"{ai.weakest_hook}"</p>
                  </div>
                )}
                <p style={{ fontSize: 11, fontWeight: 700, color: '#A855F7', marginBottom: 6 }}>AI Rewrite ✨</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.6 }}>"{ai.weakest_hook_rewrite}"</p>
              </div>
            </div>
          )}
        </div>
      </PCard>

      {/* ── C: Hashtag Strategy ── */}
      <PCard accent="linear-gradient(90deg,#3B82F6,#A855F7)" delay={0.05}>
        <div style={{ padding: '24px 28px' }}>
          <SHead icon={Hash} label="Hashtag Strategy" title="Niche-matched tags for Explore reach" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 16 }}>
            {m.topHashtags && m.topHashtags.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Your current hashtags</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {m.topHashtags.slice(0, 12).map((h) => (
                    <span key={h.tag} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>#{h.tag}</span>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', lineHeight: 1.6 }}>{ai.hashtag_verdict}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Recommended goldzone hashtags</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {ai.recommended_hashtags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E', fontFamily: 'monospace' }}>{tag}</span>
                ))}
              </div>
              {ai.recommended_hashtags_reason && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', lineHeight: 1.6 }}>{ai.recommended_hashtags_reason}</p>
              )}
            </div>
          </div>
          <PBar score={ai.hashtag_score} label="Hashtag Score" />
        </div>
      </PCard>

      {/* ── D: Rate Card ── */}
      <PCard accent="linear-gradient(90deg,#22C55E,#A855F7)" delay={0.05}>
        <div style={{ padding: '24px 28px' }}>
          <SHead icon={IndianRupee} label="Your Brand Rate Card" title="What brands should pay you" />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.6 }}>
            Based on your {m.engagementRate}% ER and {(m.followers || 0).toLocaleString('en-IN')} followers.
          </p>
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 14 }}>
            {[
              { label: 'Instagram Story', rates: ai.estimated_rates?.story, highlight: false, emoji: '📖' },
              { label: 'Dedicated Reel', rates: ai.estimated_rates?.reel, highlight: true, emoji: '🎬' },
              { label: 'Carousel Post', rates: ai.estimated_rates?.carousel, highlight: false, emoji: '🎠' },
              { label: 'Monthly Retainer', rates: ai.estimated_rates?.monthly_package, highlight: false, emoji: '📅' },
            ].filter(r => r.rates).map((row, i, arr) => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px',
                background: row.highlight ? 'rgba(168,85,247,0.07)' : 'transparent',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{row.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: row.highlight ? 700 : 500, color: row.highlight ? 'white' : 'rgba(255,255,255,0.6)' }}>{row.label}</span>
                  {row.highlight && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(168,85,247,0.15)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.3)' }}>Most popular</span>}
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: row.highlight ? '#A855F7' : 'white', fontVariantNumeric: 'tabular-nums' }}>
                  ₹{row.rates!.min.toLocaleString('en-IN')} – ₹{row.rates!.max.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <p style={{ fontSize: 13, color: '#22C55E', lineHeight: 1.6 }}>
              💡 Most creators in your niche charge 40% less than what brands are willing to pay. Don't undersell yourself.
            </p>
          </div>
          <PBar score={ai.brand_readiness_score} label="Brand Readiness Score" />
        </div>
      </PCard>

      {/* ── E: Bio Rewrite ── */}
      <PCard accent="linear-gradient(90deg,#FF3E80,#A855F7)" delay={0.05}>
        <div style={{ padding: '24px 28px' }}>
          <SHead icon={Search} label="Bio Rewrite" title="Your bio — rewritten by AI" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 14 }}>
            <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Current Bio</p>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', whiteSpace: 'pre-wrap' }}>{m.bio || 'No bio found.'}</p>
            </div>
            <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.25)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#A855F7', marginBottom: 8 }}>AI Rewrite ✨</p>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'white', fontWeight: 600, whiteSpace: 'pre-wrap' }}>{ai.bio_rewrite || '—'}</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', lineHeight: 1.6 }}>Why: {ai.bio_rewrite_reason}</p>
          <PBar score={ai.profile_completeness_score} label="Profile Completeness" />
        </div>
      </PCard>

      {/* ── F: Growth Roadmap ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <div style={{ textAlign: 'center', padding: '12px 0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 6 }}>
            <div style={{ width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg,#FF3E80,#A855F7)' }} />
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-mid)', margin: 0 }}>Your Roadmap</p>
          </div>
          <h2 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, letterSpacing: '-0.04em', color: 'white', marginBottom: 8 }}>
            3 moves that will change your numbers.
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', maxWidth: 400, margin: '0 auto' }}>
            Not generic advice. Pulled directly from your account's data. Ranked by impact.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ai.action_plan.map((action, i) => {
            const COLORS = [
              { from: '#FF3E80', to: '#A855F7', accent: 'rgba(255,62,128,0.12)', border: 'rgba(255,62,128,0.25)', bar: 'linear-gradient(90deg,#FF3E80,#A855F7)' },
              { from: '#A855F7', to: '#7C3AED', accent: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)', bar: 'linear-gradient(90deg,#A855F7,#7C3AED)' },
              { from: '#3B82F6', to: '#7C3AED', accent: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', bar: 'linear-gradient(90deg,#3B82F6,#7C3AED)' },
            ];
            const c = COLORS[i] || COLORS[2];
            const isHigh = action.impact === 'HIGH';
            return (
              <motion.div
                key={action.rank}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
              >
                <div style={{ height: 2, background: c.bar }} />
                <div style={{ padding: '22px 24px' }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg,${c.from},${c.to})`, boxShadow: `0 4px 16px ${c.from}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: 15 }}>
                        {action.rank}
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', lineHeight: 1.35, letterSpacing: '-0.02em', marginTop: 2 }}>{action.problem}</h3>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '0.06em', textTransform: 'uppercase', background: isHigh ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: isHigh ? '#EF4444' : '#F59E0B', border: `1px solid ${isHigh ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
                      {action.impact}
                    </span>
                  </div>
                  {/* Root cause */}
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 5 }}>Root Cause</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{action.root_cause}</p>
                  </div>
                  {/* Exact fix */}
                  <div style={{ padding: '14px 16px', borderRadius: 12, background: c.accent, border: `1px solid ${c.border}`, marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>Exact Fix</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'white', lineHeight: 1.65 }}>{action.exact_fix}</p>
                  </div>
                  {/* Expected result */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <TrendingUp size={14} style={{ color: '#22C55E', marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#22C55E', lineHeight: 1.6 }}>{action.expected_result}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}

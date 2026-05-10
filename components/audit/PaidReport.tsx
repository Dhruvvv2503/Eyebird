'use client';

import { motion } from 'framer-motion';
import { Clock, Hash, Zap, IndianRupee, Search, TrendingUp } from 'lucide-react';
import HeatmapGrid, { computeHeatmap, deriveRecommendation, PostForHeatmap } from '@/components/audit/HeatmapGrid';
import { ContentTimeline, GrowthProjection, ViralReverseEngineering } from '@/components/audit/InsightSections';

const FORMAT_LABELS: Record<string, string> = {
  VIDEO: 'Reels', IMAGE: 'Static', CAROUSEL_ALBUM: 'Carousel', REELS: 'Reels',
};

/* ── Section divider ── */
function SDivider() {
  return (
    <div style={{ height: 1, width: '100%', background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.45) 50%, transparent 100%)', margin: '4px 0' }} />
  );
}

/* ── Section wrapper (no card — sits on page bg) ── */
function PCard({ children, delay = 0 }: { children: React.ReactNode; accent?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Section header with left accent bar ── */
function SHead({ icon: Icon, label, title }: { icon: React.ElementType; label: string; title: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: '#7c3aed' }} />
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', margin: 0 }}>{label}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} style={{ color: '#a78bfa' }} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: 0 }}>{title}</h3>
      </div>
    </div>
  );
}

/* ── Animated progress bar ── */
function PBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{score}/100</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }} whileInView={{ width: `${score}%` }} viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ height: '100%', borderRadius: 2, background: color }}
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
  const _posts = (m.allPostsTimeline || []) as PostForHeatmap[];
  const recommendationText = deriveRecommendation(computeHeatmap(_posts)) || ai.best_posting_time;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── NEW: Content Performance Timeline ── */}
      <ContentTimeline allPostsTimeline={m.allPostsTimeline || []} />

      {/* ── NEW: Growth Projection ── */}
      <GrowthProjection projection={ai.growth_projection} followers={m.followers} />

      {/* ── NEW: Viral Reverse Engineering ── */}
      <ViralReverseEngineering viral={ai.viral_reverse_engineering} />

      {/* ── A: Best Time to Post ── */}
      <PCard delay={0}>
        <SHead icon={Clock} label="Best Time to Post" title="When your audience is most active" />
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20, lineHeight: 1.6 }}>
          Based on your audience&apos;s real activity patterns — not a generic guide.
        </p>
        <HeatmapGrid posts={_posts} />
        <div style={{ height: 3, width: '100%', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6) 50%, transparent)', borderRadius: 2, margin: '14px 0' }} />
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 20px', marginTop: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#a78bfa', textTransform: 'uppercase' as const, marginBottom: 6 }}>AI Recommendation</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 6 }}>{recommendationText}</div>
          <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>{ai.best_posting_time_reason}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>Posting Frequency</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: ai.posting_frequency_score >= 70 ? '#22c55e' : ai.posting_frequency_score >= 50 ? '#f59e0b' : '#f97316' }}>{ai.posting_frequency_score}/100</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${ai.posting_frequency_score}%`, background: '#f97316', borderRadius: 2 }} />
        </div>
      </PCard>

      {/* ── B: Hook Quality ── */}
      <PCard delay={0.05}>
        <SHead icon={Zap} label="Hook Quality Analysis" title="How well your hooks stop the scroll" />
        {ai.hook_scores && ai.hook_scores.length > 0 ? (
          <div style={{ width: '100%', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px', padding: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6b7280' }}>Hook</span>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6b7280', textAlign: 'right' as const }}>Score</span>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6b7280', textAlign: 'right' as const }}>Grade</span>
            </div>
            {ai.hook_scores.slice(0, 10).map((h, i) => {
              const c = hookColor(h.score);
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 90px',
                  padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center',
                }}>
                  <p style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.4, paddingRight: 12 }}>
                    &ldquo;{h.hook.length > 55 ? h.hook.slice(0, 52) + '…' : h.hook}&rdquo;
                  </p>
                  <span style={{ fontSize: 14, fontWeight: 600, color: c, textAlign: 'right' as const }}>
                    {h.score}/10
                  </span>
                  <div style={{ textAlign: 'right' as const }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: `${c}1e`, color: c, border: `1px solid ${c}33`, whiteSpace: 'nowrap' as const }}>
                      {hookVerdict(h.score)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Weakest hook rewrite */}
        {ai.weakest_hook_rewrite && (
          <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '18px 22px', marginTop: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#a78bfa', textTransform: 'uppercase' as const, marginBottom: 12 }}>
              ✏ Your Weakest Hook — Rewritten by AI
            </div>
            {ai.weakest_hook && (
              <>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Original:</div>
                <div style={{ fontSize: 13, color: '#6b7280', textDecoration: 'line-through', marginBottom: 14 }}>&ldquo;{ai.weakest_hook}&rdquo;</div>
              </>
            )}
            <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, marginBottom: 6 }}>AI Rewrite ✨</div>
            <div style={{ fontSize: 14, color: 'white', fontWeight: 500 }}>&ldquo;{ai.weakest_hook_rewrite}&rdquo;</div>
          </div>
        )}
      </PCard>

      {/* ── C: Hashtag Strategy ── */}
      <PCard delay={0.05}>
        <SHead icon={Hash} label="Hashtag Strategy" title="Niche-matched tags for Explore reach" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 16 }}>
          {m.topHashtags && m.topHashtags.length > 0 ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: 12 }}>Your Current Hashtags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {m.topHashtags.slice(0, 12).map((h) => (
                  <span key={h.tag} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, padding: '4px 12px', fontSize: 12, color: '#9ca3af' }}>#{h.tag}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, fontStyle: 'italic' }}>{ai.hashtag_verdict}</p>
            </div>
          ) : <div />}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: 12 }}>Recommended Goldzone Hashtags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {ai.recommended_hashtags.map(tag => (
                <span key={tag} style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 9999, padding: '4px 12px', fontSize: 12, color: '#a78bfa' }}>{tag}</span>
              ))}
            </div>
            {ai.recommended_hashtags_reason && (
              <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{ai.recommended_hashtags_reason}</p>
            )}
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>Hashtag Score</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>{ai.hashtag_score}/100</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${ai.hashtag_score}%`, background: '#f59e0b', borderRadius: 2 }} />
          </div>
        </div>
      </PCard>

      {/* ── D: Rate Card ── */}
      <PCard delay={0.05}>
        <SHead icon={IndianRupee} label="Your Brand Rate Card" title="What brands should pay you" />
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20, lineHeight: 1.6 }}>
          Based on your {m.engagementRate}% ER and {(m.followers || 0).toLocaleString('en-IN')} followers.
        </p>
        {[
          { label: 'Instagram Story', rates: ai.estimated_rates?.story, emoji: '📖', priceColor: '#9ca3af' },
          { label: 'Dedicated Reel', rates: ai.estimated_rates?.reel, emoji: '🎬', priceColor: '#ec4899', popular: true },
          { label: 'Carousel Post', rates: ai.estimated_rates?.carousel, emoji: '🎠', priceColor: '#a78bfa' },
          { label: 'Monthly Retainer', rates: ai.estimated_rates?.monthly_package, emoji: '📅', priceColor: '#22c55e' },
        ].filter(r => r.rates).map((row, i, arr) => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{row.emoji}</div>
              <span style={{ fontSize: 14, color: 'white' }}>{row.label}</span>
              {row.popular && <span style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', borderRadius: 9999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>Most popular</span>}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: row.priceColor }}>
              ₹{row.rates!.min.toLocaleString('en-IN')} – ₹{row.rates!.max.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
        <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 10, padding: '12px 16px', marginTop: 16, fontSize: 12, color: '#eab308', lineHeight: 1.6 }}>
          💡 Most creators in your niche charge 40% less than what brands are willing to pay. Don&apos;t undersell yourself.
        </div>
        <PBar score={ai.brand_readiness_score} label="Brand Readiness Score" />
      </PCard>

      {/* ── E: Bio Rewrite ── */}
      <PCard delay={0.05}>
        <SHead icon={Search} label="Bio Rewrite" title="Your bio — rewritten by AI" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: 12 }}>Current Bio</div>
            <div style={{ fontSize: 13, color: '#4b5563', textDecoration: 'line-through', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{m.bio || 'No bio found.'}</div>
          </div>
          <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#a78bfa', textTransform: 'uppercase' as const, marginBottom: 12 }}>AI Rewrite ✨</div>
            <div style={{ fontSize: 14, color: 'white', fontWeight: 500, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{ai.bio_rewrite || '—'}</div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', lineHeight: 1.6, marginTop: 14 }}>Why: {ai.bio_rewrite_reason}</p>
        <PBar score={ai.profile_completeness_score} label="Profile Completeness" />
      </PCard>

      {/* ── F: Growth Roadmap ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <div style={{ height: 1, width: '100%', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.45), transparent)', marginBottom: 24 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: '#7c3aed' }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#9ca3af', textTransform: 'uppercase' as const }}>Your Roadmap</span>
        </div>
        <h2 style={{ fontSize: 40, fontWeight: 800, color: 'white', textAlign: 'center' as const, marginBottom: 12, lineHeight: 1.2 }}>
          3 moves that will change your numbers.
        </h2>
        <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' as const, marginBottom: 4 }}>Not generic advice. Pulled directly from your account&apos;s data.</p>
        <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' as const, marginBottom: 36 }}>Ranked by impact.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ai.action_plan.map((action, i) => {
            const isHigh = action.impact === 'HIGH';
            return (
              <div key={action.rank}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                  style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px 28px' }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9999, flexShrink: 0, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 16, marginTop: 2 }}>
                      {action.rank}
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'white', lineHeight: 1.5, flex: 1 }}>{action.problem}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 9999, whiteSpace: 'nowrap' as const, flexShrink: 0, background: isHigh ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)', color: isHigh ? '#f87171' : '#fb923c', border: `1px solid ${isHigh ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)'}` }}>
                      {action.impact}
                    </span>
                  </div>
                  {/* Root cause */}
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: 5 }}>Root Cause</div>
                    <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>{action.root_cause}</p>
                  </div>
                  {/* Exact fix */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '14px 16px', marginTop: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: 7 }}>Exact Fix</div>
                    <p style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.6 }}>{action.exact_fix}</p>
                  </div>
                  {/* Expected result */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 14 }}>
                    <span style={{ color: '#22c55e', fontSize: 14, flexShrink: 0 }}>↗</span>
                    <p style={{ fontSize: 13, color: '#22c55e', lineHeight: 1.6 }}>{action.expected_result}</p>
                  </div>
                </motion.div>
                {i < ai.action_plan.length - 1 && (
                  <div style={{ height: 1, width: '100%', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)', margin: '4px 0' }} />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Film, Hash, DollarSign, Search, Zap, Target, IndianRupee } from 'lucide-react';
import HeatmapGrid from '@/components/audit/HeatmapGrid';
import ActionPlanCard from '@/components/audit/ActionPlanCard';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const FORMAT_LABELS: Record<string, string> = {
  VIDEO: 'Reels',
  IMAGE: 'Static',
  CAROUSEL_ALBUM: 'Carousel',
  REELS: 'Reels',
};

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" whileInView="visible"
      viewport={{ once: true }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`card p-6 md:p-7 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <Icon size={16} style={{ color: 'var(--brand-mid)' }} />
      </div>
      <p className="eyebrow">{title}</p>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>{score}/100</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ background: color }}
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
  };
  m: {
    bio: string;
    formatBreakdown: Record<string, number>;
    engagementRate: number;
    followers: number;
    topHashtags?: Array<{ tag: string; count: number }>;
  };
}

export default function PaidReport({ ai, m }: PaidReportProps) {
  // Format breakdown chart data
  const formatData = Object.entries(m.formatBreakdown || {}).map(([key, count]) => ({
    name: FORMAT_LABELS[key] || key,
    posts: count as number,
  })).sort((a, b) => b.posts - a.posts);

  const hookColor = (s: number) => s >= 7 ? 'var(--success)' : s >= 5 ? 'var(--warning)' : 'var(--danger)';
  const hookLabel = (s: number) => s >= 9 ? '★ Great' : s >= 7 ? '✓ Strong' : s >= 5 ? '≈ Average' : '✗ Weak';

  return (
    <div className="space-y-5">

      {/* ── Section A: Best Time to Post ─────────────────────────── */}
      <SectionCard>
        <SectionHeader icon={Clock} title="Best Time to Post" />
        <p className="text-xs mb-5" style={{ color: 'var(--text-tertiary)' }}>
          Based on your audience's real activity patterns — not a generic guide.
        </p>
        <HeatmapGrid data={ai.heatmap_data || []} highlightSlots={ai.best_posting_times || []} />
        <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div
            className="px-4 py-3 rounded-xl"
            style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderLeft: '3px solid var(--brand-mid)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--brand-mid)' }}>AI Recommendation</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ai.best_posting_time}</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{ai.best_posting_time_reason}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <ScoreBar score={ai.posting_frequency_score} label="Posting Frequency" />
          <ScoreBar score={ai.brand_readiness_score} label="Brand Readiness" />
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ai.posting_frequency_verdict}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ai.brand_readiness_verdict}</p>
        </div>
      </SectionCard>

      {/* ── Section B: Format Breakdown Chart ────────────────────── */}
      <SectionCard>
        <SectionHeader icon={Film} title="Content Format Breakdown" />
        <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
          Which format your audience responds to most.
        </p>
        {formatData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="posts" fill="var(--brand-mid)" radius={[4, 4, 0, 0]} name="Posts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>—</p>
        )}
        <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {ai.best_format_reason}
        </p>
      </SectionCard>

      {/* ── Section C: Hook Quality ───────────────────────────────── */}
      <SectionCard>
        <SectionHeader icon={Zap} title="Hook Quality Analysis" />

        {/* Hook scores table */}
        {ai.hook_scores && ai.hook_scores.length > 0 ? (
          <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
            <div className="grid grid-cols-[1fr_auto_auto] text-xs font-semibold px-4 py-2.5" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border)' }}>
              <span>Hook</span><span className="text-center mr-4">Score</span><span>Verdict</span>
            </div>
            {ai.hook_scores.slice(0, 10).map((h, i) => {
              const c = hookColor(h.score);
              return (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto_auto] px-4 py-3 items-center text-sm"
                  style={{ borderBottom: i < ai.hook_scores!.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                >
                  <p className="pr-4 leading-snug" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                    "{h.hook.length > 60 ? h.hook.slice(0, 57) + '…' : h.hook}"
                  </p>
                  <span className="font-black tabular-nums mr-4 text-center" style={{ color: c, fontSize: 15 }}>
                    {h.score}/10
                  </span>
                  <span className="text-xs font-semibold whitespace-nowrap" style={{ color: c }}>
                    {hookLabel(h.score)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Average Hook Score</p>
              <span className="font-black tabular-nums text-xl" style={{ color: hookColor(ai.hook_avg_score) }}>{ai.hook_avg_score}/10</span>
            </div>
          </div>
        )}

        {/* Weakest hook rewrite */}
        {ai.weakest_hook_rewrite && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <p className="eyebrow mb-3">🔁 Your weakest hook — rewritten by AI</p>
            {ai.weakest_hook && (
              <div className="mb-3 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Original:</p>
                <p className="text-sm italic" style={{ color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>"{ai.weakest_hook}"</p>
              </div>
            )}
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--brand-mid)' }}>AI Rewrite:</p>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>"{ai.weakest_hook_rewrite}"</p>
          </div>
        )}
      </SectionCard>

      {/* ── Section D: Hashtag Strategy ──────────────────────────── */}
      <SectionCard>
        <SectionHeader icon={Hash} title="Hashtag Strategy" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {m.topHashtags && m.topHashtags.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Your current hashtags</p>
              <div className="flex flex-wrap gap-2">
                {m.topHashtags.slice(0, 12).map((h) => (
                  <span key={h.tag} className="badge badge-default text-xs font-mono">#{h.tag}</span>
                ))}
              </div>
              <p className="text-xs mt-3 italic" style={{ color: 'var(--text-tertiary)' }}>{ai.hashtag_verdict}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Recommended goldzone hashtags</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {ai.recommended_hashtags.map(tag => (
                <span key={tag} className="badge badge-success text-xs font-mono">{tag}</span>
              ))}
            </div>
            {ai.recommended_hashtags_reason && (
              <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>{ai.recommended_hashtags_reason}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <ScoreBar score={ai.hashtag_score} label="Hashtag Score" />
        </div>
      </SectionCard>

      {/* ── Section E: Rate Card ─────────────────────────────────── */}
      <SectionCard>
        <SectionHeader icon={IndianRupee} title="Your Brand Rate Card" />
        <p className="text-xs mb-5" style={{ color: 'var(--text-tertiary)' }}>
          Based on your {m.engagementRate}% ER and {(m.followers || 0).toLocaleString('en-IN')} followers.
        </p>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {[
            { label: 'Instagram Story', rates: ai.estimated_rates?.story, highlight: false },
            { label: 'Dedicated Reel', rates: ai.estimated_rates?.reel, highlight: true },
            { label: 'Carousel Post', rates: ai.estimated_rates?.carousel, highlight: false },
            { label: 'Monthly Retainer', rates: ai.estimated_rates?.monthly_package, highlight: false },
          ].filter(r => r.rates).map((row, i, arr) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-5 py-3.5"
              style={{
                background: row.highlight ? 'rgba(168,85,247,0.06)' : 'transparent',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: row.highlight ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{row.label}</span>
                {row.highlight && <span className="badge badge-brand" style={{ fontSize: 9 }}>Most popular</span>}
              </div>
              <span
                className="font-black tabular-nums text-sm"
                style={{ color: row.highlight ? 'var(--brand-mid)' : 'var(--text-primary)' }}
              >
                ₹{row.rates!.min.toLocaleString('en-IN')} – ₹{row.rates!.max.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 px-4 py-3 rounded-xl" style={{ background: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
          <p className="text-xs" style={{ color: 'var(--info)' }}>
            💡 Most creators in your niche charge 40% less than what brands are willing to pay. Don't undersell yourself.
          </p>
        </div>
        <ScoreBar score={ai.brand_readiness_score} label="Brand Readiness Score" />
      </SectionCard>

      {/* ── Section F: Bio Rewrite ───────────────────────────────── */}
      <SectionCard>
        <SectionHeader icon={Search} title="Your Bio — Rewritten by AI" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Current Bio</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>
              {m.bio || 'No bio found.'}
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.3)', boxShadow: 'var(--glow-sm)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--brand-mid)' }}>AI Rewrite ✨</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium" style={{ color: 'var(--text-primary)' }}>
              {ai.bio_rewrite || '—'}
            </p>
          </div>
        </div>
        <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
          Why: {ai.bio_rewrite_reason}
        </p>
        <ScoreBar score={ai.profile_completeness_score} label="Profile Completeness" />
      </SectionCard>

      {/* ── Section G: Action Plan ───────────────────────────────── */}
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible"
        viewport={{ once: true }} transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="section-divider mb-8" />
          <p className="eyebrow mb-3">Your Roadmap</p>
          <h2
            className="font-black mb-3 tracking-tight"
            style={{ fontSize: 'clamp(22px, 4vw, 36px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
          >
            3 moves that will change your numbers.
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Not generic advice. Pulled directly from your account's data. Ranked by impact.
          </p>
        </div>
        <div className="space-y-4">
          {ai.action_plan.map((action, i) => (
            <motion.div
              key={action.rank}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <ActionPlanCard
                rank={action.rank as 1 | 2 | 3}
                impact={action.impact as 'HIGH' | 'MEDIUM'}
                problem={action.problem}
                rootCause={action.root_cause}
                exactFix={action.exact_fix}
                expectedResult={action.expected_result}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

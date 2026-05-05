'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FreeMetricsSectionProps {
  engagementRate: number;
  benchmark: string;
  engagementVerdict: string;
  followers: number;
  bestFormat: string;
  bestFormatReason: string;
  formatBreakdown: Record<string, number>;
  brandReadinessScore: number;
  estimatedReelMin?: number;
  estimatedReelMax?: number;
  hookAvgScore: number;
  postsPerWeek: number;
}

function MiniBarChart({ yourValue, benchmarkValue, yourLabel, benchmarkLabel, color }: {
  yourValue: number; benchmarkValue: number; yourLabel: string; benchmarkLabel: string; color: string;
}) {
  const max = Math.max(yourValue, benchmarkValue) * 1.3;
  const yourPct = Math.round((yourValue / max) * 100);
  const benchPct = Math.round((benchmarkValue / max) * 100);

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center gap-3">
        <span className="text-xs w-20 shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>You</span>
        <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full flex items-center pl-3 text-xs font-bold text-white" style={{ width: `${yourPct}%`, background: color, minWidth: 40, transition: 'width 1s ease-out' }}>
            {yourLabel}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs w-20 shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>Industry</span>
        <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full flex items-center pl-3 text-xs font-medium" style={{ width: `${benchPct}%`, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', minWidth: 40 }}>
            {benchmarkLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FreeMetricsSection({
  engagementRate, benchmark, engagementVerdict, followers,
  bestFormat, bestFormatReason, formatBreakdown,
  brandReadinessScore, estimatedReelMin, estimatedReelMax,
  hookAvgScore, postsPerWeek,
}: FreeMetricsSectionProps) {
  const benchmarkNum = parseFloat(benchmark);
  const isEngagementHigh = engagementRate >= benchmarkNum;
  const engagementMultiple = benchmarkNum > 0 ? (engagementRate / benchmarkNum).toFixed(1) : '?';
  const topFormat = Object.entries(formatBreakdown || {}).sort((a, b) => b[1] - a[1])[0];

  // Hook verdict
  const hookColor = hookAvgScore >= 7 ? '#4ade80' : hookAvgScore >= 5 ? '#facc15' : '#f87171';
  const hookVerdict = hookAvgScore >= 7 ? 'Strong' : hookAvgScore >= 5 ? 'Average' : 'Weak';

  return (
    <div className="space-y-4">

      {/* Card 1 — Engagement */}
      <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-start justify-between mb-1">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(168,85,247,0.7)' }}>Engagement Rate</p>
          {isEngagementHigh
            ? <TrendingUp size={16} className="text-green-400" />
            : <TrendingDown size={16} className="text-red-400" />}
        </div>

        <h3 className="text-3xl font-black mb-1 tracking-tight" style={{ color: isEngagementHigh ? '#4ade80' : '#f87171' }}>
          {engagementRate}%
        </h3>

        {isEngagementHigh ? (
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            You're <span className="font-bold text-green-400">{engagementMultiple}x the industry average</span>. Your audience isn't just scrolling — they're obsessed with your content. This puts you in the top tier for brand deals.
          </p>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            You're below the industry average of <span className="font-bold text-white">{benchmark}%</span>. Something in your content mix is losing the algorithm's interest. The fix is hiding in your data.
          </p>
        )}

        <MiniBarChart
          yourValue={engagementRate}
          benchmarkValue={benchmarkNum}
          yourLabel={`${engagementRate}%`}
          benchmarkLabel={`${benchmark}%`}
          color={isEngagementHigh ? 'linear-gradient(90deg, #16a34a, #4ade80)' : 'linear-gradient(90deg, #b91c1c, #f87171)'}
        />
      </div>

      {/* Card 2 — Your Content Superpower */}
      <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-start justify-between mb-1">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(168,85,247,0.7)' }}>Content Superpower</p>
          <Minus size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </div>

        <h3 className="text-3xl font-black mb-1 tracking-tight text-white">{bestFormat}</h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {bestFormatReason} Your audience is <span className="text-white font-semibold">literally telling you what they want</span>. Double down on this format.
        </p>

        {/* Format Breakdown mini bar chart */}
        {formatBreakdown && Object.entries(formatBreakdown).length > 0 && (
          <div className="space-y-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {Object.entries(formatBreakdown)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .slice(0, 3)
              .map(([format, count]) => {
                const total = Object.values(formatBreakdown).reduce((s: any, v: any) => s + v, 0);
                const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                return (
                  <div key={format} className="flex items-center gap-3">
                    <span className="text-xs w-16 shrink-0 capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>{format.toLowerCase()}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: format === topFormat?.[0] ? 'linear-gradient(90deg, #7C3AED, #EC4899)' : 'rgba(255,255,255,0.15)' }} />
                    </div>
                    <span className="text-xs font-mono w-8 text-right" style={{ color: 'rgba(255,255,255,0.4)' }}>{pct}%</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Card 3 — Hook Score Tease */}
      <div className="rounded-2xl p-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(168,85,247,0.7)' }}>Hook Strength</p>

        <div className="flex items-end gap-3 mb-2">
          <h3 className="text-3xl font-black tracking-tight" style={{ color: hookColor }}>{hookAvgScore}/10</h3>
          <span className="mb-1 text-sm font-bold px-2.5 py-0.5 rounded-full" style={{ background: `${hookColor}15`, color: hookColor, border: `1px solid ${hookColor}30` }}>{hookVerdict}</span>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {hookAvgScore >= 7
            ? 'Your opening lines are working. People are watching past the first 3 seconds. That\'s rare and valuable.'
            : hookAvgScore >= 5
              ? 'Your hooks are hit or miss. Some captions stop the scroll — others are losing people in the first second.'
              : 'Most of your audience is skipping before they even see what you made. Your hooks need urgent attention.'}
        </p>

        <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(168,85,247,0.2)' }}>
            <span style={{ fontSize: 9, color: '#c084fc' }}>🔒</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Your weakest hook identified + AI rewrite waiting in full report
          </p>
        </div>
      </div>

    </div>
  );
}

'use client';

interface ActionPlanCardProps {
  rank: 1 | 2 | 3;
  impact: 'HIGH' | 'MEDIUM';
  problem: string;
  rootCause: string;
  exactFix: string;
  expectedResult: string;
}

const RANK_COLORS = {
  1: { from: '#FF3E80', to: '#A855F7', bg: 'rgba(255,62,128,0.08)', border: 'rgba(255,62,128,0.2)' },
  2: { from: '#A855F7', to: '#7C3AED', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)' },
  3: { from: '#3B82F6', to: '#7C3AED', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
};

const IMPACT_BADGE: Record<string, { color: string; bg: string; border: string }> = {
  HIGH:   { color: 'var(--danger)',  bg: 'var(--danger-bg)',  border: 'var(--danger-border)' },
  MEDIUM: { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning-border)' },
};

export default function ActionPlanCard({ rank, impact, problem, rootCause, exactFix, expectedResult }: ActionPlanCardProps) {
  const rc = RANK_COLORS[rank];
  const ib = IMPACT_BADGE[impact];

  return (
    <div className="card p-7 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Rank badge */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-white text-sm"
            style={{ background: `linear-gradient(135deg, ${rc.from}, ${rc.to})`, boxShadow: `0 4px 16px ${rc.from}40`, flexShrink: 0 }}
          >
            {rank}
          </div>
          <h3 className="font-bold text-lg leading-snug" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {problem}
          </h3>
        </div>
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0"
          style={{ background: ib.bg, color: ib.color, border: `1px solid ${ib.border}` }}
        >
          {impact}
        </span>
      </div>

      {/* Root cause */}
      <div>
        <p className="eyebrow mb-1.5">Root Cause</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rootCause}</p>
      </div>

      {/* Fix */}
      <div
        className="rounded-xl p-5"
        style={{ background: rc.bg, border: `1px solid ${rc.border}` }}
      >
        <p className="eyebrow mb-2">Exact Fix</p>
        <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>{exactFix}</p>
      </div>

      {/* Result */}
      <div className="flex items-start gap-2">
        <span className="text-xs font-bold mt-0.5" style={{ color: 'var(--success)' }}>↑</span>
        <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>{expectedResult}</p>
      </div>
    </div>
  );
}

'use client';

import { LucideIcon } from 'lucide-react';
import { getScoreColor, getScoreClass } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  icon?: LucideIcon;
  value: string | number;
  unit?: string;
  benchmark?: number;
  benchmarkLabel?: string;
  verdict?: string;
  color?: string;
  score?: number;
  className?: string;
  accentBorder?: boolean;
}

export default function MetricCard({ title, icon: Icon, value, unit, benchmark, benchmarkLabel, verdict, color, score, className = '', accentBorder = false }: MetricCardProps) {
  const displayColor = color || (score !== undefined ? getScoreColor(score) : 'var(--brand-mid)');
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
  const fillPercent = benchmark ? Math.min(100, (numericValue / (benchmark * 2)) * 100) : score;

  return (
    <div
      className={`card p-6 ${className}`}
      style={accentBorder ? { borderLeft: `2px solid ${displayColor}` } : {}}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <Icon size={15} style={{ color: 'var(--brand-mid)' }} />
            </div>
          )}
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</span>
        </div>
        {score !== undefined && <span className={`score-badge ${getScoreClass(score)}`}>{score}/100</span>}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-3">
        <span className="metric-value text-3xl font-black" style={{ color: displayColor, letterSpacing: '-0.05em' }}>{value}</span>
        {unit && <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{unit}</span>}
      </div>

      {/* Benchmark bar */}
      {benchmark !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <span>Your rate</span>
            <span>Benchmark: {benchmark}{unit}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${fillPercent}%` }} />
          </div>
          {benchmarkLabel && <p className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>{benchmarkLabel}</p>}
        </div>
      )}

      {verdict && <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{verdict}</p>}
    </div>
  );
}

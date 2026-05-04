'use client';

import { DAY_NAMES, heatmapOpacity } from '@/lib/utils';

interface HeatmapGridProps {
  data: number[][];
  highlightSlots?: Array<{ day: string; hour: number; label: string }>;
}

export default function HeatmapGrid({ data, highlightSlots = [] }: HeatmapGridProps) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.flat());
  const isHighlighted = (di: number, hi: number) =>
    highlightSlots.some((s) => DAY_NAMES.indexOf(s.day.slice(0, 3)) === di && s.hour === hi);

  const HOUR_LABELS = ['12a', '', '', '3a', '', '', '6a', '', '', '9a', '', '', '12p', '', '', '3p', '', '', '6p', '', '', '9p', '', ''];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex mb-1.5 ml-10">
        {HOUR_LABELS.map((l, i) => (
          <div key={i} className="flex-1 text-center" style={{ fontSize: 9, color: 'var(--text-tertiary)', minWidth: 0 }}>{l}</div>
        ))}
      </div>
      {DAY_NAMES.map((day, di) => (
        <div key={day} className="flex items-center mb-1">
          <span className="w-10 shrink-0 text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{day}</span>
          <div className="flex flex-1 gap-px">
            {Array.from({ length: 24 }, (_, hi) => {
              const val = data[di]?.[hi] ?? 0;
              const op = heatmapOpacity(val, max);
              const hl = isHighlighted(di, hi);
              return (
                <div
                  key={hi}
                  title={`${day} ${hi}:00`}
                  className="heatmap-cell flex-1"
                  style={{
                    height: 18,
                    borderRadius: 2,
                    background: hl
                      ? `linear-gradient(135deg, rgba(255,62,128,${Math.max(op, 0.75)}), rgba(124,58,237,${Math.max(op, 0.75)}))`
                      : `rgba(168,85,247,${op * 0.7})`,
                    outline: hl ? '1.5px solid rgba(168,85,247,0.6)' : 'none',
                    outlineOffset: 1,
                    boxShadow: hl ? '0 0 6px rgba(168,85,247,0.5)' : 'none',
                    minWidth: 0,
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Less</span>
        {[0.06, 0.2, 0.4, 0.65, 0.9].map((op, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ background: `rgba(168,85,247,${op})` }} />
        ))}
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>More</span>
        {highlightSlots.length > 0 && (
          <span className="ml-3 badge badge-brand text-[10px]">★ Best time</span>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { DAY_NAMES, heatmapOpacity } from '@/lib/utils';

interface HeatmapGridProps {
  data: number[][];
  highlightSlots?: Array<{ day: string; hour: number; label: string }>;
}

const HOUR_LABELS = ['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p'];
const HOUR_COLS   = [0, 3, 6, 9, 12, 15, 18, 21];
const DAY_W = 32;
const GAP   = 3;

function formatHour(h: number) {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function cellColor(val: number, max: number, isHl: boolean): string {
  if (isHl) return '#ec4899';
  if (val === 0) return 'rgba(139,92,246,0.12)';
  const t = val / max;
  if (t < 0.25) return 'rgba(139,92,246,0.25)';
  if (t < 0.50) return 'rgba(139,92,246,0.45)';
  if (t < 0.75) return 'rgba(139,92,246,0.70)';
  return '#7c3aed';
}

const CELL_GRID: React.CSSProperties = {
  flex: 1,
  display: 'grid',
  gridTemplateColumns: 'repeat(24, 1fr)',
  gap: GAP,
};

export default function HeatmapGrid({ data, highlightSlots = [] }: HeatmapGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    day: string; hour: number; val: number; max: number; left: number; top: number;
  } | null>(null);

  if (!data || data.length === 0) return null;

  const flat = data.flat().filter(v => v > 0);
  const max  = flat.length > 0 ? Math.max(...flat) : 1;

  const isHighlighted = (di: number, hi: number) =>
    highlightSlots.some(s => DAY_NAMES.indexOf(s.day.slice(0, 3)) === di && s.hour === hi);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>

      {/* Hour tick labels row */}
      <div style={{ display: 'flex', marginBottom: 6, alignItems: 'center' }}>
        <div style={{ width: DAY_W, flexShrink: 0, marginRight: GAP }} />
        <div style={{ ...CELL_GRID }}>
          {Array.from({ length: 24 }, (_, hi) => {
            const labelIdx = HOUR_COLS.indexOf(hi);
            return (
              <div key={hi} style={{
                fontSize: 9, fontWeight: 500,
                color: labelIdx >= 0 ? 'rgba(255,255,255,0.28)' : 'transparent',
                textAlign: 'center',
                userSelect: 'none',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}>
                {labelIdx >= 0 ? HOUR_LABELS[labelIdx] : '.'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day rows */}
      {DAY_NAMES.map((day, di) => (
        <div key={day} style={{ display: 'flex', marginBottom: di < 6 ? GAP : 0, alignItems: 'stretch' }}>
          {/* Day label */}
          <div style={{
            width: DAY_W, flexShrink: 0, marginRight: GAP,
            display: 'flex', alignItems: 'center',
            fontSize: 10, fontWeight: 600,
            color: 'rgba(255,255,255,0.32)',
            userSelect: 'none',
          }}>
            {day}
          </div>

          {/* 24-column fluid grid */}
          <div style={{ ...CELL_GRID }}>
            {Array.from({ length: 24 }, (_, hi) => {
              const val = data[di]?.[hi] ?? 0;
              const isHl = isHighlighted(di, hi);
              const bg = cellColor(val, max, isHl);
              return (
                <div
                  key={hi}
                  onMouseEnter={(e) => {
                    const cellRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const contRect = containerRef.current?.getBoundingClientRect();
                    if (!contRect) return;
                    setTooltip({
                      day, hour: hi, val, max,
                      left: cellRect.left - contRect.left + cellRect.width / 2,
                      top: cellRect.top  - contRect.top,
                    });
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.25)';
                    (e.currentTarget as HTMLElement).style.zIndex = '10';
                  }}
                  onMouseLeave={(e) => {
                    setTooltip(null);
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLElement).style.zIndex = '1';
                  }}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 4,
                    background: bg,
                    border: isHl
                      ? '1.5px solid rgba(236,72,153,0.7)'
                      : '1px solid rgba(255,255,255,0.04)',
                    boxShadow: isHl ? '0 0 8px rgba(236,72,153,0.5)' : 'none',
                    cursor: 'default',
                    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                    position: 'relative',
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Floating tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.left,
          top: tooltip.top - 46,
          transform: 'translateX(-50%)',
          background: 'rgba(14,14,22,0.96)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 9,
          padding: '6px 11px',
          fontSize: 11, fontWeight: 600,
          color: 'white',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 30,
          boxShadow: '0 8px 24px rgba(0,0,0,0.55)',
          letterSpacing: '-0.01em',
        }}>
          {tooltip.day} · {formatHour(tooltip.hour)}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: 8 }}>
            {tooltip.val > 0 ? `${Math.round((tooltip.val / tooltip.max) * 100)}% active` : 'Inactive'}
          </span>
          <div style={{
            position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
            width: 8, height: 8, background: 'rgba(14,14,22,0.96)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderTop: 'none', borderLeft: 'none',
            rotate: '45deg',
          }} />
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap', fontSize: 11, color: '#6b7280' }}>
        <span>Less active</span>
        <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(139,92,246,0.12)' }} />
        <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(139,92,246,0.30)' }} />
        <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(139,92,246,0.55)' }} />
        <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(139,92,246,0.80)' }} />
        <span>More active</span>
        {highlightSlots.length > 0 && (
          <>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#ec4899' }} />
            <span>Best time to post</span>
          </>
        )}
      </div>
    </div>
  );
}

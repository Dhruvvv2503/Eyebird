'use client';

import { useState, useRef } from 'react';
import { DAY_NAMES, heatmapOpacity } from '@/lib/utils';

interface HeatmapGridProps {
  data: number[][];
  highlightSlots?: Array<{ day: string; hour: number; label: string }>;
}

const HOUR_LABELS = ['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p'];
const HOUR_COLS   = [0, 3, 6, 9, 12, 15, 18, 21];

const CELL = 24;
const GAP  = 3;
const DAY_W = 30;

function formatHour(h: number) {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function cellColor(val: number, max: number, isHl: boolean): string {
  if (val === 0) return 'rgba(255,255,255,0.04)';
  const t = val / max;
  if (isHl) {
    const a = Math.max(0.8, t);
    return `linear-gradient(135deg, rgba(255,62,128,${a}), rgba(168,85,247,${a}))`;
  }
  // purple gradient: dim → vivid
  const r = Math.round(80  + t * 88);
  const g = Math.round(20  + t * 65);
  const b = Math.round(140 + t * 107);
  const a = 0.1 + t * 0.9;
  return `rgba(${r},${g},${b},${a})`;
}

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

  const gridW = CELL * 24 + GAP * 23;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>

      {/* Hour tick labels */}
      <div style={{ marginLeft: DAY_W + GAP, marginBottom: 6, position: 'relative', height: 14, width: gridW }}>
        {HOUR_COLS.map((col, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: col * (CELL + GAP),
              fontSize: 10, fontWeight: 500,
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '-0.01em',
              userSelect: 'none',
            }}
          >
            {HOUR_LABELS[i]}
          </span>
        ))}
      </div>

      {/* Day rows + cells */}
      <div style={{ display: 'flex', gap: 0 }}>

        {/* Day label column */}
        <div style={{ width: DAY_W, flexShrink: 0, marginRight: GAP, paddingTop: 1 }}>
          {DAY_NAMES.map((day, di) => (
            <div key={day} style={{
              height: CELL, marginBottom: di < 6 ? GAP : 0,
              display: 'flex', alignItems: 'center',
              fontSize: 10, fontWeight: 600,
              color: 'rgba(255,255,255,0.32)',
              letterSpacing: '-0.01em',
              userSelect: 'none',
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Cell grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
          {DAY_NAMES.map((day, di) => (
            <div key={day} style={{ display: 'flex', gap: GAP }}>
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
                        day,
                        hour: hi,
                        val,
                        max,
                        left: cellRect.left - contRect.left + CELL / 2,
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
                      width: CELL, height: CELL,
                      borderRadius: 5,
                      flexShrink: 0,
                      background: bg,
                      border: isHl
                        ? '1.5px solid rgba(255,62,128,0.75)'
                        : '1px solid rgba(255,255,255,0.045)',
                      boxShadow: isHl
                        ? '0 0 10px rgba(255,62,128,0.5), 0 0 20px rgba(168,85,247,0.3)'
                        : 'none',
                      cursor: 'default',
                      transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                      position: 'relative',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

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
          {/* Arrow */}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>Less active</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => {
            const r = Math.round(80  + t * 88);
            const g = Math.round(20  + t * 65);
            const b = Math.round(140 + t * 107);
            const a = t === 0 ? 0 : 0.1 + t * 0.9;
            return (
              <div key={i} style={{
                width: 13, height: 13, borderRadius: 3,
                background: t === 0 ? 'rgba(255,255,255,0.04)' : `rgba(${r},${g},${b},${a})`,
                border: '1px solid rgba(255,255,255,0.05)',
              }} />
            );
          })}
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>More active</span>

        {highlightSlots.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 10 }}>
            <div style={{
              width: 13, height: 13, borderRadius: 3,
              background: 'linear-gradient(135deg,#FF3E80,#A855F7)',
              border: '1.5px solid rgba(255,62,128,0.7)',
              boxShadow: '0 0 7px rgba(255,62,128,0.45)',
            }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Best time to post</span>
          </div>
        )}
      </div>
    </div>
  );
}

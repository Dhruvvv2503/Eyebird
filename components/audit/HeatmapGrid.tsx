'use client';

import { useState, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PostForHeatmap {
  date: string;           // ISO timestamp string (UTC)
  engagementRate: number;
  [key: string]: unknown;
}

export interface HeatmapCell {
  day: number;      // 0=Sun … 6=Sat
  hour: number;     // 0–23 IST
  avgER: number;
  postCount: number;
  isBestTime: boolean;
}

interface HeatmapGridProps {
  posts: PostForHeatmap[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DAY_NAMES  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOUR_LABELS = ['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p'];
const HOUR_COLS   = [0, 3, 6, 9, 12, 15, 18, 21];
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+5:30
const DAY_W = 32;
const GAP   = 3;

const CELL_GRID: React.CSSProperties = {
  flex: 1,
  display: 'grid',
  gridTemplateColumns: 'repeat(24, 1fr)',
  gap: GAP,
};

// ── Data computation (exported for use in PaidReport) ─────────────────────────

export function computeHeatmap(posts: PostForHeatmap[]): HeatmapCell[][] {
  const grid: { totalER: number; count: number }[][] = Array.from(
    { length: 7 },
    () => Array.from({ length: 24 }, () => ({ totalER: 0, count: 0 }))
  );

  for (const post of posts) {
    if (!post.date) continue;
    const utc = new Date(post.date);
    if (isNaN(utc.getTime())) continue;
    const ist = new Date(utc.getTime() + IST_OFFSET_MS);
    const day  = ist.getUTCDay();
    const hour = ist.getUTCHours();
    const er   = typeof post.engagementRate === 'number' ? post.engagementRate : 0;
    grid[day][hour].totalER += er;
    grid[day][hour].count   += 1;
  }

  const cells: HeatmapCell[][] = grid.map((dayRow, day) =>
    dayRow.map((cell, hour) => ({
      day,
      hour,
      avgER:     cell.count > 0 ? cell.totalER / cell.count : 0,
      postCount: cell.count,
      isBestTime: false,
    }))
  );

  // Mark top-3 cells by avgER (min 1 post) as best time
  const withPosts = cells.flat().filter(c => c.postCount >= 1);
  withPosts.sort((a, b) => b.avgER - a.avgER);
  withPosts.slice(0, 3).forEach(top => {
    cells[top.day][top.hour].isBestTime = true;
  });

  return cells;
}

// ── Colour helpers ────────────────────────────────────────────────────────────

function getCellBackground(cell: HeatmapCell, maxER: number): string {
  if (cell.isBestTime) return '#f9607a';
  if (cell.avgER === 0 || maxER === 0) return 'rgba(255,255,255,0.03)';
  const intensity = Math.pow(cell.avgER / maxER, 0.6); // power curve for contrast
  const alpha = 0.08 + intensity * 0.75;
  return `rgba(124,58,237,${alpha.toFixed(2)})`;
}

// ── Format helpers (exported) ─────────────────────────────────────────────────

export function formatHour12(h: number): string {
  if (h === 0)  return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

// ── Derive recommendation text from best cells ─────────────────────────────────

export function deriveRecommendation(cells: HeatmapCell[][]): string {
  const best = cells.flat()
    .filter(c => c.isBestTime)
    .sort((a, b) => b.avgER - a.avgER);
  if (best.length === 0) return '';
  const day1 = FULL_DAYS[best[0].day];
  const day2 = best[1] && best[1].day !== best[0].day
    ? ` & ${FULL_DAYS[best[1].day]}` : '';
  const h = best[0].hour;
  return `${day1}${day2}, ${formatHour12(h)}–${formatHour12(h + 1)} IST`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HeatmapGrid({ posts }: HeatmapGridProps) {
  const [tooltip, setTooltip] = useState<{
    cell: HeatmapCell; x: number; y: number;
  } | null>(null);

  const cells  = computeHeatmap(posts);
  const maxER  = Math.max(...cells.flat().map(c => c.avgER), 0.01);

  const onEnter = useCallback((e: React.MouseEvent, cell: HeatmapCell) => {
    if (cell.postCount === 0) return;
    setTooltip({ cell, x: e.clientX, y: e.clientY });
  }, []);

  const onMove = useCallback((e: React.MouseEvent, cell: HeatmapCell) => {
    if (cell.postCount === 0) return;
    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev);
  }, []);

  const onLeave = useCallback(() => setTooltip(null), []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>

      {/* Hour tick labels */}
      <div style={{ display: 'flex', marginBottom: 6, alignItems: 'center' }}>
        <div style={{ width: DAY_W, flexShrink: 0, marginRight: GAP }} />
        <div style={{ ...CELL_GRID }}>
          {Array.from({ length: 24 }, (_, hi) => {
            const labelIdx = HOUR_COLS.indexOf(hi);
            const is6pm    = hi === 18;
            return (
              <div key={hi} style={{
                fontSize: 9, fontWeight: is6pm ? 700 : 500,
                color: labelIdx >= 0
                  ? (is6pm ? '#f9607a' : 'rgba(255,255,255,0.28)')
                  : 'transparent',
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
          <div style={{
            width: DAY_W, flexShrink: 0, marginRight: GAP,
            display: 'flex', alignItems: 'center',
            fontSize: 10, fontWeight: 600,
            color: 'rgba(255,255,255,0.32)',
            userSelect: 'none',
          }}>
            {day}
          </div>
          <div style={{ ...CELL_GRID }}>
            {cells[di].map(cell => {
              const bg = getCellBackground(cell, maxER);
              return (
                <div
                  key={cell.hour}
                  onMouseEnter={e => onEnter(e, cell)}
                  onMouseMove={e  => onMove(e,  cell)}
                  onMouseLeave={onLeave}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 4,
                    background: bg,
                    border: cell.isBestTime
                      ? '1.5px solid rgba(249,96,122,0.7)'
                      : cell.postCount > 0
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(255,255,255,0.03)',
                    boxShadow: cell.isBestTime
                      ? '0 0 8px rgba(249,96,122,0.5)' : 'none',
                    cursor: cell.postCount > 0 ? 'pointer' : 'default',
                    transition: 'transform 0.12s ease',
                    position: 'relative',
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Fixed tooltip — avoids overflow clipping */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 14,
          top: tooltip.y - 10,
          background: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 12,
          color: 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 9999,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>
            {DAY_NAMES[tooltip.cell.day]} · {formatHour12(tooltip.cell.hour)} IST
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
            {tooltip.cell.postCount} post{tooltip.cell.postCount !== 1 ? 's' : ''} published
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
            avg ER: {tooltip.cell.avgER.toFixed(1)}%
          </div>
          {tooltip.cell.isBestTime && (
            <div style={{ color: '#f9607a', fontSize: 11, fontWeight: 600, marginTop: 3 }}>
              ⚡ Your best time to post
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Low ER</span>
        {[0.1, 0.3, 0.5, 0.75, 1].map((t, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 3,
            background: `rgba(124,58,237,${(0.08 + t * 0.75).toFixed(2)})`,
          }} />
        ))}
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>High ER</span>
        <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{
          width: 14, height: 14, borderRadius: 3, background: '#f9607a',
          boxShadow: '0 0 6px rgba(249,96,122,0.5)',
        }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Best time to post</span>
        <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{
          width: 14, height: 14, borderRadius: 3,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>No posts</span>
      </div>
    </div>
  );
}

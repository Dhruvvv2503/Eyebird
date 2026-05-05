'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

function getScoreColor(score: number) {
  if (score >= 70) return 'var(--brand-mid)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

function getScoreVerdict(score: number) {
  if (score >= 80) return { label: '🏆 Elite tier', color: 'var(--success)' };
  if (score >= 65) return { label: '⚡ Strong. Real upside ahead.', color: 'var(--warning)' };
  if (score >= 50) return { label: '📈 Solid foundation. Fixable gaps.', color: 'var(--warning)' };
  return { label: '🔧 Needs work. High growth potential.', color: 'var(--danger)' };
}

export default function ScoreRing({ score, size = 160, strokeWidth = 10 }: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const verdict = getScoreVerdict(score);
  const color = getScoreColor(score);

  useEffect(() => {
    // Animate ring
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = String(circumference);
      const t = setTimeout(() => {
        if (circleRef.current) {
          circleRef.current.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
          circleRef.current.style.strokeDashoffset = String(dashOffset);
        }
      }, 100);
      return () => clearTimeout(t);
    }
  }, [score, circumference, dashOffset]);

  // Count-up number
  useEffect(() => {
    let current = 0;
    const increment = score / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) { setDisplayScore(score); clearInterval(timer); return; }
      setDisplayScore(Math.floor(current));
    }, 25);
    return () => clearInterval(timer);
  }, [score]);

  const gradId = `sg-${score}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              {score >= 70 ? (
                <>
                  <stop offset="0%" stopColor="#FF3E80" />
                  <stop offset="50%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </>
              ) : score >= 50 ? (
                <>
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#FBBF24" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#F87171" />
                </>
              )}
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="var(--bg-overlay)" strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            filter={`drop-shadow(0 0 8px ${color}80)`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-black tabular-nums"
            style={{ fontSize: 48, letterSpacing: '-0.05em', lineHeight: 1, color }}
          >
            {displayScore}
          </span>
          <span className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            / 100
          </span>
        </div>
      </div>
      <p className="text-sm font-semibold mt-2" style={{ color: 'var(--text-tertiary)' }}>Account Health Score</p>
      <span className="text-xs font-bold mt-1" style={{ color: verdict.color }}>{verdict.label}</span>
    </div>
  );
}

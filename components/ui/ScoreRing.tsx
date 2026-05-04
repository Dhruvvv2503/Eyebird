'use client';

import { useEffect, useRef } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  label?: string;
}

export default function ScoreRing({ score, size = 120, strokeWidth = 8, animated = true, label }: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (!animated || !circleRef.current) return;
    const circle = circleRef.current;
    circle.style.strokeDashoffset = String(circumference);
    const t = setTimeout(() => {
      circle.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      circle.style.strokeDashoffset = String(dashOffset);
    }, 100);
    return () => clearTimeout(t);
  }, [score, circumference, dashOffset, animated]);

  const gradId = `score-grad-${score}`;
  const fontSize = size * 0.28;
  const labelSize = size * 0.1;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3E80" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-overlay)" strokeWidth={strokeWidth} />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : dashOffset}
          filter="drop-shadow(0 0 6px rgba(168,85,247,0.6))"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-gradient" style={{ fontSize, letterSpacing: '-0.05em', lineHeight: 1 }}>{score}</span>
        {label && <span style={{ fontSize: labelSize, color: 'var(--text-tertiary)', marginTop: 2, fontWeight: 500 }}>{label}</span>}
      </div>
    </div>
  );
}

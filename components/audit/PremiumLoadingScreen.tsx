'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';

const ANALYSIS_PHASES = [
  { step: 0, label: 'Connecting to Instagram', sub: 'Verifying account permissions…', pct: 5 },
  { step: 1, label: 'Pulling your last 20 posts', sub: 'Fetching likes, comments, saves, and reach…', pct: 25 },
  { step: 2, label: 'Crunching your numbers', sub: 'Calculating engagement rate, posting cadence, hook scores…', pct: 45 },
  { step: 3, label: 'Running AI analysis', sub: 'Claude is reading your content strategy and finding patterns…', pct: 65 },
  { step: 4, label: 'Writing your action plan', sub: 'Generating personalized recommendations for your niche…', pct: 82 },
  { step: 5, label: 'Finalizing your report', sub: 'Almost there — polishing insights just for you…', pct: 97 },
];

const VERIFIED_FACTS = [
  { stat: '92%', copy: 'of Instagram users watch Reels with the sound off. If your captions are weak, you\'re invisible.' },
  { stat: 'Saves > Likes', copy: 'Instagram\'s algorithm values saves and shares 4× more than likes when deciding who to show your content to.' },
  { stat: '1.92%', copy: 'is the average engagement rate for carousels — the highest of any post type on Instagram.' },
  { stat: '60 minutes', copy: 'The first hour after posting is critical. Replying to comments in this window signals high quality to the algorithm.' },
  { stat: '3× a week', copy: 'Creators who post at least 3 times per week grow their following 40% faster over 6 months.' },
  { stat: 'Top 8%', copy: 'Only 8% of Instagram accounts ever cross 10,000 followers. The gap between them and everyone else? Strategy.' },
  { stat: 'First 3 sec', copy: 'You have 3 seconds to stop the scroll. After that, most viewers are gone — and the algorithm notices.' },
];

interface PremiumLoadingScreenProps {
  currentStepIndex: number;
  steps: string[];
}

export default function PremiumLoadingScreen({ currentStepIndex }: PremiumLoadingScreenProps) {
  const [factIndex, setFactIndex] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [factVisible, setFactVisible] = useState(true);

  const currentPhase = ANALYSIS_PHASES[Math.min(currentStepIndex, ANALYSIS_PHASES.length - 1)];
  const targetPct = currentPhase.pct;

  // Smooth progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev < targetPct) {
          const diff = targetPct - prev;
          return Math.min(prev + Math.max(diff * 0.06, 0.3), targetPct);
        }
        return prev;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [targetPct]);

  // Rotate facts with fade
  useEffect(() => {
    const interval = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIndex(p => (p + 1) % VERIFIED_FACTS.length);
        setFactVisible(true);
      }, 400);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  const radius = 80;
  const stroke = 7;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;
  const fact = VERIFIED_FACTS[factIndex];

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-5 pt-16 pb-10 overflow-hidden" style={{ background: '#080808' }}>

        {/* Background glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">

          {/* Progress Ring */}
          <div className="relative mb-8">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle stroke="rgba(255,255,255,0.04)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
              <circle
                stroke="url(#loadGrad)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                filter="drop-shadow(0 0 8px rgba(168,85,247,0.5))"
              />
              <defs>
                <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-black font-mono" style={{ fontSize: 32, letterSpacing: '-0.05em', color: 'white', lineHeight: 1 }}>
                {Math.round(displayProgress)}<span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>%</span>
              </span>
            </div>
          </div>

          {/* Current Step */}
          <div className="text-center mb-10 w-full">
            <h2 className="text-xl font-bold mb-2 tracking-tight text-white">
              {currentPhase.label}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {currentPhase.sub}
            </p>
          </div>

          {/* Steps visual */}
          <div className="flex items-center gap-1.5 mb-10">
            {ANALYSIS_PHASES.map((phase, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-700"
                style={{
                  width: i === currentStepIndex ? 24 : i < currentStepIndex ? 16 : 8,
                  background: i <= currentStepIndex
                    ? 'linear-gradient(90deg, #7C3AED, #EC4899)'
                    : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>

          {/* Fact Card */}
          <div
            className="w-full rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2 px-5 pt-5 pb-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#A855F7' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Did you know?
              </span>
            </div>

            <div
              className="px-5 pb-5 transition-all duration-400"
              style={{ opacity: factVisible ? 1 : 0, transform: factVisible ? 'translateY(0)' : 'translateY(8px)' }}
            >
              <p className="text-3xl font-black mb-2 tracking-tight" style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {fact.stat}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {fact.copy}
              </p>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 pb-4">
              {VERIFIED_FACTS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: i === factIndex ? 16 : 6,
                    background: i === factIndex
                      ? 'linear-gradient(90deg, #A855F7, #EC4899)'
                      : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';

const VERIFIED_FACTS = [
  "Did you know? Only 8% of Instagram accounts have over 10,000 followers. You're competing in the top percentile.",
  "Instagram's algorithm favors 'Saves' and 'Shares' 4x more than 'Likes' for reaching non-followers.",
  "Carousel posts have the highest average engagement rate of all feed post types (1.92% vs 1.74%).",
  "Accounts that post consistently at least 3 times a week see a 40% faster growth rate over 6 months.",
  "A bio with a clear call-to-action (CTA) increases profile link clicks by up to 30%.",
  "92% of users watch Instagram Reels with the sound off. Captions are absolutely mandatory for reach.",
  "Replying to comments within the first 60 minutes of posting signals high engagement to the algorithm."
];

interface PremiumLoadingScreenProps {
  currentStepIndex: number;
  steps: string[];
}

export default function PremiumLoadingScreen({ currentStepIndex, steps }: PremiumLoadingScreenProps) {
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle facts every 5 seconds
  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % VERIFIED_FACTS.length);
    }, 5000);
    return () => clearInterval(factInterval);
  }, []);

  // Smoothly animate progress based on current step
  useEffect(() => {
    const targetProgress = Math.min(
      Math.max(((currentStepIndex + 1) / steps.length) * 100, 5), 
      99 // Never quite hit 100 until it actually unmounts
    );
    
    // Smoothly increment progress towards target
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < targetProgress) {
          // Fast initially, slower as it gets closer
          const diff = targetProgress - prev;
          const step = Math.max(diff * 0.1, 0.5);
          return Math.min(prev + step, targetProgress);
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentStepIndex, steps.length]);

  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-5 pt-14" style={{ background: 'var(--bg-base)' }}>
        <div className="w-full max-w-md flex flex-col items-center">
          
          {/* Circular Progress */}
          <div className="relative flex items-center justify-center mb-8">
            <svg
              height={radius * 2}
              width={radius * 2}
              className="transform -rotate-90"
            >
              <circle
                stroke="rgba(168,85,247,0.15)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="url(#gradient)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.3s ease-out' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black font-mono tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Current Step */}
          <div className="text-center mb-10 h-16">
            <h2 className="text-xl font-bold mb-1 transition-all duration-300" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {steps[currentStepIndex] || 'Analysing your profile...'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              AI is computing 22 metrics. This takes about 30–60s.
            </p>
          </div>

          {/* Animated Facts Box */}
          <div className="w-full rounded-2xl p-5 relative overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)' }} />
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-mid)' }}>
                Verified Fact
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
            
            <div className="relative h-20 flex items-center justify-center text-center">
              {VERIFIED_FACTS.map((fact, index) => (
                <p 
                  key={index}
                  className={`absolute w-full text-sm leading-relaxed transition-all duration-700 ease-in-out ${
                    index === factIndex 
                      ? 'opacity-100 transform translate-y-0' 
                      : 'opacity-0 transform translate-y-4 pointer-events-none'
                  }`}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  "{fact}"
                </p>
              ))}
            </div>
            
            {/* Fact dots indicator */}
            <div className="flex justify-center gap-1.5 mt-3">
              {VERIFIED_FACTS.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${index === factIndex ? 'w-4 bg-brand-mid' : 'w-1.5 bg-gray-700/50'}`}
                  style={{ background: index === factIndex ? 'var(--brand-mid)' : 'var(--border-strong)' }}
                />
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

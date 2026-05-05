'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';

const VERIFIED_FACTS = [
  "Only 8% of Instagram accounts have over 10,000 followers. You're competing in the top percentile.",
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
      99
    );
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < targetProgress) {
          const diff = targetProgress - prev;
          const step = Math.max(diff * 0.08, 0.3);
          return Math.min(prev + step, targetProgress);
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [currentStepIndex, steps.length]);

  const radius = 70;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden" style={{ background: '#0a0a0a' }}>
        
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
          
          {/* Circular Progress Bar */}
          <div className="relative flex items-center justify-center mb-10">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl transform scale-75" />
            
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 drop-shadow-xl">
              <circle
                stroke="rgba(255,255,255,0.05)"
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
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c084fc" /> {/* purple-400 */}
                  <stop offset="100%" stopColor="#f472b6" /> {/* pink-400 */}
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
                {Math.round(progress)}<span className="text-xl text-white/50">%</span>
              </span>
            </div>
          </div>

          {/* Current Step Text */}
          <div className="text-center mb-14 h-20 w-full">
            <h2 className="text-2xl font-bold mb-3 tracking-tight text-white transition-opacity duration-300">
              {steps[currentStepIndex] || 'Analysing your profile...'}
            </h2>
            <div className="flex items-center justify-center gap-2 text-white/50">
              <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" />
              </svg>
              <p className="text-sm font-medium">Computing 22 parameters...</p>
            </div>
          </div>

          {/* Elegant Fact Card */}
          <div className="w-full relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-white/5">
            <div className="w-full h-full rounded-3xl bg-black/60 backdrop-blur-2xl p-6 sm:p-8 flex flex-col items-center text-center">
              
              {/* Badge */}
              <div className="mb-6 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                  Verified Data
                </span>
              </div>
              
              {/* Fact Container */}
              <div className="relative w-full h-[88px] flex items-center justify-center">
                {VERIFIED_FACTS.map((fact, index) => (
                  <p 
                    key={index}
                    className={`absolute w-full text-base sm:text-lg font-medium leading-relaxed tracking-wide transition-all duration-700 ease-in-out ${
                      index === factIndex 
                        ? 'opacity-100 transform translate-y-0 scale-100' 
                        : 'opacity-0 transform translate-y-6 scale-95 pointer-events-none'
                    }`}
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  >
                    "{fact}"
                  </p>
                ))}
              </div>
              
              {/* Fact Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {VERIFIED_FACTS.map((_, index) => (
                  <div 
                    key={index} 
                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                      index === factIndex 
                        ? 'w-6 bg-gradient-to-r from-purple-400 to-pink-400' 
                        : 'w-1.5 bg-white/15'
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </main>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const STEPS = [
  'Connected to Instagram',
  'Fetching your last 20 posts...',
  'Analysing engagement patterns...',
  'Scoring your content...',
  'Generating your action plan...',
];

const FACTS = [
  { emoji: '⚡', stat: '34%', text: 'of Instagram reach is determined in the first 30 minutes after posting' },
  { emoji: '🎯', stat: '3×', text: 'more saves = 3× more reach. Saves are Instagram\'s most powerful signal' },
  { emoji: '📊', stat: '22', text: 'data points are being checked on your account right now' },
  { emoji: '🕐', stat: '87%', text: 'of creators post at the wrong time for their specific audience' },
  { emoji: '🏷️', stat: '#fitness', text: 'has 500M+ posts. We\'re finding the goldzone hashtags where you can actually rank' },
  { emoji: '💰', stat: '₹8,000+', text: 'is what fitness creators with your engagement rate can charge per Reel' },
  { emoji: '🔍', stat: '60s', text: 'is all it takes to analyse 22 things about your account' },
  { emoji: '📈', stat: 'Top 5%', text: 'of creators use data to grow. The rest guess. You\'re about to join the top 5%' },
];

interface Props {
  currentStepIndex: number;
  steps: string[];
  username?: string;
}

export default function PremiumLoadingScreen({ currentStepIndex, username }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  // Auto-advance steps every 10 seconds for visual effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => {
        const next = prev + 1;
        if (next >= STEPS.length) { clearInterval(interval); return prev; }
        return next;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync with real API progress (jump ahead if API is faster)
  useEffect(() => {
    if (currentStepIndex > activeStep) setActiveStep(currentStepIndex);
  }, [currentStepIndex, activeStep]);

  // Rotate facts every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % FACTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const fact = FACTS[factIndex];

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen flex flex-col items-center justify-center px-5 pt-16 pb-10"
        style={{ background: 'var(--bg-base)' }}
      >
        <div className="w-full max-w-md">

          {/* Steps */}
          <div className="mb-10 space-y-3">
            {STEPS.map((label, i) => {
              const isDone = i < activeStep;
              const isActive = i === activeStep;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3"
                >
                  <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                    {isDone ? (
                      <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                    ) : isActive ? (
                      <Loader2 size={20} className="animate-spin" style={{ color: 'var(--brand-mid)' }} />
                    ) : (
                      <Circle size={20} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: isDone
                        ? 'var(--success)'
                        : isActive
                        ? 'var(--text-primary)'
                        : 'var(--text-tertiary)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Fact Card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--glow-sm)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={factIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="p-6"
              >
                <div className="flex gap-4 items-start">
                  <span className="text-3xl shrink-0">{fact.emoji}</span>
                  <div>
                    <p
                      className="text-2xl font-black tracking-tight mb-1"
                      style={{
                        background: 'var(--gradient-brand)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {fact.stat}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {fact.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dot indicator */}
            <div className="flex justify-center gap-1.5 pb-4">
              {FACTS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: i === factIndex ? 20 : 6,
                    background: i === factIndex ? 'var(--brand-mid)' : 'var(--border-bright)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Bottom label */}
          <div className="text-center mt-8">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Analysing {username ? `@${username}` : 'your account'}...
            </p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
              This takes 30–60 seconds. Good things take time.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}

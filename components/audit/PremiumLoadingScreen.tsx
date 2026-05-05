'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

const STEPS = [
  'Connected to Instagram',
  'Fetching your last 20 posts...',
  'Analysing engagement patterns...',
  'Scoring your content...',
  'Generating your action plan...',
];

const FACTS = [
  { stat: '34%', text: 'of Instagram reach is determined in the first 30 minutes after posting', emoji: '⚡' },
  { stat: '3×', text: 'more saves = 3× more reach. Saves are Instagram\'s most powerful signal', emoji: '🎯' },
  { stat: '22', text: 'data points are being checked on your account right now', emoji: '📊' },
  { stat: '87%', text: 'of creators post at the wrong time for their specific audience', emoji: '🕐' },
  { stat: '₹8k+', text: 'is what fitness creators with your engagement rate can charge per Reel', emoji: '💰' },
  { stat: 'Top 5%', text: 'of creators use data to grow. The rest guess. You\'re about to join them', emoji: '📈' },
  { stat: '60s', text: 'is all it takes to analyse 22 things about your account', emoji: '🔍' },
];

interface Props {
  currentStepIndex: number;
  steps: string[];
  username?: string;
}

export default function PremiumLoadingScreen({ currentStepIndex, username }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto-advance steps every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync with real API
  useEffect(() => {
    if (currentStepIndex > activeStep) setActiveStep(currentStepIndex);
  }, [currentStepIndex]);

  // Smooth progress bar
  useEffect(() => {
    const target = ((activeStep + 1) / STEPS.length) * 90;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= target) return prev;
        return Math.min(prev + 0.5, target);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [activeStep]);

  // Rotate facts every 6s
  useEffect(() => {
    const interval = setInterval(() => setFactIndex(p => (p + 1) % FACTS.length), 6000);
    return () => clearInterval(interval);
  }, []);

  const fact = FACTS[factIndex];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Top progress bar */}
      <div style={{ height: 2, background: 'var(--bg-elevated)', flexShrink: 0 }}>
        <motion.div
          style={{ height: '100%', background: 'var(--gradient-brand)', originX: 0 }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Brand wordmark */}
      <div style={{ padding: '20px 32px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 900, color: 'white',
            }}
          >
            E
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Eyebird
          </span>
        </div>
      </div>

      {/* Main centered content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
          gap: 40,
        }}
      >
        {/* Animated logo ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', width: 80, height: 80 }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="3" />
            <motion.circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="url(#lg)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={213.6}
              animate={{ strokeDashoffset: [213.6, 0, 213.6] }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
              style={{ rotate: -90, transformOrigin: '40px 40px' }}
            />
            <defs>
              <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF3E80" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}
          >
            📊
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ textAlign: 'center' }}
        >
          <h2
            style={{
              fontSize: 'clamp(22px, 5vw, 32px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}
          >
            Analysing{username ? ` @${username}` : ' your account'}...
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            Claude is reading your content strategy and finding patterns.
            <br />This takes 30–60 seconds. Good things take time.
          </p>
        </motion.div>

        {/* Step list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{
            width: '100%',
            maxWidth: 340,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {STEPS.map((label, i) => {
            const isDone = i < activeStep;
            const isActive = i === activeStep;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDone ? (
                    <Check size={16} style={{ color: 'var(--success)' }} />
                  ) : isActive ? (
                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--brand-mid)' }} />
                  ) : (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bg-overlay)' }} />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isDone || isActive ? 600 : 400,
                    color: isDone ? 'var(--success)' : isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Rotating fact card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={factIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <span style={{ fontSize: 28, flexShrink: 0 }}>{fact.emoji}</span>
              <div>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    marginBottom: 4,
                    background: 'var(--gradient-brand)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {fact.stat}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {fact.text}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
            {FACTS.map((_, i) => (
              <div
                key={i}
                style={{
                  height: 4,
                  width: i === factIndex ? 20 : 6,
                  borderRadius: 4,
                  background: i === factIndex ? 'var(--brand-mid)' : 'var(--bg-overlay)',
                  transition: 'all 0.4s ease',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom margin */}
      <div style={{ height: 40, flexShrink: 0 }} />
    </div>
  );
}

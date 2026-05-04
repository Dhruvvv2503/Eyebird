'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/*
  HeroMockup: Two-phase animation.
  Phase 1 (0→1s): Fade in + slide up from y:40 to y:0.
  Phase 2 (after entrance): Gentle float loop via CSS animation.
  
  Key fix: We use a state flag to only add the CSS float animation
  AFTER Framer Motion's entrance is fully complete. This prevents
  two animation systems fighting over `transform` simultaneously.
*/
function HeroMockup() {
  const [entranceDone, setEntranceDone] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => setEntranceDone(true)}
      style={{
        position: 'relative',
        maxWidth: 540,
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* This wrapper only gets the float animation after entrance completes */}
      <div
        style={{
          animation: entranceDone ? 'hero-float 5s ease-in-out infinite' : 'none',
        }}
      >
        {/* Glow behind card */}
        <div style={{
          position: 'absolute', inset: -16, borderRadius: 28,
          background: 'radial-gradient(ellipse, rgba(168,85,247,0.3) 0%, rgba(255,62,128,0.15) 50%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Card */}
        <div style={{
          position: 'relative', borderRadius: 16, overflow: 'hidden',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          {/* Window chrome */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {['#FF5F57','#FFBD2E','#28CA41'].map(c => (
                <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)' }}>eyebird · audit results</span>
            {/* Live badge */}
            <span style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 999, fontWeight: 600,
              background: 'rgba(34,197,94,0.12)', color: '#22C55E',
              border: '1px solid rgba(34,197,94,0.2)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              Live
            </span>
          </div>

          {/* Card body */}
          <div style={{ padding: '16px' }}>
            {/* Profile row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#FF3E80,#7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 12, fontWeight: 700,
                }}>R</div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0 }}>@fitlife.riya</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', margin: 0 }}>48.5K followers · Fitness</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 24, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1,
                  background: 'linear-gradient(135deg,#FF3E80,#A855F7)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>74</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)' }}>/ 100 score</div>
              </div>
            </div>

            {/* Three metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 12 }}>
              {[
                { label: 'Engagement', value: '3.1%', status: '↑ Above avg', good: true },
                { label: 'Hook Score', value: '7.2/10', status: '↑ Above avg', good: true },
                { label: 'Hashtags', value: '68/100', status: '↗ Fix this', good: false },
              ].map(m => (
                <div key={m.label} style={{
                  borderRadius: 10, padding: '8px 6px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.32)', marginBottom: 3 }}>{m.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.02em' }}>{m.value}</div>
                  <div style={{ fontSize: 8, marginTop: 2, fontWeight: 600, color: m.good ? '#22C55E' : '#F59E0B' }}>{m.status}</div>
                </div>
              ))}
            </div>

            {/* Insight rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Insight 1 */}
              <div style={{ borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 7, background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.15)' }}>
                <Zap size={11} style={{ color: '#A855F7', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.52)', margin: 0 }}>
                  Post on <strong style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 600 }}>Thursday 9 PM</strong> — your audience is 2.3× more active then.
                </p>
              </div>

              {/* Insight 2 */}
              <div style={{ borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 7, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.13)' }}>
                <span style={{ fontSize: 11, flexShrink: 0, marginTop: 0 }}>⚡</span>
                <p style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.52)', margin: 0 }}>
                  Your <strong style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 600 }}>Carousel posts</strong> get 2.4× more saves than your Reels.
                </p>
              </div>

              {/* Insight 3 — locked/blurred */}
              <div style={{
                borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 7,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                opacity: 0.5, filter: 'blur(2px)',
                userSelect: 'none', pointerEvents: 'none',
              }}>
                <span style={{ fontSize: 11, flexShrink: 0 }}>🔒</span>
                <p style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                  +19 more insights — unlock full report
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <>
      {/* Float keyframe — only activates after entrance animation completes */}
      <style>{`
        @keyframes hero-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg-base)' }}>
        {/* ── Gradient mesh ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: '110%', height: '80%', background: 'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(100,50,220,0.65) 0%, rgba(168,85,247,0.35) 30%, transparent 65%)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '55%', height: '65%', background: 'radial-gradient(ellipse at 15% 85%, rgba(255,62,128,0.5) 0%, rgba(255,62,128,0.18) 40%, transparent 65%)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '50%', height: '60%', background: 'radial-gradient(ellipse at 85% 85%, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0.12) 40%, transparent 65%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>

        {/* ZONE 1: Headline + sub + CTAs */}
        <div style={{
          position: 'relative', zIndex: 1,
          paddingTop: 'calc(64px + 48px)',
          paddingBottom: 36,
          paddingLeft: 24,
          paddingRight: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          {/* Pill badge */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontSize: 13, fontWeight: 500, padding: '7px 16px', borderRadius: 999,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)',
            }}>
              <span>✦</span>
              For Indian creators who are done guessing
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 5.8vw, 68px)',
            fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.045em',
            color: '#FAFAFA', marginBottom: 18, maxWidth: 640,
          }}>
            Stop guessing why<br />
            <span style={{ background: 'linear-gradient(135deg,#FF3E80,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              your reels flop
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.46)',
            maxWidth: 400, marginBottom: 28, fontWeight: 400,
          }}>
            You post. You wait. Nothing happens.<br />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>We show you what&apos;s broken</span>{' '}
            — and the 3 things to fix this week.{' '}
            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Free.</span>
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center',
            justifyContent: 'center', gap: 12, marginBottom: 16,
          }}>
            <Link href="/audit" id="hero-cta" className="btn btn-primary"
              style={{ height: 50, padding: '0 28px', borderRadius: 14, fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap' }}>
              Find Out — It&apos;s Free
              <ArrowRight size={17} />
            </Link>
            <Link href="/#how-it-works" className="btn btn-secondary"
              style={{ height: 50, padding: '0 22px', borderRadius: 14, fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap' }}>
              See how it works
            </Link>
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.01em' }}>
            Be among the first creators to know what&apos;s really breaking their growth.
          </p>
        </div>

        {/* Mockup card */}
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 540, width: '90%',
          margin: '0 auto',
          padding: '0 0 80px',
        }}>
          <HeroMockup />
        </div>
      </section>
    </>
  );
}

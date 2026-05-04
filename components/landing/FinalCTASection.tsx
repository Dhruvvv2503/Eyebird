'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function FinalCTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  return (
    <section style={{
      /*
        FIX 6A: Rich background gradient treatment.
        Purple glow from below + faint pink from top-left.
        Creates depth and a "spotlight on the CTA" feel.
      */
      background: `
        radial-gradient(ellipse 80% 60% at 50% 100%, rgba(139,92,246,0.18) 0%, transparent 70%),
        radial-gradient(ellipse 60% 40% at 30% 0%, rgba(236,72,153,0.08) 0%, transparent 60%),
        var(--bg-surface)
      `,
      padding: '112px 28px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Dot grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />

      <div ref={ref} style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} className="eyebrow" style={{ marginBottom: 24 }}>
          Your move
        </motion.p>

        {/*
          FIX 6B: Increased headline size to 72px desktop / 44px mobile.
          Headlines at this scale with this copy deserve room to breathe.
        */}
        <motion.h2 initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.07 }}
          style={{
            fontSize: 'clamp(44px, 6.5vw, 72px)',
            fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.04,
            color: '#FAFAFA', marginBottom: 20,
          }}>
          You&apos;ve been creating in the dark.<br />
          <span style={{ background: 'linear-gradient(135deg,#FF3E80,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Time to turn the lights on.
          </span>
        </motion.h2>

        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.15 }}
          style={{ fontSize: 17, lineHeight: 1.65, color: 'rgba(255,255,255,0.4)', marginBottom: 40 }}>
          60 seconds. Free. No credit card. Just answers.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.22 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <Link href="/audit" id="final-cta-button" className="btn btn-primary"
            style={{ height: 52, padding: '0 36px', borderRadius: 14, fontSize: 16, fontWeight: 700 }}>
            Find Out — It&apos;s Free
            <ArrowRight size={18} />
          </Link>

          {/* FIX 6C: Social proof line below button — FIX 8: no fake number */}
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.22)', marginTop: 16 }}>
            No credit card · No catch · Takes 60 seconds
          </p>

          {/* FIX 6D: Pulsing glow line below — visual full stop to the page */}
          <div style={{
            width: 280,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)',
            marginTop: 28,
            animation: 'pulse-line 3s ease-in-out infinite',
          }} />
        </motion.div>
      </div>

      {/* FIX 8: Updated trust — aspirational, no specific unverified number */}
      <style>{`
        @keyframes pulse-line {
          0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
          50% { opacity: 1; transform: scaleX(1.2); }
        }
      `}</style>
    </section>
  );
}

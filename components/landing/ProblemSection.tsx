'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingDown, Clock, EyeOff } from 'lucide-react';
import Link from 'next/link';

const PAIN_POINTS = [
  {
    icon: TrendingDown, num: '01',
    title: "You have no idea what went wrong",
    desc: "You made a reel you were proud of. It got 300 views. You posted it and waited, refreshing every hour. No one told you why. You still don't know.",
    color: '#FF3E80', bg: 'rgba(255,62,128,0.08)', border: 'rgba(255,62,128,0.18)',
    numColor: '#FF3E80',
  },
  {
    icon: Clock, num: '02',
    title: "You're posting when your audience is asleep",
    desc: "Tuesday at 6 PM. Every creator app says the same thing. But YOUR audience might be online at 9 PM on Thursdays. You'll never know by guessing.",
    color: '#A855F7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.18)',
    numColor: '#A855F7',
  },
  {
    icon: EyeOff, num: '03',
    title: "#fitness has 500 million posts. You're in there somewhere.",
    desc: "Generic hashtags bury you. The creators growing fast aren't using #reels and #explore. They know something you don't.",
    color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.18)',
    numColor: '#3B82F6',
  },
];

export default function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  return (
    <section id="problem" style={{
      background: 'var(--bg-base)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '96px 28px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '45%', height: '70%', pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,62,128,0.1), transparent 65%)' }} />

      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div style={{ marginBottom: 56 }}>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} className="eyebrow" style={{ marginBottom: 16 }}>
            The Problem
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.06 }}
            style={{ fontSize: 'clamp(30px,4.5vw,54px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.06, color: '#FAFAFA' }}>
            You&apos;re showing up every day.<br />
            <span style={{ color: 'rgba(255,255,255,0.26)' }}>Nobody&apos;s telling you why it&apos;s not working.</span>
          </motion.h2>
        </div>

        {/*
          FIX 5: All 3 cards in equal 3-column grid (desktop), 2-col (tablet), 1-col (mobile)
          Using r-grid-3 CSS class. Removed r-span-2 and r-span-3 which caused the uneven layout.
        */}
        <div className="r-grid-3" style={{ marginBottom: 48 }}>
          {PAIN_POINTS.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08 + i * 0.1 }}
              className="card"
              style={{ padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: p.bg, border: `1px solid ${p.border}` }}>
                  <p.icon size={19} style={{ color: p.color }} />
                </div>
                {/*
                  FIX 9: Increased opacity from 0.04 to 0.12, changed color to accent brand color.
                  Now clearly intentional as a design element, ties to the brand palette.
                */}
                <span style={{
                  fontSize: 72, fontWeight: 900,
                  color: p.numColor,
                  opacity: 0.12,
                  letterSpacing: '-0.06em', lineHeight: 1,
                  userSelect: 'none', pointerEvents: 'none',
                }}>
                  {p.num}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA', marginBottom: 10 }}>{p.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.42)' }}>{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.45 }}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
          <p style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA' }}>
            Eyebird answers all of this.{' '}
            <span style={{ color: 'rgba(255,255,255,0.32)', fontWeight: 400 }}>60 seconds. For free.</span>
          </p>
          <Link href="/audit" className="btn btn-primary"
            style={{ height: 44, padding: '0 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            Find Out →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

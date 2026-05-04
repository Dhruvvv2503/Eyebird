'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/*
  COPY STRATEGY — STATS BAR
  Numbers need context to mean anything.
  "22 Metrics Analysed" → so what?
  "22 reasons your account grows (or doesn't)" → now it means something.
  Every stat should answer the unspoken question: "Why does that matter to me?"
*/
const STATS = [
  { value: '22', label: 'insights per audit' },
  { value: '60s', label: 'from connect to answers' },
  { value: '₹0', label: 'to see your score' },
  { value: '500+', label: 'beta testers' },
];

export default function SocialProofSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  return (
    <div ref={ref} style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.018)', padding: '52px 28px',
    }}>
      <div className="r-grid-4" style={{ maxWidth: 960, margin: '0 auto' }}>
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.06, duration: 0.4 }} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(38px,5vw,52px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 8,
              background: 'linear-gradient(135deg,#FF3E80,#A855F7,#7C3AED)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.32)' }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

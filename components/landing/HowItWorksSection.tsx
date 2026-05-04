'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Instagram, Cpu, FileText } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    icon: Instagram, step: '01',
    title: 'Connect Instagram',
    desc: "One tap. Read-only. You're not handing over your account — just letting us look. Takes 10 seconds, and you can revoke it anytime.",
    color: '#FF3E80', bg: 'rgba(255,62,128,0.1)', border: 'rgba(255,62,128,0.2)',
  },
  {
    icon: Cpu, step: '02',
    title: 'We do the work',
    desc: "Our AI reads your last 30 posts, your audience patterns, your hashtags, your hooks. 22 things at once. While you sit back.",
    color: '#A855F7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)',
  },
  {
    icon: FileText, step: '03',
    title: 'You get the answers',
    desc: "Not a spreadsheet. Not 40 pages of data. Three specific things to do this week, ranked by impact. That's it.",
    color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)',
  },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  return (
    <section id="how-it-works" style={{
      background: 'var(--bg-surface)', borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '96px 28px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 250, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(168,85,247,0.22), transparent 65%)' }} />

      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} className="eyebrow" style={{ marginBottom: 16 }}>
            How It Works
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.06 }}
            style={{ fontSize: 'clamp(28px,4vw,50px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', lineHeight: 1.06 }}>
            Your answers in 3 steps.<br />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>Under 60 seconds.</span>
          </motion.h2>
        </div>

        <div className="r-grid-3">
          {STEPS.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.12 }}
              className="card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: step.bg, border: `1px solid ${step.border}` }}>
                  <step.icon size={20} style={{ color: step.color }} />
                </div>
                <span style={{ fontSize: 48, fontWeight: 900, color: 'rgba(255,255,255,0.05)', letterSpacing: '-0.06em', lineHeight: 1 }}>{step.step}</span>
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.42)' }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FIX 2: CTA below the 3 step cards — users at peak intent need somewhere to go */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.48 }}
          style={{ textAlign: 'center', marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Link href="/audit" className="btn btn-primary"
            style={{ height: 50, padding: '0 30px', borderRadius: 14, fontSize: 15, fontWeight: 700 }}>
            Start my free audit →
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
            No credit card. No commitment. Takes 60 seconds.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

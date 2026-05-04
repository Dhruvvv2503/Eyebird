'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

/*
  COPY STRATEGY — PRICING
  Purpose: Make ₹99 feel like the easiest decision they'll make today.
  Anchoring: Compare ₹99 to something they spend without thinking.
  Remove risk: "One-time. Yours forever." — eliminates subscription fear.
  The LAUNCH code creates urgency without fake countdown timers.
*/
const FREE_ITEMS = [
  'Profile health score — instantly',
  'See how your engagement compares',
  'Peek at 2 insights for free',
  'Zero commitment',
];

const PRO_ITEMS = [
  'Every answer. All 22 insights.',
  'Your 3-step action plan for this week',
  'Exactly when your audience is online',
  'Which hashtags are burying you (and 5 that won\'t)',
  'Your hook score + a better version, written by AI',
  'What your bio should actually say',
  'How much you can charge for a brand deal',
  'Your full PDF report sent to your email',
];

export default function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  return (
    <section id="pricing" style={{
      background: 'var(--bg-surface)', padding: '96px 28px',
      borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 300, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(124,58,237,0.2), transparent 65%)' }} />

      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} className="eyebrow" style={{ marginBottom: 16 }}>
            Pricing
          </motion.p>
          {/*
            Pricing headline: "Less than a coffee" is the most powerful pricing frame
            in consumer copywriting. It recontextualizes the cost completely.
          */}
          <motion.h2 initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.06 }}
            style={{ fontSize: 'clamp(26px,4vw,50px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', lineHeight: 1.06, marginBottom: 16 }}>
            Less than a coffee.<br />
            <span style={{ color: 'rgba(255,255,255,0.28)' }}>Worth more than a month of guessing.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.12 }}
            style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>
            One-time. No subscription. Yours forever.
          </motion.p>
        </div>

        <div className="r-grid-2" style={{ maxWidth: 880, margin: '0 auto' }}>
          {/* Free tier */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.16 }}
            className="card" style={{ padding: 36, display: 'flex', flexDirection: 'column' }}>
            <p className="eyebrow" style={{ marginBottom: 20 }}>Start Free</p>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 56, fontWeight: 900, color: '#FAFAFA', letterSpacing: '-0.06em', lineHeight: 1 }}>₹0</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.28)', marginBottom: 32 }}>
              No card. No commitment. Just answers.
            </p>
            <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {FREE_ITEMS.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.48)' }}>
                  <Check size={14} strokeWidth={2.5} style={{ color: '#22C55E', flexShrink: 0, marginTop: 1 }} /> {f}
                </li>
              ))}
            </ul>
            <Link href="/audit" className="btn btn-secondary"
              style={{ width: '100%', height: 44, borderRadius: 12, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
              Start for free
            </Link>
          </motion.div>

          {/* Pro tier */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.24 }}
            style={{ position: 'relative', borderRadius: 20 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 20, padding: 1.5, background: 'linear-gradient(135deg,#FF3E80,#A855F7,#7C3AED)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#FF3E80,#7C3AED)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 999, letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: '0 4px 16px rgba(168,85,247,0.45)', whiteSpace: 'nowrap' }}>
              Most Popular
            </div>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 19, padding: 36, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <p className="eyebrow" style={{ marginBottom: 20, color: '#A855F7' }}>Full Report</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 20, textDecoration: 'line-through', color: 'rgba(255,255,255,0.18)' }}>₹299</span>
                <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 1, background: 'linear-gradient(135deg,#FF3E80,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹99</span>
              </div>
              {/* "LAUNCH" promo — written as a secret, not a banner */}
              <div style={{ display: 'inline-block', maxWidth: 'fit-content', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#A855F7', marginBottom: 8 }}>
                Use code LAUNCH — save ₹200
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', marginBottom: 32 }}>
                Pay once. Read it whenever you want.
              </p>
              <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {PRO_ITEMS.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.48)' }}>
                    <Check size={14} strokeWidth={2.5} style={{ color: '#A855F7', flexShrink: 0, marginTop: 1 }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/audit" className="btn btn-primary"
                style={{ width: '100%', height: 44, borderRadius: 12, fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
                Get the full report — ₹99 →
              </Link>
              <p style={{ textAlign: 'center', fontSize: 12, marginTop: 10, color: 'rgba(255,255,255,0.18)' }}>
                Secure via Razorpay · No subscription ever
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

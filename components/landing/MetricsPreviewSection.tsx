'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Clock, BarChart2, Hash, Zap, DollarSign, Users, Activity, FileText, Star } from 'lucide-react';
import Link from 'next/link';

const METRICS = [
  { icon: TrendingUp, title: 'Profile Health Score', desc: 'Overall performance 0–100', locked: false, color: '#FF3E80' },
  { icon: BarChart2, title: 'Engagement Rate', desc: 'vs niche benchmark', locked: false, color: '#A855F7' },
  { icon: Clock, title: 'Best Time to Post', desc: 'Based on your specific audience', locked: false, color: '#3B82F6' },
  { icon: Activity, title: 'Content Format', desc: 'Reels vs Carousels vs Static', locked: false, color: '#22C55E' },
  { icon: Zap, title: 'Hook Quality Score', desc: 'Last 10 Reels + rewrite suggestions', locked: false, color: '#F59E0B' },
  { icon: Hash, title: 'Hashtag Health', desc: 'Goldzone vs dead + 5 new tags', locked: false, color: '#EF4444' },
  { icon: Star, title: 'Brand Deal Readiness', desc: 'Full sponsorship checklist', locked: true, color: '#A855F7' },
  { icon: Users, title: 'Follower Growth Pattern', desc: '90-day organic trend', locked: true, color: '#3B82F6' },
  { icon: FileText, title: 'Caption SEO Score', desc: 'Keywords, CTA, length analysis', locked: true, color: '#22C55E' },
  // FIX 4: Replaced ₹X,XXX placeholder with realistic estimate for a 48K fitness creator
  { icon: DollarSign, title: 'Rate Card Estimate', desc: '₹4,500 – ₹13,000 per Reel', locked: true, color: '#FF3E80' },
];

export default function MetricsPreviewSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  return (
    <section id="metrics" style={{
      background: 'var(--bg-base)', padding: '96px 28px',
      borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: '30%',
        width: '40%', height: '60%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(168,85,247,0.12), transparent 65%)',
      }} />

      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            className="eyebrow" style={{ marginBottom: 16 }}>
            What You Get
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.06 }}
            style={{ fontSize: 'clamp(26px,4vw,50px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', lineHeight: 1.06, marginBottom: 12 }}>
            22 data points. One clear action plan.
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.12 }}
            style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 460, margin: '0 auto' }}>
            Most creators have never seen half of these insights about their own account.
          </motion.p>
        </div>

        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }} className="metrics-grid">
          {METRICS.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.04 + i * 0.04 }}
              className="card"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, opacity: m.locked ? 0.5 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${m.color}18`, border: `1px solid ${m.color}30`,
                }}>
                  <m.icon size={16} style={{ color: m.color }} />
                </div>
                {/* FIX 3: Replaced "PRO" badge with "🔒 Full report" locked badge */}
                {m.locked && (
                  <span style={{
                    fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)', letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                  }}>
                    🔒 Full report
                  </span>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', color: '#FAFAFA', marginBottom: 4 }}>
                  {m.title}
                </h3>
                <p style={{ fontSize: 12, lineHeight: 1.55, color: 'rgba(255,255,255,0.35)' }}>
                  {m.desc}
                </p>
              </div>
            </motion.div>
          ))}

          {/* FIX 3: Updated +12 card with more descriptive text */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.04 + METRICS.length * 0.04 }}
            style={{
              borderRadius: 18, padding: '20px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.01)',
            }}>
            <div style={{
              fontSize: 40, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1,
              background: 'linear-gradient(135deg,#FF3E80,#A855F7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8,
            }}>+12</div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
              more insights in<br />your full report
            </p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.55 }}
          style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/audit" className="btn btn-secondary"
            style={{ height: 44, padding: '0 28px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
            See all 22 metrics — Start free audit →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

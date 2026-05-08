'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingDown, Clock, Hash, BarChart2, Zap, Sparkles, TrendingUp,
  Eye, IndianRupee, Target, Cpu, Instagram,
} from 'lucide-react';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';
import { UsernamePreview } from '@/components/landing/UsernamePreview';
import { ProductDemo } from '@/components/landing/ProductDemo';

/* ─── Landing Navbar ─────────────────────────────────────── */
function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: 64, display: 'flex', alignItems: 'center',
      background: scrolled ? 'rgba(10,8,18,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-bottom 0.3s ease',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#FF3E80,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(168,85,247,0.4)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 10, letterSpacing: '-0.03em' }}>EB</span>
          </div>
          <span style={{ color: '#FAFAFA', fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em' }}>Eyebird</span>
        </Link>
        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', padding: '7px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)' }}>
            Log in
          </Link>
          <Link href="/signup" style={{
            fontSize: 14, fontWeight: 700, textDecoration: 'none', padding: '8px 18px', borderRadius: 9,
            background: 'linear-gradient(135deg,#FF3E80,#A855F7)', color: 'white',
            boxShadow: '0 2px 12px rgba(168,85,247,0.35)',
          }}>
            Get started free →
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Fade-up animation wrapper ─────────────────────────── */
function FadeUp({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section label ─────────────────────────────────────── */
function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A855F7', marginBottom: 16 }}>
      {children}
    </div>
  );
}

/* ─── Gradient text ─────────────────────────────────────── */
function GradText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ background: 'linear-gradient(135deg,#f472b6,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
      {children}
    </span>
  );
}

/* ─── Trust strip ───────────────────────────────────────── */
function TrustStrip() {
  return (
    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', letterSpacing: '0.04em', marginTop: 28 }}>
      🔒 Official Instagram API · ✓ Read-only access · ⚡ Results in 60 seconds · 🇮🇳 Built in India
    </div>
  );
}

/* ─── Pricing plans ─────────────────────────────────────── */
const PLANS = [
  {
    name: 'Free', period: 'forever', price: '₹0', highlight: false, ctaStyle: 'ghost' as const,
    features: ['3 audit metrics preview', 'Basic engagement score', 'No credit card needed'],
    cta: 'Start free →',
  },
  {
    name: 'Full Audit', period: 'one-time', price: '₹99', originalPrice: '₹299', badge: 'MOST POPULAR',
    promoLabel: 'Use code LAUNCH — save ₹200', highlight: true, ctaStyle: 'gradient' as const,
    features: ['All 22 metrics analysed', 'AI-generated action plan', 'Brand rate card estimate', 'AI bio rewrite', 'PDF report by email', 'Yours forever — no subscription'],
    cta: 'Get full audit →',
  },
  {
    name: 'Creator Plan', period: 'per month', price: '₹799', highlight: false, ctaStyle: 'outlined' as const,
    features: ['Everything in Full Audit', 'Unlimited DM automations', 'Monthly re-audit', 'Smart Reply AI inbox', 'Growth dashboard', 'Unlimited DMs', 'Cancel anytime'],
    cta: 'Start Creator Plan →',
  },
];

const FEATURES = [
  { icon: BarChart2,    rgb: '139,92,246',   color: '#8B5CF6', title: 'Account Audit',          desc: '22 metrics analysed. Engagement rate vs your niche benchmark. Best time to post for YOUR audience. Hook quality score. Hashtag health. Bio SEO. Rate card estimate.' },
  { icon: Zap,         rgb: '234,179,8',    color: '#EAB308', title: 'DM Automation',           desc: 'Comment a keyword → get your link in DMs. Story reply automation. Welcome DM to new followers. Lead capture with WhatsApp support. Running 24/7 while you create.' },
  { icon: Sparkles,    rgb: '236,72,153',   color: '#EC4899', title: 'Smart Reply AI',          desc: 'Never leave a DM unanswered again. Our AI reads each message, understands your niche, and suggests the perfect reply. You approve in one tap.' },
  { icon: TrendingUp,  rgb: '34,197,94',    color: '#22C55E', title: 'Growth Dashboard',        desc: 'Track your account health score over time. See exactly what improved month over month. Get a weekly AI briefing every Monday morning.' },
  { icon: Eye,         rgb: '59,130,246',   color: '#3B82F6', title: 'Competitor Intelligence', desc: 'Track 10 competitor accounts. See their best reels this week. Find the topics nobody in your niche is covering yet. Own them first.' },
  { icon: IndianRupee, rgb: '245,158,11',   color: '#F59E0B', title: 'Brand Rate Card',         desc: 'Know exactly what to charge for a Story, Reel, and Carousel based on your real engagement rate. Stop undercharging by 40%.' },
];

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <>
      <LandingNavbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '100px 24px 80px',
        position: 'relative', overflow: 'hidden', background: '#0A0812',
      }}>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1000, height: 600, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '10%', width: 400, height: 400, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(255,62,128,0.07), transparent 65%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ maxWidth: 760, position: 'relative', zIndex: 1 }}
        >
          {/* Eyebrow */}
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A855F7', marginBottom: 28 }}>
            ✦&nbsp;&nbsp;Built for Instagram creators who are done guessing
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(48px,8vw,80px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.04em', color: 'white', marginBottom: 16 }}>
            Your Instagram has<br />
            the <GradText>answers.</GradText>
          </h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
            style={{ fontSize: 'clamp(20px,3vw,32px)', fontWeight: 400, fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}
          >
            You&apos;ve just never been shown them.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.5 }}
            style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}
          >
            Eyebird reads your last 30 posts, your audience patterns, your hashtags, and your hooks — then tells you the 3 things to fix this week. Specific. Actionable. Yours.
          </motion.p>

          {/* Primary CTA */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Link
              href="/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 56, padding: '0 28px', borderRadius: 14,
                background: 'linear-gradient(135deg,#FF3E80,#A855F7)',
                color: 'white', fontSize: 17, fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(168,85,247,0.4)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 32px rgba(168,85,247,0.6)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 24px rgba(168,85,247,0.4)'; }}
            >
              See what&apos;s holding you back →
            </Link>
          </motion.div>

          {/* Username preview */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <UsernamePreview />
          </motion.div>

          <TrustStrip />
        </motion.div>
      </section>

      {/* ── PRODUCT DEMO ──────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '120px 24px', background: '#0A0812' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeUp>
            <SectionLabel>SEE IT IN ACTION</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 56 }}>
              One platform.<br />Everything you need to grow.
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <ProductDemo />
          </FadeUp>
        </div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', background: '#0A0812' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeUp>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 64 }}>
              You&apos;re not failing.<br />You&apos;re <GradText>flying blind.</GradText>
            </h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { Icon: TrendingDown, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', title: 'You made something great. Nobody saw it.', body: 'You spent 3 hours on that Reel. It got 400 views. You still don\'t know why. And you\'ll never know — unless something tells you.' },
              { Icon: Clock,        color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', title: 'You\'re posting at the wrong time. Every day.', body: 'Generic advice says 6 PM. Your audience is online at 9 PM on Thursdays. That difference costs you 40% of your potential reach.' },
              { Icon: Hash,         color: '#A855F7', bg: 'rgba(168,85,247,0.08)', title: '#fitness has 500 million posts. You\'re invisible.', body: 'The creators growing fastest in your niche aren\'t using #fitness. Eyebird finds the exact hashtags where you can actually rank.' },
            ].map(({ Icon, color, bg, title, body }, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16, padding: 28, height: '100%',
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 10, lineHeight: 1.35 }}>{title}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{body}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section style={{ padding: '120px 24px', background: '#0A0812' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeUp>
            <SectionLabel>THE PROCESS</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 64 }}>
              From confused to clear<br />in under 60 seconds.
            </h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
            {[
              { num: '01', Icon: Instagram, color: '#EC4899', bg: 'rgba(236,72,153,0.1)', title: 'Connect your Instagram', body: 'One tap. Official API. Read-only — we can never post anything. Takes 10 seconds. Disconnect anytime.' },
              { num: '02', Icon: Cpu,       color: '#A855F7', bg: 'rgba(168,85,247,0.1)', title: 'We read everything',       body: 'Your last 30 posts. Audience patterns. Hooks. Hashtags. 22 data points simultaneously. While you sit back.' },
              { num: '03', Icon: Target,    color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  title: 'You get your action plan', body: 'Not a spreadsheet. Not 40 pages. Three specific things to do this week, ranked by impact, personalised to your account.' },
            ].map(({ num, Icon, color, bg, title, body }, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16, padding: '28px 24px', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 64, fontWeight: 800, color: '#A855F7', opacity: 0.07, lineHeight: 1, pointerEvents: 'none' }}>{num}</div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{body}</div>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.3}>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link
                href="/signup"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, height: 52, padding: '0 28px',
                  borderRadius: 12, background: 'linear-gradient(135deg,#FF3E80,#A855F7)',
                  color: 'white', fontSize: 16, fontWeight: 700, textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(168,85,247,0.35)',
                }}
              >
                Start for free — no card needed →
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '120px 24px', background: '#0A0812' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeUp>
            <SectionLabel>WHAT YOU GET</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(30px,4.5vw,48px)', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 56 }}>
              Everything a serious creator needs.<br />Nothing they don&apos;t.
            </h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="features-grid">
            {FEATURES.map(({ icon: Icon, rgb, color, title, desc }, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 16, padding: '28px 24px', height: '100%',
                    transition: 'border-color 0.2s ease, transform 0.2s ease', cursor: 'default',
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8, lineHeight: 1.3 }}>{title}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{desc}</div>
                </div>
              </FadeUp>
            ))}
            {/* Coming soon */}
            <FadeUp delay={0.36}>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>AND MORE COMING</div>
                {['Collab finder', 'Content calendar', 'Story analytics'].map(f => (
                  <div key={f} style={{ fontSize: 13, color: 'rgba(255,255,255,0.15)', marginBottom: 4 }}>🔒 {f}</div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', background: '#0A0812' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeUp>
            <SectionLabel>PRICING</SectionLabel>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(30px,4.5vw,52px)', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 12 }}>
              Less than a coffee.<br />
              <GradText>More than a month of guessing.</GradText>
            </h2>
            <p style={{ textAlign: 'center', fontSize: 16, color: 'rgba(255,255,255,0.45)', marginBottom: 60 }}>
              One-time payment for your audit. Monthly subscription for everything else. Cancel anytime.
            </p>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }} className="pricing-grid">
            {PLANS.map((plan, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div style={{
                  background: plan.highlight ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)',
                  border: plan.highlight ? '2px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20, padding: '32px 28px', position: 'relative',
                  boxShadow: plan.highlight ? '0 0 40px rgba(139,92,246,0.1)' : 'none',
                  transform: plan.highlight ? 'scale(1.02)' : 'scale(1)',
                }}>
                  {plan.badge && (
                    <div style={{
                      position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', borderRadius: 20,
                      padding: '4px 14px', fontSize: 11, fontWeight: 700, color: 'white', whiteSpace: 'nowrap',
                    }}>
                      {plan.badge}
                    </div>
                  )}
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    {'originalPrice' in plan && plan.originalPrice && (
                      <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>{plan.originalPrice}</span>
                    )}
                    <span style={{ fontSize: 48, fontWeight: 800, color: 'white', fontFamily: 'monospace', lineHeight: 1 }}>{plan.price}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 'promoLabel' in plan && plan.promoLabel ? 8 : 24 }}>{plan.period}</div>
                  {'promoLabel' in plan && plan.promoLabel && (
                    <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#22c55e', fontWeight: 600, marginBottom: 24 }}>
                      {plan.promoLabel}
                    </div>
                  )}
                  <div style={{ marginBottom: 28 }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
                        <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }}>✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <a
                    href="/signup"
                    style={{
                      display: 'block', width: '100%', padding: '14px 0', borderRadius: 12,
                      textAlign: 'center', fontSize: 15, fontWeight: 700, textDecoration: 'none',
                      transition: 'opacity 0.2s',
                      ...(plan.ctaStyle === 'gradient' ? {
                        background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', color: 'white', border: 'none',
                      } : plan.ctaStyle === 'outlined' ? {
                        background: 'transparent', color: '#8B5CF6', border: '1.5px solid #8B5CF6',
                      } : {
                        background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)',
                      }),
                    }}
                    onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {plan.cta}
                  </a>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', background: '#0A0812', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 900, height: 500, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(139,92,246,0.2), transparent 65%)' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <FadeUp>
            <h2 style={{ fontSize: 'clamp(40px,7vw,72px)', fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 20 }}>
              Your next viral post<br />starts with knowing<br /><GradText>what&apos;s broken.</GradText>
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', marginBottom: 36, lineHeight: 1.6 }}>
              60 seconds. Free preview. No credit card.<br />See what Eyebird finds about your account.
            </p>
            <Link
              href="/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', height: 56, padding: '0 32px', borderRadius: 14,
                background: 'linear-gradient(135deg,#FF3E80,#A855F7)',
                color: 'white', fontSize: 17, fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(168,85,247,0.4)',
              }}
            >
              See what&apos;s holding you back →
            </Link>
            <TrustStrip />
          </FadeUp>
        </div>
      </section>

      <Footer />
      <ToastContainer />

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 767px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .pricing-grid  { grid-template-columns: 1fr !important; }
          .pricing-grid > * { transform: scale(1) !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}

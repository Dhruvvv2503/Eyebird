'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingDown, Clock, Hash, Cpu, Target,
  BarChart2, Zap, Sparkles, TrendingUp, Eye, IndianRupee,
  Instagram, Check,
} from 'lucide-react';

function GradText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: 'linear-gradient(135deg, #f472b6, #fb923c)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>
      {children}
    </span>
  );
}

function FadeUp({ children, delay = 0, className = '', style = {} }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
      background: scrolled ? 'rgba(10,8,18,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1000, margin: '0 auto', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #FF3E80, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(168,85,247,0.4)',
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 10, letterSpacing: '-0.02em' }}>EB</span>
          </div>
          <span style={{ color: '#FAFAFA', fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em' }}>Eyebird</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login" style={{
            fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
            padding: '8px 16px', borderRadius: 8, transition: 'color 0.2s',
          }}
            onMouseOver={e => (e.currentTarget.style.color = 'white')}
            onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >Log in</Link>
          <Link href="/signup" style={{
            fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none',
            padding: '9px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            transition: 'opacity 0.2s',
          }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >Start free →</Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px', position: 'relative', overflow: 'hidden', textAlign: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139,92,246,0.1) 0%, transparent 65%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 40% 40% at 80% 80%, rgba(236,72,153,0.06) 0%, transparent 60%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, width: '100%' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.08)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 32,
          fontSize: 12, color: '#8B5CF6', letterSpacing: '0.08em',
        }}>
          ✦&nbsp;&nbsp;Used by 500+ Indian creators
        </div>

        <h1 className="hero-headline" style={{
          fontSize: 76, fontWeight: 800, lineHeight: 1.0,
          color: 'white', marginBottom: 24, letterSpacing: '-0.04em',
        }}>
          Your last reel got 400 views.<br />
          We know <GradText>exactly why.</GradText>
        </h1>

        <p className="hero-sub" style={{
          fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75,
          maxWidth: 540, margin: '0 auto 40px',
        }}>
          Eyebird analyses 22 things about your Instagram account
          and tells you the 3 specific things to fix this week.
          Not generic tips. Your account. Your data. Your fix.
        </p>

        <motion.a
          href="/signup"
          whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(139,92,246,0.35)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            height: 56, padding: '0 32px', borderRadius: 14,
            fontSize: 17, fontWeight: 700, color: 'white',
            textDecoration: 'none', marginBottom: 16,
          }}
        >
          Get my free audit →
        </motion.a>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em', marginBottom: 20 }}>
          Free preview · No credit card · 60 seconds
        </div>

        <div style={{
          fontSize: 12, color: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <span>🔒 Official Instagram API</span>
          <span>·</span>
          <span>👁 Read-only</span>
          <span>·</span>
          <span>🇮🇳 Built in India</span>
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  const metrics = [
    { label: 'Engagement', value: '3.1%', badge: '↑ Above avg', badgeColor: '#22c55e', badgeBg: 'rgba(34,197,94,0.1)' },
    { label: 'Hook Score', value: '7.2/10', badge: '↑ Above avg', badgeColor: '#22c55e', badgeBg: 'rgba(34,197,94,0.1)' },
    { label: 'Hashtags', value: '68/100', badge: '↗ Fix this', badgeColor: '#eab308', badgeBg: 'rgba(234,179,8,0.1)' },
  ];

  return (
    <section style={{ padding: '120px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <FadeUp>
          <div style={{ fontSize: 12, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
            WHAT YOU'LL SEE ABOUT YOUR ACCOUNT
          </div>
          <h2 className="section-headline" style={{
            fontSize: 52, fontWeight: 800, color: 'white', letterSpacing: '-0.03em',
            lineHeight: 1.1, marginBottom: 16,
          }}>
            Real data. Real insights.<br /><GradText>No fluff.</GradText>
          </h2>
          <p className="section-sub" style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', marginBottom: 56 }}>
            This is what a real Eyebird audit looks like.<br />
            Every number comes from your actual Instagram account.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div style={{
            maxWidth: 680, margin: '0 auto',
            background: '#0F0C1A', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            animation: 'float 4s ease-in-out infinite',
          }}>
            {/* Window chrome */}
            <div style={{
              background: '#1A1528', padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>
                eyebird · audit results
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>Live</span>
              </div>
            </div>

            {/* Profile row */}
            <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: 'white',
                }}>R</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>@fitlife.riya</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>48.5K followers · Fitness</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'white', fontFamily: 'monospace', lineHeight: 1 }}>74</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/100 score</div>
              </div>
            </div>

            {/* Metric cards */}
            <div className="metrics-grid" style={{ padding: '0 24px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {metrics.map((m, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: '14px',
                }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{m.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'monospace', marginBottom: 8 }}>{m.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: m.badgeColor, background: m.badgeBg, borderRadius: 6, padding: '2px 8px', display: 'inline-block' }}>{m.badge}</div>
                </div>
              ))}
            </div>

            {/* Insight rows */}
            <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'left',
              }}>
                <span>⚡</span>
                Post on <strong style={{ color: 'white' }}>&nbsp;Thursday 9 PM</strong> — your audience is 2.3× more active then
              </div>
              <div style={{
                background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)',
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'left',
              }}>
                <span>🎯</span>
                Your <strong style={{ color: 'white' }}>&nbsp;Carousel posts</strong> get 2.4× more saves than your Reels
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '12px 16px',
                  fontSize: 13, color: 'rgba(255,255,255,0.6)',
                }}>
                  🔑 Your weakest hook is losing 60% of viewers in the first second. Here's the fix...
                </div>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 14 }}>🔒</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                    19 more insights · Unlock for ₹99
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 16, fontStyle: 'italic', textAlign: 'center' }}>
            ↑ This is from a real audit. Every number is pulled directly<br />
            from Instagram's official API. Nothing is estimated.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

const problemCards = [
  {
    Icon: TrendingDown,
    iconColor: 'rgb(239,68,68)',
    iconBg: 'rgba(239,68,68,0.1)',
    title: "You made something good. Nobody saw it.",
    body: "You spent 3 hours editing that Reel. It got 312 views. The one you made in 20 minutes got 18,000. You still don't know why. Neither does anyone else giving you generic advice.",
  },
  {
    Icon: Clock,
    iconColor: 'rgb(245,158,11)',
    iconBg: 'rgba(245,158,11,0.1)',
    title: "You're posting at the wrong time. Every single day.",
    body: "Every article says 'post at 6 PM'. Your audience is online at 9 PM on Thursdays. That 3-hour difference is costing you 40% of your potential reach. Every post. Every week.",
  },
  {
    Icon: Hash,
    iconColor: 'rgb(139,92,246)',
    iconBg: 'rgba(139,92,246,0.1)',
    title: "#fitness has 500 million posts. You don't exist there.",
    body: "The creators growing fastest in your niche aren't using the obvious hashtags. They've found the goldzone — hashtags with 200K–800K posts where they can actually rank. Eyebird finds yours in 60 seconds.",
  },
];

function ProblemCard({ card }: { card: typeof problemCards[number] }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: 28, height: '100%',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <card.Icon size={20} color={card.iconColor} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 10, lineHeight: 1.4 }}>
        {card.title}
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>
        {card.body}
      </div>
    </div>
  );
}

function ProblemSection() {
  return (
    <section style={{ padding: '120px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <FadeUp>
          <h2 className="problem-headline" style={{
            fontSize: 60, fontWeight: 800, color: 'white', letterSpacing: '-0.03em',
            lineHeight: 1.1, marginBottom: 48, textAlign: 'center',
          }}>
            You're not a bad creator.<br />You're just <GradText>flying blind.</GradText>
          </h2>
        </FadeUp>

        <div className="problem-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {problemCards.slice(0, 2).map((card, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <ProblemCard card={card} />
            </FadeUp>
          ))}
          <FadeUp delay={0.2} className="problem-full" style={{ gridColumn: 'span 2' }}>
            <ProblemCard card={problemCards[2]} />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: '01',
    Icon: Instagram,
    iconColor: '#EC4899',
    iconBg: 'rgba(236,72,153,0.1)',
    title: 'Connect your Instagram',
    body: "One click. Official Meta API. Read-only — we literally cannot post, comment, or follow anyone. Takes 10 seconds. Disconnect anytime from Instagram settings.",
  },
  {
    number: '02',
    Icon: Cpu,
    iconColor: '#60a5fa',
    iconBg: 'rgba(96,165,250,0.1)',
    title: 'We read 22 things simultaneously',
    body: "Your last 20 posts. Your audience demographics. Your hook quality. Your hashtag health. Your best posting window. Your engagement vs your niche benchmark. All at once.",
  },
  {
    number: '03',
    Icon: Target,
    iconColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.1)',
    title: 'You get 3 specific things to fix this week',
    body: "Not a 40-page PDF. Not generic tips. Three actions, ranked by impact, specific to your account. With the exact wording, timing, and reasoning behind each one.",
  },
];

function HowItWorksSection() {
  return (
    <section style={{ padding: '120px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
              THE PROCESS
            </div>
            <h2 className="section-headline" style={{
              fontSize: 52, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1,
            }}>
              From confused to clear<br />in under 60 seconds.
            </h2>
          </div>
        </FadeUp>

        <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, position: 'relative' }}>
          <div className="how-it-works-line" style={{
            position: 'absolute', top: 40, left: '16.67%', right: '16.67%',
            borderTop: '1px dashed rgba(255,255,255,0.1)', pointerEvents: 'none',
          }} />

          {steps.map((step, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div style={{ position: 'relative', padding: '28px 24px' }}>
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  fontSize: 80, fontWeight: 900, color: '#8B5CF6', opacity: 0.06,
                  lineHeight: 1, fontFamily: 'monospace', userSelect: 'none',
                }}>
                  {step.number}
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: step.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, position: 'relative', zIndex: 1,
                }}>
                  <step.Icon size={22} color={step.iconColor} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 10, lineHeight: 1.3, position: 'relative', zIndex: 1 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, position: 'relative', zIndex: 1 }}>
                  {step.body}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.3}>
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <motion.a
              href="/signup"
              whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(139,92,246,0.35)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                height: 56, padding: '0 32px', borderRadius: 14,
                fontSize: 17, fontWeight: 700, color: 'white', textDecoration: 'none',
              }}
            >
              Get my free audit →
            </motion.a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

const features = [
  {
    Icon: BarChart2, iconRgb: '139, 92, 246', title: 'Account Audit',
    description: '22 metrics. Engagement rate vs your niche. Best time to post for YOUR audience. Hook quality. Hashtag health. Bio SEO score. Brand rate card. All from your real Instagram data.',
  },
  {
    Icon: Zap, iconRgb: '234, 179, 8', title: 'DM Automation',
    description: "Someone comments your keyword → they get your link in DMs instantly. Story replies, welcome DMs, lead capture. Running 24/7. You set it up once in 2 minutes.",
  },
  {
    Icon: Sparkles, iconRgb: '236, 72, 153', title: 'Smart Reply AI',
    description: "Claude AI reads every unmatched DM, understands your niche, and suggests the perfect reply. You approve in one tap. 50 DMs managed in 5 minutes.",
  },
  {
    Icon: TrendingUp, iconRgb: '34, 197, 94', title: 'Growth Tracking',
    description: "Your account health score tracked over time. See exactly what improved month over month. Weekly AI briefing every Monday. Know it's working.",
  },
  {
    Icon: Eye, iconRgb: '59, 130, 246', title: 'Competitor Intel',
    description: "Track 10 competitors. See their best reels this week. Find the content gaps nobody in your niche is covering. Own them before anyone else does.",
  },
  {
    Icon: IndianRupee, iconRgb: '245, 158, 11', title: 'Rate Card',
    description: "Know exactly what to charge brands for a Story, Reel, and Carousel based on your actual engagement rate. Stop charging ₹500 when brands would pay ₹3,000.",
  },
];

function FeaturesSection() {
  return (
    <section style={{ padding: '120px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
              WHAT YOU GET
            </div>
            <h2 className="section-headline" style={{
              fontSize: 52, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16,
            }}>
              The complete picture.<br />For the first time.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
              Start with a free audit. Upgrade when you're ready to automate.
            </p>
          </div>
        </FadeUp>

        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {features.map((f, i) => (
            <FadeUp key={i} delay={i * 0.07}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16, padding: '28px 24px', height: '100%',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `rgba(${f.iconRgb}, 0.1)`,
                  border: `1px solid rgba(${f.iconRgb}, 0.15)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <f.Icon size={20} color={`rgb(${f.iconRgb})`} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8, lineHeight: 1.3 }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75 }}>
                  {f.description}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: 'Free Preview', billing: 'Always free', price: '₹0', originalPrice: null as null | string,
    highlight: false, badge: null as null | string, promoNote: null as null | string,
    features: [
      '3 of 22 metrics revealed',
      'Your engagement rate vs benchmark',
      'One key insight about your account',
      'No credit card, ever',
    ],
    cta: 'Start free →', ctaHref: '/signup', ctaVariant: 'ghost' as const,
  },
  {
    name: 'Full Audit', billing: 'One-time payment', price: '₹99', originalPrice: '₹299' as null | string,
    highlight: true, badge: 'MOST POPULAR' as null | string, promoNote: 'Code LAUNCH applied — you save ₹200' as null | string,
    features: [
      'All 22 metrics analysed',
      'Your personalised action plan',
      'AI-rewritten bio',
      'Your exact best time to post',
      'Goldzone hashtag recommendations',
      'Brand rate card in ₹',
      'PDF report sent to your email',
      'Yours forever — no subscription',
    ],
    cta: 'Get full audit →', ctaHref: '/signup', ctaVariant: 'gradient' as const,
  },
  {
    name: 'Creator Plan', billing: 'Per month · cancel anytime', price: '₹799', originalPrice: null as null | string,
    highlight: false, badge: null as null | string, promoNote: null as null | string,
    features: [
      'Everything in Full Audit',
      'Monthly re-audit (track your growth)',
      'Unlimited DM automations',
      'Smart Reply AI inbox',
      'Competitor tracking (10 accounts)',
      'Growth dashboard',
      'Unlimited DMs sent',
      'Priority support',
    ],
    cta: 'Start Creator Plan →', ctaHref: '/signup', ctaVariant: 'outlined' as const,
  },
];

function PricingSection() {
  return (
    <section style={{ padding: '120px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
              PRICING
            </div>
            <h2 className="section-headline" style={{
              fontSize: 52, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16,
            }}>
              Start free.<br /><GradText>Pay when it clicks.</GradText>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
              Your first 3 insights are free. No card needed.<br />
              Full report is ₹99. Less than one cup of coffee at Starbucks.
            </p>
          </div>
        </FadeUp>

        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
          {plans.map((plan, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div style={{
                position: 'relative',
                background: plan.highlight ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.02)',
                border: plan.highlight ? '2px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '32px 28px',
                boxShadow: plan.highlight ? '0 0 40px rgba(139,92,246,0.08)' : 'none',
                transform: plan.highlight ? 'scale(1.02)' : 'scale(1)',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    borderRadius: 100, padding: '4px 16px',
                    fontSize: 11, fontWeight: 700, color: 'white', whiteSpace: 'nowrap',
                  }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{plan.billing}</div>

                <div style={{ fontSize: 48, fontWeight: 800, color: 'white', fontFamily: 'monospace', lineHeight: 1, marginBottom: 6 }}>
                  {plan.price}
                </div>

                {plan.originalPrice && (
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through', marginBottom: 8 }}>
                    {plan.originalPrice}
                  </div>
                )}
                {plan.promoNote && (
                  <div style={{
                    fontSize: 12, color: '#22c55e', background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6,
                    padding: '4px 10px', display: 'inline-block', marginBottom: 20,
                  }}>
                    {plan.promoNote}
                  </div>
                )}
                {!plan.originalPrice && !plan.promoNote && <div style={{ marginBottom: 14 }} />}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map((feature, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                      <Check size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
                      {feature}
                    </div>
                  ))}
                </div>

                <a
                  href={plan.ctaHref}
                  style={{
                    display: 'block', textAlign: 'center', textDecoration: 'none',
                    height: 48, lineHeight: plan.ctaVariant === 'outlined' ? '45px' : '48px',
                    borderRadius: 10, fontSize: 15, fontWeight: 700,
                    ...(plan.ctaVariant === 'gradient' ? {
                      background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: 'white',
                    } : plan.ctaVariant === 'ghost' ? {
                      background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                    } : {
                      background: 'transparent', border: '1.5px solid #8B5CF6', color: '#8B5CF6',
                    }),
                  }}
                >
                  {plan.cta}
                </a>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section style={{
      padding: '160px 24px', position: 'relative', overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', height: '100%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(139,92,246,0.18) 0%, transparent 65%)',
      }} />

      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <FadeUp>
          <h2 className="final-cta-headline" style={{
            fontSize: 68, fontWeight: 800, color: 'white', letterSpacing: '-0.04em',
            lineHeight: 1.1, marginBottom: 24,
          }}>
            The creators winning on Instagram{' '}
            aren't more talented than you.{' '}
            <GradText>They just know something you don't.</GradText>
          </h2>
          <p className="final-cta-sub" style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', marginBottom: 40 }}>
            Find out what your account has been trying to tell you.<br />
            60 seconds. Free.
          </p>

          <motion.a
            href="/signup"
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(139,92,246,0.35)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              height: 56, padding: '0 32px', borderRadius: 14,
              fontSize: 17, fontWeight: 700, color: 'white',
              textDecoration: 'none', marginBottom: 20,
            }}
          >
            Get my free audit →
          </motion.a>

          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em', marginBottom: 20 }}>
            Free preview · No credit card · 60 seconds
          </div>

          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap',
          }}>
            <span>🔒 Official Instagram API</span>
            <span>·</span>
            <span>👁 Read-only</span>
            <span>·</span>
            <span>🇮🇳 Built in India</span>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '48px 24px 32px', background: '#0A0812',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #FF3E80, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 10px rgba(168,85,247,0.35)',
              }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 10 }}>EB</span>
              </div>
              <span style={{ color: '#FAFAFA', fontWeight: 700, fontSize: 16 }}>Eyebird</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
              Your Instagram growth OS.<br />Made with ❤️ in India.
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Product
            </div>
            {[['How it works', '#how-it-works'], ['Pricing', '#pricing'], ['Dashboard', '/dashboard']].map(([label, href]) => (
              <a key={label} href={href}
                style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 10, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = 'white')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >{label}</a>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Legal
            </div>
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Data Deletion', '/data-deletion']].map(([label, href]) => (
              <a key={label} href={href}
                style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 10, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.color = 'white')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >{label}</a>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Contact
            </div>
            <a href="mailto:support@eyebird.in"
              style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 10, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.color = '#8B5CF6')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >support@eyebird.in</a>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>© 2026 Eyebird. All rights reserved.</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>🇮🇳 Built in India for Indian creators</div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @media (max-width: 768px) {
          .hero-headline { font-size: 44px !important; }
          .hero-sub { font-size: 15px !important; }
          .section-headline { font-size: 34px !important; }
          .problem-headline { font-size: 38px !important; }
          .final-cta-headline { font-size: 40px !important; }
          .final-cta-sub { font-size: 16px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .how-it-works-grid { grid-template-columns: 1fr !important; }
          .how-it-works-line { display: none !important; }
          .metrics-grid { grid-template-columns: 1fr !important; }
          .problem-grid { grid-template-columns: 1fr !important; }
          .problem-full { grid-column: span 1 !important; }
        }

        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{
        background: '#0A0812', minHeight: '100vh', color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <LandingNavbar />
        <HeroSection />
        <ProofSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PricingSection />
        <FinalCTASection />
        <Footer />
      </div>
    </>
  );
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Zap, BarChart2, MessageCircle, TrendingUp, Sparkles, IndianRupee,
  Check, ArrowRight, Users, Clock, ChevronDown, ChevronUp,
} from 'lucide-react'

const GRADIENT = 'linear-gradient(135deg, #8B5CF6, #EC4899)'
const BG = '#080612'

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: GRADIENT,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    }}>
      {children}
    </span>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '18px 20px', cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
      onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'white', lineHeight: 1.4 }}>{q}</span>
        {open
          ? <ChevronUp size={16} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
          : <ChevronDown size={16} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
        }
      </div>
      {open && (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
          {a}
        </p>
      )}
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [dmStep, setDmStep] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setDmStep(s => (s + 1) % 4)
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { getSupabaseClient } = await import('@/lib/supabase')
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        setIsLoggedIn(!!session)
      } catch {
        setIsLoggedIn(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'var(--font-body, inherit)' }}>

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,6,18,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: GRADIENT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: 'white',
          }}>EB</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Eyebird</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isCheckingAuth && (
            isLoggedIn ? (
              <a href="/dashboard" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 20px',
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                color: '#a78bfa',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(139,92,246,0.18)'
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(139,92,246,0.1)'
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'
              }}
              >
                Go to dashboard →
              </a>
            ) : (
              <>
                <a href="/login" style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  transition: 'color 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.color = 'white')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                >
                  Log in
                </a>
                <a href="/signup" style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'white',
                  textDecoration: 'none',
                  padding: '9px 20px',
                  background: GRADIENT,
                  borderRadius: 10,
                  transition: 'opacity 0.2s, transform 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.opacity = '0.9'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                >
                  Get started free →
                </a>
              </>
            )
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '140px 24px 100px', position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 70% 50% at 50% 20%, rgba(139,92,246,0.14) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(236,72,153,0.07) 0%, transparent 60%)
          `,
        }} />

        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 18px',
          border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20,
          background: 'rgba(139,92,246,0.08)', marginBottom: 36,
          fontSize: 12, fontWeight: 600, color: '#a78bfa',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6',
            animation: 'pulse-dot 2s ease-in-out infinite', flexShrink: 0,
          }} />
          India's AI Instagram Manager
        </div>

        {/* Headline */}
        <h1 className="text-hero" style={{ marginBottom: 28, maxWidth: 840 }}>
          Your Instagram{' '}
          <GradientText>Managed</GradientText>
          <br />Even while you sleep
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'rgba(255,255,255,0.45)', lineHeight: 1.7,
          maxWidth: 560, marginBottom: 44, fontWeight: 400,
        }}>
          AI audits your account, replies to DMs automatically, and tells you exactly what to fix —{' '}
          <strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>24 hours a day</strong>
        </p>

        {/* CTA */}
        <a href={isLoggedIn ? '/dashboard' : '/signup'} className="landing-cta-full" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '17px 40px', background: GRADIENT, borderRadius: 14,
          fontSize: 17, fontWeight: 700, color: 'white', textDecoration: 'none',
          boxShadow: '0 8px 32px rgba(139,92,246,0.35)',
          transition: 'all 0.2s ease', marginBottom: 20,
        }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 44px rgba(139,92,246,0.5)' }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,92,246,0.35)' }}
        >
          {isLoggedIn ? 'Go to dashboard →' : 'Get started free →'}
        </a>

        {/* Micro-copy */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 72,
          fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.03em',
        }}>
          {['Free to start', 'No credit card', 'Takes 60 seconds'].map((t, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />}
              {t}
            </span>
          ))}
        </div>

        {/* Hero visual — animated DM mockup */}
        <div
          className="landing-hero-visual"
          style={{
            width: '100%', maxWidth: 700,
            background: '#0F0C1A', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
            animation: 'float 5s ease-in-out infinite', textAlign: 'left',
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          }}
        >
          {/* Window chrome */}
          <div style={{
            background: '#1A1528', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 6,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>eyebird · automation running</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>Live 24/7</span>
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Left: DM conversation */}
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                💬 Comment → DM (automatic)
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 10, animation: 'dm-appear 0.4s ease' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0, marginTop: 2 }} />
                <div style={{
                  background: 'rgba(255,255,255,0.07)', borderRadius: '4px 12px 12px 12px',
                  padding: '8px 12px', fontSize: 12, color: 'rgba(255,255,255,0.7)',
                }}>
                  Bhai can you share the diet plan? 🙏
                </div>
              </div>

              {dmStep >= 1 && (
                <div style={{
                  fontSize: 10, color: '#8B5CF6', textAlign: 'center',
                  marginBottom: 8, animation: 'dm-appear 0.4s ease',
                }}>
                  ⚡ Eyebird responds in 2 seconds
                </div>
              )}

              {dmStep >= 2 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, animation: 'dm-appear 0.4s ease' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(236,72,153,0.3))',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: '12px 4px 12px 12px',
                    padding: '10px 14px', fontSize: 12, color: 'white', maxWidth: '85%',
                  }}>
                    Hey! 💪 Here's your free diet plan:<br />
                    <span style={{ color: '#a78bfa', textDecoration: 'underline' }}>Get it here →</span>
                  </div>
                </div>
              )}

              {dmStep >= 3 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 4, animation: 'dm-appear 0.4s ease' }}>
                  {[['345', 'DMs sent'], ['100%', 'CTR'], ['23', 'Leads']].map(([v, l]) => (
                    <div key={l} style={{
                      flex: 1, background: 'rgba(255,255,255,0.04)',
                      borderRadius: 8, padding: '6px 8px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>{v}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Audit snapshot */}
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                📊 Account audit (AI-powered)
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: 'white', fontFamily: 'monospace', lineHeight: 1 }}>74</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>/100</span>
                <span style={{
                  marginLeft: 4, fontSize: 11, fontWeight: 600, color: '#22c55e',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 6, padding: '2px 8px',
                }}>↑ Strong</span>
              </div>

              {[
                { label: 'Engagement', value: '3.1%', color: '#22c55e' },
                { label: 'Best time', value: 'Thu 9 PM', color: '#8B5CF6' },
                { label: 'Hashtags', value: 'Fix this', color: '#eab308' },
              ].map((m, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.value}</span>
                </div>
              ))}

              <div style={{
                marginTop: 10,
                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
                borderRadius: 8, padding: '8px 10px',
                fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
              }}>
                ⚡ <strong style={{ color: 'white' }}>Action:</strong> Post Thursday 9 PM — 2.3× more reach
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', marginTop: 20, fontStyle: 'italic' }}>
          ↑ This is Eyebird working right now — DMs sent automatically, audit running in background
        </p>
      </section>

      {/* ─── SOCIAL PROOF BAR ─── */}
      <section style={{
        padding: '32px 24px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 'clamp(20px, 4vw, 64px)', flexWrap: 'wrap',
          }}>
            {[
              { number: '500+', label: 'Indian creators', color: '#8B5CF6' },
              { number: '22', label: 'metrics per audit', color: '#EC4899' },
              { number: '24/7', label: 'automation uptime', color: '#22c55e' },
              { number: '₹99', label: 'full audit, one-time', color: '#eab308' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 900,
                  color: stat.color, fontFamily: 'monospace', lineHeight: 1,
                }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section className="section-pad" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="text-label" style={{ marginBottom: 20 }}>The problem</p>
          <h2 className="text-section-headline" style={{ marginBottom: 16, maxWidth: 720, margin: '0 auto 16px' }}>
            You're creating every day<br />
            <GradientText>But who's managing your growth?</GradientText>
          </h2>

          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            color: 'rgba(255,255,255,0.4)', lineHeight: 1.7,
            maxWidth: 520, margin: '0 auto 56px',
          }}>
            A social media manager costs ₹20,000–₹50,000/month — most creators can't afford that, so they do everything alone and miss 80% of what's actually working
          </p>

          <div className="landing-grid-3 features-grid" style={{
            display: 'grid', gap: 16, textAlign: 'left',
          }}>
            {[
              {
                icon: <MessageCircle size={20} color="#ef4444" />,
                topColor: '#ef4444',
                iconBg: 'rgba(239,68,68,0.1)', iconBorder: 'rgba(239,68,68,0.2)',
                title: 'DMs piling up unanswered',
                body: 'Every unanswered DM is a lost follower, lead, or brand deal — you can\'t reply to 200 DMs a day and still make content',
              },
              {
                icon: <Clock size={20} color="#eab308" />,
                topColor: '#eab308',
                iconBg: 'rgba(234,179,8,0.1)', iconBorder: 'rgba(234,179,8,0.2)',
                title: 'Posting and hoping for the best',
                body: 'You post at 6 PM because some article said so — your audience peaks at 9 PM Thursdays, and that gap is costing you reach every day',
              },
              {
                icon: <TrendingUp size={20} color="#8B5CF6" />,
                topColor: '#8B5CF6',
                iconBg: 'rgba(139,92,246,0.1)', iconBorder: 'rgba(139,92,246,0.2)',
                title: "No idea what's actually working",
                body: 'One reel gets 50,000 views, the next gets 300 — without data you\'re just guessing, copying trends, and burning out',
              },
            ].map((card, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '28px 24px',
                borderTop: `3px solid ${card.topColor}`,
                transition: 'transform 0.2s',
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: card.iconBg, border: `1px solid ${card.iconBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  {card.icon}
                </div>
                <h3 className="text-card-title" style={{ marginBottom: 10 }}>{card.title}</h3>
                <p className="text-body" style={{ margin: 0 }}>{card.body}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48 }}>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 15, fontWeight: 600, color: '#a78bfa',
              textDecoration: 'none', padding: '12px 28px',
              border: '1px solid rgba(139,92,246,0.35)', borderRadius: 10,
              transition: 'all 0.2s',
            }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)' }}
            >
              See how Eyebird fixes this <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURES (Solution) ─── */}
      <section className="section-pad" style={{
        background: 'rgba(139,92,246,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p className="text-label" style={{ marginBottom: 20 }}>
            <Sparkles size={11} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            What Eyebird does
          </p>

          <h2 className="text-section-headline" style={{ marginBottom: 16, maxWidth: 720, margin: '0 auto 16px' }}>
            Your AI social media manager<br />
            <GradientText>At 1% of the cost</GradientText>
          </h2>

          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            color: 'rgba(255,255,255,0.4)', lineHeight: 1.7,
            maxWidth: 520, margin: '0 auto 56px',
          }}>
            A human social media manager costs ₹20,000/month — Eyebird does more, for ₹799/month, running 24/7
          </p>

          <div className="features-grid">
            {[
              { icon: <BarChart2 size={20} />, iconRgb: '139, 92, 246', title: 'Instagram Audit',
                body: '22 metrics analysed in 60 seconds — engagement rate, hook quality, best posting time, hashtag health — with 3 specific things to fix this week' },
              { icon: <Zap size={20} />, iconRgb: '234, 179, 8', title: 'DM Automation', badge: '24/7',
                body: 'Keyword comment → instant DM with your link — story replies, welcome DMs, lead capture — set up in 2 minutes, runs forever' },
              { icon: <Sparkles size={20} />, iconRgb: '236, 72, 153', title: 'Smart Reply AI', badge: 'AI',
                body: 'Claude AI reads every DM, understands your niche and voice, suggests the perfect reply — 50 DMs handled in 5 minutes' },
              { icon: <TrendingUp size={20} />, iconRgb: '34, 197, 94', title: 'Growth Tracking',
                body: 'Account health score tracked over time with weekly AI briefing every Monday — know exactly what\'s working, month over month' },
              { icon: <Users size={20} />, iconRgb: '59, 130, 246', title: 'Lead Capture',
                body: 'Turn comments into WhatsApp contacts automatically — every person who engages with your content becomes a lead you own' },
              { icon: <IndianRupee size={20} />, iconRgb: '245, 158, 11', title: 'Brand Rate Card',
                body: 'Know exactly what to charge brands for Stories, Reels, Carousels — based on your actual engagement rate, in rupees' },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '26px 22px',
                transition: 'border-color 0.2s, transform 0.2s', position: 'relative',
                textAlign: 'left',
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = `rgba(${f.iconRgb}, 0.3)`; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {f.badge && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    background: `rgba(${f.iconRgb}, 0.15)`,
                    border: `1px solid rgba(${f.iconRgb}, 0.3)`,
                    borderRadius: 6, padding: '2px 8px',
                    fontSize: 10, fontWeight: 700, color: `rgb(${f.iconRgb})`,
                  }}>{f.badge}</div>
                )}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `rgba(${f.iconRgb}, 0.1)`,
                  border: `1px solid rgba(${f.iconRgb}, 0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16, color: `rgb(${f.iconRgb})`,
                }}>
                  {f.icon}
                </div>
                <h3 className="text-card-title" style={{ marginBottom: 8 }}>{f.title}</h3>
                <p className="text-body" style={{ margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section-pad" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p className="text-label" style={{ marginBottom: 20 }}>How it works</p>

          <h2 className="text-section-headline" style={{ marginBottom: 16, maxWidth: 640, margin: '0 auto 16px' }}>
            Set up in 2 minutes<br />
            <GradientText>Works forever after</GradientText>
          </h2>

          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.35)', marginBottom: 56, lineHeight: 1.6 }}>
            No technical knowledge needed — no agency, no long setup
          </p>

          <div className="steps-grid">
            {[
              { step: '01', color: '139, 92, 246', title: 'Sign up with Google', body: 'One click — your Eyebird account is ready, no forms, no long onboarding' },
              { step: '02', color: '236, 72, 153', title: 'Connect Instagram', body: 'Official Meta API — read-only, we can never post or follow anyone without your permission' },
              { step: '03', color: '34, 197, 94', title: 'Get your audit', body: '60 seconds, 22 metrics, your account health score, 3 specific things to fix this week' },
              { step: '04', color: '234, 179, 8', title: 'Automations run 24/7', body: 'Set up your DM automations in 2 minutes — then forget about it, Eyebird handles everything' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: '28px 22px', textAlign: 'left',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -10, right: 12,
                  fontSize: 80, fontWeight: 900, color: `rgba(${s.color}, 0.06)`,
                  fontFamily: 'monospace', lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
                }}>{s.step}</div>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `rgba(${s.color}, 0.15)`,
                  border: `1px solid rgba(${s.color}, 0.25)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: `rgb(${s.color})`,
                  marginBottom: 16, fontFamily: 'monospace',
                }}>{s.step}</div>
                <h3 className="text-card-title" style={{ marginBottom: 8 }}>{s.title}</h3>
                <p className="text-body" style={{ fontSize: 13, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section style={{
        padding: '96px 24px',
        background: 'rgba(139,92,246,0.025)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 1020, margin: '0 auto' }}>

          {/* Label */}
          <div style={{
            fontSize: 11, fontWeight: 600, color: '#a78bfa',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            textAlign: 'center', marginBottom: 16,
          }}>Pricing</div>

          {/* Headline */}
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 900,
            lineHeight: 1.1, letterSpacing: '-0.025em', color: 'white',
            textAlign: 'center', marginBottom: 12,
          }}>
            Start free<br />
            <span style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Pay when it clicks</span>
          </h2>

          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.4)',
            textAlign: 'center', marginBottom: 56, lineHeight: 1.6,
          }}>
            Free forever to start · Upgrade when you need more
          </p>

          {/* THREE EQUAL HEIGHT CARDS */}
          <div className="pricing-cards-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20, alignItems: 'stretch', marginBottom: 40,
          }}>

            {/* ── CARD 1: FREE ── */}
            <div style={{
              background: 'rgba(139,92,246,0.06)',
              border: '2px solid rgba(139,92,246,0.4)',
              borderRadius: 20, padding: '32px 28px',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 0 40px rgba(139,92,246,0.08)',
              position: 'relative',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                Free Forever
              </div>
              <div style={{ fontSize: 52, fontWeight: 900, color: 'white', fontFamily: 'monospace', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>₹0</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 28 }}>Always free · No credit card</div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 16, letterSpacing: '0.04em' }}>Free includes:</div>
              <div style={{ flex: 1, marginBottom: 24 }}>
                {[
                  { icon: '📊', text: '3 audit metrics free' },
                  { icon: '⚡', text: '1 active DM automation' },
                  { icon: '💬', text: '500 DMs/month' },
                  { icon: '#️⃣', text: 'Comment → DM (1 keyword)' },
                  { icon: '✨', text: '50 Smart Reply suggestions' },
                  { icon: '📈', text: 'Basic analytics dashboard' },
                  { icon: '👥', text: '100 contacts stored' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{f.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#eab308', lineHeight: 1.5, marginBottom: 20 }}>
                ⚡ Most creators hit the 500 DM limit after their first viral post
              </div>
              <Link href="/signup" style={{
                display: 'block', padding: '14px 0',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', borderRadius: 12,
                textAlign: 'center', fontSize: 15, fontWeight: 700, color: 'white',
                textDecoration: 'none', boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
                transition: 'all 0.2s', letterSpacing: '-0.01em',
              }}
                onMouseOver={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.01)' }}
                onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
              >Start free →</Link>
            </div>

            {/* ── CARD 2: FULL AUDIT ── */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '32px 28px',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                Full Audit
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.2)', textDecoration: 'line-through', fontFamily: 'monospace' }}>₹299</span>
                <span style={{ fontSize: 52, fontWeight: 900, color: 'white', fontFamily: 'monospace', letterSpacing: '-0.03em', lineHeight: 1 }}>₹99</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>One-time · yours forever</div>
              <div style={{ display: 'inline-block', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#22c55e', marginBottom: 28, letterSpacing: '0.02em' }}>
                Code LAUNCH — save ₹200
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: 16, letterSpacing: '0.04em' }}>Audit includes:</div>
              <div style={{ flex: 1, marginBottom: 24 }}>
                {[
                  { icon: '📊', text: 'All 22 metrics analysed' },
                  { icon: '🎯', text: 'AI action plan — 3 specific fixes' },
                  { icon: '✏️', text: 'AI bio rewrite suggestion' },
                  { icon: '🕐', text: 'Your exact best time to post' },
                  { icon: '#️⃣', text: 'Goldzone hashtag recommendations' },
                  { icon: '💰', text: 'Brand rate card in ₹' },
                  { icon: '📄', text: 'PDF report delivered to email' },
                  { icon: '♾️', text: 'No subscription — yours forever' },
                  { icon: '💬', text: '500 free DMs to try automation' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{f.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{
                display: 'block', padding: '14px 0',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, textAlign: 'center', fontSize: 15, fontWeight: 700,
                color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'white' }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)' }}
              >Get full audit →</Link>
            </div>

            {/* ── CARD 3: CREATOR PLAN — MOST POPULAR ── */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '32px 28px',
              display: 'flex', flexDirection: 'column', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                borderRadius: 100, padding: '5px 18px',
                fontSize: 11, fontWeight: 700, color: 'white', whiteSpace: 'nowrap',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
              }}>Most Popular</div>

              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, marginTop: 8 }}>
                Creator Plan
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.2)', textDecoration: 'line-through', fontFamily: 'monospace' }}>₹1999</span>
                <span style={{ fontSize: 52, fontWeight: 900, color: 'white', fontFamily: 'monospace', letterSpacing: '-0.03em', lineHeight: 1 }}>₹799</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 28 }}>per month · cancel anytime</div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: 16, letterSpacing: '0.04em' }}>All of Full Audit, and:</div>

              <div style={{ flex: 1, marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginTop: 4 }}>Automation</div>
                {[
                  { icon: '♾️', text: 'Unlimited DMs — no caps, ever', bold: true },
                  { icon: '⚡', text: 'Unlimited active automations', bold: false },
                  { icon: '💬', text: 'Comment → DM (unlimited keywords)', bold: false },
                  { icon: '📖', text: 'Story reply + Welcome DM', bold: false },
                  { icon: '✨', text: 'Smart Reply AI inbox (unlimited)', bold: false },
                  { icon: '📱', text: 'Lead capture — WhatsApp + Email', bold: false },
                  { icon: '📣', text: 'Broadcast to qualifying contacts', bold: false },
                  { icon: '🇮🇳', text: '27 Indian creator templates', bold: false },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                    <span style={{ fontSize: 13, color: f.bold ? 'white' : 'rgba(255,255,255,0.55)', fontWeight: f.bold ? 700 : 400, lineHeight: 1.5 }}>{f.text}</span>
                  </div>
                ))}

                <div style={{ fontSize: 10, fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginTop: 16 }}>Intelligence</div>
                {[
                  { icon: '📈', text: 'Monthly re-audit — track growth' },
                  { icon: '🔍', text: 'Competitor tracking (10 accounts)' },
                  { icon: '🧠', text: 'Weekly AI insights every Monday' },
                  { icon: '📊', text: 'Growth dashboard' },
                  { icon: '👥', text: 'Full contacts CRM + CSV export' },
                  { icon: '🎧', text: 'Priority support (Indian timezone)' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{f.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>vs competitors</div>
                {[
                  { name: 'ManyChat', price: '₹1,500/mo', note: '1K contact cap', isUs: false },
                  { name: 'CreatorFlow', price: '₹2,100/mo', note: '5K DM cap', isUs: false },
                  { name: 'Eyebird', price: '₹799/mo', note: 'Unlimited', isUs: true },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ fontSize: 12, fontWeight: row.isUs ? 700 : 400, color: row.isUs ? 'white' : 'rgba(255,255,255,0.3)' }}>
                      {row.isUs ? '🟢 ' : ''}{row.name}
                    </span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: row.isUs ? 700 : 400, color: row.isUs ? '#22c55e' : 'rgba(255,255,255,0.25)' }}>{row.price}</span>
                      <span style={{ fontSize: 11, color: row.isUs ? '#22c55e' : 'rgba(255,255,255,0.2)' }}>{row.note}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push(isLoggedIn ? '/dashboard?upgrade=1' : '/login')}
                style={{
                  display: 'block', width: '100%', padding: '14px 0', background: 'transparent',
                  border: '1.5px solid rgba(139,92,246,0.5)', borderRadius: 12,
                  textAlign: 'center' as const, fontSize: 15, fontWeight: 700, color: '#a78bfa',
                  cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '-0.01em',
                  marginTop: 'auto', fontFamily: 'inherit',
                }}
                onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(139,92,246,0.15)'; el.style.borderColor = '#8B5CF6'; el.style.color = 'white'; }}
                onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.borderColor = 'rgba(139,92,246,0.5)'; el.style.color = '#a78bfa'; }}
              >Start Creator Plan →</button>

              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
                Cancel anytime · No contracts · Instant access
              </p>
            </div>
          </div>

          {/* Bottom line */}
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginBottom: 40 }}>
            A human social media manager costs ₹20,000–₹50,000/month — Eyebird Creator Plan: ₹799/month — same work, no sick days
          </p>

          {/* FAQ GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              {
                q: 'What happens when I hit 500 DMs on free?',
                a: 'Automations pause until next month — or upgrade to Creator Plan for unlimited DMs instantly',
              },
              {
                q: 'Is this better than CreatorFlow?',
                a: 'CreatorFlow charges ₹2,100/month with DM caps — Eyebird is ₹799 with unlimited DMs and an AI audit included',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes — no contracts, no penalties — cancel from your dashboard in one click',
              },
              {
                q: 'Do you ever post on my Instagram?',
                a: 'Never — we use Instagram\'s official read-only API for audits — automations only send DMs, never posts or follows',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 7, lineHeight: 1.4 }}>{faq.q}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{faq.a}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{
        padding: '100px 24px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 60% 70% at 50% 100%, rgba(139,92,246,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 50% 80%, rgba(236,72,153,0.08) 0%, transparent 60%)
          `,
        }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', marginBottom: 32,
            border: '1px solid rgba(139,92,246,0.25)', borderRadius: 20,
            background: 'rgba(139,92,246,0.07)',
            fontSize: 12, fontWeight: 600, color: '#a78bfa', letterSpacing: '0.05em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse-dot 2s infinite' }} />
            500+ creators already inside
          </div>

          <h2 className="text-section-headline" style={{ marginBottom: 20 }}>
            Stop managing Instagram alone<br />
            <GradientText>Let Eyebird handle it</GradientText>
          </h2>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 44,
          }}>
            Your first audit is free — no credit card, 60 seconds<br />
            See exactly what your account has been trying to tell you
          </p>

          <a href={isLoggedIn ? '/dashboard' : '/signup'} className="landing-cta-full" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '18px 44px', background: GRADIENT, borderRadius: 14,
            fontSize: 18, fontWeight: 700, color: 'white', textDecoration: 'none',
            boxShadow: '0 8px 40px rgba(139,92,246,0.4)', transition: 'all 0.2s',
          }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 52px rgba(139,92,246,0.55)' }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(139,92,246,0.4)' }}
          >
            {isLoggedIn ? 'Go to dashboard →' : 'Start for free →'}
          </a>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 20, marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.2)',
          }}>
            {['🔒 Official Instagram API', '👁 Read-only access', '🇮🇳 Built in India'].map((t, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />}
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '48px 24px 32px', background: BG,
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div className="footer-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 40, marginBottom: 48,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, background: GRADIENT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: 'white',
                }}>EB</div>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Eyebird</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', lineHeight: 1.7 }}>
                India's AI-powered Instagram buddy<br />Made with ❤️ in India
              </p>
            </div>

            {[
              { title: 'Product', links: [['How it works', '#how-it-works'], ['Pricing', '#pricing'], ['Dashboard', '/dashboard']] },
              { title: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Data Deletion', '/data-deletion']] },
              { title: 'Contact', links: [['support@eyebird.in', 'mailto:support@eyebird.in']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16,
                }}>{col.title}</div>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} style={{
                    display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.35)',
                    textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s',
                  }}
                    onMouseOver={e => (e.currentTarget.style.color = 'white')}
                    onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                  >{label}</a>
                ))}
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24,
            display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
            gap: 12, fontSize: 13, color: 'rgba(255,255,255,0.2)',
          }}>
            <span>© 2026 Eyebird — All rights reserved</span>
            <span>🇮🇳 Built in India for Indian creators</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

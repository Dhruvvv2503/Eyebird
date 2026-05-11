'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity, PlaySquare, Image as ImageIcon, Lock, CheckCircle2, ArrowRight, Zap, TrendingUp, Clock, Hash, IndianRupee, PenLine, Sparkles, BarChart3, AlertCircle } from 'lucide-react'
import UpgradeModal from './UpgradeModal'

interface Props {
  igAccount: any
  audit: any
  userProfile: any
  autoStart: boolean
  userId: string
  userEmail: string
  autoUpgrade?: boolean
}

function safeGet(obj: any, path: string, fallback: any = null) {
  try {
    return path.split('.').reduce((o: any, k: string) => o?.[k], obj) ?? fallback
  } catch {
    return fallback
  }
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function useCountUp(target: number, duration = 1400, decimals = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    const steps = duration / 16
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + increment, target)
      setVal(parseFloat(current.toFixed(decimals)))
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, decimals])
  return val
}

const LOADING_FACTS = [
  'Reading your last 20 posts...',
  'Finding your best posting time...',
  'Scoring your hook quality...',
  'Checking your hashtag health...',
  'Calculating your brand rate card...',
  'Generating your action plan...',
]

export function DashboardOverviewClient({ igAccount, audit, userProfile, autoStart, userId, userEmail, autoUpgrade }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [factIndex, setFactIndex] = useState(0)
  const [currentAudit, setCurrentAudit] = useState(audit)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (autoUpgrade) setShowUpgradeModal(true)
  }, [autoUpgrade])

  // Derive metrics early so hooks can use them
  const overallScore = currentAudit?.overall_score || 0
  const metrics = currentAudit?.computed_metrics || {}
  const aiAnalysis = currentAudit?.ai_analysis || {}
  const erNum = parseFloat(String(metrics?.engagementRate || 0))
  const hookNum = parseFloat(String(aiAnalysis?.hook_avg_score || metrics?.hookScore || 5))

  // Animated counts
  const animatedScore = useCountUp(overallScore || 0, 1400, 0)
  const animatedEr = useCountUp(erNum, 1200, 1)
  const animatedHook = useCountUp(hookNum, 1300, 1)

  useEffect(() => {
    if (autoStart) {
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [autoStart])

  useEffect(() => {
    if (!loading) return
    const timer = setInterval(() => {
      setFactIndex(i => (i + 1) % LOADING_FACTS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [loading])

  const runAudit = useCallback(async () => {
    if (!igAccount?.ig_user_id) return
    setLoading(true)
    setError(null)
    try {
      const fetchRes = await fetch('/api/instagram/fetch-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId: igAccount.ig_user_id }),
      })
      if (!fetchRes.ok) throw new Error('Failed to fetch Instagram data')

      const auditRes = await fetch('/api/audit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId: igAccount.ig_user_id }),
      })
      if (!auditRes.ok) throw new Error('Failed to generate audit')

      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Something went wrong — please try again')
      setLoading(false)
    }
  }, [igAccount])

  useEffect(() => {
    if (autoStart && igAccount && !currentAudit) {
      runAudit()
    }
  }, [autoStart, igAccount, currentAudit, runAudit])

  // ─── STATE 1: NO INSTAGRAM CONNECTED ───────────────────────────
  if (!igAccount) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#07060F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
      }}>
        {/* Background atmosphere */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
        }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 520 }}>

          {/* Logo mark */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 28, fontWeight: 800, color: '#fff',
            margin: '0 auto 32px',
            boxShadow: '0 12px 40px rgba(139,92,246,0.35), 0 0 0 1px rgba(139,92,246,0.2)',
          }}>EB</div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32, fontWeight: 800,
            color: '#fff', letterSpacing: '-0.5px',
            marginBottom: 12, lineHeight: 1.2,
          }}>
            Connect your Instagram
          </h1>

          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.7, marginBottom: 40, maxWidth: 360,
            margin: '0 auto 40px',
          }}>
            Get your full account audit, automate DMs, and grow faster — all in one place.
          </p>

          {/* Feature pills */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: 8, marginBottom: 40, flexWrap: 'wrap',
          }}>
            {[
              { icon: '⚡', text: 'Takes 10 seconds' },
              { icon: '👁️', text: 'Read-only access' },
              { icon: '🔒', text: 'We never post anything' },
            ].map(f => (
              <div key={f.text} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 100, padding: '6px 14px',
                fontSize: 12, fontWeight: 500,
                color: 'rgba(255,255,255,0.5)',
              }}>
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <a
            href="/api/instagram/auth"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '15px 36px',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              borderRadius: 14, fontSize: 15, fontWeight: 700,
              color: '#fff', textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-display)',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'
              ;(e.currentTarget as HTMLElement).style.opacity = '0.95'
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
              ;(e.currentTarget as HTMLElement).style.opacity = '1'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/>
            </svg>
            Connect Instagram →
          </a>

          {/* What you get section */}
          <div style={{
            marginTop: 48,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}>
            {[
              { icon: '📊', title: '22-metric audit', desc: 'Full account health report' },
              { icon: '⚡', title: 'DM automation', desc: 'Comment → instant DM' },
              { icon: '🤖', title: 'AI insights', desc: 'Personalized recommendations' },
            ].map(item => (
              <div key={item.title} style={{
                background: 'linear-gradient(145deg, #0F0E20, #0C0B1A)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '16px 14px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 13, fontWeight: 700,
                  color: '#fff', marginBottom: 4,
                }}>{item.title}</div>
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.35)',
                  lineHeight: 1.4,
                }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Trust line */}
          <div style={{
            marginTop: 28,
            fontSize: 12, color: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Secured by Meta OAuth · Your password is never shared with Eyebird
          </div>
        </div>
      </div>
    )
  }

  // ─── STATE 2: LOADING / AUDIT RUNNING ──────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-6 font-sans text-gray-100">
        <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-purple-500 animate-spin mb-8" />
        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
          Analysing @{igAccount?.username}
        </h2>
        <p className="text-gray-400 mb-8 leading-relaxed text-sm">
          Reading 22 signals simultaneously.<br />This takes about 60 seconds.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-gray-400 min-w-[280px] max-w-md animate-pulse">
          {LOADING_FACTS[factIndex]}
        </div>
      </div>
    )
  }

  // ─── ERROR STATE ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 font-sans text-gray-100">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Something went wrong</h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <button
          onClick={() => { setError(null); runAudit() }}
          className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-medium transition-all"
        >
          Try again
        </button>
      </div>
    )
  }

  // ─── HAS INSTAGRAM BUT NO AUDIT ────────────────────────────────
  if (!currentAudit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 font-sans text-gray-100">
        <Sparkles className="w-16 h-16 text-purple-500 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Ready to see your Instagram clearly?</h2>
        <p className="text-lg text-gray-400 mb-10 max-w-md mx-auto">
          We&apos;ll analyse 22 unique metrics about @{igAccount.username} in under 60 seconds.
        </p>
        <button
          onClick={runAudit}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-xl shadow-purple-500/20 transition-all hover:-translate-y-0.5"
        >
          Run my audit <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  // ─── FULL COCKPIT WITH AUDIT DATA ───────────────────────────────
  const formatBreakdown = metrics?.formatBreakdown || {}
  const formats = Object.entries(formatBreakdown) as [string, any][]
  const bestFormatEntry = formats.sort(([, a], [, b]) =>
    (parseFloat(b?.avgEngagementRate) || 0) - (parseFloat(a?.avgEngagementRate) || 0)
  )[0]
  const bestFormatKey = bestFormatEntry?.[0] || 'VIDEO'
  const bestFormatData = bestFormatEntry?.[1] as any
  
  let FormatIcon = PlaySquare;
  let formatName = 'Reels';
  if (bestFormatKey === 'CAROUSEL_ALBUM') { FormatIcon = ImageIcon; formatName = 'Carousels'; }
  else if (bestFormatKey === 'IMAGE') { FormatIcon = ImageIcon; formatName = 'Photos'; }

  const formatEmoji = bestFormatKey === 'VIDEO' ? '🎬' : bestFormatKey === 'CAROUSEL_ALBUM' ? '🖼️' : '📸'

  const formatAvgEr = parseFloat(bestFormatData?.avgEngagementRate || '0').toFixed(1)
  const auditDate = currentAudit?.created_at
    ? new Date(currentAudit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recently'
  const mediaCount = igAccount?.media_count || 0
  const followers = igAccount?.followers_count || 0

  const hookSegs = Array.from({ length: 10 }).map((_, i) => {
    const filled = Math.round(animatedHook)
    if (i >= filled) return 'empty'
    if (i < 3) return 'red'
    if (i < 6) return 'amber'
    return 'pink'
  })

  return (
  <>
  <div style={{
    fontFamily: 'var(--font-body)',
    minHeight: '100vh',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
  }}>

    {/* ── ATMOSPHERIC BACKGROUND ── */}
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      background: `
        radial-gradient(ellipse 70% 55% at 15% -5%, rgba(139,92,246,0.16) 0%, transparent 60%),
        radial-gradient(ellipse 50% 35% at 85% 5%,  rgba(236,72,153,0.09) 0%, transparent 55%),
        radial-gradient(ellipse 35% 30% at 50% 90%, rgba(139,92,246,0.05) 0%, transparent 60%)
      `,
    }} />
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
      backgroundSize: '48px 48px',
      maskImage: 'radial-gradient(ellipse 90% 50% at 50% 0%, black 0%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 90% 50% at 50% 0%, black 0%, transparent 100%)',
    }} />

    <div style={{ position: 'relative', zIndex: 1, padding: '32px 32px 80px', maxWidth: 1320, marginInline: 'auto' }}>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO ROW
          Left: identity + stats pill
          Right: health score ring
      ══════════════════════════════════════════ */}
      <div className="ov-fadein" style={{ display: 'flex', gap: 16, alignItems: 'stretch', marginBottom: 20 }}>

        {/* ── HERO IDENTITY CARD ── */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.09) 0%, rgba(13,12,30,0.97) 45%)',
          border: '1px solid rgba(139,92,246,0.18)',
          borderRadius: 28,
          padding: '32px 36px',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.055)',
        }}>
          {/* Top shimmer border */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.75) 30%, rgba(236,72,153,0.75) 70%, transparent 100%)' }} />
          {/* Corner ambient */}
          <div style={{ position: 'absolute', top: -80, left: -80, width: 320, height: 320, background: 'radial-gradient(circle, rgba(139,92,246,0.11) 0%, transparent 65%)', pointerEvents: 'none' }} />

          {/* Identity row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
            {/* Avatar with rotating ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', inset: -3, borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #8B5CF6 0%, #EC4899 50%, #8B5CF6 100%)',
                animation: 'rotateSlow 5s linear infinite',
              }} />
              <div style={{ position: 'relative', width: 72, height: 72, borderRadius: '50%', background: 'var(--bg)', padding: 3, zIndex: 1 }}>
                {igAccount?.profile_picture_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={igAccount.profile_picture_url}
                    alt={igAccount?.username}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #1a1535, #0C0B1A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#c4b5fd' }}>
                    {igAccount?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: '#22C55E', border: '2.5px solid var(--bg)', animation: 'pulseGreen 2.2s infinite', zIndex: 2 }} />
            </div>

            {/* Name + badges */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--m1)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 7 }}>
                {(() => {
                  const h = new Date().getHours();
                  return h < 12 ? 'Good morning 👋' : h < 17 ? 'Good afternoon 👋' : 'Good evening 👋';
                })()}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.6px', lineHeight: 1.1, marginBottom: 12 }}>
                @{igAccount?.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 100, padding: '4px 13px', fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 7px #22C55E' }} />
                  Live · Instagram Connected
                </div>
                <div style={{ fontSize: 11, color: 'var(--m1)', fontWeight: 500 }}>
                  Audited {auditDate}
                </div>
              </div>
            </div>
          </div>

          {/* Stats pill */}
          <div style={{
            display: 'flex', alignItems: 'center',
            marginTop: 28,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 18, padding: '18px 28px',
            position: 'relative',
          }}>
            {[
              { val: formatNumber(followers), label: 'Followers', color: '#c4b5fd' },
              { val: String(mediaCount),       label: 'Posts',     color: '#93c5fd' },
              { val: erNum.toFixed(1) + '%',   label: 'Avg ER',    color: '#4ade80' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.06)' }} />}
                <div style={{ flex: 1, textAlign: 'center' as const }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: '-0.5px', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--m1)', marginTop: 5, fontWeight: 500, letterSpacing: '0.02em' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── CREATOR PULSE STRIP ── */}
          <div style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}>
            {/* Reach potential */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.04) 100%)',
              border: '1px solid rgba(245,158,11,0.18)',
              borderRadius: 16,
              padding: '14px 16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(245,158,11,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.09em', marginBottom: 8 }}>
                Reach Potential
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fcd34d', letterSpacing: '-0.8px', lineHeight: 1, marginBottom: 5 }}>
                {Math.round(followers * (erNum / 100) * 4.2).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500, lineHeight: 1.4 }}>
                Est. eyes per reel at your ER
              </div>
            </div>

            {/* Content velocity */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(251,146,60,0.10) 0%, rgba(251,146,60,0.04) 100%)',
              border: '1px solid rgba(251,146,60,0.18)',
              borderRadius: 16,
              padding: '14px 16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(251,146,60,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.09em', marginBottom: 8 }}>
                Content Ratio
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 5 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fb923c', letterSpacing: '-0.8px', lineHeight: 1 }}>
                  {mediaCount > 0 ? (followers / mediaCount).toFixed(0) : '—'}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 2, fontWeight: 500 }}>/ post</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500, lineHeight: 1.4 }}>
                Avg followers earned per post
              </div>
            </div>

            {/* Growth signal */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(234,179,8,0.10) 0%, rgba(234,179,8,0.04) 100%)',
              border: '1px solid rgba(234,179,8,0.18)',
              borderRadius: 16,
              padding: '14px 16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(234,179,8,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.09em', marginBottom: 8 }}>
                ER vs Industry
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 5 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#fde047', letterSpacing: '-0.8px', lineHeight: 1 }}>
                  {erNum > 0 ? `${(erNum / 3).toFixed(1)}×` : '—'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500, lineHeight: 1.4 }}>
                Above avg · top-tier creator
              </div>
            </div>
          </div>
        </div>

        {/* ── HEALTH SCORE CARD ── */}
        <div style={{
          width: 220, flexShrink: 0,
          background: 'linear-gradient(165deg, rgba(139,92,246,0.13) 0%, rgba(13,12,30,0.98) 55%)',
          border: '1px solid rgba(139,92,246,0.22)',
          borderRadius: 28, padding: '28px 22px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 48px rgba(0,0,0,0.55), 0 0 60px rgba(139,92,246,0.07), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.85), rgba(236,72,153,0.85), transparent)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: 220, height: 220, background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--m1)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', alignSelf: 'flex-start' }}>Account Health</div>

          {/* Score ring */}
          <div style={{ position: 'relative', width: 116, height: 116 }}>
            <svg width="116" height="116" viewBox="0 0 116 116" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
                <filter id="ringGlow">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <circle cx="58" cy="58" r="48" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
              <circle cx="58" cy="58" r="48" fill="none" stroke="rgba(139,92,246,0.10)" strokeWidth="10" strokeDasharray="301" strokeDashoffset="0" />
              <circle cx="58" cy="58" r="48" fill="none" stroke="url(#rg2)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray="301"
                strokeDashoffset={301 - (301 * animatedScore / 100)}
                filter="url(#ringGlow)"
                style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.34,1.2,0.64,1)' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>{animatedScore}</span>
              <span style={{ fontSize: 10, color: 'var(--m1)', marginTop: 3 }}>/100</span>
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            padding: '6px 20px', borderRadius: 100,
            fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
            color: overallScore >= 70 ? '#4ade80' : overallScore >= 50 ? '#fcd34d' : '#f87171',
            background: overallScore >= 70 ? 'rgba(34,197,94,0.09)' : overallScore >= 50 ? 'rgba(245,158,11,0.09)' : 'rgba(239,68,68,0.09)',
            border: `1px solid ${overallScore >= 70 ? 'rgba(34,197,94,0.28)' : overallScore >= 50 ? 'rgba(245,158,11,0.28)' : 'rgba(239,68,68,0.28)'}`,
            boxShadow: overallScore >= 70 ? '0 0 18px rgba(34,197,94,0.12)' : 'none',
          }}>
            {overallScore >= 70 ? '⚡ Strong Performance' : overallScore >= 50 ? '📈 Growing' : '🔧 Needs Work'}
          </div>

          {/* Mini bars */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
            {[
              { label: 'Engagement', pct: Math.min((erNum / 15) * 100, 100), color: '#22C55E' },
              { label: 'Hook quality', pct: (hookNum / 10) * 100,            color: '#F59E0B' },
              { label: 'Post timing',  pct: 45,                               color: '#8B5CF6' },
            ].map(b => (
              <div key={b.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: 'var(--m1)', fontWeight: 500 }}>{b.label}</span>
                  <span style={{ fontSize: 10, color: b.color, fontWeight: 700 }}>{Math.round(b.pct)}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${b.pct}%`, height: '100%', background: `linear-gradient(90deg, ${b.color}80, ${b.color})`, borderRadius: 2, transition: 'width 1.6s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 8px ${b.color}35` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 2 — METRIC CARDS ROW (3 columns)
          ER · Best Format · Hook Strength
      ══════════════════════════════════════════ */}
      <div className="ov-fadein-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>

        {/* — ENGAGEMENT RATE — */}
        <div
          style={{ background: 'linear-gradient(150deg, rgba(34,197,94,0.05) 0%, rgba(13,12,30,0.98) 55%)', border: '1px solid rgba(34,197,94,0.13)', borderRadius: 24, padding: '26px 28px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 28px rgba(0,0,0,0.45)', transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease', cursor: 'default' }}
          onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-5px)'; el.style.boxShadow='0 20px 48px rgba(34,197,94,0.1), 0 4px 28px rgba(0,0,0,0.45)'; el.style.borderColor='rgba(34,197,94,0.30)'; }}
          onMouseOut={e  => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(0)';   el.style.boxShadow='0 4px 28px rgba(0,0,0,0.45)';                                                 el.style.borderColor='rgba(34,197,94,0.13)'; }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #22C55E, rgba(34,197,94,0.15))', borderRadius: '24px 24px 0 0' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 700, color: 'rgba(34,197,94,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 7px #22C55E' }} />
            Engagement Rate
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 58, fontWeight: 800, color: '#fff', letterSpacing: '-3px', lineHeight: 1, marginBottom: 22, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            {animatedEr.toFixed(1)}
            <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.3)', letterSpacing: 0, fontFamily: 'var(--font-body)', marginBottom: 9, fontWeight: 400 }}>%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'You',          val: erNum.toFixed(1)+'%', pct: Math.min((erNum/15)*100,100), grad: 'linear-gradient(90deg, #16a34a, #22C55E, #4ade80)', textCol: '#4ade80' },
              { label: 'Industry avg', val: '2–4%',               pct: 22,                           grad: 'rgba(255,255,255,0.12)',                               textCol: 'rgba(255,255,255,0.18)' },
            ].map(b => (
              <div key={b.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, fontWeight: 500 }}>
                  <span style={{ color: 'var(--m2)' }}>{b.label}</span>
                  <span style={{ color: b.textCol, fontWeight: 700 }}>{b.val}</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${b.pct}%`, height: '100%', background: b.grad, borderRadius: 3, transition: 'width 1.6s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 -28px 18px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4ade80' }}>✓ Brands pay premium for this</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.22)', borderRadius: 100, padding: '3px 10px' }}>Top tier</span>
          </div>
        </div>

        {/* — BEST FORMAT — */}
        <div
          style={{ background: 'linear-gradient(150deg, rgba(139,92,246,0.06) 0%, rgba(13,12,30,0.98) 55%)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 24, padding: '26px 28px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 28px rgba(0,0,0,0.45)', transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease', cursor: 'default' }}
          onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-5px)'; el.style.boxShadow='0 20px 48px rgba(139,92,246,0.1), 0 4px 28px rgba(0,0,0,0.45)'; el.style.borderColor='rgba(139,92,246,0.35)'; }}
          onMouseOut={e  => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(0)';   el.style.boxShadow='0 4px 28px rgba(0,0,0,0.45)';                                                   el.style.borderColor='rgba(139,92,246,0.15)'; }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #8B5CF6, rgba(139,92,246,0.15))', borderRadius: '24px 24px 0 0' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 700, color: 'rgba(139,92,246,0.75)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', display: 'inline-block', boxShadow: '0 0 7px #8B5CF6' }} />
            Best Format
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(139,92,246,0.07))', border: '1px solid rgba(139,92,246,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: '0 4px 20px rgba(139,92,246,0.18)' }}>
              {formatEmoji}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>
              {formatName}
            </div>
          </div>

          <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 14, padding: '14px 16px', fontSize: 13, color: 'var(--m2)', lineHeight: 1.65, marginBottom: 18 }}>
            {formatAvgEr !== '0.0'
              ? `${formatAvgEr}% avg ER — your strongest content type for reach`
              : 'Gets the most engagement from your audience consistently'}
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(139,92,246,0.09)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: '#a78bfa' }}>
            → Double down on {formatName}
          </div>
        </div>

        {/* — HOOK STRENGTH — */}
        <div
          style={{ background: 'linear-gradient(150deg, rgba(236,72,153,0.06) 0%, rgba(13,12,30,0.98) 55%)', border: '1px solid rgba(236,72,153,0.13)', borderRadius: 24, padding: '26px 28px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 28px rgba(0,0,0,0.45)', transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease', cursor: 'default' }}
          onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-5px)'; el.style.boxShadow='0 20px 48px rgba(236,72,153,0.09), 0 4px 28px rgba(0,0,0,0.45)'; el.style.borderColor='rgba(236,72,153,0.30)'; }}
          onMouseOut={e  => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(0)';   el.style.boxShadow='0 4px 28px rgba(0,0,0,0.45)';                                                    el.style.borderColor='rgba(236,72,153,0.13)'; }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #EC4899, rgba(236,72,153,0.15))', borderRadius: '24px 24px 0 0' }} />
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 700, color: 'rgba(236,72,153,0.75)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EC4899', display: 'inline-block', boxShadow: '0 0 7px #EC4899' }} />
            Hook Strength
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 58, fontWeight: 800, color: '#fff', letterSpacing: '-3px', lineHeight: 1, marginBottom: 20, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            {animatedHook.toFixed(1)}
            <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.3)', letterSpacing: 0, fontFamily: 'var(--font-body)', marginBottom: 10, fontWeight: 400 }}>/10</span>
          </div>

          {/* Segment bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
            {hookSegs.map((state, i) => (
              <div key={i} style={{
                flex: 1, height: 7, borderRadius: 4,
                background: state === 'red'   ? 'linear-gradient(90deg, #dc2626, #EF4444)' :
                             state === 'amber' ? 'linear-gradient(90deg, #d97706, #F59E0B)' :
                             state === 'pink'  ? 'linear-gradient(90deg, #db2777, #EC4899)' :
                                                 'rgba(255,255,255,0.07)',
                boxShadow: state === 'red'   ? '0 0 8px rgba(239,68,68,0.35)'   :
                            state === 'amber' ? '0 0 8px rgba(245,158,11,0.35)' :
                            state === 'pink'  ? '0 0 8px rgba(236,72,153,0.35)' : 'none',
                transition: `background 0.05s ${i * 0.04}s, box-shadow 0.05s ${i * 0.04}s`,
              }} />
            ))}
          </div>

          <div style={{ fontSize: 13, color: 'var(--m2)', lineHeight: 1.65, marginBottom: 18, fontWeight: 500 }}>
            {hookNum >= 8 ? 'Excellent — hooks retaining viewers effectively' :
             hookNum >= 6 ? 'Good — some hooks losing viewers early' :
             'Needs work — losing viewers in the first 3 seconds'}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 -28px 18px' }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: '#f472b6', display: 'flex', alignItems: 'center', gap: 7 }}>
            🔒 AI rewrites available in full report
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 3 — INSIGHTS PANEL + PRICING
          2/3 insights list · 1/3 upgrade cards
      ══════════════════════════════════════════ */}
      <div className="ov-fadein-2" style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: 16 }}>

        {/* ── INSIGHTS PANEL ── */}
        <div style={{ background: 'linear-gradient(150deg, rgba(13,12,30,0.98), rgba(10,9,25,0.99))', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 28px rgba(0,0,0,0.45)' }}>

          {/* Panel header */}
          <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, rgba(139,92,246,0.055), rgba(236,72,153,0.025), transparent)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 100, padding: '4px 12px', fontSize: 10, fontWeight: 700, color: '#fcd34d', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 11 }}>
                🔒 19 insights locked
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.3, marginBottom: 7 }}>
                Your audience peaks at a specific time
              </div>
              <div style={{ fontSize: 13, color: 'var(--m1)', lineHeight: 1.6, fontWeight: 500 }}>
                {"You're probably posting at the wrong one — costing you 40% of reach daily"}
              </div>
            </div>
            <span
              style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', whiteSpace: 'nowrap', cursor: 'pointer', marginTop: 2, flexShrink: 0, letterSpacing: '-0.1px', transition: 'color 0.15s' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#c4b5fd'; }}
              onMouseOut={e  => { (e.currentTarget as HTMLElement).style.color = '#a78bfa'; }}>
              Unlock all 22 →
            </span>
          </div>

          {/* Insight list */}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { icon: '⏰', color: '#8B5CF6', bg: 'rgba(139,92,246,0.09)', border: 'rgba(139,92,246,0.18)', name: 'Your exact golden posting window',   sub: "Not generic advice — YOUR audience's actual peak hours" },
              { icon: '🎯', color: '#EC4899', bg: 'rgba(236,72,153,0.09)', border: 'rgba(236,72,153,0.18)', name: 'The hook losing 60% of your viewers', sub: '+ the AI rewrite to fix it immediately' },
              { icon: '#️⃣', color: '#F59E0B', bg: 'rgba(245,158,11,0.09)', border: 'rgba(245,158,11,0.18)', name: '22 rankable hashtags in your niche',  sub: 'Specific to your content — not #fitness with 500M posts' },
              { icon: '💰', color: '#22C55E', bg: 'rgba(34,197,94,0.09)',   border: 'rgba(34,197,94,0.18)',  name: 'Your brand rate card in ₹',           sub: 'Story · Reel · Carousel — stop undercharging for your reach' },
              { icon: '✏️', color: '#38bdf8', bg: 'rgba(56,189,248,0.09)', border: 'rgba(56,189,248,0.18)',  name: 'Your bio rewritten by AI',            sub: 'Convert profile visitors into followers instantly' },
              { icon: '📈', color: '#a78bfa', bg: 'rgba(167,139,250,0.09)', border: 'rgba(167,139,250,0.18)', name: '3 things to fix this week',          sub: 'Ranked by impact on your reach and growth' },
            ].map((item, i) => (
              <div key={i}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 14, border: '1px solid transparent', transition: 'all 0.15s ease', cursor: 'pointer' }}
                onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.025)'; el.style.borderColor=`${item.color}18`; }}
                onMouseOut={e  => { const el = e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.borderColor='transparent'; }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: item.bg, border: `1px solid ${item.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: `0 4px 14px ${item.color}12` }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.62)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--m1)', marginTop: 3, fontWeight: 500 }}>{item.sub}</div>
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.055)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12 }}>🔒</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── UPGRADE CARDS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* One-time audit */}
          <div style={{ background: 'linear-gradient(150deg, rgba(13,12,30,0.98), rgba(10,9,25,0.99))', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 24, padding: '24px 22px', boxShadow: '0 4px 28px rgba(0,0,0,0.45)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--m1)', textTransform: 'uppercase' as const, letterSpacing: '0.11em', marginBottom: 12 }}>One-time Report</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'rgba(255,255,255,0.18)', textDecoration: 'line-through' }}>₹299</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-2.5px', lineHeight: 1 }}>₹99</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--m1)', marginBottom: 12, fontWeight: 500 }}>Full audit · yours forever</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,146,60,0.08))', border: '1px solid rgba(245,158,11,0.28)', borderRadius: 9, padding: '5px 11px', fontSize: 11, fontWeight: 700, color: '#fcd34d', marginBottom: 16, boxShadow: '0 0 12px rgba(245,158,11,0.12)', letterSpacing: '0.01em' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B', display: 'inline-block', boxShadow: '0 0 6px #F59E0B', flexShrink: 0, animation: 'pulseGreen 2s infinite' }} />
              🕐 Limited Period Offer
            </div>
            <div style={{ marginBottom: 18 }}>
              {['All 22 metrics unlocked', 'AI hook rewrites', 'Brand rate card in ₹'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, color: 'var(--m2)', fontWeight: 500 }}>
                  <span style={{ color: '#22C55E', fontWeight: 800, fontSize: 13 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <a
              href="/dashboard/audit"
              style={{ display: 'block', padding: '12px 0', background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, textAlign: 'center' as const, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textDecoration: 'none', fontFamily: 'var(--font-display)', transition: 'all 0.2s ease' }}
              onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.09)'; el.style.color='#fff'; el.style.borderColor='rgba(255,255,255,0.14)'; }}
              onMouseOut={e  => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.055)'; el.style.color='rgba(255,255,255,0.78)'; el.style.borderColor='rgba(255,255,255,0.09)'; }}>
              Get full audit →
            </a>
          </div>

          {/* Creator Plan */}
          <div style={{ background: 'linear-gradient(155deg, rgba(139,92,246,0.17) 0%, rgba(236,72,153,0.09) 55%, rgba(13,12,30,0.98) 100%)', border: '1.5px solid rgba(139,92,246,0.30)', borderRadius: 24, padding: '24px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 48px rgba(139,92,246,0.16), 0 4px 28px rgba(0,0,0,0.45)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.85), rgba(236,72,153,0.85), transparent)' }} />
            <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', borderRadius: '0 0 12px 12px', padding: '5px 20px', fontSize: 10, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', letterSpacing: '0.09em', textTransform: 'uppercase' as const, boxShadow: '0 6px 24px rgba(139,92,246,0.48)' }}>
              ★ Best Value
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(139,92,246,0.65)', textTransform: 'uppercase' as const, letterSpacing: '0.11em', marginBottom: 12 }}>Creator Plan</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'rgba(255,255,255,0.18)', textDecoration: 'line-through' }}>₹1,999</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-2.5px', lineHeight: 1 }}>₹799</span>
                <span style={{ fontSize: 13, color: 'var(--m1)', fontWeight: 500 }}>/mo</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--m2)', marginBottom: 16, fontWeight: 500 }}>Everything, unlimited. No DM caps ever.</div>
              <div style={{ marginBottom: 20 }}>
                {['All 22 metrics + monthly re-audit', 'Unlimited DM automations', 'Smart Reply AI inbox', 'Priority support'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, color: 'var(--m2)', fontWeight: 500 }}>
                    <span style={{ color: '#22C55E', fontWeight: 800, fontSize: 13 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                style={{ display: 'block', width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, #8B5CF6, #A855F7, #EC4899)', borderRadius: 14, textAlign: 'center' as const, fontSize: 13, fontWeight: 800, color: '#fff', border: 'none', fontFamily: 'var(--font-display)', boxShadow: '0 6px 28px rgba(139,92,246,0.42)', letterSpacing: '-0.1px', transition: 'all 0.2s ease', cursor: 'pointer' }}
                onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.opacity='0.90'; el.style.transform='scale(1.015)'; el.style.boxShadow='0 10px 36px rgba(139,92,246,0.55)'; }}
                onMouseOut={e  => { const el = e.currentTarget as HTMLElement; el.style.opacity='1';    el.style.transform='scale(1)';     el.style.boxShadow='0 6px 28px rgba(139,92,246,0.42)'; }}>
                Start Creator Plan →
              </button>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.16)', textAlign: 'center' as const, marginTop: 10, fontWeight: 500 }}>Cancel anytime · No contracts · Instant access</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
  <UpgradeModal
    isOpen={showUpgradeModal}
    onClose={() => setShowUpgradeModal(false)}
    onSuccess={() => window.location.reload()}
    userEmail={userEmail}
  />
</>
)
}

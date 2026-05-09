'use client'

import { useState, useEffect, useCallback } from 'react'

interface Props {
  igAccount: any
  audit: any
  userProfile: any
  autoStart: boolean
  userId: string
}

function safeGet(obj: any, path: string, fallback: any = null) {
  try {
    return path.split('.').reduce((o: any, k: string) => o?.[k], obj) ?? fallback
  } catch {
    return fallback
  }
}

function formatNumber(n: any): string {
  const num = Number(n)
  if (isNaN(num)) return '0'
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString('en-IN')
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!target) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

const LOADING_FACTS = [
  '📊 Reading your last 20 posts',
  '🕐 Finding your best posting time',
  '🎯 Scoring your hook quality',
  '#️⃣ Checking your hashtag health',
  '💰 Calculating your brand rate card',
  '🧠 Generating your action plan',
]

const ACCENT = '#8B5CF6'
const GRADIENT = 'linear-gradient(135deg, #8B5CF6, #EC4899)'

export function DashboardOverviewClient({ igAccount, audit, userProfile, autoStart, userId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [factIndex, setFactIndex] = useState(0)
  const [currentAudit, setCurrentAudit] = useState(audit)

  // Hooks must be called unconditionally — fallback to 0 when no audit yet
  const overallScore = currentAudit?.overall_score || 0
  const erRaw = parseFloat(String(currentAudit?.computed_metrics?.engagementRate || 0))
  const animatedScore = useCountUp(overallScore, 1500)
  const animatedEr = useCountUp(Math.round(erRaw * 10), 1000)

  useEffect(() => {
    if (autoStart) {
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [autoStart])

  useEffect(() => {
    if (!loading) return
    const timer = setInterval(() => {
      setFactIndex(i => (i + 1) % LOADING_FACTS.length)
    }, 4000)
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
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '75vh', textAlign: 'center',
        padding: '40px 24px',
        animation: 'fade-up 0.4s ease both',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: GRADIENT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 28, fontWeight: 800, color: 'white',
          marginBottom: 32,
          boxShadow: '0 12px 40px rgba(139,92,246,0.35)',
        }}>EB</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 800, color: 'white',
          marginBottom: 10, letterSpacing: '-0.03em', lineHeight: 1.2,
        }}>Connect your Instagram</h1>
        <p style={{
          fontSize: 15, color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.65, maxWidth: 300, marginBottom: 36,
        }}>Takes 10 seconds · Read-only · We never post anything</p>
        <a href="/api/instagram/auth" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '14px 32px',
          background: GRADIENT,
          borderRadius: 12, fontSize: 15, fontWeight: 700,
          color: 'white', textDecoration: 'none',
          boxShadow: '0 8px 28px rgba(139,92,246,0.3)',
          transition: 'all 0.2s',
        }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(139,92,246,0.45)' }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,92,246,0.3)' }}
        >
          Connect Instagram →
        </a>
      </div>
    )
  }

  // ─── STATE 2: LOADING / AUDIT RUNNING ──────────────────────────
  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '75vh', textAlign: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          border: '3px solid rgba(139,92,246,0.15)',
          borderTop: '3px solid #8B5CF6',
          animation: 'spin 1s linear infinite',
          marginBottom: 32,
        }} />
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22, fontWeight: 800, color: 'white',
          marginBottom: 8, letterSpacing: '-0.02em',
        }}>Analysing @{igAccount?.username}</h2>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.35)',
          marginBottom: 36, lineHeight: 1.6,
        }}>
          Reading 22 things simultaneously<br />takes about 60 seconds
        </p>
        <div key={factIndex} style={{
          background: 'rgba(139,92,246,0.08)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: 12, padding: '14px 24px',
          fontSize: 14, color: 'rgba(255,255,255,0.6)',
          animation: 'fact-in 0.4s ease', maxWidth: 340,
        }}>
          {LOADING_FACTS[factIndex]}
        </div>
      </div>
    )
  }

  // ─── ERROR STATE ────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '50vh', textAlign: 'center', padding: '40px 24px',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>{error}</p>
        <button
          onClick={() => { setError(null); runAudit() }}
          style={{
            padding: '12px 28px',
            background: GRADIENT,
            border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 700, color: 'white',
            cursor: 'pointer',
          }}
        >
          Try again →
        </button>
      </div>
    )
  }

  // ─── HAS INSTAGRAM BUT NO AUDIT ────────────────────────────────
  if (!currentAudit) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '70vh', textAlign: 'center', padding: '40px 24px',
      }}>
        <div style={{ fontSize: 40, marginBottom: 20 }}>🔍</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 10 }}>
          Ready to see your Instagram clearly?
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
          We&apos;ll analyse 22 things about @{igAccount.username} in 60 seconds
        </p>
        <button
          onClick={runAudit}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '15px 32px',
            background: GRADIENT,
            border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 700, color: 'white',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(139,92,246,0.3)',
            transition: 'all 0.2s',
          }}
        >
          Run my audit →
        </button>
      </div>
    )
  }

  // ─── FULL COCKPIT WITH AUDIT DATA ───────────────────────────────

  const metrics = currentAudit?.computed_metrics || {}
  const aiAnalysis = currentAudit?.ai_analysis || {}
  const formatBreakdown = metrics?.formatBreakdown || {}
  const formats = Object.entries(formatBreakdown)
  const bestFormatEntry = formats.sort(([, a]: any, [, b]: any) =>
    (parseFloat(b?.avgEngagementRate) || 0) - (parseFloat(a?.avgEngagementRate) || 0)
  )[0]
  const bestFormatKey = (bestFormatEntry?.[0] || 'VIDEO') as string
  const bestFormatData = bestFormatEntry?.[1] as any
  const formatEmoji = bestFormatKey === 'VIDEO' ? '📹' : bestFormatKey === 'CAROUSEL_ALBUM' ? '🖼️' : '📸'
  const formatName = bestFormatKey === 'VIDEO' ? 'Reels' : bestFormatKey === 'CAROUSEL_ALBUM' ? 'Carousels' : 'Photos'
  const formatAvgEr = parseFloat(bestFormatData?.avgEngagementRate || '0').toFixed(1)

  const auditDate = currentAudit?.created_at
    ? new Date(currentAudit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recently'

  const erNum = parseFloat(String(metrics?.engagementRate || 0))
  const hookNum = parseFloat(String(aiAnalysis?.hook_avg_score || metrics?.hookScore || 5))
  const mediaCount = igAccount?.media_count || 0
  const followers = safeGet(igAccount, 'followers_count', 0)
  const username = safeGet(igAccount, 'username', 'creator')
  const profilePic = safeGet(igAccount, 'profile_picture_url', null)

  return (
    <div style={{ padding: '0 0 60px', fontFamily: 'var(--font-body)' }}>

      {/* ══ PROFILE HERO HEADER ══ */}
      <div style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(236,72,153,0.06) 50%, rgba(8,6,18,0) 100%)',
        border: '1px solid rgba(139,92,246,0.2)',
        padding: '28px 32px',
        animation: 'fade-up 0.5s ease both',
      }}>
        {/* Subtle grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
        }}>
          {/* Profile picture with animated gradient ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              position: 'absolute', inset: -3,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899, #8B5CF6)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 3s linear infinite',
            }} />
            {profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profilePic}
                alt={username}
                style={{
                  position: 'relative',
                  width: 76, height: 76,
                  borderRadius: '50%',
                  border: '3px solid #080612',
                  objectFit: 'cover',
                  display: 'block',
                  zIndex: 1,
                }}
              />
            ) : (
              <div style={{
                position: 'relative',
                width: 76, height: 76,
                borderRadius: '50%',
                background: GRADIENT,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30, fontWeight: 800, color: 'white',
                border: '3px solid #080612',
                zIndex: 1,
                fontFamily: 'var(--font-display)',
              }}>
                {username[0]?.toUpperCase()}
              </div>
            )}
            {/* Live green dot */}
            <div style={{
              position: 'absolute', bottom: 4, right: 4,
              width: 14, height: 14,
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #080612',
              zIndex: 2,
              boxShadow: '0 0 8px rgba(34,197,94,0.6)',
            }} />
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 10, marginBottom: 6, flexWrap: 'wrap',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24, fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.03em',
              }}>
                @{username}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: '#22c55e',
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 6, padding: '3px 9px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                ● Connected
              </span>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18, fontWeight: 800,
                  color: 'white', letterSpacing: '-0.02em',
                }}>
                  {formatNumber(followers)}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 5 }}>followers</span>
              </div>
              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18, fontWeight: 800,
                  color: 'white', letterSpacing: '-0.02em',
                }}>
                  {mediaCount}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 5 }}>posts</span>
              </div>
              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                Audited {auditDate}
              </span>
            </div>
          </div>

          {/* Score ring — right side */}
          <div className="score-ring-wrapper" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}>
            <div style={{ position: 'relative', width: 100, height: 100 }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="263.9"
                  strokeDashoffset={263.9 - (263.9 * animatedScore) / 100}
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 30, fontWeight: 800,
                  color: 'white', letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}>
                  {animatedScore}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>/100</span>
              </div>
            </div>
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Account Health</div>
            <div style={{
              fontSize: 12, fontWeight: 700,
              color: overallScore >= 70 ? '#22c55e' : overallScore >= 50 ? '#eab308' : '#ef4444',
              background: overallScore >= 70 ? 'rgba(34,197,94,0.1)' : overallScore >= 50 ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${overallScore >= 70 ? 'rgba(34,197,94,0.25)' : overallScore >= 50 ? 'rgba(234,179,8,0.25)' : 'rgba(239,68,68,0.25)'}`,
              borderRadius: 8, padding: '3px 12px',
            }}>
              {overallScore >= 70 ? '⚡ Strong' : overallScore >= 50 ? '📈 Growing' : '🔧 Needs work'}
            </div>
          </div>
        </div>
      </div>

      {/* ══ THREE METRIC CARDS ══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 14,
        marginBottom: 20,
      }} className="dashboard-grid-3">

        {/* CARD 1 — ENGAGEMENT RATE */}
        <div
          className="stagger-1"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: '24px',
            cursor: 'default',
            transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(34,197,94,0.08)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 2,
            background: 'linear-gradient(90deg, #22c55e, rgba(34,197,94,0))',
            borderRadius: '20px 20px 0 0',
          }} />

          <div style={{
            fontSize: 10, fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            Engagement Rate
          </div>

          <div style={{ marginBottom: 16 }}>
            <span className="metric-number" style={{ fontSize: 52, color: 'white' }}>
              {(animatedEr / 10).toFixed(1)}
            </span>
            <span style={{
              fontSize: 22, color: 'rgba(255,255,255,0.4)',
              fontFamily: 'var(--font-display)', fontWeight: 800,
            }}>%</span>
          </div>

          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>You</span>
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>{erNum.toFixed(1)}%</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((erNum / 15) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                borderRadius: 3,
                transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Industry avg</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>2–4%</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '20%', background: 'rgba(255,255,255,0.15)', borderRadius: 3 }} />
            </div>
          </div>

          <div style={{
            marginTop: 14,
            fontSize: 12, fontWeight: 600,
            color: erNum >= 3 ? '#22c55e' : '#eab308',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {erNum >= 3
              ? '✓ Top tier — brands pay premium for this'
              : '↗ Below average — fixable this week'}
          </div>
        </div>

        {/* CARD 2 — BEST FORMAT */}
        <div
          className="stagger-2"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: '24px',
            transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.08)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 2,
            background: 'linear-gradient(90deg, #8B5CF6, rgba(139,92,246,0))',
            borderRadius: '20px 20px 0 0',
          }} />

          <div style={{
            fontSize: 10, fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6' }} />
            Your Best Format
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52,
              borderRadius: 14,
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
            }}>
              {formatEmoji}
            </div>
            <span className="metric-number" style={{ fontSize: 38, color: 'white' }}>
              {formatName}
            </span>
          </div>

          <div style={{
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.55,
            marginBottom: 14,
          }}>
            {parseFloat(formatAvgEr) > 0
              ? `${formatAvgEr}% avg ER — your strongest content type`
              : 'Gets the most engagement from your audience'}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: 6 }}>
            → Double down on {formatName}
          </div>
        </div>

        {/* CARD 3 — HOOK STRENGTH */}
        <div
          className="stagger-3"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: '24px',
            transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = 'rgba(236,72,153,0.3)'
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(236,72,153,0.08)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 2,
            background: 'linear-gradient(90deg, #EC4899, rgba(236,72,153,0))',
            borderRadius: '20px 20px 0 0',
          }} />

          <div style={{
            fontSize: 10, fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EC4899' }} />
            Hook Strength
          </div>

          <div style={{ marginBottom: 16 }}>
            <span className="metric-number" style={{ fontSize: 52, color: 'white' }}>
              {hookNum.toFixed(1)}
            </span>
            <span style={{
              fontSize: 20, color: 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-display)', fontWeight: 800,
            }}>/10</span>
          </div>

          {/* Segmented bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 6,
                borderRadius: 3,
                background: i < Math.round(hookNum)
                  ? i < 4 ? '#ef4444'
                  : i < 7 ? '#eab308'
                  : '#EC4899'
                  : 'rgba(255,255,255,0.08)',
                transition: `background 0.05s ${i * 0.04}s`,
              }} />
            ))}
          </div>

          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, marginBottom: 10 }}>
            {hookNum >= 8
              ? 'Excellent — hooks keeping viewers in'
              : hookNum >= 6
              ? 'Good — some hooks losing viewers early'
              : 'Needs work — losing most viewers in 3s'}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#EC4899', display: 'flex', alignItems: 'center', gap: 6 }}>
            🔒 AI rewrites available in full report
          </div>
        </div>
      </div>

      {/* ══ UPGRADE SECTION ══ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.04))',
        border: '1px solid rgba(139,92,246,0.18)',
        borderRadius: 24,
        overflow: 'hidden',
        animation: 'fade-up 0.5s ease 0.3s both',
      }}>

        {/* Top bar */}
        <div style={{
          padding: '16px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          background: 'rgba(139,92,246,0.06)',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            🔒 19 insights locked
          </span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Unlock all 22 metrics + your action plan
          </span>
        </div>

        <div className="upgrade-section-inner" style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>

          {/* LEFT: headline + locked items */}
          <div className="upgrade-right-panel" style={{
            flex: 1, minWidth: 300,
            padding: '28px 28px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}>
            <h3 className="dashboard-headline" style={{
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              color: 'white',
              marginBottom: 6,
            }}>
              Your audience peaks at a specific time
            </h3>
            <p style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.4)',
              marginBottom: 24,
              lineHeight: 1.6,
            }}>
              You&apos;re probably posting at the wrong one — and losing 40% of potential reach every day
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '🕐', color: '#8B5CF6', text: 'Your exact golden posting window', sub: "Not generic advice — YOUR audience's peak hours" },
                { icon: '🎯', color: '#EC4899', text: 'The hook losing 60% of your viewers', sub: '+ the AI rewrite to fix it immediately' },
                { icon: '#️⃣', color: '#eab308', text: '22 rankable hashtags in your niche', sub: 'Specific to your content, not #fitness with 500M posts' },
                { icon: '💰', color: '#22c55e', text: 'Your brand rate card in ₹', sub: 'Story · Reel · Carousel — stop undercharging' },
                { icon: '✏️', color: '#a78bfa', text: 'Your bio rewritten by AI', sub: 'Convert profile visitors into followers' },
                { icon: '📈', color: '#38bdf8', text: '3 things to fix this week', sub: 'Ranked by impact on your reach and growth' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    transition: 'border-color 0.15s, background 0.15s',
                    animation: `fade-up 0.4s ease ${0.05 * i + 0.3}s both`,
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = `${item.color}33`
                    e.currentTarget.style.background = 'rgba(255,255,255,0.035)'
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                  }}
                >
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: 10,
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
                      {item.text}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                      {item.sub}
                    </div>
                  </div>
                  <div style={{
                    width: 28, height: 28,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, flexShrink: 0,
                  }}>
                    🔒
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: pricing options */}
          <div style={{
            width: 260,
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            flexShrink: 0,
          }}>

            {/* One-time */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '20px',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700,
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: 10,
              }}>One-time</div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.2)',
                  textDecoration: 'line-through',
                  fontFamily: 'var(--font-display)',
                }}>₹299</span>
                <span className="metric-number" style={{ fontSize: 40, color: 'white' }}>₹99</span>
              </div>

              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>
                Full audit · yours forever
              </div>

              <div style={{
                fontSize: 11, fontWeight: 600,
                color: '#22c55e',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: 6, padding: '4px 10px',
                marginBottom: 16,
                display: 'inline-block',
              }}>
                Code LAUNCH — save ₹200
              </div>

              <a href="/dashboard/audit" style={{
                display: 'block',
                padding: '11px 0',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                textAlign: 'center',
                fontSize: 14, fontWeight: 700,
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; e.currentTarget.style.color = 'white' }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
              >
                Get full audit →
              </a>
            </div>

            {/* Creator Plan */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.12))',
              border: '1.5px solid rgba(139,92,246,0.4)',
              borderRadius: 16,
              padding: '20px',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(139,92,246,0.15)',
            }}>
              <div style={{
                position: 'absolute', top: -11, left: '50%',
                transform: 'translateX(-50%)',
                background: GRADIENT,
                borderRadius: 100,
                padding: '4px 14px',
                fontSize: 10, fontWeight: 700,
                color: 'white', whiteSpace: 'nowrap',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
              }}>
                Best value
              </div>

              <div style={{
                fontSize: 10, fontWeight: 700,
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: 10, marginTop: 6,
              }}>Per month</div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.2)',
                  textDecoration: 'line-through',
                  fontFamily: 'var(--font-display)',
                }}>₹1999</span>
                <span className="metric-number" style={{ fontSize: 40, color: 'white' }}>₹799</span>
              </div>

              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
                Everything · unlimited · 24/7
              </div>

              {[
                'All 22 metrics unlocked',
                'Unlimited DM automations',
                'Smart Reply AI inbox',
                'Monthly re-audit',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', fontSize: 12 }}>✓</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{f}</span>
                </div>
              ))}

              <a href="/dashboard/audit" style={{
                display: 'block',
                padding: '12px 0',
                background: GRADIENT,
                borderRadius: 10,
                textAlign: 'center',
                fontSize: 14, fontWeight: 700,
                color: 'white',
                textDecoration: 'none',
                marginTop: 16,
                boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                transition: 'all 0.2s',
              }}
                onMouseOver={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.01)' }}
                onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                Start Creator Plan →
              </a>
              <p style={{
                fontSize: 10, color: 'rgba(255,255,255,0.2)',
                textAlign: 'center', margin: '8px 0 0',
              }}>
                Cancel anytime · No contracts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

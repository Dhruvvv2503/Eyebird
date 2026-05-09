'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowRight } from 'lucide-react'

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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '75vh',
        textAlign: 'center',
        padding: '40px 24px',
      }}>

        {/* Eyebird logo mark — large */}
        <div style={{
          width: 72, height: 72,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 900, color: 'white',
          marginBottom: 32,
          boxShadow: '0 12px 40px rgba(139,92,246,0.35)',
          letterSpacing: '-0.02em',
        }}>
          EB
        </div>

        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: 'white',
          marginBottom: 10,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          Connect your Instagram
        </h1>

        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.65,
          maxWidth: 320,
          marginBottom: 36,
        }}>
          Takes 10 seconds · Read-only · We never post anything
        </p>

        <a href="/api/instagram/auth" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 32px',
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          color: 'white',
          textDecoration: 'none',
          boxShadow: '0 8px 28px rgba(139,92,246,0.3)',
          transition: 'all 0.2s',
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.02)'
          e.currentTarget.style.boxShadow = '0 12px 36px rgba(139,92,246,0.45)'
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,92,246,0.3)'
        }}
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          width: 64, height: 64,
          borderRadius: '50%',
          border: '3px solid rgba(139,92,246,0.15)',
          borderTop: `3px solid ${ACCENT}`,
          animation: 'spin 1s linear infinite',
          marginBottom: 32,
        }} />

        <h2 style={{
          fontSize: 24, fontWeight: 800,
          color: 'white', marginBottom: 10,
          letterSpacing: '-0.02em',
        }}>
          Analysing @{igAccount.username}
        </h2>

        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.4)',
          marginBottom: 40,
          lineHeight: 1.6,
        }}>
          This takes about 60 seconds<br />we&apos;re reading 22 things simultaneously
        </p>

        <div
          key={factIndex}
          style={{
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 12,
            padding: '14px 24px',
            fontSize: 15,
            color: 'rgba(255,255,255,0.7)',
            animation: 'fact-in 0.4s ease',
            maxWidth: 360,
          }}
        >
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

  const metrics = currentAudit.computed_metrics || {}
  const aiAnalysis = currentAudit.ai_analysis || {}
  const overallScore = currentAudit.overall_score || 0
  const engagementRate = safeGet(metrics, 'engagementRate', 0)
  const benchmark = safeGet(metrics, 'benchmark', '2–4%')
  const hookScore = safeGet(aiAnalysis, 'hook_avg_score', safeGet(metrics, 'hookScore', 5))
  const formatBreakdown = safeGet(metrics, 'formatBreakdown', {})
  const followers = safeGet(igAccount, 'followers_count', 0)
  const username = safeGet(igAccount, 'username', 'creator')
  const profilePic = safeGet(igAccount, 'profile_picture_url', null)
  const mediaCount = safeGet(igAccount, 'media_count', 0)

  const formats = Object.entries(formatBreakdown)
  const bestFormatEntry = formats.sort(([, a]: any, [, b]: any) =>
    (parseFloat(b.avgEngagementRate) || 0) - (parseFloat(a.avgEngagementRate) || 0)
  )[0]
  const bestFormatKey = bestFormatEntry?.[0] || 'VIDEO'
  const bestFormatData = bestFormatEntry?.[1] as any
  const formatEmoji = bestFormatKey === 'VIDEO' ? '📹' : bestFormatKey === 'CAROUSEL_ALBUM' ? '🖼️' : '📸'
  const formatName = bestFormatKey === 'VIDEO' ? 'Reels' : bestFormatKey === 'CAROUSEL_ALBUM' ? 'Carousels' : 'Photos'
  const formatAvgEr = parseFloat(bestFormatData?.avgEngagementRate || '0').toFixed(1)

  const erNum = parseFloat(String(engagementRate))
  const erColor = erNum >= 3 ? '#22c55e' : erNum >= 1 ? '#eab308' : '#ef4444'
  const hookNum = parseFloat(String(hookScore))

  const auditDate = new Date(currentAudit.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div style={{ padding: '0 0 48px', animation: 'fade-up 0.4s ease' }}>

      {/* ── PROFILE HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.05))',
        border: '1px solid rgba(139,92,246,0.15)',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }} className="profile-header-inner">

        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {profilePic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profilePic}
              alt={username}
              style={{
                width: 72, height: 72,
                borderRadius: '50%',
                border: '3px solid rgba(139,92,246,0.4)',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: 72, height: 72,
              borderRadius: '50%',
              background: GRADIENT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'white',
              border: '3px solid rgba(139,92,246,0.4)',
            }}>
              {username[0]?.toUpperCase() || 'E'}
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: 2, right: 2,
            width: 16, height: 16,
            borderRadius: '50%',
            background: '#22c55e',
            border: '2px solid #080612',
            animation: 'pulse-dot 2s infinite',
          }} />
        </div>

        {/* Username + stats */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 10, marginBottom: 8, flexWrap: 'wrap',
          }}>
            <h2 style={{
              fontSize: 22, fontWeight: 800,
              color: 'white', margin: 0,
              letterSpacing: '-0.02em',
            }}>
              @{username}
            </h2>
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#22c55e',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 6, padding: '2px 8px',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>Connected</span>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
                {formatNumber(followers)}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 5 }}>
                followers
              </span>
            </span>
            <span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
                {mediaCount}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 5 }}>
                posts
              </span>
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
              Audited {auditDate}
            </span>
          </div>
        </div>

        {/* Score box */}
        <div style={{
          textAlign: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '20px 28px',
          flexShrink: 0,
        }} className="score-box">
          <div style={{
            fontSize: 52, fontWeight: 900,
            color: 'white', fontFamily: 'monospace',
            lineHeight: 1, letterSpacing: '-0.03em',
            marginBottom: 6,
          }}>
            {overallScore}
          </div>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 10,
          }}>
            Account Health
          </div>
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: overallScore >= 70 ? '#22c55e' : overallScore >= 50 ? '#eab308' : '#ef4444',
            background: overallScore >= 70 ? 'rgba(34,197,94,0.1)' : overallScore >= 50 ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${overallScore >= 70 ? 'rgba(34,197,94,0.2)' : overallScore >= 50 ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: 8, padding: '3px 12px',
            display: 'inline-block',
          }}>
            {overallScore >= 70 ? '⚡ Strong' : overallScore >= 50 ? '📈 Growing' : '🔧 Needs work'}
          </div>
        </div>
      </div>

      {/* ── THREE METRIC CARDS ── */}
      <div className="dashboard-grid-3" style={{ marginBottom: 24 }}>

        {/* Card 1: Engagement Rate */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 22,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 14,
          }}>Engagement Rate</div>

          <div style={{
            fontSize: 40, fontWeight: 900,
            color: 'white', fontFamily: 'monospace',
            letterSpacing: '-0.03em', lineHeight: 1,
            marginBottom: 16,
          }}>
            {erNum > 0 ? `${erNum.toFixed(1)}%` : '—'}
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>You</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{erNum.toFixed(1)}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((erNum / 15) * 100, 100)}%`,
                background: erColor,
                borderRadius: 3,
                transition: 'width 1s ease-out',
              }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Industry avg</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{benchmark}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '20%', background: 'rgba(255,255,255,0.2)', borderRadius: 3 }} />
            </div>
          </div>

          <div style={{ fontSize: 12, color: erColor, fontWeight: 600 }}>
            {erNum >= 3
              ? '✓ Above average — top tier for brand deals'
              : erNum >= 1
              ? '↗ Below average — fixable this week'
              : '⚠ Very low — needs immediate attention'}
          </div>
        </div>

        {/* Card 2: Best Content Format */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 22,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 14,
          }}>Your Best Format</div>

          <div style={{
            fontSize: 28, fontWeight: 800,
            color: 'white', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span>{formatEmoji}</span>
            <span>{formatName}</span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 13, color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.55, marginBottom: 14,
          }}>
            {parseFloat(formatAvgEr) > 0
              ? `${formatAvgEr}% avg engagement rate — your strongest format`
              : 'This format gets the most engagement from your audience'}
          </div>

          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>
            → Double down on {formatName}
          </div>
        </div>

        {/* Card 3: Hook Strength */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 22,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 14,
          }}>Hook Strength</div>

          <div style={{
            fontSize: 40, fontWeight: 900,
            color: 'white', fontFamily: 'monospace',
            letterSpacing: '-0.03em', lineHeight: 1,
            marginBottom: 14,
          }}>
            {hookNum > 0 ? hookNum.toFixed(1) : '—'}
            <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/10</span>
          </div>

          <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i < Math.round(hookNum) ? ACCENT : 'rgba(255,255,255,0.1)',
              }} />
            ))}
          </div>

          <div style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.5,
            marginBottom: 10,
          }}>
            {hookNum >= 8
              ? 'Strong hooks — keeping viewers watching'
              : hookNum >= 5
              ? 'Some hooks losing viewers in the first second'
              : 'Most hooks need improvement — losing viewers fast'}
          </div>

          <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>
            🔒 Full breakdown + AI rewrites in paid report
          </div>
        </div>
      </div>

      {/* ── UPGRADE PROMPT ── */}
      <div style={{
        background: 'rgba(139,92,246,0.06)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 20,
        padding: '32px',
        marginBottom: 24,
      }}>
        <div className="upgrade-columns">

          {/* LEFT: locked insights list */}
          <div className="upgrade-left">
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: '#a78bfa',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: 14,
            }}>
              19 more insights waiting for you
            </div>

            <h3 style={{
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              fontWeight: 800, color: 'white',
              marginBottom: 20, lineHeight: 1.3,
              letterSpacing: '-0.02em',
            }}>
              Your audience is most active at a specific time —{' '}
              <span style={{
                background: GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                and you&apos;re probably posting at the wrong one
              </span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '🕐', text: "Your exact golden posting window — not generic advice, YOUR audience's peak hours" },
                { icon: '🎯', text: "The hook losing you 60% of viewers in the first second + the AI rewrite" },
                { icon: '#️⃣', text: "22 hashtags from your niche where you can actually rank" },
                { icon: '💰', text: "Your brand rate card — Story, Reel, Carousel in exact ₹ amounts" },
                { icon: '✏️', text: "Your bio rewritten by AI to convert profile visitors into followers" },
                { icon: '📈', text: "3 specific things to fix this week, ranked by impact on your reach" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <span style={{
                    fontSize: 13, color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.5, flex: 1,
                  }}>{item.text}</span>
                  <span style={{ flexShrink: 0, fontSize: 14 }}>🔒</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: two pricing options */}
          <div className="upgrade-right" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* One-time audit */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: 20,
            }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>One-time</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 14, fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.2)',
                  textDecoration: 'line-through',
                }}>₹299</span>
                <span style={{
                  fontSize: 36, fontWeight: 900,
                  color: 'white', fontFamily: 'monospace',
                  letterSpacing: '-0.03em', lineHeight: 1,
                }}>₹99</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                Full audit · yours forever
              </div>
              <div style={{
                fontSize: 12, color: '#22c55e',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: 6, padding: '4px 10px',
                display: 'inline-block', marginBottom: 16,
                fontWeight: 600,
              }}>
                Code LAUNCH — save ₹200
              </div>
              <a href="/dashboard/audit" style={{
                display: 'block', padding: '12px 0',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, textAlign: 'center',
                fontSize: 14, fontWeight: 700,
                color: 'white', textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              >
                Get full audit →
              </a>
            </div>

            {/* Creator Plan */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))',
              border: '1.5px solid rgba(139,92,246,0.4)',
              borderRadius: 16, padding: 20,
              position: 'relative',
              boxShadow: '0 0 30px rgba(139,92,246,0.12)',
            }}>
              <div style={{
                position: 'absolute', top: -11, left: '50%',
                transform: 'translateX(-50%)',
                background: GRADIENT,
                borderRadius: 100, padding: '4px 14px',
                fontSize: 10, fontWeight: 700,
                color: 'white', whiteSpace: 'nowrap',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
              }}>Best value</div>

              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8, marginTop: 6 }}>
                Per month
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 14, fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.2)',
                  textDecoration: 'line-through',
                }}>₹1999</span>
                <span style={{
                  fontSize: 36, fontWeight: 900,
                  color: 'white', fontFamily: 'monospace',
                  letterSpacing: '-0.03em', lineHeight: 1,
                }}>₹799</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
                Audit + automations + re-audits
              </div>

              {[
                'Everything in Full Audit',
                'Unlimited DM automations',
                'Smart Reply AI inbox',
                'Monthly re-audit',
                'Cancel anytime',
              ].map((f, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 7,
                  marginBottom: 7, alignItems: 'center',
                }}>
                  <span style={{ color: '#22c55e', fontSize: 13 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{f}</span>
                </div>
              ))}

              <a href="/dashboard/audit" style={{
                display: 'block', padding: '13px 0',
                background: GRADIENT,
                borderRadius: 10, textAlign: 'center',
                fontSize: 14, fontWeight: 700,
                color: 'white', textDecoration: 'none',
                marginTop: 16,
                boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
              >
                Start Creator Plan →
              </a>
              <p style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.2)',
                textAlign: 'center',
                margin: '8px 0 0',
              }}>
                No contracts · Instant access
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

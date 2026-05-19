'use client'

import { useState } from 'react'

interface Props {
  userEmail: string
  onAccepted: () => void
}

export default function TermsPopup({ userEmail, onAccepted }: Props) {
  const [marketingEmails, setMarketingEmails] = useState(true)
  const [productUpdates, setProductUpdates] = useState(true)
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    if (loading) return
    setLoading(true)
    try {
      await fetch('/api/user/accept-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketing_emails: marketingEmails, product_updates: productUpdates }),
      })
      onAccepted()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(7, 6, 15, 0.88)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{
        background: '#0D0C1E',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 20,
        padding: '36px 32px',
        maxWidth: 460,
        width: '100%',
        boxShadow: '0 0 60px rgba(139,92,246,0.15), 0 24px 64px rgba(0,0,0,0.6)',
        animation: 'fadeInUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}>✦</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.02em' }}>Creatiq</span>
        </div>

        <h2 style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.03em',
          marginBottom: 8,
          lineHeight: 1.2,
        }}>Before you dive in</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28, lineHeight: 1.6 }}>
          Please review and accept our terms to continue using Creatiq.
        </p>

        {/* T&C block */}
        <div style={{
          background: 'rgba(139,92,246,0.06)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          <div style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 1,
          }}>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
            I agree to Creatiq&rsquo;s{' '}
            <a href="/terms" target="_blank" rel="noopener" style={{ color: '#a78bfa', textDecoration: 'underline' }}>
              Terms &amp; Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" rel="noopener" style={{ color: '#a78bfa', textDecoration: 'underline' }}>
              Privacy Policy
            </a>
            . I understand Creatiq connects to my Instagram account to provide automation and analytics services.
          </p>
        </div>

        {/* Email preferences */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
          Email Preferences
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div
              onClick={() => setMarketingEmails(v => !v)}
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                border: marketingEmails ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                background: marketingEmails ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {marketingEmails && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
              Promotional emails — tips, case studies, and offers
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div
              onClick={() => setProductUpdates(v => !v)}
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                border: productUpdates ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                background: productUpdates ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {productUpdates && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
              Product updates — new features and improvements
            </span>
          </label>
        </div>

        <button
          onClick={handleAccept}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            background: loading ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'opacity 0.15s ease',
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid #fff',
                animation: 'spin 0.8s linear infinite',
              }} />
              Setting up...
            </>
          ) : (
            'Accept & Continue →'
          )}
        </button>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
          Logged in as {userEmail}. You can manage email preferences anytime in account settings.
        </p>
      </div>
    </div>
  )
}

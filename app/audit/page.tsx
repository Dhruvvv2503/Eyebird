'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';
import { Shield, Eye, EyeOff, Instagram, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

function AuditStartContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [accessExpanded, setAccessExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    window.location.href = '/api/instagram/auth';
  };

  const errorMessages: Record<string, string> = {
    oauth_failed: 'Instagram login failed. Please try again.',
    personal_account: "Personal accounts aren't supported. Switch to a Creator or Business account — it's free.",
    no_media: 'Your account needs at least 5 posts for a meaningful audit.',
    token_expired: 'Your Instagram session expired. Please reconnect.',
    fetch_failed: 'Could not fetch your Instagram data. Please try again.',
    default: 'Something went wrong. Please try again.',
  };
  const errorMessage = error ? (errorMessages[error] || errorMessages.default) : null;

  const TRUST = [
    { icon: Shield, label: 'Official API' },
    { icon: Eye, label: 'Read-only' },
    { icon: EyeOff, label: 'Never posts' },
  ];

  const ACCESS_ALLOWED = [
    'Profile info (name, bio, follower count)',
    'Last 20 posts (likes, comments, reach)',
    'Audience demographics',
    'Audience online hours',
  ];
  const ACCESS_DENIED = ['Your DMs', 'Your password', 'Private data', 'Ability to post'];

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '100px 20px 60px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 500, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 60% at 50% 20%, rgba(124,58,237,0.3), transparent 65%)',
      }} />

      {/* Step indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 32, position: 'relative', zIndex: 1,
      }}>
        {[1, 2, 3].map((step) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
              ...(step === 1
                ? {
                    background: 'linear-gradient(135deg, #FF3E80, #7C3AED)',
                    color: 'white',
                    boxShadow: '0 0 14px rgba(168,85,247,0.5)',
                  }
                : {
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }),
            }}>
              {step}
            </div>
            {step < 3 && (
              <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
            )}
          </div>
        ))}
        <span style={{ marginLeft: 12, fontSize: 13, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
          Step 1 of 3
        </span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 20,
        padding: 36,
        boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 60px rgba(168,85,247,0.06)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Error */}
        {errorMessage && (
          <div style={{
            marginBottom: 24, padding: '12px 16px', borderRadius: 12,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#EF4444', fontSize: 14, lineHeight: 1.55,
          }}>
            {errorMessage}
            {error === 'personal_account' && (
              <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', marginTop: 8, fontWeight: 600, color: '#EF4444', textDecoration: 'underline' }}>
                Learn how to switch →
              </a>
            )}
          </div>
        )}

        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,62,128,0.1)', border: '1px solid rgba(255,62,128,0.22)',
        }}>
          <Instagram size={22} style={{ color: '#FF3E80' }} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 24, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.03em',
          color: '#FAFAFA', marginBottom: 10,
        }}>
          Connect your Instagram
        </h1>
        <p style={{
          fontSize: 14, textAlign: 'center', lineHeight: 1.6,
          color: 'rgba(255,255,255,0.45)', marginBottom: 24, maxWidth: 320, margin: '0 auto 24px',
        }}>
          We&apos;ll read your account data using Instagram&apos;s official API. Read-only access. We never post anything.
        </p>

        {/* Trust pills */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexWrap: 'wrap', gap: 8, marginBottom: 24,
        }}>
          {TRUST.map(({ icon: Icon, label }) => (
            <div key={label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 999,
              background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}>
              <Icon size={12} style={{ color: '#A855F7', flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>

        {/* CTA button — properly sized, NOT full width */}
        <button
          onClick={handleConnect}
          disabled={loading}
          id="connect-instagram-btn"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', height: 48, borderRadius: 14,
            background: loading ? 'rgba(168,85,247,0.5)' : 'linear-gradient(135deg,#FF3E80,#A855F7,#7C3AED)',
            color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none', letterSpacing: '-0.01em',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(168,85,247,0.35)',
            transition: 'all 0.2s',
          }}
        >
          {loading ? (
            <>
              <svg style={{ animation: 'spin 0.7s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.25" />
                <path fill="white" fillOpacity="0.75" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Connecting…
            </>
          ) : (
            <>Connect Instagram <ArrowRight size={15} /></>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, marginTop: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
          Requires Creator or Business account.{' '}
          <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'underline' }}>
            Switching is free →
          </a>
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '20px 0' }} />

        {/* What we access — collapsible */}
        <button
          onClick={() => setAccessExpanded(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
          }}
        >
          <span>What we&apos;ll access</span>
          {accessExpanded
            ? <ChevronUp size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
            : <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
          }
        </button>

        {accessExpanded && (
          <div style={{
            marginTop: 12, padding: '16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              We access
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
              {ACCESS_ALLOWED.map(item => (
                <p key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>✓ {item}</p>
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 12 }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              We do NOT access
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {ACCESS_DENIED.map(item => (
                <p key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>✗ {item}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AuditStartPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <AuditStartContent />
      </Suspense>
      <Footer />
      <ToastContainer />
    </>
  );
}

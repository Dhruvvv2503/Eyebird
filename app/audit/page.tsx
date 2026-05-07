'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';
import { Shield, Eye, EyeOff, Instagram, ChevronDown, ChevronUp, ArrowRight, History, Sparkles } from 'lucide-react';

function AuditStartContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [accessExpanded, setAccessExpanded] = useState(false);
  const [loadingIntent, setLoadingIntent] = useState<'get_started' | 'login' | null>(null);

  const handleConnect = (intent: 'get_started' | 'login') => {
    setLoadingIntent(intent);
    window.location.href = `/api/instagram/auth?intent=${intent}`;
  };

  const errorMessages: Record<string, string> = {
    oauth_failed: 'Instagram login failed. Please try again.',
    personal_account: "Personal accounts aren't supported. Switch to a Creator or Business account — it's free.",
    no_media: 'Your account needs at least 5 posts for a meaningful audit.',
    token_expired: 'Your Instagram session expired. Please reconnect.',
    fetch_failed: 'Could not fetch your Instagram data. Please try again.',
    default: 'Something went wrong. Please try again.',
    instagram_not_configured: 'Instagram integration is being set up. Please try again later.',
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
        width: 800, height: 600, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 60% at 50% 20%, rgba(124,58,237,0.25), transparent 65%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: 400, height: 400, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(255,62,128,0.1), transparent 65%)',
      }} />

      {/* Error */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            width: '100%', maxWidth: 500, marginBottom: 24, padding: '12px 16px', borderRadius: 12,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#EF4444', fontSize: 14, lineHeight: 1.55, zIndex: 1, position: 'relative',
          }}
        >
          {errorMessage}
          {error === 'personal_account' && (
            <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', marginTop: 8, fontWeight: 600, color: '#EF4444', textDecoration: 'underline' }}>
              Learn how to switch →
            </a>
          )}
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 40, position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', marginBottom: 16 }}>
          <Instagram size={13} style={{ color: '#A855F7' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#A855F7', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Instagram Audit</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.04em', color: 'white', lineHeight: 1.15, marginBottom: 12 }}>
          What would you like to do?
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 400 }}>
          First-time here? Get a fresh audit. Already audited? Log in to see your history.
        </p>
      </motion.div>

      {/* Two CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, width: '100%', maxWidth: 620, position: 'relative', zIndex: 1, marginBottom: 32 }}
      >
        {/* Get Started */}
        <button
          onClick={() => handleConnect('get_started')}
          disabled={loadingIntent !== null}
          id="get-started-btn"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0,
            padding: '28px 28px 24px',
            borderRadius: 20,
            background: loadingIntent === 'get_started'
              ? 'rgba(168,85,247,0.15)'
              : 'linear-gradient(135deg, rgba(255,62,128,0.12), rgba(168,85,247,0.12))',
            border: '1px solid rgba(168,85,247,0.3)',
            cursor: loadingIntent !== null ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            transition: 'all 0.25s',
            boxShadow: '0 8px 32px rgba(168,85,247,0.12)',
            position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={e => {
            if (!loadingIntent) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#FF3E80,#A855F7)' }} />
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#FF3E80,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            {loadingIntent === 'get_started'
              ? <svg style={{ animation: 'spin 0.7s linear infinite', width: 18, height: 18 }} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.25" /><path fill="white" fillOpacity="0.75" d="M4 12a8 8 0 018-8v8z" /></svg>
              : <Sparkles size={20} color="white" />
            }
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 6 }}>
            {loadingIntent === 'get_started' ? 'Connecting…' : 'Get Started'}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, marginBottom: 20 }}>
            Connect Instagram and get your full audit report. Takes 2 minutes.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#A855F7' }}>
            Run audit <ArrowRight size={14} />
          </div>
        </button>

        {/* Login */}
        <button
          onClick={() => handleConnect('login')}
          disabled={loadingIntent !== null}
          id="login-btn"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0,
            padding: '28px 28px 24px',
            borderRadius: 20,
            background: loadingIntent === 'login'
              ? 'rgba(34,197,94,0.08)'
              : 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: loadingIntent !== null ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            transition: 'all 0.25s',
            position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={e => {
            if (!loadingIntent) {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            {loadingIntent === 'login'
              ? <svg style={{ animation: 'spin 0.7s linear infinite', width: 18, height: 18 }} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#22C55E" strokeWidth="3" strokeOpacity="0.25" /><path fill="#22C55E" fillOpacity="0.75" d="M4 12a8 8 0 018-8v8z" /></svg>
              : <History size={20} color="#22C55E" />
            }
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 6 }}>
            {loadingIntent === 'login' ? 'Connecting…' : 'Login'}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, marginBottom: 20 }}>
            View your past audits, compare growth over time and track your progress.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#22C55E' }}>
            View dashboard <ArrowRight size={14} />
          </div>
        </button>
      </motion.div>

      {/* Trust pills */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 24, position: 'relative', zIndex: 1 }}
      >
        {TRUST.map(({ icon: Icon, label }) => (
          <div key={label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <Icon size={12} style={{ color: '#A855F7', flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </motion.div>

      {/* Collapsible what we access */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}
      >
        <button
          onClick={() => setAccessExpanded(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
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
            marginTop: 4, padding: '16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>We access</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
              {ACCESS_ALLOWED.map(item => (
                <p key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>✓ {item}</p>
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 12 }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>We do NOT access</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {ACCESS_DENIED.map(item => (
                <p key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>✗ {item}</p>
              ))}
            </div>
          </div>
        )}
      </motion.div>
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

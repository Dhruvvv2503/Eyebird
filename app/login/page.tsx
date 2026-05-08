'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.204c0-.637-.057-1.251-.164-1.839H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.617z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function Spinner({ color = 'rgba(255,255,255,0.75)' }: { color?: string }) {
  return (
    <svg style={{ animation: 'spin 0.7s linear infinite', width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
      <path fill={color} d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const authError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<'google' | 'email' | null>(null);
  const [error, setError] = useState(authError === 'auth_failed' ? 'Authentication failed. Please try again.' : '');
  const [shake, setShake] = useState(false);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleGoogle = async () => {
    setLoading('google');
    setError('');
    const supabase = getSupabaseClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (oauthError) {
      triggerError('Could not connect to Google. Please try again.');
      setLoading(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading('email');
    setError('');
    const supabase = getSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      triggerError("That email or password doesn't match. Double-check and try again.");
      setLoading(null);
    } else {
      router.push(next);
      router.refresh();
    }
  };

  return (
    <main style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 500, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(124,58,237,0.22), transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%', width: 300, height: 300, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(255,62,128,0.08), transparent 65%)',
        filter: 'blur(50px)',
      }} />

      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 'clamp(28px, 5vw, 40px) clamp(20px, 5vw, 32px)',
        }}
      >
        {/* Logo + headings */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg,#FF3E80,#7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(168,85,247,0.45)',
            }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 11, letterSpacing: '-0.03em' }}>EB</span>
            </div>
            <span style={{ color: '#FAFAFA', fontWeight: 700, fontSize: 20, letterSpacing: '-0.03em' }}>Eyebird</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FAFAFA', letterSpacing: '-0.04em', marginBottom: 6, lineHeight: 1.2 }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Sign in to your creator dashboard.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
              color: 'var(--danger)', fontSize: 13, lineHeight: 1.5,
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading !== null}
          style={{
            width: '100%', height: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 10, color: '#FAFAFA', fontSize: 15, fontWeight: 500,
            cursor: loading !== null ? 'not-allowed' : 'pointer',
            marginBottom: 20, transition: 'background 0.2s ease',
            opacity: loading !== null ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = 'rgba(255,255,255,0.08)'); }}
          onMouseLeave={e => { (e.currentTarget.style.background = 'rgba(255,255,255,0.05)'); }}
        >
          {loading === 'google' ? <Spinner /> : <GoogleIcon />}
          Continue with Google
        </button>

        {/* OR separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleEmailSignIn}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="input"
            style={{ height: 48, marginBottom: 12, fontSize: 14 }}
          />
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input"
              style={{ height: 48, paddingRight: 44, fontSize: 14 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-tertiary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--brand-mid)', textDecoration: 'none', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading !== null}
            className="btn btn-primary"
            style={{ width: '100%', height: 52, fontSize: 15, fontWeight: 700, borderRadius: 10 }}
          >
            {loading === 'email'
              ? <><Spinner /> Signing in…</>
              : <>Sign in <ArrowRight size={16} /></>
            }
          </button>
        </form>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

        {/* Sign up link */}
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--brand-mid)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </motion.div>

      {/* Trust text */}
      <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
        <Lock size={11} />
        Your data is secure. We never post on your behalf.
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

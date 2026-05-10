'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const S = {
  page:      { background: '#0A0A10', minHeight: '100vh', color: '#FAFAFA' } as React.CSSProperties,
  wrap:      { maxWidth: 680, margin: '0 auto', padding: '120px 24px 80px' } as React.CSSProperties,
  h1:        { fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 12 } as React.CSSProperties,
  meta:      { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 48 } as React.CSSProperties,
  h2:        { fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA', marginBottom: 16, marginTop: 40 } as React.CSSProperties,
  p:         { fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', marginBottom: 12 } as React.CSSProperties,
  card:      { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '24px' } as React.CSSProperties,
  label:     { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: '0.04em' } as React.CSSProperties,
  input:     { width: '100%', height: 44, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA', fontSize: 14, padding: '0 14px', outline: 'none', boxSizing: 'border-box' as const },
  textarea:  { width: '100%', minHeight: 90, borderRadius: 9, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA', fontSize: 14, padding: '12px 14px', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, fontFamily: 'inherit' },
  divider:   { height: 1, background: 'rgba(255,255,255,0.07)', margin: '40px 0' } as React.CSSProperties,
};

export default function DataDeletionPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    const res = await fetch('/api/data-deletion-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, instagram_username: username, reason }),
    });

    if (res.ok) {
      setStatus('sent');
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div style={S.page}>
      <Navbar />
      <main style={S.wrap}>
        <h1 style={S.h1}>Data Deletion</h1>
        <p style={S.meta}>In accordance with India's DPDP Act 2023 and Meta's platform requirements.</p>

        {/* Option 1: delete via dashboard */}
        <h2 style={S.h2}>Option 1 — Delete instantly from your dashboard</h2>
        <p style={S.p}>
          If you have an Eyebird account, you can delete it immediately — no waiting period.
        </p>
        <div style={S.card}>
          <p style={{ ...S.p, marginBottom: 16 }}>
            Go to <strong style={{ color: '#FAFAFA' }}>Dashboard → Settings → Account → Danger Zone</strong> and click <strong style={{ color: '#FAFAFA' }}>Delete my account</strong>.
          </p>
          <Link
            href="/dashboard/settings"
            style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 9, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#A855F7', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
          >
            Go to Settings →
          </Link>
        </div>

        <div style={S.divider} />

        {/* Option 2: email form */}
        <h2 style={S.h2}>Option 2 — Submit a deletion request</h2>
        <p style={S.p}>
          If you no longer have access to your account, submit the form below. We will process your request within 7 business days.
        </p>

        {status === 'sent' ? (
          <div style={{ ...S.card, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <p style={{ ...S.p, color: '#22C55E', marginBottom: 4, fontWeight: 700 }}>Request received</p>
            <p style={{ ...S.p, marginBottom: 0 }}>
              We sent a confirmation to <strong style={{ color: '#FAFAFA' }}>{email}</strong>. Deletion will be completed within 7 business days.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={S.label}>Email address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                style={S.input}
              />
            </div>
            <div>
              <label style={S.label}>Instagram username (if applicable)</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="@yourhandle"
                style={S.input}
              />
            </div>
            <div>
              <label style={S.label}>Reason (optional)</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Let us know why you're leaving (optional)."
                style={S.textarea}
              />
            </div>
            {status === 'error' && (
              <p style={{ fontSize: 13, color: '#EF4444', margin: 0 }}>{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{ height: 46, borderRadius: 10, background: 'linear-gradient(135deg,#FF3E80,#A855F7)', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.7 : 1 }}
            >
              {status === 'loading' ? 'Submitting…' : 'Submit deletion request'}
            </button>
          </form>
        )}

        <div style={S.divider} />

        <p style={{ ...S.p, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          Questions? Contact us at{' '}
          <a href="mailto:support@eyebird.in" style={{ color: '#A855F7', textDecoration: 'none' }}>support@eyebird.in</a>.
          Eyebird · Karnal, Haryana, India.
        </p>
      </main>
      <Footer />
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Deleted | Eyebird',
};

export default function AccountDeletedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#07060F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(34,197,94,0.12)',
          border: '1.5px solid rgba(34,197,94,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: '#FAFAFA',
          marginBottom: 12,
        }}>
          Account deleted
        </h1>

        <p style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 32,
        }}>
          Your Eyebird account and all associated data have been permanently deleted. You will not receive any further emails from us.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            borderRadius: 10,
            background: 'rgba(168,85,247,0.12)',
            border: '1px solid rgba(168,85,247,0.3)',
            color: '#A855F7',
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          Back to Eyebird
        </Link>
      </div>
    </div>
  );
}

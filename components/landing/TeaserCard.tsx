'use client';

import { useRouter } from 'next/navigation';

interface Issue {
  type: 'good' | 'warning' | 'neutral';
  label: string;
  value: string;
  status: string;
  detail: string;
}

interface TeaserCardProps {
  username: string;
  followersCount: string;
  issues: Issue[];
  issuesFound: number;
  message: string;
}

export function TeaserCard({ username, followersCount, issues, issuesFound, message }: TeaserCardProps) {
  const router = useRouter();

  const issueColor = {
    good:    { bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)',   text: '#22c55e', icon: '✓' },
    warning: { bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.2)',   text: '#eab308', icon: '⚠' },
    neutral: { bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)',  text: '#8b5cf6', icon: '→' },
  };

  return (
    <div style={{
      marginTop: 24,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      padding: '24px 28px',
      maxWidth: 520,
      margin: '24px auto 0',
      textAlign: 'left',
      animation: 'fadeInUp 0.4s ease-out',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>@{username}</div>
          {followersCount !== 'Unknown' && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              {followersCount} followers · Quick scan complete
            </div>
          )}
        </div>
        <div style={{
          background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)',
          borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#eab308',
        }}>
          {issuesFound} issue{issuesFound !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Issues list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {issues.map((issue, i) => {
          const colors = issueColor[issue.type];
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: colors.bg, border: `1px solid ${colors.border}`,
              borderRadius: 10, padding: '10px 14px',
            }}>
              <span style={{ fontSize: 14, color: colors.text, fontWeight: 700, flexShrink: 0 }}>{colors.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{issue.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.text, flexShrink: 0 }}>{issue.value}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{issue.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Locked teaser */}
      <div style={{
        background: 'rgba(139,92,246,0.08)', border: '1px dashed rgba(139,92,246,0.3)',
        borderRadius: 10, padding: '10px 14px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 16 }}>🔒</span>
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            + 19 more insights locked
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>
            Hook quality score, best posting time, hashtag goldzone, rate card, and more
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push('/signup')}
        style={{
          width: '100%', padding: '14px 24px',
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          border: 'none', borderRadius: 10, color: 'white',
          fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10,
          transition: 'opacity 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
        onMouseOut={e => (e.currentTarget.style.opacity = '1')}
      >
        Sign up free to see your full analysis →
      </button>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
        No credit card · Takes 60 seconds · Free preview
      </div>
    </div>
  );
}

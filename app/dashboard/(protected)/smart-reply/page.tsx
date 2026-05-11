import { requireAuth } from '@/lib/auth'

export default async function SmartReplyPage() {
  await requireAuth()

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
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.1) 0%, transparent 65%)' }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.1))',
          border: '1px solid rgba(139,92,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 28px',
          boxShadow: '0 8px 32px rgba(139,92,246,0.2)',
        }}>🤖</div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 100, padding: '4px 14px',
          fontSize: 11, fontWeight: 700, color: '#fcd34d',
          letterSpacing: '0.06em', textTransform: 'uppercase' as const,
          marginBottom: 16,
        }}>
          ⏳ Pending Meta Approval
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26, fontWeight: 800, color: '#fff',
          marginBottom: 12, letterSpacing: '-0.4px', lineHeight: 1.2,
        }}>
          Smart Reply is coming soon
        </h1>

        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.7, margin: '0 auto 20px', maxWidth: 360,
        }}>
          AI-powered DM inbox where Claude reads incoming messages
          and suggests perfect replies in your voice. You approve with one tap.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '20px',
          marginBottom: 28, textAlign: 'left' as const,
        }}>
          {[
            { icon: '💬', text: 'AI reads every DM and understands context' },
            { icon: '✍️', text: 'Suggests replies in your exact tone and voice' },
            { icon: '⚡', text: 'Approve and send with one tap' },
            { icon: '📈', text: 'Manage 50 DMs in 5 minutes instead of 50' },
          ].map((f, i, arr) => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 0', fontSize: 13,
              color: 'rgba(255,255,255,0.5)', fontWeight: 500,
              borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
          We have submitted for Meta App Review.<br />
          Smart Reply will activate automatically once approved.
        </div>
      </div>
    </div>
  )
}

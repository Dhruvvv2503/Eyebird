'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Automation } from '@/types/automations';

interface Props {
  initialAutomations: Automation[];
  igAccount: {
    id: string;
    username: string;
    profile_picture_url: string | null;
    followers_count: number;
  } | null;
}

export default function AutomationsClient({ initialAutomations, igAccount }: Props) {
  const router = useRouter();
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(id: string) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/automations/${id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.automation) {
        setAutomations(prev => prev.map(a => a.id === id ? data.automation : a));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this automation? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/automations/${id}`, { method: 'DELETE' });
      setAutomations(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  function getStatusColor(status: string) {
    if (status === 'active') return { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', color: '#4ade80' };
    if (status === 'paused') return { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#fcd34d' };
    return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' };
  }

  function getTriggerSummary(a: Automation) {
    const keyword = a.trigger_any_word
      ? 'any word'
      : a.trigger_keywords.length > 0
        ? a.trigger_keywords.slice(0, 2).join(', ')
        : 'any comment';
    const post = a.trigger_post_id ? 'specific post' : 'any post';
    return `Comment "${keyword}" on ${post} → DM`;
  }

  const totalDMs = automations.reduce((sum, a) => sum + a.total_dms_sent, 0);
  const activeCount = automations.filter(a => a.status === 'active').length;

  // ── EMPTY STATE ──
  if (automations.length === 0) {
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
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)' }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 480 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 22,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.1))',
            border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 28px',
            boxShadow: '0 8px 32px rgba(139,92,246,0.2)',
          }}>⚡</div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 12, lineHeight: 1.2 }}>
            Your first automation<br />is one click away
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 10 }}>
            Someone comments <span style={{ color: '#c4b5fd', fontWeight: 600 }}>LINK</span> on your Reel
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 36 }}>
            → They instantly get your DM. You sleep. Eyebird works.
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
            {['Unlimited DMs', 'Instant response', 'Any keyword', 'Test mode safe'].map(f => (
              <span key={f} style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '5px 12px' }}>{f}</span>
            ))}
          </div>

          <button
            onClick={() => router.push('/dashboard/automations/new')}
            style={{
              padding: '14px 36px',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              border: 'none', borderRadius: 14,
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
              color: '#fff', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; (e.currentTarget as HTMLElement).style.opacity = '0.95'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Create your first automation →
          </button>
        </div>
      </div>
    );
  }

  // ── LIST STATE ──
  return (
    <div style={{
      minHeight: '100vh',
      background: '#07060F',
      fontFamily: 'var(--font-body)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, background: 'radial-gradient(ellipse 80% 100% at 30% 0%, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', padding: '28px 28px 60px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              Growth Engine
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              Automations
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/automations/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 22px',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              border: 'none', borderRadius: 12,
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
              color: '#fff', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.01)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Automation
          </button>
        </div>

        {/* STATS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total DMs sent', value: totalDMs.toLocaleString(), color: '#4ade80', icon: '💬' },
            { label: 'Active automations', value: String(activeCount), color: '#c4b5fd', icon: '⚡' },
            { label: 'Avg response time', value: '< 3s', color: '#93c5fd', icon: '⏱' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'linear-gradient(145deg, #0F0E20, #0C0B1A)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: 24 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.5px', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* TEST MODE BANNER */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12, padding: '12px 18px',
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 16 }}>🧪</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fcd34d' }}>Test Mode Active</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>All DMs are sent to @dhruvv.bhaii only — not real commenters</span>
          </div>
          <span style={{ fontSize: 11, color: '#fcd34d', fontWeight: 600 }}>Pending App Review</span>
        </div>

        {/* AUTOMATION CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {automations.map(automation => {
            const statusStyle = getStatusColor(automation.status);
            return (
              <div
                key={automation.id}
                style={{
                  background: 'linear-gradient(145deg, #0F0E20, #0C0B1A)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16, padding: '18px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'border-color 0.2s',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.2)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>⚡</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>
                      {automation.name}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      background: statusStyle.bg,
                      border: `1px solid ${statusStyle.border}`,
                      color: statusStyle.color,
                      borderRadius: 100, padding: '2px 9px',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {automation.status}
                    </span>
                    {automation.test_mode && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#fcd34d', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 100, padding: '2px 8px' }}>
                        🧪 Test
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                    {getTriggerSummary(automation)}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 60 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                    {automation.total_dms_sent}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>DMs sent</div>
                </div>

                {/* Toggle switch */}
                <div
                  onClick={() => handleToggle(automation.id)}
                  style={{
                    width: 44, height: 24,
                    borderRadius: 100,
                    background: automation.status === 'active' ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'rgba(255,255,255,0.1)',
                    position: 'relative', cursor: togglingId === automation.id ? 'wait' : 'pointer',
                    transition: 'all 0.3s', flexShrink: 0,
                    boxShadow: automation.status === 'active' ? '0 0 12px rgba(139,92,246,0.4)' : 'none',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3,
                    left: automation.status === 'active' ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.3s',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => router.push(`/dashboard/automations/${automation.id}/edit`)}
                    style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.5)',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, transition: 'all 0.15s',
                    }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
                    title="Edit"
                  >✏️</button>
                  <button
                    onClick={() => handleDelete(automation.id)}
                    disabled={deletingId === automation.id}
                    style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: 'rgba(239,68,68,0.06)',
                      border: '1px solid rgba(239,68,68,0.12)',
                      color: 'rgba(239,68,68,0.5)',
                      cursor: deletingId === automation.id ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, transition: 'all 0.15s',
                    }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.5)'; }}
                    title="Delete"
                  >🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

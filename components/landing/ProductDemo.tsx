'use client';

import { useState, useEffect, useRef } from 'react';

const PANEL_DURATION = 4000;

export function ProductDemo() {
  const [activePanel, setActivePanel] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    progressRef.current = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + (100 / (PANEL_DURATION / 50))));
    }, 50);
    intervalRef.current = setInterval(() => {
      setActivePanel(p => (p + 1) % 3);
      setProgress(0);
    }, PANEL_DURATION);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [paused, activePanel]);

  const tabs = [
    { label: '📊 Audit', id: 0 },
    { label: '⚡ Automate', id: 1 },
    { label: '📈 Dashboard', id: 2 },
  ];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ maxWidth: 760, margin: '0 auto' }}
    >
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActivePanel(tab.id); setProgress(0); }}
            style={{
              padding: '8px 20px', borderRadius: 20,
              border: activePanel === tab.id ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
              background: activePanel === tab.id ? 'rgba(139,92,246,0.15)' : 'transparent',
              color: activePanel === tab.id ? 'white' : 'rgba(255,255,255,0.4)',
              fontSize: 14, fontWeight: activePanel === tab.id ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
          borderRadius: 1, transition: 'width 0.05s linear',
        }} />
      </div>

      {/* Panel container */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, overflow: 'hidden', minHeight: 360,
      }}>

        {/* Panel 1: Audit */}
        {activePanel === 0 && (
          <div style={{ padding: 28, animation: 'fadeInUp 0.35s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: 'white',
                }}>R</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>@fitlife.riya</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>48.5K followers · Fitness</div>
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'white', fontFamily: 'monospace' }}>
                74<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/100</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Engagement', value: '3.1%',   status: '↑ Above avg', color: '#22c55e' },
                { label: 'Hook Score', value: '7.2/10', status: '↑ Above avg', color: '#22c55e' },
                { label: 'Hashtags',   value: '68/100', status: '↗ Fix this',  color: '#eab308' },
              ].map((m, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'white', fontFamily: 'monospace', marginBottom: 4 }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>{m.status}</div>
                </div>
              ))}
            </div>
            <div style={{
              background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.8)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              Post on <strong style={{ color: 'white', marginLeft: 4, marginRight: 4 }}>Thursday 9 PM</strong> — your audience is 2.3× more active then
            </div>
            <div style={{ marginTop: 12, filter: 'blur(4px)', opacity: 0.4, userSelect: 'none', pointerEvents: 'none' }}>
              <div style={{ height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 8 }} />
              <div style={{ height: 40, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }} />
            </div>
          </div>
        )}

        {/* Panel 2: Automation */}
        {activePanel === 1 && (
          <div style={{ padding: 28, animation: 'fadeInUp 0.35s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 4 }}>Comment → DM Automation</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Workout Plan Delivery</div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 20, padding: '4px 12px',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>LIVE</span>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: 16, marginBottom: 16,
            }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Comment on your reel</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '0 10px 10px 10px', padding: '8px 12px', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                    Bhai can you share the DIET PLAN 🙏
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginBottom: 16 }}>
                ↓ Eyebird fires automatically in 2 seconds
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DM sent automatically</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))',
                    border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px 0 10px 10px',
                    padding: '10px 14px', fontSize: 13, color: 'white', maxWidth: '80%',
                  }}>
                    Hey! 💪 Here&apos;s your free diet plan:<br />
                    <span style={{ color: '#a78bfa', textDecoration: 'underline' }}>Get the plan →</span>
                    <br /><br />
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      Quick q — beginner or advanced? I&apos;ll send the right plan! 🔥
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[{ label: 'DMs sent', value: '345' }, { label: 'CTR', value: '100%' }, { label: 'Leads', value: '23' }].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 3: Dashboard */}
        {activePanel === 2 && (
          <div style={{ padding: 28, animation: 'fadeInUp 0.35s ease-out' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 20 }}>Good evening, @creator 👋</div>
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: 16, marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Account health score over time</div>
              <svg viewBox="0 0 300 80" style={{ width: '100%', height: 80 }}>
                <defs>
                  <linearGradient id="demoLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                  <linearGradient id="demoAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 0,60 L 75,50 L 150,35 L 225,20 L 300,10 L 300,80 L 0,80 Z" fill="url(#demoAreaGrad)" />
                <path d="M 0,60 L 75,50 L 150,35 L 225,20 L 300,10" fill="none" stroke="url(#demoLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {[[0,60],[75,50],[150,35],[225,20],[300,10]].map(([x,y], i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill="#8B5CF6" />
                ))}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
              </div>
            </div>
            <div style={{
              background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: 'rgba(255,255,255,0.8)',
            }}>
              <span style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>TODAY&apos;S ACTION</span>
              Post a Reel before <strong style={{ color: 'white' }}>9 PM tonight</strong> — your audience peaks then 🔥
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[{ label: 'DMs this week', value: '127' }, { label: 'Leads collected', value: '23' }].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

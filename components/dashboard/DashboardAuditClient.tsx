'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  igAccount: { ig_user_id: string; username: string; followers_count?: number; profile_picture_url?: string } | null;
  audits: any[];
  autoStart: boolean;
}

const LOADING_STEPS = [
  { label: 'Connected to Instagram', done: true },
  { label: 'Fetching your last 20 posts…' },
  { label: 'Analysing engagement patterns…' },
  { label: 'Scoring your content…' },
  { label: 'Generating your action plan…' },
];

const FACTS = [
  { emoji: '⚡', stat: '34%', text: 'of Instagram reach is determined in the first 30 minutes after posting' },
  { emoji: '🎯', stat: '3x',  text: 'more saves = 3x more reach. Saves are the most powerful signal' },
  { emoji: '📊', stat: '22',  text: 'data points are being checked on your account right now' },
  { emoji: '🕐', stat: '87%', text: 'of creators post at the wrong time for their specific audience' },
  { emoji: '💰', stat: '₹8,000+', text: 'is what creators with your engagement rate can charge per Reel' },
];

export function DashboardAuditClient({ igAccount, audits, autoStart }: Props) {
  const router = useRouter();
  const [state, setState] = useState<'empty' | 'loading' | 'report' | 'history'>('empty');
  const [currentAudit, setCurrentAudit] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingFact, setLoadingFact] = useState(0);

  useEffect(() => {
    if (audits.length > 0) {
      setCurrentAudit(audits[0]);
      setState('report');
    } else if (autoStart && igAccount) {
      startAudit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state !== 'loading') return;
    const interval = setInterval(() => {
      setLoadingFact(f => (f + 1) % FACTS.length);
      setLoadingStep(s => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [state]);

  async function startAudit() {
    if (!igAccount) return;
    setState('loading');
    setLoadingStep(0);
    try {
      await fetch('/api/instagram/fetch-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId: igAccount.ig_user_id }),
      });
      setLoadingStep(2);

      const res = await fetch('/api/audit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId: igAccount.ig_user_id }),
      });
      const data = await res.json();

      if (data.success || data.audit) {
        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();
        const { data: audit } = await supabase
          .from('audits')
          .select('*')
          .eq('ig_user_id', igAccount.ig_user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        setCurrentAudit(audit);
        setState('report');
        router.replace('/dashboard/audit');
      } else {
        setState('empty');
      }
    } catch (err) {
      console.error('Audit failed:', err);
      setState('empty');
    }
  }

  /* ─── EMPTY ─────────────────────────────────────────────── */
  if (state === 'empty') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24, animation: 'pulse 3s ease-in-out infinite' }}>
          👁️
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 12, lineHeight: 1.2 }}>
          Ready to see your Instagram clearly?
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 32, maxWidth: 400, lineHeight: 1.6 }}>
          We&apos;ll analyse 22 things about your account in under 60 seconds.{!igAccount && ' Connect your Instagram account first.'}
        </p>
        {igAccount ? (
          <button
            onClick={startAudit}
            style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', border: 'none', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            Run my first audit →
          </button>
        ) : (
          <a href="/api/instagram/auth" style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', borderRadius: 12, color: 'white', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
            Connect Instagram first →
          </a>
        )}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>🔒 Read-only access · Never posts · Official Instagram API</div>
      </div>
    );
  }

  /* ─── LOADING ────────────────────────────────────────────── */
  if (state === 'loading') {
    const fact = FACTS[loadingFact];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', minHeight: '60vh' }}>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 32, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Analysing @{igAccount?.username}
        </div>
        <div style={{ width: '100%', maxWidth: 400, marginBottom: 48 }}>
          {LOADING_STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, opacity: i <= loadingStep ? 1 : 0.3, transition: 'opacity 0.5s ease' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: i < loadingStep ? '#22c55e' : i === loadingStep ? 'transparent' : 'rgba(255,255,255,0.1)',
                border: i === loadingStep ? '2px solid #8B5CF6' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                animation: i === loadingStep ? 'spin 1s linear infinite' : 'none',
              }}>
                {i < loadingStep && '✓'}
              </div>
              <span style={{ fontSize: 14, color: i < loadingStep ? '#22c55e' : i === loadingStep ? 'white' : 'rgba(255,255,255,0.3)', fontWeight: i === loadingStep ? 600 : 400 }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', maxWidth: 440, width: '100%', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>{fact.emoji}</span>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#8B5CF6', lineHeight: 1, marginBottom: 6 }}>{fact.stat}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{fact.text}</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', marginTop: 32 }}>This takes 30–60 seconds. Good things take time.</div>
      </div>
    );
  }

  /* ─── REPORT ─────────────────────────────────────────────── */
  if (state === 'report' && currentAudit) {
    const overallScore = currentAudit?.overall_score ?? 72
    const erNum = parseFloat(String(currentAudit?.computed_metrics?.engagementRate || 0))
    const hookNum = currentAudit?.ai_analysis?.hook_avg_score ?? 6.3
    const hashtagScore = currentAudit?.ai_analysis?.hashtag_score ?? 62
    const igUsername = currentAudit?.username || igAccount?.username || ''
    const auditDate = currentAudit?.created_at
      ? new Date(currentAudit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Recently'
    const formatBreakdown = currentAudit?.computed_metrics?.formatBreakdown || {}
    const formats = Object.entries(formatBreakdown) as [string, any][]
    const bestFormatEntry = formats.sort(([, a], [, b]) =>
      (parseFloat(b?.avgEngagementRate) || 0) - (parseFloat(a?.avgEngagementRate) || 0)
    )[0]
    const bestFormatKey = bestFormatEntry?.[0] || 'VIDEO'
    const bestFormatData = bestFormatEntry?.[1] as any
    const formatEmoji = bestFormatKey === 'VIDEO' ? '🎬' : bestFormatKey === 'CAROUSEL_ALBUM' ? '🖼️' : '📸'
    let formatName = 'Reels'
    if (bestFormatKey === 'CAROUSEL_ALBUM') formatName = 'Carousels'
    else if (bestFormatKey === 'IMAGE') formatName = 'Photos'
    const formatAvgEr = parseFloat(bestFormatData?.avgEngagementRate || '0').toFixed(1)
    const actionPlan = currentAudit?.ai_analysis?.action_plan ?? []

    return (
  <div style={{ fontFamily: 'var(--font-body)', minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

    {/* ATMOSPHERE */}
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      background: `radial-gradient(ellipse 65% 50% at 10% -5%, rgba(139,92,246,0.14) 0%, transparent 60%),
        radial-gradient(ellipse 45% 35% at 90% 10%, rgba(236,72,153,0.08) 0%, transparent 55%)` }} />
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)',
      backgroundSize: '48px 48px',
      maskImage: 'radial-gradient(ellipse 90% 50% at 50% 0%,black 0%,transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 90% 50% at 50% 0%,black 0%,transparent 100%)' }} />

    <div style={{ position: 'relative', zIndex: 1, padding: '32px 32px 120px', maxWidth: 1280, marginInline: 'auto' }}>

      {/* ═══════════════════════════════════════
          HEADER
      ═══════════════════════════════════════ */}
      <div className="ov-fadein" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--m1)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Instagram Audit</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.7px', lineHeight: 1, margin: 0, marginBottom: 7 }}>Your Audit Report</h1>
          <div style={{ fontSize: 12, color: 'var(--m1)', fontWeight: 500 }}>@{igUsername} · Audited {auditDate}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setState('history')}
            style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
            onMouseOver={e=>{const el=e.currentTarget;el.style.background='rgba(255,255,255,0.09)';el.style.color='#fff';}}
            onMouseOut={e=>{const el=e.currentTarget;el.style.background='rgba(255,255,255,0.05)';el.style.color='rgba(255,255,255,0.65)';}}>
            View history
          </button>
          <button onClick={startAudit}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#8B5CF6,#A855F7,#EC4899)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', boxShadow: '0 4px 20px rgba(139,92,246,0.35)', transition: 'all 0.2s' }}
            onMouseOver={e=>{const el=e.currentTarget;el.style.opacity='0.88';el.style.transform='scale(1.02)';}}
            onMouseOut={e=>{const el=e.currentTarget;el.style.opacity='1';el.style.transform='scale(1)';}}>
            + Run new audit
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          HERO ROW — Score + 4 stat tiles
      ═══════════════════════════════════════ */}
      <div className="ov-fadein" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 20 }}>

        {/* Score card */}
        <div style={{ background: 'linear-gradient(165deg,rgba(139,92,246,0.13) 0%,rgba(13,12,30,0.98) 55%)', border: '1px solid rgba(139,92,246,0.22)', borderRadius: 28, padding: '32px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.055)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.85),rgba(236,72,153,0.85),transparent)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: 240, height: 240, background: 'radial-gradient(circle,rgba(139,92,246,0.16) 0%,transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--m1)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', alignSelf: 'flex-start' }}>Account Health</div>

          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="ar1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6"/><stop offset="50%" stopColor="#A855F7"/><stop offset="100%" stopColor="#EC4899"/>
                </linearGradient>
                <filter id="ag1"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="11"/>
              <circle cx="70" cy="70" r="58" fill="none" stroke="url(#ar1)" strokeWidth="11" strokeLinecap="round"
                strokeDasharray="364" strokeDashoffset={364-(364*overallScore/100)}
                filter="url(#ag1)" style={{transition:'stroke-dashoffset 1.8s cubic-bezier(0.34,1.2,0.64,1)'}}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, color: '#fff', letterSpacing: '-3px', lineHeight: 1 }}>{overallScore}</span>
              <span style={{ fontSize: 11, color: 'var(--m1)', marginTop: 4 }}>/100</span>
            </div>
          </div>

          <div style={{ padding: '7px 22px', borderRadius: 100, fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
            color: overallScore>=70?'#4ade80':overallScore>=50?'#fcd34d':'#f87171',
            background: overallScore>=70?'rgba(34,197,94,0.09)':overallScore>=50?'rgba(245,158,11,0.09)':'rgba(239,68,68,0.09)',
            border:`1px solid ${overallScore>=70?'rgba(34,197,94,0.28)':overallScore>=50?'rgba(245,158,11,0.28)':'rgba(239,68,68,0.28)'}`,
            boxShadow:overallScore>=70?'0 0 20px rgba(34,197,94,0.12)':'none' }}>
            {overallScore>=70?'⚡ Strong Performance':overallScore>=50?'📈 Growing':'🔧 Needs Work'}
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 11 }}>
            {[
              { label: 'Engagement',   pct: Math.min((erNum/15)*100,100), color: '#22C55E' },
              { label: 'Hook quality', pct: (hookNum/10)*100,              color: '#F59E0B' },
              { label: 'Hashtags',     pct: hashtagScore,                  color: '#8B5CF6' },
            ].map(b=>(
              <div key={b.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: 'var(--m1)', fontWeight: 500 }}>{b.label}</span>
                  <span style={{ fontSize: 10, color: b.color, fontWeight: 700 }}>{Math.round(b.pct)}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width:`${b.pct}%`, height:'100%', background:`linear-gradient(90deg,${b.color}70,${b.color})`, borderRadius:2, transition:'width 1.8s cubic-bezier(0.4,0,0.2,1)', boxShadow:`0 0 8px ${b.color}35` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 16 }}>

          {/* ER */}
          <div style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.07) 0%,rgba(13,12,30,0.98) 60%)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 24, padding: '24px 26px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 28px rgba(0,0,0,0.45)' }}>
            <div style={{ position: 'absolute', top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#22C55E,rgba(34,197,94,0.08))',borderRadius:'24px 24px 0 0' }}/>
            <div style={{ fontSize:10,fontWeight:700,color:'rgba(34,197,94,0.65)',textTransform:'uppercase' as const,letterSpacing:'0.09em',marginBottom:10,display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ width:6,height:6,borderRadius:'50%',background:'#22C55E',display:'inline-block',boxShadow:'0 0 7px #22C55E' }}/>
              Engagement Rate
            </div>
            <div style={{ fontFamily:'var(--font-display)',fontSize:44,fontWeight:800,color:'#fff',letterSpacing:'-2.5px',lineHeight:1,marginBottom:6,display:'flex',alignItems:'flex-end',gap:3 }}>
              {erNum.toFixed(1)}<span style={{ fontSize:20,color:'rgba(255,255,255,0.3)',fontFamily:'var(--font-body)',marginBottom:7,fontWeight:400 }}>%</span>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <div style={{ fontFamily:'var(--font-display)',fontSize:22,fontWeight:800,color:'#4ade80',letterSpacing:'-1px' }}>{(erNum/3).toFixed(1)}×</div>
              <div style={{ fontSize:11,color:'var(--m1)',fontWeight:500,lineHeight:1.4 }}>above<br/>industry avg</div>
            </div>
          </div>

          {/* Hook */}
          <div style={{ background: 'linear-gradient(135deg,rgba(236,72,153,0.07) 0%,rgba(13,12,30,0.98) 60%)', border: '1px solid rgba(236,72,153,0.15)', borderRadius: 24, padding: '24px 26px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 28px rgba(0,0,0,0.45)' }}>
            <div style={{ position: 'absolute', top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#EC4899,rgba(236,72,153,0.08))',borderRadius:'24px 24px 0 0' }}/>
            <div style={{ fontSize:10,fontWeight:700,color:'rgba(236,72,153,0.65)',textTransform:'uppercase' as const,letterSpacing:'0.09em',marginBottom:10,display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ width:6,height:6,borderRadius:'50%',background:'#EC4899',display:'inline-block',boxShadow:'0 0 7px #EC4899' }}/>
              Hook Strength
            </div>
            <div style={{ fontFamily:'var(--font-display)',fontSize:44,fontWeight:800,color:'#fff',letterSpacing:'-2.5px',lineHeight:1,marginBottom:6,display:'flex',alignItems:'flex-end',gap:3 }}>
              {hookNum.toFixed(1)}<span style={{ fontSize:20,color:'rgba(255,255,255,0.3)',fontFamily:'var(--font-body)',marginBottom:7,fontWeight:400 }}>/10</span>
            </div>
            <div style={{ fontSize:12,color:'var(--m2)',fontWeight:500,lineHeight:1.5 }}>
              {hookNum>=8?'Hooks retaining viewers well':hookNum>=6?'Some hooks losing viewers early':'Losing viewers in first 3s'}
            </div>
          </div>

          {/* Best Format */}
          <div style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.07) 0%,rgba(13,12,30,0.98) 60%)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 24, padding: '24px 26px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 28px rgba(0,0,0,0.45)' }}>
            <div style={{ position: 'absolute', top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#8B5CF6,rgba(139,92,246,0.08))',borderRadius:'24px 24px 0 0' }}/>
            <div style={{ fontSize:10,fontWeight:700,color:'rgba(139,92,246,0.65)',textTransform:'uppercase' as const,letterSpacing:'0.09em',marginBottom:10,display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ width:6,height:6,borderRadius:'50%',background:'#8B5CF6',display:'inline-block',boxShadow:'0 0 7px #8B5CF6' }}/>
              Best Format
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:14,marginBottom:6 }}>
              <div style={{ width:44,height:44,borderRadius:14,background:'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(139,92,246,0.07))',border:'1px solid rgba(139,92,246,0.22)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>
                {formatEmoji}
              </div>
              <span style={{ fontFamily:'var(--font-display)',fontSize:30,fontWeight:800,color:'#fff',letterSpacing:'-1px',lineHeight:1 }}>{formatName}</span>
            </div>
            <div style={{ fontSize:12,color:'var(--m2)',fontWeight:500 }}>{formatAvgEr&&formatAvgEr!=='0.0'?`${formatAvgEr}% avg ER — strongest format`:'Highest-performing content type'}</div>
          </div>

          {/* Hashtags */}
          <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.07) 0%,rgba(13,12,30,0.98) 60%)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 24, padding: '24px 26px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 28px rgba(0,0,0,0.45)' }}>
            <div style={{ position: 'absolute', top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#F59E0B,rgba(245,158,11,0.08))',borderRadius:'24px 24px 0 0' }}/>
            <div style={{ fontSize:10,fontWeight:700,color:'rgba(245,158,11,0.65)',textTransform:'uppercase' as const,letterSpacing:'0.09em',marginBottom:10,display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ width:6,height:6,borderRadius:'50%',background:'#F59E0B',display:'inline-block',boxShadow:'0 0 7px #F59E0B' }}/>
              Hashtag Health
            </div>
            <div style={{ fontFamily:'var(--font-display)',fontSize:44,fontWeight:800,color:'#fff',letterSpacing:'-2.5px',lineHeight:1,marginBottom:6,display:'flex',alignItems:'flex-end',gap:3 }}>
              {hashtagScore}<span style={{ fontSize:20,color:'rgba(255,255,255,0.3)',fontFamily:'var(--font-body)',marginBottom:7,fontWeight:400 }}>/100</span>
            </div>
            <div style={{ fontSize:12,color:'var(--m2)',fontWeight:500,lineHeight:1.5 }}>
              {hashtagScore>=70?'Good niche targeting':hashtagScore>=50?'Some over-saturated tags':'Using too many mass hashtags'}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          ACTION PLAN — Card-style, scannable
      ═══════════════════════════════════════ */}
      <div className="ov-fadein-1" style={{ marginBottom: 20 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:800,color:'#fff',letterSpacing:'-0.4px',margin:0,marginBottom:4 }}>Your Action Plan</h2>
            <p style={{ fontSize:12,color:'var(--m1)',fontWeight:500,margin:0 }}>3 specific fixes — ranked by impact on your growth</p>
          </div>
          <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:'rgba(34,197,94,0.07)',border:'1px solid rgba(34,197,94,0.18)',borderRadius:100,padding:'5px 14px',fontSize:11,fontWeight:700,color:'#4ade80' }}>
            ✓ Included in Free Plan
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14 }}>
          {actionPlan.slice(0,3).map((item:any,i:number)=>{
            const colors = [
              { accent:'#8B5CF6', bg:'rgba(139,92,246,0.08)', border:'rgba(139,92,246,0.22)', grad:'linear-gradient(90deg,#8B5CF6,rgba(139,92,246,0.1))', numCol:'#c4b5fd', impactBg:'rgba(239,68,68,0.1)', impactBorder:'rgba(239,68,68,0.25)', impactCol:'#f87171', impactLabel:'HIGH impact' },
              { accent:'#EC4899', bg:'rgba(236,72,153,0.08)', border:'rgba(236,72,153,0.22)', grad:'linear-gradient(90deg,#EC4899,rgba(236,72,153,0.1))', numCol:'#f9a8d4', impactBg:'rgba(239,68,68,0.1)', impactBorder:'rgba(239,68,68,0.25)', impactCol:'#f87171', impactLabel:'HIGH impact' },
              { accent:'#F59E0B', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.22)', grad:'linear-gradient(90deg,#F59E0B,rgba(245,158,11,0.1))', numCol:'#fcd34d', impactBg:'rgba(245,158,11,0.1)', impactBorder:'rgba(245,158,11,0.25)', impactCol:'#fcd34d', impactLabel:'MEDIUM impact' },
            ][i];
            const title = item?.problem ?? (typeof item==='string'?item:'');
            const fix = item?.exact_fix ?? item?.description ?? '';
            const impact = item?.impact ?? (i<2?'HIGH':'MEDIUM');
            return (
              <div key={i} style={{ background:'linear-gradient(150deg,rgba(13,12,30,0.98),rgba(10,9,25,0.99))', border:`1px solid ${colors.border}`, borderRadius:24, padding:'26px 24px', position:'relative', overflow:'hidden', boxShadow:'0 4px 28px rgba(0,0,0,0.45)', display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:colors.grad,borderRadius:'24px 24px 0 0' }}/>
                <div style={{ position:'absolute',top:-30,right:-30,width:120,height:120,background:`radial-gradient(circle,${colors.accent}10 0%,transparent 70%)`,pointerEvents:'none' }}/>
                <div style={{ width:40,height:40,borderRadius:13,background:colors.bg,border:`1px solid ${colors.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:18,fontWeight:800,color:colors.numCol,flexShrink:0 }}>
                  {i+1}
                </div>
                <div style={{ fontFamily:'var(--font-display)',fontSize:15,fontWeight:800,color:'#fff',lineHeight:1.4,letterSpacing:'-0.3px' }}>
                  {title}
                </div>
                {fix&&(
                  <div style={{ fontSize:12,color:'var(--m1)',lineHeight:1.7,fontWeight:500,flex:1 }}>
                    {fix.length>160?fix.slice(0,160)+'…':fix}
                  </div>
                )}
                <div style={{ display:'inline-flex',alignItems:'center',gap:5,background:colors.impactBg,border:`1px solid ${colors.impactBorder}`,borderRadius:100,padding:'4px 12px',fontSize:10,fontWeight:700,color:colors.impactCol,alignSelf:'flex-start' }}>
                  ↑ {impact} impact
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          LOCKED WALL — Teaser + Paywall
      ═══════════════════════════════════════ */}
      <div className="ov-fadein-2" style={{ position:'relative' }}>

        {/* Blurred preview rows */}
        <div style={{ filter:'blur(6px)', userSelect:'none', pointerEvents:'none', opacity:0.45 }}>
          <div style={{ marginBottom:12, background:'rgba(13,12,30,0.98)', border:'1px solid rgba(139,92,246,0.18)', borderRadius:20, padding:'20px 24px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:44,height:44,borderRadius:14,background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>⏰</div>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:'#fff',marginBottom:4 }}>Your exact golden posting window</div>
              <div style={{ fontSize:12,color:'var(--m1)' }}>The specific times your audience is most active — not generic advice</div>
            </div>
            <div style={{ marginLeft:'auto',fontSize:18 }}>🔒</div>
          </div>
          <div style={{ marginBottom:12, background:'rgba(13,12,30,0.98)', border:'1px solid rgba(236,72,153,0.18)', borderRadius:20, padding:'20px 24px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:44,height:44,borderRadius:14,background:'rgba(236,72,153,0.1)',border:'1px solid rgba(236,72,153,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>🎯</div>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:'#fff',marginBottom:4 }}>The exact hook losing 60% of your viewers + AI rewrite</div>
              <div style={{ fontSize:12,color:'var(--m1)' }}>We identified which hook is killing your retention — here is the fixed version</div>
            </div>
            <div style={{ marginLeft:'auto',fontSize:18 }}>🔒</div>
          </div>
          <div style={{ marginBottom:12, background:'rgba(13,12,30,0.98)', border:'1px solid rgba(245,158,11,0.18)', borderRadius:20, padding:'20px 24px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:44,height:44,borderRadius:14,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>#️⃣</div>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:'#fff',marginBottom:4 }}>22 rankable hashtags built for your exact niche and size</div>
              <div style={{ fontSize:12,color:'var(--m1)' }}>Not #fitness with 500M posts — ones your content can actually rank in</div>
            </div>
            <div style={{ marginLeft:'auto',fontSize:18 }}>🔒</div>
          </div>
          <div style={{ background:'rgba(13,12,30,0.98)', border:'1px solid rgba(34,197,94,0.18)', borderRadius:20, padding:'20px 24px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:44,height:44,borderRadius:14,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>💰</div>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:'#fff',marginBottom:4 }}>Your brand rate card in ₹ — Story, Reel, Carousel</div>
              <div style={{ fontSize:12,color:'var(--m1)' }}>Calculated from your actual ER — stop undercharging brands</div>
            </div>
            <div style={{ marginLeft:'auto',fontSize:18 }}>🔒</div>
          </div>
        </div>

        {/* Paywall overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 0%,rgba(7,6,15,0.7) 30%,rgba(7,6,15,0.97) 65%)', borderRadius:20, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', paddingBottom:36 }}>
          <div style={{ background:'linear-gradient(150deg,rgba(139,92,246,0.14) 0%,rgba(13,12,30,0.98) 70%)', border:'1.5px solid rgba(139,92,246,0.28)', borderRadius:28, padding:'32px 40px', maxWidth:560, width:'100%', position:'relative', overflow:'hidden', boxShadow:'0 16px 64px rgba(0,0,0,0.7),0 0 80px rgba(139,92,246,0.12)', textAlign:'center' as const }}>
            <div style={{ position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(139,92,246,0.85),rgba(236,72,153,0.85),transparent)' }}/>

            <div style={{ display:'inline-flex',alignItems:'center',gap:7,background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.22)',borderRadius:100,padding:'5px 16px',fontSize:11,fontWeight:700,color:'#fcd34d',letterSpacing:'0.06em',textTransform:'uppercase' as const,marginBottom:16 }}>
              <span style={{ width:5,height:5,borderRadius:'50%',background:'#F59E0B',display:'inline-block',boxShadow:'0 0 6px #F59E0B',animation:'pulseGreen 2s infinite' }}/>
              🕐 Limited Period Offer · 19 insights locked
            </div>

            <h3 style={{ fontFamily:'var(--font-display)',fontSize:26,fontWeight:800,color:'#fff',letterSpacing:'-0.6px',lineHeight:1.25,margin:'0 0 10px' }}>
              Your full Instagram diagnosis is ready
            </h3>
            <p style={{ fontSize:13,color:'var(--m1)',lineHeight:1.7,fontWeight:500,margin:'0 0 26px',maxWidth:420,marginInline:'auto' }}>
              Golden posting window, hook rewrite, 22 hashtags, brand rate card in ₹, AI bio rewrite — and 14 more insights specific to <strong style={{ color:'rgba(255,255,255,0.75)' }}>@{igUsername}</strong>.
            </p>

            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:20,marginBottom:22,flexWrap:'wrap' }}>
              <div>
                <div style={{ display:'flex',alignItems:'baseline',gap:8,justifyContent:'center',marginBottom:3 }}>
                  <span style={{ fontFamily:'var(--font-display)',fontSize:14,color:'rgba(255,255,255,0.2)',textDecoration:'line-through' }}>₹299</span>
                  <span style={{ fontFamily:'var(--font-display)',fontSize:46,fontWeight:800,color:'#fff',letterSpacing:'-3px',lineHeight:1 }}>₹99</span>
                </div>
                <div style={{ fontSize:11,color:'var(--m1)',fontWeight:500 }}>One-time · yours forever · PDF to email</div>
              </div>
            </div>

            <a href="/dashboard/upgrade?plan=audit"
              style={{ display:'block',padding:'16px 0',background:'linear-gradient(135deg,#8B5CF6,#A855F7,#EC4899)',borderRadius:16,fontSize:16,fontWeight:800,color:'#fff',textDecoration:'none',fontFamily:'var(--font-display)',boxShadow:'0 8px 32px rgba(139,92,246,0.45)',letterSpacing:'-0.2px',transition:'all 0.2s',marginBottom:14 }}
              onMouseOver={e=>{const el=e.currentTarget as HTMLElement;el.style.opacity='0.88';el.style.transform='scale(1.02)';el.style.boxShadow='0 14px 44px rgba(139,92,246,0.58)';}}
              onMouseOut={e=>{const el=e.currentTarget as HTMLElement;el.style.opacity='1';el.style.transform='scale(1)';el.style.boxShadow='0 8px 32px rgba(139,92,246,0.45)';}}>
              Unlock Full Report →
            </a>

            <div style={{ display:'flex',alignItems:'center',gap:18,justifyContent:'center',flexWrap:'wrap' }}>
              {['✓ Instant delivery','✓ PDF to email','✓ No subscription','✓ Specific to your account'].map(t=>(
                <span key={t} style={{ fontSize:11,color:'rgba(255,255,255,0.25)',fontWeight:500 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
    );
  }

  /* ─── HISTORY ────────────────────────────────────────────── */
  if (state === 'history') {
    return (
      <div style={{ padding: 'clamp(20px,4vw,32px)', paddingBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>Audit History</h1>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{audits.length} audit{audits.length !== 1 ? 's' : ''} completed</div>
          </div>
          <button onClick={startAudit} style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            + Run new audit
          </button>
        </div>

        {audits.length >= 2 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score trend</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {audits.slice().reverse().map((audit: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>{audit.overall_score}</span>
                  {i < audits.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>→</span>}
                </div>
              ))}
              {(() => {
                const first = audits[audits.length - 1]?.overall_score || 0;
                const last = audits[0]?.overall_score || 0;
                const diff = last - first;
                return diff !== 0 ? (
                  <span style={{ fontSize: 13, fontWeight: 700, color: diff > 0 ? '#22c55e' : '#ef4444', background: diff > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${diff > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 8, padding: '2px 10px' }}>
                    {diff > 0 ? '↑' : '↓'} {Math.abs(diff)} points
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {audits.map((audit: any, i: number) => {
            const prev = audits[i + 1];
            const scoreDiff = prev ? audit.overall_score - prev.overall_score : null;
            const igUserId = igAccount?.ig_user_id || audit.ig_user_id;
            return (
              <div
                key={audit.id}
                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${scoreDiff !== null && scoreDiff > 0 ? 'rgba(34,197,94,0.15)' : scoreDiff !== null && scoreDiff < 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: '20px 24px', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}
                onClick={() => { setCurrentAudit(audit); setState('report'); }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = scoreDiff !== null && scoreDiff > 0 ? 'rgba(34,197,94,0.15)' : scoreDiff !== null && scoreDiff < 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {new Date(audit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {i === 0 && <span style={{ fontSize: 11, background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>Latest</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    @{audit.username}{audit.computed_metrics?.engagementRate ? ` · ${audit.computed_metrics.engagementRate}% ER` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {scoreDiff !== null && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: scoreDiff > 0 ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                      {scoreDiff > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                    </span>
                  )}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: 'monospace', lineHeight: 1 }}>{audit.overall_score}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/100</div>
                  </div>
                  <Link
                    href={`/audit/${igUserId}?auditId=${audit.id}`}
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: audit.is_paid ? 'linear-gradient(135deg,#A855F7,#7C3AED)' : 'rgba(255,255,255,0.06)', color: audit.is_paid ? 'white' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}
                  >
                    {audit.is_paid ? 'View' : 'Unlock'} <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

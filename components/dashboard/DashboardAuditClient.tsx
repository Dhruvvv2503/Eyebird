'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import PremiumLoadingScreen from '@/components/audit/PremiumLoadingScreen';
import FreeMetricsSection from '@/components/audit/FreeMetricsSection';
import PaywallTeaser from '@/components/audit/PaywallTeaser';
import PaymentModal from '@/components/audit/PaymentModal';
import PaidReport from '@/components/audit/PaidReport';

interface Props {
  igAccount: { ig_user_id: string; username: string; followers_count?: number; profile_picture_url?: string } | null;
  audits: any[];
  autoStart: boolean;
}

const LOADING_STEPS = [
  'Connected to Instagram',
  'Fetching your last 20 posts…',
  'Analysing engagement patterns…',
  'Scoring your content…',
  'Generating your action plan…',
];

export function DashboardAuditClient({ igAccount, audits, autoStart }: Props) {
  const router = useRouter();
  const [state, setState] = useState<'empty' | 'loading' | 'report' | 'history'>('empty');
  const [currentAudit, setCurrentAudit] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paidLoading, setPaidLoading] = useState(false);

  useEffect(() => {
    if (audits.length > 0) {
      setCurrentAudit(audits[0]);
      setIsPaid(audits[0]?.is_paid ?? false);
      setState('report');
    } else if (autoStart && igAccount) {
      startAudit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Advance loading step every 6s to sync PremiumLoadingScreen
  useEffect(() => {
    if (state !== 'loading') return;
    const interval = setInterval(() => {
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
        setIsPaid(audit?.is_paid ?? false);
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

  async function handlePaymentSuccess() {
    setShowPaymentModal(false);
    setPaidLoading(true);
    try {
      if (igAccount) {
        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();
        const { data: audit } = await supabase
          .from('audits')
          .select('*')
          .eq('ig_user_id', igAccount.ig_user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (audit) setCurrentAudit(audit);
      }
    } catch (err) {
      console.error('Failed to reload audit after payment:', err);
    } finally {
      setPaidLoading(false);
      setIsPaid(true);
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

  /* ─── LOADING (audit generation) ────────────────────────────── */
  if (state === 'loading') {
    return (
      <PremiumLoadingScreen
        currentStepIndex={loadingStep}
        steps={LOADING_STEPS}
        username={igAccount?.username}
      />
    );
  }

  /* ─── REPORT ─────────────────────────────────────────────── */
  if (state === 'report' && currentAudit) {
    const igUsername = currentAudit?.username || igAccount?.username || '';

    // Brief loading screen while re-fetching paid audit data
    if (paidLoading) {
      return (
        <PremiumLoadingScreen
          currentStepIndex={4}
          steps={LOADING_STEPS}
          username={igUsername}
        />
      );
    }

    const overallScore = currentAudit?.overall_score ?? 72;
    const erNum = parseFloat(String(currentAudit?.computed_metrics?.engagementRate || 0));
    const hookNum = currentAudit?.ai_analysis?.hook_avg_score ?? 6.3;
    const hashtagScore = currentAudit?.ai_analysis?.hashtag_score ?? 62;
    const auditDate = currentAudit?.created_at
      ? new Date(currentAudit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Recently';
    const followers = (currentAudit?.computed_metrics?.followers as number) || igAccount?.followers_count || 0;

    const rawFormatBreakdown = currentAudit?.computed_metrics?.formatBreakdown || {};
    const formats = Object.entries(rawFormatBreakdown) as [string, any][];
    const bestFormatEntry = [...formats].sort(([, a], [, b]) =>
      (parseFloat(b?.avgEngagementRate) || 0) - (parseFloat(a?.avgEngagementRate) || 0)
    )[0];
    const bestFormatKey = bestFormatEntry?.[0] || 'VIDEO';
    const bestFormatData = bestFormatEntry?.[1] as any;
    const formatEmoji = bestFormatKey === 'VIDEO' ? '🎬' : bestFormatKey === 'CAROUSEL_ALBUM' ? '🖼️' : '📸';
    let formatName = 'Reels';
    if (bestFormatKey === 'CAROUSEL_ALBUM') formatName = 'Carousels';
    else if (bestFormatKey === 'IMAGE') formatName = 'Photos';
    const formatAvgEr = parseFloat(bestFormatData?.avgEngagementRate || '0').toFixed(1);

    // FreeMetricsSection + PaidReport expect Record<string, number> (post counts per format)
    const formatBreakdownCounts: Record<string, number> = {};
    Object.entries(rawFormatBreakdown).forEach(([k, v]: [string, any]) => {
      formatBreakdownCounts[k] = typeof v === 'number' ? v : (v?.count ?? v?.postCount ?? 0);
    });

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
              HERO ROW — Score ring + 4 stat tiles
          ═══════════════════════════════════════ */}
          <div className="ov-fadein" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 28 }}>

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
              FREE METRICS — visible to all users
          ═══════════════════════════════════════ */}
          <div className="ov-fadein-1" style={{ marginBottom: 24 }}>
            <FreeMetricsSection
              engagementRate={erNum}
              benchmark="5.5"
              engagementVerdict={currentAudit?.ai_analysis?.engagement_verdict || ''}
              followers={followers}
              bestFormat={bestFormatKey}
              bestFormatReason={currentAudit?.ai_analysis?.best_format_reason || ''}
              formatBreakdown={formatBreakdownCounts}
              hookAvgScore={hookNum}
              estimatedReelMin={currentAudit?.ai_analysis?.estimated_rates?.reel?.min}
              estimatedReelMax={currentAudit?.ai_analysis?.estimated_rates?.reel?.max}
            />
          </div>

          {/* ═══════════════════════════════════════
              PAID REPORT or PAYWALL
          ═══════════════════════════════════════ */}
          {isPaid ? (
            <div className="ov-fadein-2">
              <PaidReport
                ai={currentAudit?.ai_analysis}
                m={{
                  bio: currentAudit?.computed_metrics?.bio || '',
                  formatBreakdown: formatBreakdownCounts,
                  engagementRate: erNum,
                  followers,
                  topHashtags: currentAudit?.computed_metrics?.topHashtags,
                  allPostsTimeline: currentAudit?.computed_metrics?.allPostsTimeline,
                }}
              />
            </div>
          ) : (
            <div className="ov-fadein-2">
              <PaywallTeaser
                username={igUsername}
                followers={followers}
                estimatedReelMin={currentAudit?.ai_analysis?.estimated_rates?.reel?.min}
                estimatedReelMax={currentAudit?.ai_analysis?.estimated_rates?.reel?.max}
                onUnlock={() => setShowPaymentModal(true)}
              />
            </div>
          )}

        </div>

        {/* ═══════════════════════════════════════
            PAYMENT MODAL OVERLAY
        ═══════════════════════════════════════ */}
        {showPaymentModal && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.78)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              padding: '24px',
              overflowY: 'auto',
            }}
            onClick={e => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}
          >
            <div style={{ width: '100%', maxWidth: 520, position: 'relative', margin: 'auto' }}>
              {/* Close button */}
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  position: 'absolute', top: -14, right: -14, zIndex: 10,
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(20,20,32,0.95)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.75)', fontSize: 20, lineHeight: 1,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-body)',
                }}
              >
                ×
              </button>
              <PaymentModal
                igUserId={currentAudit?.ig_user_id || igAccount?.ig_user_id || ''}
                auditId={currentAudit?.id || ''}
                username={igUsername}
                onSuccess={handlePaymentSuccess}
              />
            </div>
          </div>
        )}
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
                onClick={() => { setCurrentAudit(audit); setIsPaid(audit?.is_paid ?? false); setState('report'); }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = scoreDiff !== null && scoreDiff > 0 ? 'rgba(34,197,94,0.15)' : scoreDiff !== null && scoreDiff < 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {new Date(audit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {i === 0 && <span style={{ fontSize: 11, background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>Latest</span>}
                    {audit.is_paid && <span style={{ fontSize: 11, background: 'rgba(34,197,94,0.12)', color: '#4ade80', borderRadius: 6, padding: '2px 8px', fontWeight: 600, border: '1px solid rgba(34,197,94,0.2)' }}>Full Report</span>}
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

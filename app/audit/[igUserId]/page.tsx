'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ScoreRing from '@/components/ui/ScoreRing';
import MetricCard from '@/components/ui/MetricCard';
import BlurGate from '@/components/ui/BlurGate';
import ActionPlanCard from '@/components/audit/ActionPlanCard';
import PaymentModal from '@/components/audit/PaymentModal';
import HeatmapGrid from '@/components/audit/HeatmapGrid';
import { showToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import {
  BarChart2, AlertTriangle, Hash, Clock,
  Video, UserCheck, TrendingUp, Search, Type, DollarSign,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToastContainer from '@/components/ui/Toast';

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}
      >
        <Icon size={18} style={{ color: 'var(--brand-mid)' }} />
      </div>
      <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {children}
      </h2>
    </div>
  );
}

const MOCK_DATA = {
  id: 'mock-audit-id',
  username: 'fitlife.riya',
  is_paid: false,
  overall_score: 74,
  created_at: new Date().toISOString(),
  computed_metrics: {
    followers_count: 48500, media_count: 320,
    profile_picture_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop&q=80',
    engagement_rate: 3.1, benchmark_er: 2.5, niche: 'Fitness',
    bio_text: 'Fitness coach & athlete. Helping you build a strong mind and body.',
    has_link: true,
  },
  ai_analysis: {
    profile_completeness_score: 85,
    profile_keyword_verdict: "Your bio has no strong niche keyword — Instagram may struggle to categorise your account.",
    bio_rewrite: "Fitness Coach | Helping women build strength 💪\nOnline Training • Nutrition Plans • Motivation\nJoin 500+ transformed clients 👇",
    bio_rewrite_reason: "Added clear value proposition, authority signals, and a strong CTA.",
    top_post_format: 'Carousel',
    top_format_verdict: 'Your Workout Tip Carousels get 2.4× more saves than your Transformation Reels.',
    posting_frequency_score: 58,
    posting_frequency_verdict: 'You posted 2.3× per week over 90 days. 3–4 posts/week is optimal for your size.',
    best_posting_times: [{ day: 'Thursday', hour: 21, label: '9 PM' }, { day: 'Monday', hour: 19, label: '7 PM' }, { day: 'Sunday', hour: 10, label: '10 AM' }],
    heatmap_data: Array(7).fill(null).map(() => Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))),
    hook_avg_score: 7.2,
    weakest_hook_rewrite: 'The one mistake 90% of gym beginners make (and how to fix it today)',
    hashtag_score: 68,
    hashtag_verdict: 'Too many generic tags (#fitness). Switch to goldzone tags (100K–2M posts).',
    recommended_hashtags: ['#homeworkoutindia', '#fitnessmotivationhindi', '#indianfitness', '#weightlossindia', '#fitindian'],
    caption_seo_score: 60,
    alt_text_verdict: '0% of your last 20 posts use custom alt text. Missing out on SEO reach.',
    brand_readiness_score: 80,
    follower_quality_verdict: 'Healthy like-to-comment ratio indicates genuine audience engagement.',
    growth_trend: 'organic',
    growth_verdict: 'Steady organic growth with a slight plateau in the last 14 days.',
    link_in_bio_verdict: 'Link is present, but captions rarely direct traffic to it.',
    estimated_rates: {
      story: { min: 2500, max: 4000 },
      reel: { min: 8000, max: 15000 },
      carousel: { min: 6000, max: 10000 },
      monthly_package: { min: 30000, max: 50000 },
    },
    action_plan: [
      { rank: 1, impact: 'HIGH', problem: 'Your reach dropped 40% in the last 30 days', root_cause: 'You posted 0 Reels in week 3 — the algorithm deprioritised your account.', exact_fix: "Post 1 Reel this Thursday at 9 PM using the hook: 'The one mistake 90% of gym beginners make'.", expected_result: 'Reach recovery within 7–10 days based on your posting history.' },
      { rank: 2, impact: 'HIGH', problem: 'You are invisible in Instagram search', root_cause: 'Your bio lacks searchable keywords and you have 0% alt text usage.', exact_fix: 'Update your bio to the AI-suggested version and add custom alt text to every new post.', expected_result: 'Increased profile visits from Explore and Search.' },
      { rank: 3, impact: 'MEDIUM', problem: 'Low engagement on recent static posts', root_cause: 'Hashtags (#fitness, #gym) are over-saturated (500M+ posts).', exact_fix: 'Use the 5 suggested goldzone hashtags in your next 3 posts.', expected_result: '15–20% bump in non-follower reach per post.' },
    ],
  },
};

export default function AuditReportPage({ params }: { params: { igUserId: string } }) {
  const router = useRouter();
  const [data, setData] = useState<typeof MOCK_DATA | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        await new Promise((r) => setTimeout(r, 2800));
        setData(MOCK_DATA);
      } catch (err: any) {
        setError(err.message || 'Failed to load audit data');
        showToast('Error loading audit data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.igUserId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-14 flex flex-col items-center justify-center gap-6" style={{ background: 'var(--bg-base)' }}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center animate-glow"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            <svg className="animate-spin h-7 w-7" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="rgb(168,85,247)" strokeWidth="3" />
              <path className="opacity-75" fill="rgb(168,85,247)" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Analysing your Instagram…</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI is processing 22 metrics. This takes about 30 seconds.</p>
          </div>
          {/* Skeleton cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full px-5 mt-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center pt-14 px-5" style={{ background: 'var(--bg-base)' }}>
          <div className="card p-10 text-center max-w-md">
            <AlertTriangle size={40} className="mx-auto mb-4" style={{ color: 'var(--danger)' }} />
            <h2 className="text-xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>Audit Failed</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error || 'Could not generate your audit.'}</p>
            <button onClick={() => router.push('/audit')} className="btn btn-primary w-full h-11 rounded-xl font-semibold">Try Again</button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { is_paid, overall_score, computed_metrics: m, ai_analysis: ai } = data;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-24 pt-20" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-4xl mx-auto px-5 space-y-5">

          {/* Profile header */}
          <section className="card p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0" style={{ border: '2px solid var(--border-brand)' }}>
                  <Image src={m.profile_picture_url} alt={`@${data.username}`} fill className="object-cover" />
                </div>
                <div>
                  <h1 className="text-2xl font-black mb-0.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    @{data.username}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {m.followers_count.toLocaleString()} followers · {m.media_count} posts · {m.niche}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Audited {formatDate(data.created_at)}</p>
                </div>
              </div>
              <ScoreRing score={overall_score} size={96} strokeWidth={7} label="Health" />
            </div>
          </section>

          {/* Free metrics */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="Engagement Rate" icon={BarChart2} value={`${m.engagement_rate}%`}
              benchmark={m.benchmark_er} benchmarkLabel={`Niche avg: ${m.benchmark_er}%`}
              verdict={`${m.engagement_rate > m.benchmark_er ? '↑ Above' : '↓ Below'} the ${m.benchmark_er}% benchmark`}
              color={m.engagement_rate >= m.benchmark_er ? 'var(--success)' : 'var(--danger)'} accentBorder />
            <MetricCard title="Profile Completeness" icon={UserCheck} value={`${ai.profile_completeness_score}/100`}
              score={ai.profile_completeness_score} verdict={ai.profile_keyword_verdict} />
            <MetricCard title="Top Post Format" icon={Video} value={ai.top_post_format} verdict={ai.top_format_verdict} />
          </section>

          {/* Paywall */}
          {!is_paid && (
            <div id="paywall-block">
              <PaymentModal igUserId={params.igUserId} auditId={data.id} username={data.username}
                onSuccess={() => setData({ ...data, is_paid: true })} />
            </div>
          )}

          {/* Paid content */}
          <BlurGate isPaid={is_paid} onUnlock={() => document.getElementById('paywall-block')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="space-y-10">

              {/* Content Intel */}
              <section>
                <SectionTitle icon={Clock}>Content Intelligence</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-6 md:col-span-2">
                    <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Best Time to Post</h3>
                    <p className="text-xs mb-5" style={{ color: 'var(--text-tertiary)' }}>Based on your audience online activity</p>
                    <HeatmapGrid data={ai.heatmap_data} highlightSlots={ai.best_posting_times} />
                    <div className="mt-5 pt-4 text-sm" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>AI Recommendation: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Post on {ai.best_posting_times.map((t: any) => `${t.day} at ${t.label}`).join(', ')}.
                      </span>
                    </div>
                  </div>
                  <MetricCard title="Posting Frequency" icon={Clock} value={`${ai.posting_frequency_score}/100`}
                    score={ai.posting_frequency_score} verdict={ai.posting_frequency_verdict} />
                  <MetricCard title="Follower Growth" icon={TrendingUp} value={ai.growth_trend.charAt(0).toUpperCase() + ai.growth_trend.slice(1)}
                    verdict={ai.growth_verdict} color="var(--success)" />
                </div>
              </section>

              {/* Profile & SEO */}
              <section>
                <SectionTitle icon={Search}>Profile & SEO Health</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bio comparison */}
                  <div className="card p-6 md:col-span-2">
                    <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-secondary)' }}>Bio Optimisation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl text-sm whitespace-pre-wrap" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)', border: '1px solid var(--border)', textDecoration: 'line-through' }}>
                        <div className="text-xs uppercase tracking-wider mb-2.5 font-semibold" style={{ textDecoration: 'none', color: 'var(--text-tertiary)' }}>Current Bio</div>
                        {m.bio_text}
                      </div>
                      <div className="p-4 rounded-xl text-sm whitespace-pre-wrap" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.25)', color: 'var(--text-primary)' }}>
                        <div className="text-xs uppercase tracking-wider mb-2.5 font-bold" style={{ color: 'var(--brand-mid)' }}>AI Rewrite Suggestion</div>
                        {ai.bio_rewrite}
                      </div>
                    </div>
                    <p className="text-xs mt-3 italic" style={{ color: 'var(--text-tertiary)' }}>Reason: {ai.bio_rewrite_reason}</p>
                  </div>
                  <MetricCard title="Caption SEO Score" icon={Type} value={`${ai.caption_seo_score}/100`} score={ai.caption_seo_score} verdict={ai.alt_text_verdict} />
                  <MetricCard title="Hook Quality" icon={Hash} value={`${ai.hook_avg_score}/10`} score={ai.hook_avg_score * 10} verdict={`Rewrite suggestion: "${ai.weakest_hook_rewrite}"`} />
                </div>
              </section>

              {/* Hashtags & Monetisation */}
              <section>
                <SectionTitle icon={DollarSign}>Hashtags & Monetisation</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-6">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Hashtag Strategy</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-black text-gradient" style={{ fontSize: 40, letterSpacing: '-0.05em', lineHeight: 1 }}>{ai.hashtag_score}</span>
                      <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>/ 100</span>
                    </div>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{ai.hashtag_verdict}</p>
                    <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Suggested Goldzone Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {ai.recommended_hashtags.map((tag: string) => (
                        <span key={tag} className="badge badge-brand">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="card p-6">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Estimated Rate Card</h3>
                    <div className="space-y-3">
                      {[
                        { label: '1 Instagram Story', rates: ai.estimated_rates.story },
                        { label: '1 Dedicated Reel', rates: ai.estimated_rates.reel },
                        { label: '1 Carousel Post', rates: ai.estimated_rates.carousel },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center text-sm pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                          <span className="font-bold font-mono" style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                            ₹{item.rates.min.toLocaleString()} – ₹{item.rates.max.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center text-sm pt-1">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>30-Day Retainer</span>
                        <span className="font-black font-mono text-gradient" style={{ fontSize: 13 }}>
                          ₹{ai.estimated_rates.monthly_package.min.toLocaleString()} – ₹{ai.estimated_rates.monthly_package.max.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Plan */}
              <section className="pt-8" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="text-center mb-10">
                  <p className="eyebrow mb-3">Your Plan</p>
                  <h2 className="font-black mb-3" style={{ fontSize: 'clamp(24px, 4vw, 40px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                    Your personalised action plan
                  </h2>
                  <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    These 3 things will have the highest impact right now. Execute them this week.
                  </p>
                </div>
                <div className="space-y-4">
                  {ai.action_plan.map((action: any) => (
                    <ActionPlanCard key={action.rank} rank={action.rank} impact={action.impact}
                      problem={action.problem} rootCause={action.root_cause}
                      exactFix={action.exact_fix} expectedResult={action.expected_result} />
                  ))}
                </div>
              </section>
            </div>
          </BlurGate>
        </div>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}

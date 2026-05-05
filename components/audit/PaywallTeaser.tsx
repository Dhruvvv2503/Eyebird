'use client';

import { Lock, ArrowRight } from 'lucide-react';

interface PaywallTeaserProps {
  username: string;
  followers: number;
  estimatedReelMin?: number;
  estimatedReelMax?: number;
  onUnlock: () => void;
}

const LOCKED_PREVIEWS = [
  { emoji: '⏰', label: 'Best time to post', hint: 'We analyzed 90 days of data — it\'s not what you\'d guess' },
  { emoji: '📉', label: '3 growth leaks killing your reach', hint: 'With exact, week-by-week action steps to fix each one' },
  { emoji: '#️⃣', label: '22 niche-matched hashtags', hint: 'Not generic. Pulled from accounts like yours that are growing' },
  { emoji: '💰', label: 'Your full brand rate card', hint: 'Story, Reel, Carousel + monthly retainer in INR' },
  { emoji: '✍️', label: 'AI-rewritten bio', hint: 'A version that converts visitors into followers' },
  { emoji: '🎯', label: 'Your weakest hook — rewritten', hint: 'The one caption that\'s losing you the most viewers' },
];

export default function PaywallTeaser({ username, followers, estimatedReelMin, estimatedReelMax, onUnlock }: PaywallTeaserProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div className="px-6 pt-7 pb-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(168,85,247,0.7)' }}>
          What's waiting for you
        </p>
        <h2 className="text-xl font-black mb-2 tracking-tight text-white">
          Your full playbook is ready. Just needs one click.
        </h2>
        {estimatedReelMin && estimatedReelMax && (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Based on your data, brands in your niche pay{' '}
            <span className="font-bold text-white">₹{estimatedReelMin.toLocaleString()}–₹{estimatedReelMax.toLocaleString()} per Reel</span>.
            {' '}We've calculated your exact rate card inside.
          </p>
        )}
      </div>

      {/* Locked list */}
      <div className="px-6 pb-5 space-y-3">
        {LOCKED_PREVIEWS.map((item, i) => (
          <div key={i} className="flex items-start gap-4 p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-xl shrink-0 mt-0.5">{item.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white mb-0.5 flex items-center gap-2">
                {item.label}
                <Lock size={11} style={{ color: 'rgba(168,85,247,0.6)' }} />
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-7">
        <button
          onClick={onUnlock}
          className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}
        >
          Unlock full report for ₹99
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

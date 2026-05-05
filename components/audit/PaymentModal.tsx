'use client';

import { useState } from 'react';
import { isValidEmail } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';
import { ShieldCheck, Clock, Zap } from 'lucide-react';

interface PaymentModalProps {
  igUserId: string;
  auditId: string;
  username: string;
  onSuccess: () => void;
}

const DISPLAY_PRICE = 99;
const ORIGINAL_PRICE = 299;

const LOCKED_ITEMS = [
  'Your exact best time to post (we found the golden window)',
  'Your 3 biggest growth leaks — and the exact fix for each',
  '22 hashtags matched to your niche and audience',
  'Your full brand rate card: Story, Reel, Carousel + retainer',
  'AI-rewritten bio that turns visitors into followers',
  'Your weakest hook — rewritten to stop the scroll',
];

export default function PaymentModal({ igUserId, auditId, username, onSuccess }: PaymentModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRazorpay = (): Promise<boolean> => new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const handlePay = async () => {
    if (!isValidEmail(email)) { showToast('Please enter a valid email address.', 'error'); return; }
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { showToast('Could not load payment gateway. Check your connection.', 'error'); setLoading(false); return; }

      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId, email }),
      });

      if (!orderRes.ok) { showToast('Payment could not start. Please try again.', 'error'); setLoading(false); return; }
      const { orderId, keyId, amount } = await orderRes.json();

      const rzp = new (window as any).Razorpay({
        key: keyId,
        amount,
        currency: 'INR',
        order_id: orderId,
        name: 'Eyebird',
        description: `Full Audit Report — @${username}`,
        prefill: { email },
        theme: { color: '#A855F7' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                igUserId, auditId, email,
              }),
            });
            if (verifyRes.ok) {
              showToast('🎉 Report unlocked! PDF sent to your email.', 'success');
              onSuccess();
            } else {
              showToast("Couldn't verify payment. Email support@eyebird.in if charged.", 'error');
            }
          } catch {
            showToast('Verification error. Contact support@eyebird.in if charged.', 'error');
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl" style={{ background: '#0d0d0d', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 0 80px rgba(168,85,247,0.15)' }}>
      
      {/* Top gradient bar */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7C3AED, #A855F7, #EC4899)' }} />

      <div className="p-7 md:p-9">
        {/* Urgency Banner */}
        <div className="flex items-center gap-2 mb-7 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Clock size={14} className="text-red-400 shrink-0" />
          <p className="text-sm font-semibold text-red-400">Launch Offer — Ends Soon. Price goes to ₹299.</p>
        </div>

        {/* Locked items */}
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(168,85,247,0.8)' }}>What you unlock right now</p>
        <div className="space-y-2.5 mb-8">
          {LOCKED_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <Zap size={14} className="mt-0.5 shrink-0 text-purple-400" />
              <p className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>{item}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="flex items-end gap-4 mb-1">
          <span className="text-lg line-through font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>₹{ORIGINAL_PRICE}</span>
          <div className="flex items-baseline gap-2">
            <span className="font-black" style={{ fontSize: 56, letterSpacing: '-0.05em', lineHeight: 1, background: 'linear-gradient(135deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ₹{DISPLAY_PRICE}
            </span>
          </div>
          <span className="mb-2 text-sm font-bold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>66% off</span>
        </div>
        <p className="text-xs mb-7" style={{ color: 'rgba(255,255,255,0.35)' }}>One-time payment. No subscription. Instant PDF delivery.</p>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Where should we send your full report?
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-12 px-4 rounded-xl text-sm font-medium outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(168,85,247,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>

        {/* CTA Button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full h-14 rounded-xl font-bold text-base text-white transition-all duration-200"
          style={{ background: loading ? 'rgba(168,85,247,0.5)' : 'linear-gradient(135deg, #7C3AED, #A855F7, #EC4899)', boxShadow: loading ? 'none' : '0 8px 32px rgba(168,85,247,0.4)', letterSpacing: '-0.01em' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Processing...
            </span>
          ) : 'Yes, Show Me Everything →'}
        </button>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-5 mt-5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Secure via Razorpay</span>
          </div>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Instant PDF delivery</span>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>One-time only</span>
        </div>

      </div>
    </div>
  );
}

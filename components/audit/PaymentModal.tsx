'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Check, X, Tag } from 'lucide-react';
import { isValidEmail } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';

interface PaymentModalProps {
  igUserId: string;
  auditId: string;
  username: string;
  onSuccess: () => void;
}

const LOCKED_ITEMS = [
  { emoji: '⚡', title: 'Your exact best time to post', desc: "We analysed 90 days of data — it's not what you'd guess" },
  { emoji: '📉', title: '3 growth leaks killing your reach', desc: 'With exact, week-by-week action steps to fix each one' },
  { emoji: '#️⃣', title: '22 niche-matched hashtags', desc: 'Not generic. Pulled from accounts like yours that are growing' },
  { emoji: '💰', title: 'Your full brand rate card', desc: 'Story, Reel, Carousel + monthly retainer in INR' },
  { emoji: '✏️', title: 'AI-rewritten bio', desc: 'A version that converts visitors into followers' },
  { emoji: '🔁', title: 'Your weakest hook — rewritten', desc: "The one caption that's losing you the most viewers" },
];

export default function PaymentModal({ igUserId, auditId, username, onSuccess }: PaymentModalProps) {
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('LAUNCH');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [promoShake, setPromoShake] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Always ₹99 — launch price. Promo kept as UX element.
  const displayAmount = 99;
  const originalAmount = 299;

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError(false);
    setPromoApplied(false);
    try {
      const res = await fetch('/api/payment/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim().toUpperCase(), baseAmount: originalAmount }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoApplied(true);
      } else {
        setPromoError(true);
        setPromoShake(true);
        setTimeout(() => setPromoShake(false), 500);
      }
    } catch {
      setPromoError(true);
    } finally {
      setPromoLoading(false);
    }
  };

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
        key: keyId, amount, currency: 'INR', order_id: orderId,
        name: 'Eyebird', description: `Full Audit Report — @${username}`,
        prefill: { email }, theme: { color: '#A855F7' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                igUserId, auditId, email,
              }),
            });
            if (verifyRes.ok) { showToast('🎉 Report unlocked! Check your email for the PDF.', 'success'); onSuccess(); }
            else showToast("Couldn't verify payment. Email support@eyebird.in if charged.", 'error');
          } catch { showToast('Verification error. Contact support@eyebird.in if charged.', 'error'); }
          finally { setLoading(false); }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch { showToast('Something went wrong. Please try again.', 'error'); setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: '2px solid var(--border-brand)',
        boxShadow: '0 0 40px rgba(168,85,247,0.18), var(--shadow-xl)',
      }}
    >
      {/* Top accent bar */}
      <div className="h-1" style={{ background: 'var(--gradient-brand)' }} />

      <div className="p-6 md:p-8">

        {/* Header */}
        <h2 className="text-xl font-black mb-1 tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Your full playbook is ready.
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Just needs one click. Brands in your niche pay ₹1,500–₹3,000 per Reel. Your exact rate card is inside.
        </p>

        {/* Locked items */}
        <div className="rounded-xl overflow-hidden mb-6" style={{ border: '1px solid var(--border)' }}>
          {LOCKED_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3"
              style={{ borderBottom: i < LOCKED_ITEMS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
            >
              <span className="text-lg shrink-0 mt-0.5">{item.emoji}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-divider mb-6" />

        {/* Urgency */}
        <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}>
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: 'var(--danger)', boxShadow: '0 0 6px var(--danger)', animation: 'pulse-glow 2s infinite' }}
          />
          <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
            🚨 Launch Offer — Ends Soon. Price goes to ₹299.
          </p>
        </div>

        {/* Price */}
        <div className="flex items-end gap-3 mb-1">
          <span className="text-xl line-through font-medium" style={{ color: 'var(--text-tertiary)' }}>₹{originalAmount}</span>
          <span
            className="font-black"
            style={{ fontSize: 52, letterSpacing: '-0.05em', lineHeight: 1, background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            ₹{displayAmount}
          </span>
          <span className="mb-1.5 badge badge-success">66% off</span>
        </div>
        <p className="text-xs mb-6" style={{ color: 'var(--text-tertiary)' }}>
          One-time payment · Instant PDF delivery · No subscription
        </p>

        {/* Promo code */}
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            Have a promo code?
          </label>
          <div className={`flex gap-2 ${promoShake ? 'animate-shake' : ''}`}>
            <div className="relative flex-1">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                value={promoCode}
                onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoApplied(false); setPromoError(false); }}
                onKeyDown={e => e.key === 'Enter' && handleValidatePromo()}
                placeholder="LAUNCH"
                className="input pl-8 font-mono uppercase text-sm"
                style={{
                  borderColor: promoApplied ? 'var(--success)' : promoError ? 'var(--danger)' : undefined,
                }}
              />
              {promoApplied && (
                <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--success)' }} />
              )}
              {promoError && (
                <X size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--danger)' }} />
              )}
            </div>
            <button
              onClick={handleValidatePromo}
              disabled={promoLoading || !promoCode.trim()}
              className="btn btn-secondary text-sm px-5 rounded-xl shrink-0"
            >
              {promoLoading ? '…' : 'Apply'}
            </button>
          </div>
          {promoApplied && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--success)' }}>✓ ₹200 off applied!</p>
          )}
          {promoError && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>Invalid code. Try LAUNCH.</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            Where should we send your full report?
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input text-sm"
            style={{ height: 48 }}
          />
        </div>

        {/* CTA */}
        <motion.button
          onClick={handlePay}
          disabled={loading || !email}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="btn btn-primary w-full font-bold"
          style={{ height: 56, fontSize: 15, borderRadius: 'var(--r-xl)' }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Processing payment...
            </span>
          ) : 'Yes, Show Me Everything →'}
        </motion.button>

        {/* Trust */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Secure via Razorpay</span>
          </div>
          <span className="text-xs" style={{ color: 'var(--border-bright)' }}>·</span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Instant PDF delivery</span>
          <span className="text-xs" style={{ color: 'var(--border-bright)' }}>·</span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>One-time only</span>
        </div>

      </div>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { Check, X, Tag } from 'lucide-react';
import { isValidEmail } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';

interface PromoResult { valid: boolean; discountAmount?: number; finalAmount?: number; message?: string; }
interface PaymentModalProps { igUserId: string; auditId: string; username: string; onSuccess: () => void; }

export default function PaymentModal({ igUserId, auditId, username, onSuccess }: PaymentModalProps) {
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoShake, setPromoShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const baseAmount = 29900;
  const finalAmount = promoResult?.valid ? (promoResult.finalAmount || 0) * 100 : baseAmount;
  const displayAmount = finalAmount / 100;

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await fetch('/api/payment/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim().toUpperCase(), baseAmount: baseAmount / 100 }),
      });
      const data = await res.json();
      setPromoResult(data);
      if (!data.valid) { setPromoShake(true); setTimeout(() => setPromoShake(false), 500); }
    } catch {
      setPromoResult({ valid: false, message: 'Could not validate. Try again.' });
    } finally { setPromoLoading(false); }
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
        body: JSON.stringify({ amount: finalAmount, igUserId, email, promoCode: promoResult?.valid ? promoCode.trim().toUpperCase() : undefined }),
      });
      if (!orderRes.ok) { showToast('Payment could not start. Please try again.', 'error'); setLoading(false); return; }
      const { orderId, keyId } = await orderRes.json();
      const rzp = new (window as any).Razorpay({
        key: keyId, amount: finalAmount, currency: 'INR', order_id: orderId,
        name: 'Eyebird', description: `Instagram Audit — @${username}`,
        prefill: { email }, theme: { color: '#A855F7' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature, igUserId, auditId, email, promoCode: promoResult?.valid ? promoCode.trim().toUpperCase() : undefined }),
            });
            if (verifyRes.ok) { showToast('🎉 Report unlocked! PDF sent to your email.', 'success'); onSuccess(); }
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
    <div className="card p-8" style={{ border: '1px solid var(--border-brand)', boxShadow: '0 0 60px rgba(168,85,247,0.12)' }}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-7">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}
        >
          <span style={{ fontSize: 18 }}>🔓</span>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Unlock Full Audit Report
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            You&apos;re seeing 3 of 22 insights. Unlock all — best posting times, hook scores, hashtags, rate card & your personalised action plan.
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-xl line-through" style={{ color: 'var(--text-tertiary)' }}>₹299</span>
        <span className="font-black text-gradient" style={{ fontSize: 48, letterSpacing: '-0.05em', lineHeight: 1 }}>
          ₹{displayAmount}
        </span>
        {promoResult?.valid && (
          <span className="badge badge-success">You save ₹{299 - displayAmount}!</span>
        )}
      </div>
      {!promoResult?.valid && (
        <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
          Use code <span className="font-bold font-mono" style={{ color: 'var(--brand-mid)' }}>LAUNCH</span> to pay just ₹99
        </p>
      )}

      {/* Promo */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Promo Code</label>
        <div className={`flex gap-2 ${promoShake ? 'animate-shake' : ''}`}>
          <div className="relative flex-1">
            <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text" value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleValidatePromo()}
              placeholder="LAUNCH" className="input pl-8 font-mono uppercase"
              style={{ borderColor: promoResult?.valid === true ? 'var(--success)' : promoResult?.valid === false ? 'var(--danger)' : undefined }}
            />
          </div>
          <button onClick={handleValidatePromo} disabled={promoLoading || !promoCode.trim()} className="btn btn-secondary text-sm px-5 rounded-lg font-semibold shrink-0">
            {promoLoading ? '…' : 'Apply'}
          </button>
        </div>
        {promoResult && (
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium" style={{ color: promoResult.valid ? 'var(--success)' : 'var(--danger)' }}>
            {promoResult.valid ? <Check size={12} /> : <X size={12} />}
            {promoResult.message}
          </div>
        )}
      </div>

      {/* Email */}
      <div className="mb-6">
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
          Email — we&apos;ll send your PDF report here
        </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
      </div>

      {/* Pay button */}
      <button onClick={handlePay} disabled={loading} className="btn btn-primary w-full h-12 rounded-xl text-sm font-bold">
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing…
          </span>
        ) : `Unlock Full Report — ₹${displayAmount} →`}
      </button>
      <p className="text-center text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>
        One-time payment · Secure via Razorpay · No subscription
      </p>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Mail, ArrowRight, Loader2, Tag, CheckCircle2, X } from 'lucide-react';
import { isValidEmail } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';

interface PaymentModalProps {
  igUserId: string;
  auditId: string;
  username: string;
  onSuccess: () => void;
}

const MRP = 299;       // ₹ — crossed-out price always shown
const BASE_PRICE = 99; // ₹ — selling price promo codes apply on
const BASE_PAISE = 9900;

const FEATURES = [
  { emoji: '⚡', title: 'Best time to post', desc: "Your audience's real activity window" },
  { emoji: '📉', title: '3 growth leaks', desc: 'Week-by-week fixes, ranked by impact' },
  { emoji: '#️⃣', title: '22 goldzone hashtags', desc: 'Niche-matched. Not generic.' },
  { emoji: '💰', title: 'Your brand rate card', desc: 'Story, Reel, Carousel — in INR' },
  { emoji: '✏️', title: 'AI-rewritten bio', desc: 'Converts visitors into followers' },
  { emoji: '🔁', title: 'Weakest hook rewritten', desc: 'The one losing you the most viewers' },
];

declare global {
  interface Window { Razorpay: any; }
}

export default function PaymentModal({ igUserId, auditId, username, onSuccess }: PaymentModalProps) {
  const [email, setEmail] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoState, setPromoState] = useState<{
    applied: boolean;
    code: string;
    discountLabel: string;
    finalAmount: number; // paise
    isFree: boolean;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rzpReady, setRzpReady] = useState(false);

  // Inject Razorpay script
  useEffect(() => {
    if (window.Razorpay) { setRzpReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRzpReady(true);
    document.body.appendChild(script);
  }, []);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true); setPromoError('');
    try {
      const res = await fetch('/api/payment/validate-promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoState({ applied: true, code: data.code, discountLabel: data.discountLabel, finalAmount: data.finalAmount, isFree: data.isFree });
        showToast(`✅ Promo applied — ${data.discountLabel}!`, 'success');
      } else {
        setPromoError(data.error || 'Invalid promo code');
        setPromoState(null);
      }
    } catch { setPromoError('Could not validate promo. Try again.'); }
    finally { setPromoLoading(false); }
  };

  const removePromo = () => { setPromoState(null); setPromoInput(''); setPromoError(''); };

  /* ── Bypass (free after promo) ── */
  const handleBypass = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/bypass', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId, auditId, email, promoCode: promoState?.code }),
      });
      if (!res.ok) throw new Error('Bypass failed');
      showToast('🎉 Full report unlocked!', 'success');
      onSuccess();
    } catch { showToast('Something went wrong. Please try again.', 'error'); }
    finally { setLoading(false); }
  };

  /* ── Razorpay full payment ── */
  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const finalPaise = promoState ? promoState.finalAmount : BASE_PAISE;
      const res = await fetch('/api/payment/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId, email, amount: finalPaise }),
      });
      if (!res.ok) throw new Error('Order creation failed');
      const { orderId, amount, currency, keyId } = await res.json();

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: 'Eyebird',
        description: `Full Audit Report — @${username}`,
        prefill: { email },
        theme: { color: '#A855F7' },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                igUserId, auditId, email,
                promoCode: promoState?.code || null,
                amount: finalPaise,
              }),
            });
            if (!verifyRes.ok) throw new Error('Verification failed');
            showToast('🎉 Payment successful! Full report unlocked.', 'success');
            onSuccess();
          } catch {
            showToast('Payment received but verification failed. Contact support.', 'error');
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err: any) {
      showToast(err.message || 'Payment failed. Please try again.', 'error');
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!isValidEmail(email)) { showToast('Please enter a valid email address.', 'error'); return; }
    if (promoState?.isFree) { await handleBypass(); return; }
    if (!rzpReady) { showToast('Payment system loading, please wait…', 'info'); return; }
    await handleRazorpay();
  };

  const finalPaise = promoState ? promoState.finalAmount : BASE_PAISE;
  const finalPrice = Math.round(finalPaise / 100);
  const isFree = promoState?.isFree ?? false;
  const hasDiscount = promoState?.applied && !isFree;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'relative' }}
    >
      {/* Outer glow */}
      <div style={{ position: 'absolute', inset: -1, borderRadius: 24, background: 'linear-gradient(135deg,rgba(168,85,247,0.5),rgba(255,62,128,0.3),rgba(124,58,237,0.4))', filter: 'blur(8px)', opacity: 0.6, pointerEvents: 'none' }} />

      {/* Main card */}
      <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid rgba(168,85,247,0.25)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#FF3E80,#A855F7,#7C3AED)' }} />

        <div style={{ padding: '28px 28px 24px' }}>

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 8px var(--danger)', animation: 'pulse-glow 2s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--danger)' }}>Launch offer — limited time</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 6 }}>Your full playbook is ready.</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Brands in your niche pay ₹1,500–₹3,000 per Reel. Your exact rate card is one click away.</p>
          </div>

          {/* Features grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 20 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.3 }}
                style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{f.emoji}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

          {/* Price block */}
          <div style={{ marginBottom: 18 }}>
            {isFree ? (
              /* Promo makes it 100% free */
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', background: 'linear-gradient(135deg,#22C55E,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Free</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>₹{MRP}</span>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)', letterSpacing: '0.04em' }}>100% OFF</span>
              </div>
            ) : (
              /* Normal: show MRP strikethrough + 67% off + selling price + optional promo */
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Actual price */}
                <span style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em', color: 'white', lineHeight: 1 }}>₹{finalPrice}</span>
                {/* MRP strikethrough */}
                <span style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>₹{MRP}</span>
                {/* 67% off — always visible */}
                <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: 'rgba(255,62,128,0.12)', color: '#FF3E80', border: '1px solid rgba(255,62,128,0.25)', letterSpacing: '0.04em' }}>67% OFF</span>
                {/* Extra promo badge when code applied */}
                {promoState?.applied && (
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: 'rgba(168,85,247,0.12)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.25)', letterSpacing: '0.04em' }}>
                    +{promoState.discountLabel}
                  </span>
                )}
              </div>
            )}
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>
              {isFree ? 'Free with your promo code · Full report included' : 'One-time payment · Instant access · No subscription'}
            </p>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Where should we send your full report?</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePay()} placeholder="your@email.com" className="input"
                style={{ height: 46, paddingLeft: 38, fontSize: 14, width: '100%', boxSizing: 'border-box', borderRadius: 12 }} />
            </div>
          </div>

          {/* Promo code */}
          <div style={{ marginBottom: 18 }}>
            {promoState?.applied ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle2 size={15} style={{ color: '#22C55E', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#22C55E', flex: 1 }}>"{promoState.code}" — {promoState.discountLabel}</span>
                <button onClick={removePromo} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Tag size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                  <input value={promoInput} onChange={e => setPromoInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && applyPromo()} placeholder="Have a promo code?" className="input"
                    style={{ height: 42, paddingLeft: 34, fontSize: 13, width: '100%', boxSizing: 'border-box', borderRadius: 10 }} />
                </div>
                <button onClick={applyPromo} disabled={promoLoading || !promoInput.trim()}
                  style={{ height: 42, padding: '0 16px', borderRadius: 10, border: 'none', background: promoLoading || !promoInput.trim() ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.15)', color: '#A855F7', fontSize: 13, fontWeight: 700, cursor: promoLoading || !promoInput.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {promoLoading ? <Loader2 size={13} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
            )}
            {promoError && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>{promoError}</p>}
          </div>

          {/* CTA */}
          <motion.button
            onClick={handlePay}
            disabled={loading || !email}
            whileHover={loading || !email ? {} : { scale: 1.01, boxShadow: '0 8px 32px rgba(168,85,247,0.4)' }}
            whileTap={loading || !email ? {} : { scale: 0.99 }}
            style={{
              width: '100%', height: 54, borderRadius: 14, border: 'none',
              cursor: loading || !email ? 'not-allowed' : 'pointer',
              background: loading || !email ? 'rgba(168,85,247,0.3)' : 'linear-gradient(135deg,#FF3E80,#A855F7,#7C3AED)',
              color: 'white', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 16, transition: 'background 0.3s ease',
              boxShadow: loading || !email ? 'none' : '0 4px 20px rgba(168,85,247,0.35)',
            }}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" />{isFree ? 'Unlocking…' : 'Processing payment…'}</>
            ) : (
              <>{isFree ? 'Unlock Full Report Free' : `Pay ₹${finalPrice} & Unlock Report`}<ArrowRight size={16} /></>
            )}
          </motion.button>

          {/* Trust row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><ShieldCheck size={12} style={{ color: 'var(--text-tertiary)' }} /><span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Secure payment</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={12} style={{ color: 'var(--text-tertiary)' }} /><span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Instant access</span></div>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Powered by Razorpay</span>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

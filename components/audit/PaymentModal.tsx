'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Clock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { isValidEmail } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';

interface PaymentModalProps {
  igUserId: string;
  auditId: string;
  username: string;
  onSuccess: () => void;
}

const FEATURES = [
  { emoji: '⚡', title: 'Best time to post', desc: 'Your audience\'s real activity window' },
  { emoji: '📉', title: '3 growth leaks', desc: 'Week-by-week fixes, ranked by impact' },
  { emoji: '#️⃣', title: '22 goldzone hashtags', desc: 'Niche-matched. Not generic.' },
  { emoji: '💰', title: 'Your brand rate card', desc: 'Story, Reel, Carousel — in INR' },
  { emoji: '✏️', title: 'AI-rewritten bio', desc: 'Converts visitors into followers' },
  { emoji: '🔁', title: 'Weakest hook rewritten', desc: 'The one losing you the most viewers' },
];

const loadRazorpay = (): Promise<boolean> => new Promise((resolve) => {
  if ((window as any).Razorpay) { resolve(true); return; }
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

export default function PaymentModal({ igUserId, auditId, username, onSuccess }: PaymentModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        showToast('Could not load payment gateway. Check your connection.', 'error');
        setLoading(false);
        return;
      }

      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igUserId, email }),
      });

      if (!orderRes.ok) {
        showToast('Payment could not start. Please try again.', 'error');
        setLoading(false);
        return;
      }

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
                igUserId,
                auditId,
                email,
              }),
            });
            if (verifyRes.ok) {
              showToast('🎉 Report unlocked! Check your email for the PDF.', 'success');
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
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'relative' }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: 'absolute', inset: -1,
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(168,85,247,0.5) 0%, rgba(255,62,128,0.3) 50%, rgba(124,58,237,0.4) 100%)',
          filter: 'blur(8px)',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Main card */}
      <div
        style={{
          position: 'relative',
          borderRadius: 22,
          overflow: 'hidden',
          background: 'var(--bg-surface)',
          border: '1px solid rgba(168,85,247,0.25)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Brand gradient line */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, #FF3E80 0%, #A855F7 50%, #7C3AED 100%)' }} />

        <div style={{ padding: '28px 28px 24px' }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--danger)',
                  boxShadow: '0 0 8px var(--danger)',
                  animation: 'pulse-glow 2s infinite',
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--danger)' }}>
                Launch offer — ends soon
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 6 }}>
              Your full playbook is ready.
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Brands in your niche pay ₹1,500–₹3,000 per Reel. Your exact rate card is one click away.
            </p>
          </div>

          {/* Feature 2×3 grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
              marginBottom: 24,
            }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{f.emoji}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.title}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

          {/* Price block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>₹299</span>
            <span
              style={{
                fontSize: 52, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1,
                background: 'linear-gradient(135deg, #FF3E80 0%, #A855F7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ₹99
            </span>
            <span
              style={{
                fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 99,
                background: 'rgba(34,197,94,0.12)',
                color: 'var(--success)',
                border: '1px solid rgba(34,197,94,0.25)',
                letterSpacing: '0.04em',
              }}
            >
              66% OFF
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 22 }}>
            One-time payment · Instant PDF delivery · No subscription
          </p>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Where should we send your full report?
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={14}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePay()}
                placeholder="your@email.com"
                className="input"
                style={{
                  height: 48,
                  paddingLeft: 38,
                  fontSize: 14,
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: 12,
                }}
              />
            </div>
          </div>

          {/* CTA */}
          <motion.button
            onClick={handlePay}
            disabled={loading || !email}
            whileHover={loading || !email ? {} : { scale: 1.01, boxShadow: '0 8px 32px rgba(168,85,247,0.4)' }}
            whileTap={loading || !email ? {} : { scale: 0.99 }}
            style={{
              width: '100%',
              height: 54,
              borderRadius: 14,
              border: 'none',
              cursor: loading || !email ? 'not-allowed' : 'pointer',
              background: loading || !email
                ? 'rgba(168,85,247,0.3)'
                : 'linear-gradient(135deg, #FF3E80 0%, #A855F7 50%, #7C3AED 100%)',
              color: 'white',
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 16,
              transition: 'background 0.3s ease',
              boxShadow: loading || !email ? 'none' : '0 4px 20px rgba(168,85,247,0.35)',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing payment...
              </>
            ) : (
              <>
                Yes, Show Me Everything
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>

          {/* Trust row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <ShieldCheck size={12} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Secure via Razorpay</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Instant delivery</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>One-time only</span>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

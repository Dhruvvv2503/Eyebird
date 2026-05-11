'use client';

import { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const ORIGINAL_PRICE = 79900; // ₹799 in paise

function displayPrice(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`;
}

export default function UpgradeModal({ isOpen, onClose, onSuccess, userEmail }: Props) {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(ORIGINAL_PRICE);
  const [loading, setLoading] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPromoCode('');
      setPromoApplied(false);
      setPromoError('');
      setDiscount(0);
      setFinalAmount(ORIGINAL_PRICE);
      setLoading(false);
      setSuccessMsg('');
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function resetPromo() {
    setPromoApplied(false);
    setPromoCode('');
    setDiscount(0);
    setFinalAmount(ORIGINAL_PRICE);
    setPromoError('');
  }

  async function validatePromo() {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setPromoError('');
    try {
      const res = await fetch('/api/payment/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), amount: ORIGINAL_PRICE }),
      });
      const data = await res.json();
      if (!data.valid) {
        setPromoError(data.error || 'Invalid promo code');
        setPromoApplied(false);
        return;
      }
      setDiscount(data.discountAmount || 0);
      setFinalAmount(data.finalAmount ?? ORIGINAL_PRICE);
      setPromoApplied(true);
      setPromoError('');
    } catch {
      setPromoError('Failed to validate promo code');
    } finally {
      setValidatingPromo(false);
    }
  }

  async function handlePurchase() {
    setLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/payment/create-plan-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode: promoApplied ? promoCode.trim() : null }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPromoError(data.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      // 100% free — already upgraded server-side
      if (data.bypassed) {
        setSuccessMsg('Creator Plan activated!');
        setTimeout(() => { onSuccess(); onClose(); }, 1500);
        return;
      }

      // Load Razorpay SDK if not present
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.head.appendChild(script);
        });
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Eyebird',
        description: 'Creator Plan — 1 Year',
        order_id: data.orderId,
        prefill: { email: userEmail },
        theme: { color: '#8B5CF6' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch('/api/payment/verify-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              promoCode: promoApplied ? promoCode.trim() : null,
              discountApplied: discount,
              amountPaid: data.amount,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setSuccessMsg('Creator Plan activated!');
            setTimeout(() => { onSuccess(); onClose(); }, 1500);
          } else {
            setPromoError('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      rzp.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setPromoError(message);
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const inp: React.CSSProperties = {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${promoApplied ? 'rgba(34,197,94,0.4)' : promoError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 10,
    padding: '10px 14px',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: '#fff',
    outline: 'none',
    letterSpacing: '0.05em',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        backdropFilter: 'blur(8px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#0D0C1E',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: 24, padding: '32px',
        width: '100%', maxWidth: 480,
        position: 'relative',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1)',
      }}>
        {/* Top gradient line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(236,72,153,0.8), transparent)',
          borderRadius: '24px 24px 0 0',
        }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', fontSize: 18, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-body)',
          }}
        >×</button>

        {successMsg ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8,
            }}>{successMsg}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
              Refreshing your dashboard...
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 100, padding: '4px 12px',
                fontSize: 11, fontWeight: 700, color: '#a78bfa',
                letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                marginBottom: 12,
              }}>★ Creator Plan</div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26, fontWeight: 800, color: '#fff',
                letterSpacing: '-0.5px', marginBottom: 6,
              }}>Unlock everything</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                Unlimited DMs, all 22 insights, AI inbox, monthly re-audit. No caps ever.
              </div>
            </div>

            {/* Features */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '14px 16px',
              marginBottom: 24,
            }}>
              {[
                { icon: '⚡', text: 'Unlimited DM automations — no monthly caps' },
                { icon: '📊', text: 'All 22 audit metrics unlocked' },
                { icon: '🤖', text: 'Smart Reply AI inbox' },
                { icon: '🔄', text: 'Monthly re-audit to track your growth' },
                { icon: '🎯', text: 'Priority support in Indian timezone' },
              ].map(f => (
                <div key={f.text} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '5px 0', fontSize: 13,
                  color: 'rgba(255,255,255,0.6)', fontWeight: 500,
                }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)',
                marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
              }}>Promo code (optional)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={promoCode}
                  onChange={e => {
                    setPromoCode(e.target.value.toUpperCase());
                    if (promoApplied) resetPromo();
                    else setPromoError('');
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && promoCode.trim() && !promoApplied) validatePromo(); }}
                  placeholder="Enter promo code"
                  disabled={promoApplied}
                  style={inp}
                />
                <button
                  onClick={promoApplied ? resetPromo : validatePromo}
                  disabled={validatingPromo || (!promoApplied && !promoCode.trim())}
                  style={{
                    padding: '10px 16px',
                    background: promoApplied ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.15)',
                    border: `1px solid ${promoApplied ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.3)'}`,
                    borderRadius: 10,
                    color: promoApplied ? '#f87171' : '#c4b5fd',
                    fontSize: 12, fontWeight: 700,
                    cursor: (validatingPromo || (!promoApplied && !promoCode.trim())) ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-body)',
                    whiteSpace: 'nowrap' as const,
                    opacity: (!promoApplied && !promoCode.trim()) ? 0.5 : 1,
                  }}
                >
                  {validatingPromo ? 'Checking...' : promoApplied ? 'Remove' : 'Apply'}
                </button>
              </div>
              {promoError && (
                <div style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>{promoError}</div>
              )}
              {promoApplied && (
                <div style={{ fontSize: 12, color: '#4ade80', marginTop: 6, fontWeight: 600 }}>
                  ✓ Promo applied — you save {displayPrice(discount)}
                </div>
              )}
            </div>

            {/* Price */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.06))',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 14, padding: '16px 20px',
              marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                  Creator Plan — 1 year access
                </div>
                {promoApplied && discount > 0 && (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through', marginBottom: 2 }}>
                    {displayPrice(ORIGINAL_PRICE)}
                  </div>
                )}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 32, fontWeight: 800, color: '#fff',
                  letterSpacing: '-1px', lineHeight: 1,
                }}>
                  {finalAmount === 0 ? 'FREE' : displayPrice(finalAmount)}
                </div>
              </div>
              {promoApplied && discount > 0 && (
                <div style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 8, padding: '4px 12px',
                  fontSize: 12, fontWeight: 700, color: '#4ade80',
                }}>
                  Save {displayPrice(discount)}
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handlePurchase}
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                border: 'none', borderRadius: 12,
                fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                color: '#fff', cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 6px 24px rgba(139,92,246,0.4)',
                transition: 'opacity 0.2s',
              }}
            >
              {loading
                ? 'Processing...'
                : finalAmount === 0
                ? 'Activate Creator Plan →'
                : `Pay ${displayPrice(finalAmount)} →`}
            </button>

            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.2)',
              textAlign: 'center' as const, marginTop: 12,
            }}>
              Secured by Razorpay · All Indian payment methods accepted
            </div>
          </>
        )}
      </div>
    </div>
  );
}

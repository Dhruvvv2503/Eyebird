'use client';

import { useState } from 'react';
import { Check, X, Tag } from 'lucide-react';

interface PromoInputProps {
  onValidCode: (discountAmount: number, finalAmount: number) => void;
  onInvalidCode: () => void;
  baseAmount?: number;
}

export default function PromoInput({
  onValidCode,
  onInvalidCode,
  baseAmount = 299,
}: PromoInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [shake, setShake] = useState(false);

  const validate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/payment/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase(), baseAmount }),
      });
      const data = await res.json();
      setResult(data);
      if (data.valid) {
        onValidCode(data.discountAmount, data.finalAmount);
      } else {
        onInvalidCode();
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setResult({ valid: false, message: 'Could not validate. Try again.' });
      onInvalidCode();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={`flex gap-2 ${shake ? 'animate-shake' : ''}`}>
        <div className="relative flex-1">
          <Tag
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setResult(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && validate()}
            placeholder="Have a promo code?"
            className="w-full pl-8 pr-4 py-2.5 text-sm rounded-lg outline-none transition-all"
            style={{
              background: 'var(--bg-primary)',
              border: `1px solid ${result?.valid === true ? 'var(--success)' : result?.valid === false ? 'var(--danger)' : 'var(--border)'}`,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-jetbrains-mono)',
            }}
          />
        </div>
        <button
          onClick={validate}
          disabled={loading || !code.trim()}
          className="btn btn-ghost text-sm px-4"
          style={{ flexShrink: 0 }}
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            'Apply'
          )}
        </button>
      </div>
      {result && (
        <div
          className="flex items-center gap-1.5 mt-2 text-xs"
          style={{ color: result.valid ? 'var(--success)' : 'var(--danger)' }}
        >
          {result.valid ? <Check size={12} /> : <X size={12} />}
          {result.message}
        </div>
      )}
    </div>
  );
}

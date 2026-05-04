'use client';

import { Lock } from 'lucide-react';

interface BlurGateProps {
  isPaid: boolean;
  children: React.ReactNode;
  onUnlock?: () => void;
}

export default function BlurGate({ isPaid, children, onUnlock }: BlurGateProps) {
  if (isPaid) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-gate select-none" style={{ pointerEvents: 'none' }}>
        {children}
      </div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--bg-base) 35%)' }}
      >
        <div
          className="card-glass flex flex-col items-center gap-4 p-8 text-center max-w-sm"
          style={{ border: '1px solid var(--border-brand)', boxShadow: '0 0 40px rgba(168,85,247,0.15)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            <Lock size={20} style={{ color: 'var(--brand-mid)' }} />
          </div>
          <div>
            <p className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Unlock Full Report
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This section is part of the paid audit — just ₹99.
            </p>
          </div>
          {onUnlock && (
            <button onClick={onUnlock} className="btn btn-primary w-full h-10 rounded-xl text-sm font-semibold">
              Unlock Full Report — ₹99 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

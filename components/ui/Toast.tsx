'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/* ── Global pub/sub ── */
let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let currentToasts: ToastItem[] = [];

function notify(toasts: ToastItem[]) {
  currentToasts = toasts;
  toastListeners.forEach((fn) => fn([...toasts]));
}

export function showToast(message: string, type: ToastType = 'info', duration = 4500) {
  const id = Math.random().toString(36).slice(2);
  notify([...currentToasts, { id, message, type, duration }]);
  setTimeout(() => {
    notify(currentToasts.filter((t) => t.id !== id));
  }, duration);
}

/* ── Per-type design tokens ── */
const DESIGN: Record<ToastType, {
  bg: string; border: string; glow: string;
  barFrom: string; barTo: string; iconColor: string;
  Icon: React.ElementType;
}> = {
  success: {
    bg: 'linear-gradient(135deg, rgba(10,10,16,0.97) 0%, rgba(14,26,18,0.97) 100%)',
    border: 'rgba(34,197,94,0.35)',
    glow: '0 0 40px rgba(34,197,94,0.15)',
    barFrom: '#22C55E', barTo: '#16A34A',
    iconColor: '#22C55E',
    Icon: CheckCircle2,
  },
  error: {
    bg: 'linear-gradient(135deg, rgba(10,10,16,0.97) 0%, rgba(26,10,12,0.97) 100%)',
    border: 'rgba(239,68,68,0.35)',
    glow: '0 0 40px rgba(239,68,68,0.15)',
    barFrom: '#EF4444', barTo: '#DC2626',
    iconColor: '#EF4444',
    Icon: XCircle,
  },
  info: {
    bg: 'linear-gradient(135deg, rgba(10,10,16,0.97) 0%, rgba(14,12,26,0.97) 100%)',
    border: 'rgba(168,85,247,0.35)',
    glow: '0 0 40px rgba(168,85,247,0.15)',
    barFrom: '#A855F7', barTo: '#7C3AED',
    iconColor: '#A855F7',
    Icon: Info,
  },
};

function SingleToast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const d = DESIGN[toast.type];
  const dur = toast.duration ?? 4500;

  /* mount animation */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 15);
    return () => clearTimeout(t);
  }, []);

  /* progress bar countdown */
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / dur) * 100);
      setProgress(pct);
      if (pct > 0) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dur]);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 280);
  };

  const Icon = d.Icon;

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'relative',
        minWidth: 300,
        maxWidth: 400,
        borderRadius: 16,
        overflow: 'hidden',
        background: d.bg,
        border: `1px solid ${d.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 16px 48px rgba(0,0,0,0.55), ${d.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
        cursor: 'pointer',
        /* spring-in from right, spring-out up */
        transform: leaving
          ? 'translateX(110%) scale(0.92)'
          : mounted
            ? 'translateX(0) scale(1)'
            : 'translateX(120%) scale(0.9)',
        opacity: leaving ? 0 : mounted ? 1 : 0,
        transition: leaving
          ? 'transform 0.28s cubic-bezier(0.4,0,1,1), opacity 0.28s ease'
          : 'transform 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease',
      }}
    >
      {/* Top gradient accent */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, ${d.barFrom}, ${d.barTo})`,
      }} />

      {/* Content */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '14px 16px 16px',
      }}>
        {/* Icon with glow */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `${d.iconColor}18`,
          border: `1px solid ${d.iconColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 14px ${d.iconColor}25`,
          marginTop: 1,
        }}>
          <Icon size={18} style={{ color: d.iconColor }} />
        </div>

        {/* Message */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.45, letterSpacing: '-0.01em',
            marginBottom: 2,
          }}>
            {toast.message}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
            Click to dismiss
          </p>
        </div>

        {/* Dismiss X */}
        <button
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          style={{
            width: 24, height: 24, borderRadius: 7,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, color: 'rgba(255,255,255,0.4)',
            marginTop: 1,
          }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 2,
        background: 'rgba(255,255,255,0.06)',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${d.barFrom}, ${d.barTo})`,
          transition: 'width 0.1s linear',
          borderRadius: 99,
        }} />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (t: ToastItem[]) => setToasts(t);
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter((l) => l !== listener); };
  }, []);

  const dismiss = useCallback((id: string) => {
    notify(currentToasts.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24, right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
      alignItems: 'flex-end',
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <SingleToast toast={toast} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}

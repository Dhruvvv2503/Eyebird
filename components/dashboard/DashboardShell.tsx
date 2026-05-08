'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  LayoutDashboard, BarChart2, Zap, Sparkles, Users, TrendingUp, Settings,
  LogOut, Menu, X,
} from 'lucide-react';

interface DashboardShellProps {
  displayName: string;
  avatarUrl: string | null;
  plan: string;
  igUsername: string | null;
  userEmail: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview',     href: '/dashboard',               soon: false },
  { icon: BarChart2,       label: 'Audit',        href: '/dashboard/audit',         soon: false },
  { icon: Zap,             label: 'Automations',  href: '/dashboard/automations',   soon: true  },
  { icon: Sparkles,        label: 'Smart Reply',  href: '/dashboard/smart-reply',   soon: true  },
  { icon: Users,           label: 'Contacts',     href: '/dashboard/contacts',      soon: true  },
  { icon: TrendingUp,      label: 'Analytics',    href: '/dashboard/analytics',     soon: true  },
  { icon: Settings,        label: 'Settings',     href: '/dashboard/settings',      soon: false },
];

const MOBILE_NAV = NAV_ITEMS.slice(0, 5);

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, { label: string; bg: string; color: string; border: string }> = {
    free:    { label: 'Free Plan', bg: 'rgba(107,107,128,0.15)', color: '#6B6B80', border: 'rgba(107,107,128,0.2)' },
    creator: { label: 'Creator',  bg: 'rgba(34,197,94,0.08)',   color: '#22C55E', border: 'rgba(34,197,94,0.2)'   },
    pro:     { label: 'Pro',      bg: 'rgba(168,85,247,0.1)',   color: '#A855F7', border: 'rgba(168,85,247,0.25)' },
    agency:  { label: 'Agency',   bg: 'rgba(59,130,246,0.1)',   color: '#3B82F6', border: 'rgba(59,130,246,0.25)' },
  };
  const s = styles[plan] || styles.free;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 700,
      padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color,
      border: `1px solid ${s.border}`, letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>
      {s.label}
    </span>
  );
}

export default function DashboardShell({
  displayName, avatarUrl, plan, igUsername, userEmail, children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch { /* ignore */ }
    router.push('/');
    router.refresh();
  };

  const navItem = (item: typeof NAV_ITEMS[0], onClick?: () => void) => {
    const { icon: Icon, label, href, soon } = item;
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={soon ? '#' : href}
        onClick={(e) => { if (soon) e.preventDefault(); else onClick?.(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 10, marginBottom: 2,
          textDecoration: 'none',
          color: active ? '#FAFAFA' : 'rgba(255,255,255,0.45)',
          background: active ? 'rgba(168,85,247,0.12)' : 'transparent',
          borderLeft: active ? '2px solid #A855F7' : '2px solid transparent',
          fontSize: 13, fontWeight: active ? 600 : 500,
          transition: 'all 0.15s ease',
          cursor: soon ? 'default' : 'pointer',
        }}
        onMouseEnter={e => { if (!active && !soon) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; } }}
        onMouseLeave={e => { if (!active && !soon) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
      >
        <Icon size={16} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{label}</span>
        {soon && (
          <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(168,85,247,0.12)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.2)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Soon
          </span>
        )}
      </Link>
    );
  };

  const sidebarInner = (onNavClick?: () => void) => (
    <>
      {/* User identity */}
      <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: 'linear-gradient(135deg,#FF3E80,#A855F7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {avatarUrl ? (
              <Image src={avatarUrl} alt={displayName} width={40} height={40} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'white', fontSize: 16, fontWeight: 800 }}>{displayName[0]?.toUpperCase()}</span>
            )}
          </div>
          <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FAFAFA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {igUsername ? `@${igUsername}` : displayName}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {igUsername ? displayName : userEmail}
            </div>
          </div>
        </div>
        <PlanBadge plan={plan} />
        {!igUsername && (
          <div style={{ marginTop: 10 }}>
            <a
              href="/api/instagram/auth"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
                padding: '7px 10px', borderRadius: 8,
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                color: '#F59E0B', fontSize: 11, fontWeight: 600, lineHeight: 1.3,
              }}
            >
              <span style={{ flexShrink: 0 }}>⚠</span>
              <span>No Instagram connected</span>
            </a>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ padding: '4px 8px', flex: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => navItem(item, onNavClick))}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
        {/* Upgrade CTA — free users only */}
        {plan === 'free' && (
          <div style={{
            margin: '0 0 10px',
            padding: '14px',
            borderRadius: 12,
            background: 'linear-gradient(135deg,rgba(255,62,128,0.07),rgba(168,85,247,0.07))',
            border: '1px solid rgba(168,85,247,0.2)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#FAFAFA', marginBottom: 4 }}>🚀 Upgrade to Creator</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 10 }}>
              Unlock automations + monthly re-audits
            </div>
            <Link
              href="/#pricing"
              style={{
                display: 'block', textAlign: 'center', padding: '7px 0', borderRadius: 8,
                background: 'linear-gradient(135deg,#FF3E80,#A855F7,#7C3AED)',
                color: 'white', fontSize: 11, fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(168,85,247,0.3)',
              }}
            >
              Upgrade — ₹799/month →
            </Link>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10, background: 'none', border: 'none',
            cursor: signingOut ? 'not-allowed' : 'pointer',
            color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 500,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
        >
          <LogOut size={15} />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </>
  );

  const logoMark = (
    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#FF3E80,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(168,85,247,0.4)' }}>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 9, letterSpacing: '-0.02em' }}>EB</span>
      </div>
      <span style={{ color: '#FAFAFA', fontWeight: 700, fontSize: 16, letterSpacing: '-0.03em' }}>Eyebird</span>
    </Link>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── Desktop Sidebar ── */}
      <div className="db-sidebar" style={{
        width: 240, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0,
        background: 'var(--bg-surface)', borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', zIndex: 30,
      }}>
        {/* Logo */}
        <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {logoMark}
        </div>
        {sidebarInner()}
      </div>

      {/* ── Mobile Top Bar ── */}
      <div className="db-topbar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56, zIndex: 40,
        background: 'rgba(10,10,16,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        alignItems: 'center', padding: '0 16px', gap: 12,
      }}>
        <button
          onClick={() => setSidebarOpen(v => !v)}
          style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <Menu size={17} />
        </button>
        {logoMark}
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 45 }}
            />
            <motion.div
              initial={{ x: -270 }} animate={{ x: 0 }} exit={{ x: -270 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
                background: 'var(--bg-surface)', borderRight: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column', zIndex: 50,
              }}
            >
              <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                {logoMark}
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={15} />
                </button>
              </div>
              {sidebarInner(() => setSidebarOpen(false))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="db-main" style={{ flex: 1, minHeight: '100vh' }}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          style={{ minHeight: '100vh', paddingBottom: 80 }}
        >
          {children}
        </motion.div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <div className="db-bottomnav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
        background: 'rgba(10,10,16,0.97)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {MOBILE_NAV.map(({ icon: Icon, label, href, soon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={soon ? '#' : href}
              onClick={e => { if (soon) e.preventDefault(); }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '8px 0 10px', textDecoration: 'none', gap: 3,
                color: active ? '#A855F7' : 'rgba(255,255,255,0.35)',
                transition: 'color 0.15s ease',
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.02em' }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

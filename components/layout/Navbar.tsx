'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export function EyebirdLogo() {
  return (
    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: 'linear-gradient(135deg, #FF3E80, #7C3AED)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 0 16px rgba(168,85,247,0.5)',
      }}>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 10, letterSpacing: '-0.03em' }}>EB</span>
      </div>
      <span style={{ color: '#FAFAFA', fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em', lineHeight: 1 }}>
        Eyebird
      </span>
    </Link>
  );
}

interface ConnectedUser {
  igUserId: string;
  username: string;
}

interface AuthUser {
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connected, setConnected] = useState<ConnectedUser | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check Supabase auth session
  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthUser({
          email: user.email || '',
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
        });
      } else {
        setAuthUser(null);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setAuthUser({
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url,
        });
      } else {
        setAuthUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Legacy: read connected IG user from localStorage (for non-auth users)
  useEffect(() => {
    if (authUser) { setConnected(null); return; }
    try {
      const stored = localStorage.getItem('eb_connected_user');
      setConnected(stored ? JSON.parse(stored) : null);
    } catch { setConnected(null); }
  }, [pathname, authUser]);

  const handleDisconnect = () => {
    localStorage.removeItem('eb_connected_user');
    setConnected(null);
    window.location.href = '/';
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setAuthUser(null);
    window.location.href = '/';
  };

  const displayInitial = authUser?.full_name?.[0]?.toUpperCase() || authUser?.email?.[0]?.toUpperCase() || '?';

  const links = [
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/#faq', label: 'FAQ' },
  ];

  const linkStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 500,
    padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
    letterSpacing: '-0.01em', whiteSpace: 'nowrap',
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, display: 'flex', alignItems: 'center',
        background: 'rgba(10,10,16,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', width: '100%',
          padding: '0 28px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'relative',
        }}>
          <EyebirdLogo />

          {/* Desktop center links */}
          <div className="nav-links" style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          }}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} style={linkStyle}>{l.label}</Link>
            ))}
          </div>

          {/* Desktop CTAs — context-aware */}
          <div className="nav-ctas">
            {authUser ? (
              /* Supabase auth state */
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px 6px 6px', borderRadius: 10,
                    background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)',
                    color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#FF3E80,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                    {displayInitial}
                  </div>
                  {authUser.full_name || authUser.email.split('@')[0]}
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>▾</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: 6,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)',
                        borderRadius: 12, padding: '6px', minWidth: 160,
                        boxShadow: 'var(--shadow-xl)', zIndex: 60,
                      }}
                    >
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                      <Link href="/dashboard/settings" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <User size={14} /> Settings
                      </Link>
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                      <button onClick={handleSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : connected ? (
              /* Legacy Instagram connected state */
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link
                  href={`/audit/${connected.igUserId}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  <User size={13} style={{ color: '#A855F7' }} />
                  @{connected.username}
                </Link>
                <button onClick={handleDisconnect} title="Disconnect Instagram" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              /* Guest state */
              <>
                <Link href="/login" style={{ ...linkStyle, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', padding: '7px 16px', borderRadius: 9 }}>
                  Log in
                </Link>
                <Link href="/audit" className="btn btn-primary" style={{ height: 36, padding: '0 18px', borderRadius: 9, fontSize: 14, fontWeight: 600 }}>
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            style={{
              width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, zIndex: 40,
              background: 'rgba(10,10,16,0.97)', backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: '12px 20px 20px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: 500, padding: '12px 16px', borderRadius: 10, textDecoration: 'none' }}>
                  {l.label}
                </Link>
              ))}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0' }} />
              {authUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                    <LayoutDashboard size={15} style={{ color: '#A855F7' }} />
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', borderRadius: 12, background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer' }}>
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              ) : connected ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href={`/audit/${connected.igUserId}`} onClick={() => setMobileOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                    <User size={15} style={{ color: '#A855F7' }} />
                    View @{connected.username}&apos;s report
                  </Link>
                  <button onClick={handleDisconnect}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', borderRadius: 12, background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer' }}>
                    <LogOut size={14} /> Disconnect Instagram
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                    Log in
                  </Link>
                  <Link href="/audit" onClick={() => setMobileOpen(false)}
                    className="btn btn-primary"
                    style={{ width: '100%', height: 44, borderRadius: 12, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                    Get started free →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

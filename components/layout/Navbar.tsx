'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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

          {/* Desktop CTAs */}
          <div className="nav-ctas">
            <Link href="/audit" style={{
              ...linkStyle,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              padding: '7px 16px',
              borderRadius: 9,
            }}>
              Log in
            </Link>
            <Link href="/audit" className="btn btn-primary" style={{
              height: 36, padding: '0 18px', borderRadius: 9, fontSize: 14, fontWeight: 600,
            }}>
              Get started
            </Link>
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
              <Link href="/audit" onClick={() => setMobileOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', height: 44, borderRadius: 12, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                Get started free →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

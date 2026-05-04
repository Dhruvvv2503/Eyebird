import Link from 'next/link';

// Inline logo — no import from 'use client' Navbar to avoid SSR issues
function FooterLogo() {
  return (
    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'linear-gradient(135deg,#FF3E80,#7C3AED)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 12px rgba(168,85,247,0.4)',
      }}>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 9, letterSpacing: '-0.03em' }}>EB</span>
      </div>
      <span style={{ color: '#FAFAFA', fontWeight: 700, fontSize: 17, letterSpacing: '-0.03em' }}>
        Eyebird
      </span>
    </Link>
  );
}

const LINKS: Record<string, { href: string; label: string }[]> = {
  Product: [
    { href: '/', label: 'Home' },
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/audit', label: 'Start Audit' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

const linkStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'rgba(255,255,255,0.38)',
  textDecoration: 'none',
  display: 'block',
  lineHeight: 1,
  transition: 'color 0.15s',
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: '#0D0D14',
      borderTop: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 28px 0' }}>

        {/* Main grid — 3 cols: brand (2fr), product (1fr), legal (1fr) */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, marginBottom: 52 }}
          className="footer-grid">
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FooterLogo />
            <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.35)', maxWidth: 280 }}>
              AI-powered Instagram audits for Indian creators. Know exactly what to fix to grow faster.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 999,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.3)', maxWidth: 'fit-content',
            }}>
              🇮🇳 Made in India for Indian Creators
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'rgba(255,255,255,0.2)',
              }}>
                {group}
              </p>
              {links.map((link) => (
                <Link key={link.href} href={link.href} style={linkStyle}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 0',
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
            © {year} Eyebird. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
            Built with ♥ for Indian Instagram creators
          </p>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { LEGAL_CONFIG } from '@/app/lib/legal-config';

export const metadata: Metadata = {
  title: `Data Deletion Instructions | ${LEGAL_CONFIG.businessName}`,
  description: `How to request deletion of your personal data from ${LEGAL_CONFIG.businessName}, in line with India's DPDP Act 2023.`,
};

const lastUpdated = new Date().toLocaleDateString('en-IN', {
  day: 'numeric', month: 'long', year: 'numeric',
});

const S = {
  page:      { background: '#0A0A10', minHeight: '100vh', color: '#FAFAFA' } as React.CSSProperties,
  wrap:      { maxWidth: 780, margin: '0 auto', padding: '120px 24px 80px' } as React.CSSProperties,
  h1:        { fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 12 } as React.CSSProperties,
  meta:      { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 56 } as React.CSSProperties,
  h2:        { fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA', marginBottom: 12, marginTop: 40 } as React.CSSProperties,
  p:         { fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', marginBottom: 12 } as React.CSSProperties,
  ol:        { paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 } as React.CSSProperties,
  ul:        { paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 } as React.CSSProperties,
  li:        { fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)' } as React.CSSProperties,
  card:      {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '20px 24px',
    marginTop: 16,
  } as React.CSSProperties,
  highlight: {
    background: 'rgba(168,85,247,0.08)',
    border: '1px solid rgba(168,85,247,0.25)',
    borderRadius: 14,
    padding: '20px 24px',
    marginTop: 16,
  } as React.CSSProperties,
  code:      {
    fontFamily: 'monospace',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    padding: '3px 10px',
    fontSize: 14,
    color: '#FAFAFA',
    display: 'inline-block',
  } as React.CSSProperties,
  label:     { fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.25)', marginBottom: 4 },
  value:     { fontSize: 15, color: 'rgba(255,255,255,0.75)', marginBottom: 10 } as React.CSSProperties,
  divider:   { height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' } as React.CSSProperties,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={S.h2}>{title}</h2>
      {children}
    </section>
  );
}

function GrievanceCard() {
  return (
    <div style={S.highlight}>
      <p style={S.label}>Grievance Officer</p>
      <div style={S.divider} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
        <div><p style={S.label}>Name</p><p style={S.value}>{LEGAL_CONFIG.ownerName}</p></div>
        <div><p style={S.label}>Business</p><p style={S.value}>{LEGAL_CONFIG.businessName} (Udyam Registered)</p></div>
        <div>
          <p style={S.label}>Email</p>
          <a href={`mailto:${LEGAL_CONFIG.supportEmail}`} style={{ fontSize: 15, color: '#A855F7', textDecoration: 'none' }}>
            {LEGAL_CONFIG.supportEmail}
          </a>
        </div>
        <div style={{ marginTop: 8 }}><p style={S.label}>Response Time</p><p style={{ ...S.value, marginBottom: 0 }}>7 business days</p></div>
      </div>
    </div>
  );
}

export default function DataDeletionPage() {
  return (
    <div style={S.page}>
      <Navbar />
      <main style={S.wrap}>
        <h1 style={S.h1}>Data Deletion Instructions</h1>
        <p style={S.meta}>Last updated: {lastUpdated}</p>

        <Section title="1. Your Right to Deletion">
          <p style={S.p}>
            {LEGAL_CONFIG.businessName} fully respects your right to control your personal data. Under India's Digital Personal Data Protection (DPDP) Act 2023, you have the right to request erasure of all personal data we hold about you, at any time, without giving a reason.
          </p>
        </Section>

        <Section title="2. How to Request Deletion">
          <p style={S.p}>Follow these steps to request complete deletion of your data:</p>
          <div style={S.card}>
            <ol style={{ ...S.ol, paddingLeft: 24 }}>
              <li style={S.li}>
                Email us at{' '}
                <a href={`mailto:${LEGAL_CONFIG.supportEmail}`} style={{ color: '#A855F7', textDecoration: 'none' }}>
                  {LEGAL_CONFIG.supportEmail}
                </a>
              </li>
              <li style={S.li}>
                Use the subject line: <span style={S.code}>Data Deletion Request</span>
              </li>
              <li style={S.li}>Include your Instagram username and the email address you used at signup</li>
              <li style={S.li}>You will receive a confirmation within <strong style={{ color: '#FAFAFA' }}>24 hours</strong></li>
              <li style={S.li}>Deletion will be completed within <strong style={{ color: '#FAFAFA' }}>7 business days</strong></li>
              <li style={S.li}>A final confirmation email will be sent once deletion is complete</li>
            </ol>
          </div>
        </Section>

        <Section title="3. What Gets Deleted">
          <p style={S.p}>Upon a successful deletion request, we will permanently remove:</p>
          <ul style={S.ul}>
            <li style={S.li}>Your Instagram connection and access token</li>
            <li style={S.li}>All cached posts, engagement metrics, and audience data</li>
            <li style={S.li}>Your audit report and AI-generated analysis</li>
            <li style={S.li}>Your email address and account information</li>
            <li style={S.li}>Payment confirmation records held by us</li>
          </ul>
          <p style={{ ...S.p, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            Note: Minimal transactional metadata may be retained for up to 8 years as required by Indian tax law. This data is anonymised and cannot be used to identify you personally.
          </p>
        </Section>

        <Section title="4. Revoking Instagram Access">
          <p style={S.p}>You can also revoke {LEGAL_CONFIG.businessName}'s access to your Instagram account directly:</p>
          <div style={S.card}>
            <ol style={{ ...S.ol, paddingLeft: 24 }}>
              <li style={S.li}>Open the <strong style={{ color: '#FAFAFA' }}>Instagram</strong> app</li>
              <li style={S.li}>Go to <strong style={{ color: '#FAFAFA' }}>Settings → Apps and Websites</strong></li>
              <li style={S.li}>Find <strong style={{ color: '#FAFAFA' }}>{LEGAL_CONFIG.businessName}</strong> in the list</li>
              <li style={S.li}>Tap <strong style={{ color: '#FAFAFA' }}>Remove</strong></li>
            </ol>
          </div>
          <p style={{ ...S.p, marginTop: 12 }}>
            ⚠️ Revoking Instagram access stops <em>future</em> data collection but does <strong style={{ color: '#FAFAFA' }}>not</strong> delete data already collected. To delete existing data, please use the email process described above.
          </p>
        </Section>

        <Section title="5. Data Kept for Legal Reasons">
          <p style={S.p}>
            In compliance with the Income Tax Act 1961 and applicable Indian tax regulations, we may retain minimal transactional data (e.g., payment amount, date, transaction ID) for up to 8 years. This data is anonymised, securely stored, and cannot be used to identify you personally.
          </p>
        </Section>

        <Section title="6. Grievance Officer">
          <p style={S.p}>For any questions or concerns about data deletion, contact our Grievance Officer:</p>
          <GrievanceCard />
        </Section>
      </main>
      <Footer />
    </div>
  );
}

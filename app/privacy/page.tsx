import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { LEGAL_CONFIG } from '@/app/lib/legal-config';

export const metadata: Metadata = {
  title: `Privacy Policy | ${LEGAL_CONFIG.businessName}`,
  description: `Privacy Policy for ${LEGAL_CONFIG.businessName} — how we collect, use, and protect your data.`,
};

const lastUpdated = new Date().toLocaleDateString('en-IN', {
  day: 'numeric', month: 'long', year: 'numeric',
});

// ── Shared style tokens ──────────────────────────────────────────────────────
const S = {
  page:   { background: '#0A0A10', minHeight: '100vh', color: '#FAFAFA' } as React.CSSProperties,
  wrap:   { maxWidth: 780, margin: '0 auto', padding: '120px 24px 80px' } as React.CSSProperties,
  h1:     { fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 12 } as React.CSSProperties,
  meta:   { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 56 } as React.CSSProperties,
  h2:     { fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA', marginBottom: 12, marginTop: 40 } as React.CSSProperties,
  p:      { fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', marginBottom: 12 } as React.CSSProperties,
  ul:     { paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 } as React.CSSProperties,
  li:     { fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)' } as React.CSSProperties,
  card:   {
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
  label:  { fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.25)', marginBottom: 4 },
  value:  { fontSize: 15, color: 'rgba(255,255,255,0.75)', marginBottom: 10 } as React.CSSProperties,
  divider:{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' } as React.CSSProperties,
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
      <p style={{ ...S.label }}>Grievance Officer</p>
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

export default function PrivacyPage() {
  return (
    <div style={S.page}>
      <Navbar />
      <main style={S.wrap}>
        {/* Header */}
        <h1 style={S.h1}>Privacy Policy</h1>
        <p style={S.meta}>Last updated: {lastUpdated}</p>

        <Section title="1. Introduction">
          <p style={S.p}>
            {LEGAL_CONFIG.businessName} is operated by {LEGAL_CONFIG.ownerName}, a sole proprietor, Udyam registered, based in India. By using our service at {LEGAL_CONFIG.domain}, you agree to the collection and use of information described in this Privacy Policy.
          </p>
          <p style={S.p}>
            We are committed to protecting your privacy and handling your data with transparency, in compliance with India's Digital Personal Data Protection (DPDP) Act, 2023.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p style={S.p}>We collect the following categories of information:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: '#FAFAFA' }}>Instagram Data</strong> — via the official Instagram Graph API (read-only): username, posts, engagement metrics, and audience demographics. We never write to or modify your Instagram account.</li>
            <li style={S.li}><strong style={{ color: '#FAFAFA' }}>Email Address</strong> — to deliver your audit report and service notifications.</li>
            <li style={S.li}><strong style={{ color: '#FAFAFA' }}>Payment Information</strong> — handled entirely by Razorpay. We never store card numbers, UPI credentials, or banking details.</li>
            <li style={S.li}><strong style={{ color: '#FAFAFA' }}>Usage Data</strong> — browser type, IP address, and page interactions for service improvement.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul style={S.ul}>
            <li style={S.li}>Generate your personalised AI-powered Instagram audit report</li>
            <li style={S.li}>Process your payment and send the PDF report to your email</li>
            <li style={S.li}>Improve the accuracy and quality of our service</li>
            <li style={S.li}>Respond to support requests and grievances</li>
            <li style={S.li}>Comply with applicable Indian law and regulatory requirements</li>
          </ul>
        </Section>

        <Section title="4. Data Sharing">
          <p style={S.p}>We share your data only with the following service providers, strictly for delivering the service:</p>
          <div style={S.card}>
            {[
              ['Anthropic', 'Claude AI — powers the audit analysis'],
              ['Supabase', 'Database storage for your audit results'],
              ['Razorpay', 'Payment processing (PCI-DSS compliant)'],
              ['Resend', 'Transactional email delivery'],
              ['Meta Platforms', 'Via the Instagram Graph API for data retrieval'],
            ].map(([name, desc]) => (
              <div key={name} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA', minWidth: 120 }}>{name}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>{desc}</span>
              </div>
            ))}
          </div>
          <p style={{ ...S.p, marginTop: 16 }}>
            <strong style={{ color: '#FAFAFA' }}>We do not sell your data. We do not use your data for advertising.</strong>
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p style={S.p}>
            Your data is retained while the service is active. Instagram access tokens are stored encrypted and refreshed every 60 days. You may request complete deletion at any time at <a href={`https://${LEGAL_CONFIG.domain}/data-deletion`} style={{ color: '#A855F7', textDecoration: 'none' }}>{LEGAL_CONFIG.domain}/data-deletion</a>.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p style={S.p}>
            All data is transmitted over TLS-encrypted connections (HTTPS only). Instagram access tokens are stored in encrypted form. While we take every reasonable precaution, no method of transmission or storage over the internet is 100% secure.
          </p>
        </Section>

        <Section title="7. Your Rights Under the DPDP Act 2023">
          <p style={S.p}>As a data principal under India's Digital Personal Data Protection Act 2023, you have the right to:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: '#FAFAFA' }}>Access</strong> — know what personal data we hold about you</li>
            <li style={S.li}><strong style={{ color: '#FAFAFA' }}>Correction</strong> — request correction of inaccurate data</li>
            <li style={S.li}><strong style={{ color: '#FAFAFA' }}>Erasure</strong> — request deletion of your personal data</li>
            <li style={S.li}><strong style={{ color: '#FAFAFA' }}>Withdraw Consent</strong> — withdraw consent at any time</li>
            <li style={S.li}><strong style={{ color: '#FAFAFA' }}>Grievance Redressal</strong> — raise a complaint with the Grievance Officer</li>
            <li style={S.li}><strong style={{ color: '#FAFAFA' }}>Nomination</strong> — nominate another individual to exercise your rights</li>
          </ul>
          <p style={S.p}>To exercise any right, email <a href={`mailto:${LEGAL_CONFIG.supportEmail}`} style={{ color: '#A855F7', textDecoration: 'none' }}>{LEGAL_CONFIG.supportEmail}</a>.</p>
        </Section>

        <Section title="8. Data Deletion">
          <p style={S.p}>
            To request deletion of all your data, email <a href={`mailto:${LEGAL_CONFIG.supportEmail}`} style={{ color: '#A855F7', textDecoration: 'none' }}>{LEGAL_CONFIG.supportEmail}</a> with the subject line "Data Deletion Request". Requests are processed within 7 business days. Full instructions are available at <a href={`https://${LEGAL_CONFIG.domain}/data-deletion`} style={{ color: '#A855F7', textDecoration: 'none' }}>{LEGAL_CONFIG.domain}/data-deletion</a>.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p style={S.p}>
            {LEGAL_CONFIG.businessName} is not intended for users under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected data from a minor, please contact us immediately at <a href={`mailto:${LEGAL_CONFIG.supportEmail}`} style={{ color: '#A855F7', textDecoration: 'none' }}>{LEGAL_CONFIG.supportEmail}</a>.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p style={S.p}>
            We may update this Privacy Policy from time to time. Material changes will be communicated via email or a prominent notice on our website. Continued use of the service after changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Grievance Officer">
          <p style={S.p}>For any privacy concerns or to exercise your rights under the DPDP Act 2023:</p>
          <GrievanceCard />
        </Section>
      </main>
      <Footer />
    </div>
  );
}

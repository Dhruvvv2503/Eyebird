import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { LEGAL_CONFIG } from '@/app/lib/legal-config';

export const metadata: Metadata = {
  title: `Terms of Service | ${LEGAL_CONFIG.businessName}`,
  description: `Terms of Service for ${LEGAL_CONFIG.businessName} — rules for using our AI-powered Instagram audit service.`,
};

const lastUpdated = new Date().toLocaleDateString('en-IN', {
  day: 'numeric', month: 'long', year: 'numeric',
});

const S = {
  page:    { background: '#0A0A10', minHeight: '100vh', color: '#FAFAFA' } as React.CSSProperties,
  wrap:    { maxWidth: 780, margin: '0 auto', padding: '120px 24px 80px' } as React.CSSProperties,
  h1:      { fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 12 } as React.CSSProperties,
  meta:    { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 56 } as React.CSSProperties,
  h2:      { fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA', marginBottom: 12, marginTop: 40 } as React.CSSProperties,
  p:       { fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', marginBottom: 12 } as React.CSSProperties,
  ul:      { paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 } as React.CSSProperties,
  li:      { fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)' } as React.CSSProperties,
  notice:  {
    background: 'rgba(255,62,128,0.06)',
    border: '1px solid rgba(255,62,128,0.2)',
    borderRadius: 14,
    padding: '16px 20px',
    marginTop: 12,
    marginBottom: 12,
  } as React.CSSProperties,
  noticeText: { fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 } as React.CSSProperties,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={S.h2}>{title}</h2>
      {children}
    </section>
  );
}

export default function TermsPage() {
  return (
    <div style={S.page}>
      <Navbar />
      <main style={S.wrap}>
        <h1 style={S.h1}>Terms of Service</h1>
        <p style={S.meta}>Last updated: {lastUpdated}</p>

        <Section title="1. Acceptance of Terms">
          <p style={S.p}>
            By accessing or using {LEGAL_CONFIG.businessName} at {LEGAL_CONFIG.domain}, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </Section>

        <Section title="2. Service Description">
          <p style={S.p}>
            {LEGAL_CONFIG.businessName} is an AI-powered Instagram account audit tool that analyses your Instagram data and provides personalised growth insights. The service requires a Creator or Business Instagram account connected via the official Instagram Graph API.
          </p>
          <div style={S.notice}>
            <p style={S.noticeText}>
              ⚠️ {LEGAL_CONFIG.businessName} is not affiliated with, endorsed by, or associated with Meta Platforms, Inc. or Instagram.
            </p>
          </div>
        </Section>

        <Section title="3. Eligibility">
          <ul style={S.ul}>
            <li style={S.li}>You must be 18 years of age or older to use this service.</li>
            <li style={S.li}>You must be the owner or authorised manager of the Instagram account being connected to the service.</li>
            <li style={S.li}>By using the service, you represent that you meet both of the above conditions.</li>
          </ul>
        </Section>

        <Section title="4. Pricing and Payment">
          <ul style={S.ul}>
            <li style={S.li}>A free preview of your audit is available without payment.</li>
            <li style={S.li}>The full audit report is available for <strong style={{ color: '#FAFAFA' }}>₹299</strong>, or <strong style={{ color: '#FAFAFA' }}>₹99</strong> with the promo code <strong style={{ color: '#FAFAFA' }}>LAUNCH</strong>.</li>
            <li style={S.li}>All payments are in Indian Rupees (INR) and processed securely via Razorpay.</li>
            <li style={S.li}>This is a one-time purchase only. There are no subscriptions or recurring charges.</li>
            <li style={S.li}>The price displayed at the time of purchase is the final price.</li>
          </ul>
        </Section>

        <Section title="5. Refund Policy">
          <p style={S.p}>
            {LEGAL_CONFIG.businessName} delivers a digital service — your audit report is generated and delivered immediately upon successful payment. Accordingly, <strong style={{ color: '#FAFAFA' }}>all sales are final once the report has been generated.</strong>
          </p>
          <p style={S.p}>
            Exceptions may be considered for: (a) technical failure preventing report delivery, or (b) duplicate charges. To request a refund under these exceptions, email <a href={`mailto:${LEGAL_CONFIG.supportEmail}`} style={{ color: '#A855F7', textDecoration: 'none' }}>{LEGAL_CONFIG.supportEmail}</a> within 7 days of purchase.
          </p>
        </Section>

        <Section title="6. User Responsibilities">
          <ul style={S.ul}>
            <li style={S.li}>Provide accurate information when using the service.</li>
            <li style={S.li}>Only connect Instagram accounts you own or are authorised to manage.</li>
            <li style={S.li}>Do not violate Instagram's Terms of Use or Community Guidelines while using this service.</li>
            <li style={S.li}>Do not attempt to reverse engineer, copy, scrape, or abuse the service in any way.</li>
            <li style={S.li}>Do not use the service for any unlawful purpose.</li>
          </ul>
        </Section>

        <Section title="7. Intellectual Property">
          <p style={S.p}>
            All content, branding, code, and design of {LEGAL_CONFIG.businessName} is owned by {LEGAL_CONFIG.ownerName} / {LEGAL_CONFIG.businessName}. Your personalised audit report is licensed to you for personal use only and may not be resold, redistributed, or reproduced for commercial purposes.
          </p>
        </Section>

        <Section title="8. Disclaimer of Warranties">
          <p style={S.p}>
            The service is provided "as-is" without warranty of any kind. We do not guarantee the accuracy of audit results or that following our suggestions will lead to specific growth outcomes. Insights and recommendations are data-driven suggestions, not guaranteed results.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p style={S.p}>
            To the maximum extent permitted by Indian law, {LEGAL_CONFIG.businessName} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability to you shall not exceed the amount you paid for the service.
          </p>
        </Section>

        <Section title="10. Termination">
          <p style={S.p}>
            We reserve the right to suspend or terminate access to the service for any user who violates these Terms. You may stop using the service at any time. Termination does not entitle you to a refund.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p style={S.p}>
            These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in {LEGAL_CONFIG.jurisdictionCity}, India.
          </p>
        </Section>

        <Section title="12. Changes to Terms">
          <p style={S.p}>
            We may update these Terms of Service from time to time. Continued use of the service following any changes constitutes your acceptance of the revised Terms. We recommend reviewing this page periodically.
          </p>
        </Section>

        <Section title="13. Contact">
          <p style={S.p}>
            Questions about these Terms? Email us at{' '}
            <a href={`mailto:${LEGAL_CONFIG.supportEmail}`} style={{ color: '#A855F7', textDecoration: 'none' }}>
              {LEGAL_CONFIG.supportEmail}
            </a>. We aim to respond within 7 business days.
          </p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

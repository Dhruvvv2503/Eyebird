import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import FinalCTASection from '@/components/landing/FinalCTASection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Eyebird Instagram Audit',
  description: 'One-time ₹99 audit. 22 metrics. AI-powered action plan. Use code LAUNCH for ₹200 off.',
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <section
          className="section text-center relative overflow-hidden"
          style={{ background: 'var(--bg-base)' }}
        >
          {/* Glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none opacity-15 blur-[80px]"
            style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.8), transparent 65%)' }}
          />
          <div className="relative">
            <p className="eyebrow mb-4">Pricing</p>
            <h1
              className="font-black mb-4"
              style={{ fontSize: 'clamp(30px, 5vw, 60px)', color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.05 }}
            >
              Simple. One-time. No surprises.
            </h1>
            <p className="text-lg max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Pay once, get your full audit forever. Use code{' '}
              <span
                className="font-bold font-mono px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(168,85,247,0.1)', color: 'var(--brand-mid)', border: '1px solid rgba(168,85,247,0.25)' }}
              >
                LAUNCH
              </span>{' '}
              to pay only ₹99 instead of ₹299.
            </p>
          </div>
        </section>
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}

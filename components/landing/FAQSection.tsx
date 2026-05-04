'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Plus } from 'lucide-react';

/*
  FIX 7: Full FAQ accordion with 7 questions.
  - Only ONE item open at a time (true accordion)
  - Clicking an open item closes it
  - Smooth Framer Motion height animation
  - Touch targets min 44px (Apple HIG)
  - Questions written as creators think them
*/

const FAQS = [
  {
    q: 'Will you post anything on my account?',
    a: "Never. We connect using Instagram's official read-only API. We can only read your data — we cannot post, comment, follow, unfollow, or take any action on your account. You can revoke access at any time from your Instagram settings.",
  },
  {
    q: 'Does this work for personal accounts?',
    a: "No — Instagram's official API only works with Creator and Business accounts. The good news: switching is completely free and takes 30 seconds. Go to Instagram Settings → Account → Switch to Professional Account → Creator. Then come back and connect.",
  },
  {
    q: 'How long does the audit take?',
    a: "Under 60 seconds from connecting your Instagram to seeing your full report. Our AI reads your last 30 posts, your audience patterns, and your hashtag data simultaneously.",
  },
  {
    q: 'Is this a subscription? Will I be charged again?',
    a: "No. You pay ₹99 once (using code LAUNCH) and own your audit forever. We will never charge you again unless you choose to run a new audit. No hidden fees, no auto-renewal, no subscription.",
  },
  {
    q: 'Is my Instagram data safe?',
    a: "Yes. We use Instagram's official Meta-approved API — the same one used by tools like Buffer and Later. We never store your password. Your data is encrypted and used only to generate your audit. You can request deletion at any time by emailing us.",
  },
  {
    q: 'What if my account is too small?',
    a: "There is no minimum. We've seen useful insights from accounts with 500 followers. In fact, smaller accounts often benefit most — the earlier you fix your foundations, the faster you grow.",
  },
  {
    q: "I paid but didn't get my PDF. What do I do?",
    a: "Check your spam folder first. If it's not there, email us at support@eyebird.in with your Instagram username and we'll resend it within 2 hours. Every paid audit is permanently stored — you will always get your report.",
  },
];

function FAQItem({
  faq,
  isOpen,
  onToggle,
  index,
}: {
  faq: (typeof FAQS)[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Toggle button — min 44px height for touch (Apple HIG) */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          textAlign: 'left',
          gap: 16,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          borderRadius: 8,
        }}
      >
        <span style={{
          fontWeight: 500,
          fontSize: 15,
          letterSpacing: '-0.01em',
          color: isOpen ? '#FAFAFA' : 'rgba(255,255,255,0.65)',
          lineHeight: 1.45,
          transition: 'color 0.2s',
          textAlign: 'left',
        }}>
          {faq.q}
        </span>
        {/* + icon rotates to × on open */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isOpen ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${isOpen ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.1)'}`,
          transition: 'all 0.2s',
        }}>
          <Plus
            size={14}
            style={{
              color: isOpen ? '#A855F7' : 'rgba(255,255,255,0.4)',
              transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease, color 0.2s',
            }}
          />
        </div>
      </button>

      {/* Answer — AnimatePresence for smooth mount/unmount */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              paddingTop: 4,
              paddingBottom: 20,
              fontSize: 14,
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.75,
            }}>
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });
  // Only one open at a time — null means all closed
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (i: number) => {
    setOpenIndex(prev => (prev === i ? null : i));
  };

  return (
    <section id="faq" style={{
      background: 'var(--bg-base)',
      padding: '96px 28px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div ref={ref} style={{ textAlign: 'center', marginBottom: 56 }}>
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            className="eyebrow" style={{ marginBottom: 16 }}>
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.06 }}
            style={{ fontSize: 'clamp(24px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', lineHeight: 1.06 }}>
            Questions creators ask<br />before connecting
          </motion.h2>
        </div>

        {/* Accordion container */}
        <div style={{
          borderRadius: 20,
          padding: '0 28px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'var(--bg-surface)',
        }}>
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => handleToggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

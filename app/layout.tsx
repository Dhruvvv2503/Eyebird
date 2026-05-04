import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Eyebird — Know exactly why your reels flop. Fix it in minutes.',
  description:
    'Eyebird audits your Instagram account using AI and tells you the 3 things to fix this week. No guessing. No generic advice. Just what actually works for YOUR account.',
  keywords: ['instagram audit', 'reels analysis', 'instagram growth', 'creator tools india', 'instagram analytics india'],
  authors: [{ name: 'Eyebird' }],
  creator: 'Eyebird',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://eyebird.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://eyebird.in',
    title: 'Eyebird — Know exactly why your reels flop.',
    description: 'AI-powered Instagram audit for Indian creators. Get 22 insights + personalised action plan in 60 seconds.',
    siteName: 'Eyebird',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eyebird — Know exactly why your reels flop.',
    description: 'AI-powered Instagram audit for Indian creators.',
    creator: '@eyebird_in',
  },
  robots: { index: true, follow: true },
  themeColor: '#0A0A10',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

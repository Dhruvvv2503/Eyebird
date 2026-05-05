/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: 'scontent.cdninstagram.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // Ignore type and lint errors during production build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Explicit permissive headers for legal pages + bots
  async headers() {
    const publicHeaders = [
      { key: 'X-Robots-Tag', value: 'all' },
      { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
      // Allow framing by Meta/Facebook tools
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      // Explicitly signal this is public content
      { key: 'Vary', value: 'Accept-Encoding' },
    ];

    return [
      { source: '/data-deletion',   headers: publicHeaders },
      { source: '/data-deletion/',  headers: publicHeaders },
      { source: '/privacy',         headers: publicHeaders },
      { source: '/privacy/',        headers: publicHeaders },
      { source: '/terms',           headers: publicHeaders },
      { source: '/terms/',          headers: publicHeaders },
      // Also serve robots.txt without any restriction
      { source: '/robots.txt',      headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] },
    ];
  },

  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'puppeteer-core', '@sparticuz/chromium-min'];
    }
    return config;
  },
};

module.exports = nextConfig;

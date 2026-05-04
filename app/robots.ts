import type { MetadataRoute } from 'next';

/**
 * Next.js App Router robots.ts
 * Served at /robots.txt by Next.js automatically.
 * Explicitly allows facebookexternalhit and Facebot for Meta App Review.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Facebot',
        allow: '/',
      },
    ],
    // No sitemap reference — sitemap.xml does not exist yet
  };
}

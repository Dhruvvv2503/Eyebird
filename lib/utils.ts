/**
 * Utility functions for Eyebird
 */

/** Format number in Indian number system (e.g. 1,00,000) */
export function formatIndianNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('en-IN');
}

/** Format currency in Indian Rupees */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

/** Get score color based on value (works on both light and dark bg via CSS vars) */
export function getScoreColor(score: number): string {
  if (score >= 70) return '#22C55E';  // green-500
  if (score >= 50) return '#F59E0B';  // amber-500
  return '#EF4444';                    // red-500
}

/** Get score label */
export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 30) return 'Below Average';
  return 'Needs Work';
}

/** Get score CSS class */
export function getScoreClass(score: number): string {
  if (score >= 70) return 'score-high';
  if (score >= 50) return 'score-medium';
  return 'score-low';
}

/** Compute engagement rate */
export function computeEngagementRate(
  likes: number,
  comments: number,
  reach: number
): number {
  if (!reach || reach === 0) return 0;
  return parseFloat((((likes + comments) / reach) * 100).toFixed(2));
}

/** Engagement benchmark by follower band */
export function getEngagementBenchmark(followers: number): number {
  if (followers < 10000) return 5.0;
  if (followers < 50000) return 3.5;
  if (followers < 100000) return 2.5;
  if (followers < 500000) return 1.8;
  return 1.2;
}

/** Format date to Indian locale string */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Truncate text to max chars */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + '…';
}

/** Get first line of caption (hook) */
export function getHook(caption: string | null): string {
  if (!caption) return '';
  return caption.split('\n')[0].trim().slice(0, 120);
}

/** Classify media type from Instagram media_type */
export function classifyMediaType(mediaType: string, mediaProductType?: string): 'reel' | 'carousel' | 'static' {
  if (mediaType === 'VIDEO' && mediaProductType === 'REELS') return 'reel';
  if (mediaType === 'CAROUSEL_ALBUM') return 'carousel';
  return 'static';
}

/** Day name from number (0=Sunday) */
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Generate a consistent color opacity for heatmap */
export function heatmapOpacity(value: number, max: number): number {
  if (max === 0) return 0;
  const normalized = value / max;
  return Math.max(0.04, normalized);
}

/** Validate email */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Sleep for N ms */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Estimated brand deal rates based on followers and ER */
export function estimateBrandRates(followers: number, engagementRate: number): {
  story: { min: number; max: number };
  reel: { min: number; max: number };
  carousel: { min: number; max: number };
  monthly_package: { min: number; max: number };
} {
  const baseRate = Math.floor((followers / 1000) * engagementRate * 100);
  return {
    story: { min: Math.floor(baseRate * 0.3), max: Math.floor(baseRate * 0.6) },
    reel: { min: Math.floor(baseRate * 0.8), max: Math.floor(baseRate * 1.5) },
    carousel: { min: Math.floor(baseRate * 0.6), max: Math.floor(baseRate * 1.2) },
    monthly_package: {
      min: Math.floor(baseRate * 4),
      max: Math.floor(baseRate * 8),
    },
  };
}

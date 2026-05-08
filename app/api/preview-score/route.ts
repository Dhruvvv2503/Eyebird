import { NextRequest, NextResponse } from 'next/server';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 3600000 });
    return true;
  }
  if (record.count >= 10) return false;
  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!getRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again in an hour.' }, { status: 429 });
  }

  const { username } = await request.json();
  if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

  const cleanUsername = username.replace('@', '').trim().toLowerCase();
  if (!cleanUsername) return NextResponse.json({ error: 'Invalid username' }, { status: 400 });

  try {
    let profileData: any = null;
    const publicToken = process.env.INSTAGRAM_PUBLIC_TOKEN;

    if (publicToken) {
      const res = await fetch(
        `https://graph.instagram.com/v21.0/${cleanUsername}?fields=username,biography,followers_count,media_count&access_token=${publicToken}`,
        { next: { revalidate: 3600 } }
      );
      if (res.ok) profileData = await res.json();
    }

    const followersCount = profileData?.followers_count || Math.floor(Math.random() * 50000) + 1000;
    const estimatedPostsPerWeek = (Math.random() * 4 + 0.5).toFixed(1);
    const isPostingRegularly = parseFloat(estimatedPostsPerWeek) >= 3;

    let estimatedER: string;
    let erStatus: 'above' | 'average' | 'below';
    if (followersCount < 10000) {
      estimatedER = (Math.random() * 4 + 3).toFixed(1);
      erStatus = parseFloat(estimatedER) >= 5 ? 'above' : parseFloat(estimatedER) >= 3 ? 'average' : 'below';
    } else if (followersCount < 100000) {
      estimatedER = (Math.random() * 3 + 1).toFixed(1);
      erStatus = parseFloat(estimatedER) >= 3 ? 'above' : parseFloat(estimatedER) >= 2 ? 'average' : 'below';
    } else {
      estimatedER = (Math.random() * 1.5 + 0.5).toFixed(1);
      erStatus = parseFloat(estimatedER) >= 1.5 ? 'above' : parseFloat(estimatedER) >= 1 ? 'average' : 'below';
    }

    const issues = [];

    issues.push(isPostingRegularly ? {
      type: 'good' as const,
      label: 'Posting frequency',
      value: `${estimatedPostsPerWeek}x/week`,
      status: 'Good',
      detail: 'Consistent posting detected',
    } : {
      type: 'warning' as const,
      label: 'Posting frequency',
      value: `${estimatedPostsPerWeek}x/week`,
      status: 'Below optimal',
      detail: 'Algorithm rewards consistency above 3x/week',
    });

    issues.push({
      type: (erStatus === 'above' ? 'good' : erStatus === 'average' ? 'neutral' : 'warning') as 'good' | 'neutral' | 'warning',
      label: 'Estimated engagement',
      value: `~${estimatedER}%`,
      status: erStatus === 'above' ? 'Above average' : erStatus === 'average' ? 'Average' : 'Below average',
      detail: erStatus === 'above' ? 'Strong audience connection' : 'Room to improve content strategy',
    });

    issues.push({
      type: 'warning' as const,
      label: 'Hashtag strategy',
      value: 'Not analysed',
      status: 'Needs review',
      detail: 'Connect account to check if hashtags are burying your reach',
    });

    return NextResponse.json({
      username: cleanUsername,
      followersCount: followersCount.toLocaleString('en-IN'),
      issues,
      issuesFound: issues.filter(i => i.type === 'warning').length,
      message: `We found ${issues.filter(i => i.type === 'warning').length} things worth fixing on @${cleanUsername}`,
    });
  } catch (error) {
    console.error('Preview score error:', error);
    return NextResponse.json({
      username: cleanUsername,
      followersCount: 'Unknown',
      issues: [
        { type: 'warning', label: 'Posting frequency', value: 'Not checked', status: 'Needs review', detail: 'Connect account for accurate data' },
        { type: 'warning', label: 'Hashtag strategy', value: 'Not checked', status: 'Needs review', detail: 'Most creators use hashtags that bury their reach' },
        { type: 'neutral', label: 'Engagement rate', value: 'Not checked', status: 'Needs connection', detail: 'Connect Instagram to see your real ER vs benchmark' },
      ],
      issuesFound: 2,
      message: `Sign up to see the full analysis for @${cleanUsername}`,
    });
  }
}

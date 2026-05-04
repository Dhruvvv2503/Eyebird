import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // This route normally:
  // 1. Receives raw IG data
  // 2. Computes basic metrics
  // 3. Calls Anthropic Claude API for AI analysis
  // 4. Stores in Supabase `audits` table
  
  // Handled client-side with mock data for this build since IG API is missing
  return NextResponse.json({ status: 'success', message: 'Audit generation endpoint' });
}

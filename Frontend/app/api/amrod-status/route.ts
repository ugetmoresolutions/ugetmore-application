import { NextRequest, NextResponse } from 'next/server';
interface TokenCache {
  token: string;
  expiry: number;
  fetchedAt: number;
}
const tokenCache: TokenCache | null = null;

export async function GET(request: NextRequest) {
  if (!tokenCache) {
    return NextResponse.json({ 
      hasToken: false, 
      isExpired: true 
    });
  }
  
  const now = Date.now();
  const ageInSeconds = (now - tokenCache.fetchedAt) / 1000;
  const isExpired = ageInSeconds >= tokenCache.expiry;
  const expiresIn = tokenCache.expiry - ageInSeconds;
  
  return NextResponse.json({
    hasToken: true,
    isExpired,
    expiresIn: isExpired ? 0 : Math.max(0, expiresIn),
    fetchedAt: new Date(tokenCache.fetchedAt).toISOString()
  });
}
// lib/token-manager.ts
import axios from 'axios';

// Token management
export interface TokenCache {
  token: string;
  expiry: number;
  fetchedAt: number;
}

// Global token cache - in production, consider using Redis or similar for multiple instances
let tokenCache: TokenCache | null = null;

const LOGIN_CREDENTIALS = {
  username: "nokuthula.mchunu@hisgroup-it.co.za",
  password: "Thula121-",
  customerCode: "027897"
};

const LOGIN_ENDPOINT = "https://identity.amrod.co.za/VendorLogin";

export async function getAmrodToken(): Promise<string> {
  const now = Date.now();
  
  // Check if we have a valid cached token (with 10 minute buffer before expiry)
  if (tokenCache && (now - tokenCache.fetchedAt) < (tokenCache.expiry - 600) * 1000) {
    console.log("Using cached token");
    return tokenCache.token;
  }
  
  try {
    console.log("Fetching new token...");
    const response = await axios.post(LOGIN_ENDPOINT, LOGIN_CREDENTIALS, {
      headers: { "Content-Type": "application/json" }
    });
    
    const { token, expiry } = response.data;
    
    tokenCache = {
      token,
      expiry,
      fetchedAt: now
    };
    
    console.log(`Token fetched successfully, expires in ${expiry} seconds`);
    return token;
  } catch (error: any) {
    console.error("Failed to fetch Amrod token:", error.message);
    console.error("Error response:", error.response?.data || error);
    throw new Error("Authentication failed");
  }
}

export function getTokenCache(): TokenCache | null {
  return tokenCache;
}

export function clearTokenCache(): void {
  tokenCache = null;
  console.log("Token cache cleared");
}


export function getTokenStatus(): { hasToken: boolean; isExpired: boolean; expiresIn?: number } {
  if (!tokenCache) {
    return { hasToken: false, isExpired: true };
  }
  
  const now = Date.now();
  const ageInSeconds = (now - tokenCache.fetchedAt) / 1000;
  const isExpired = ageInSeconds >= tokenCache.expiry;
  const expiresIn = tokenCache.expiry - ageInSeconds;
  
  return {
    hasToken: true,
    isExpired,
    expiresIn: isExpired ? 0 : Math.max(0, expiresIn)
  };
}
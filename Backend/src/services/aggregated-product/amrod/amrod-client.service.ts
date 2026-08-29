// services/aggregated-product/amrod/amrod-client.service.ts
import { Service, Inject } from "typedi";
import {
  IAmrodConfigService,
  AMROD_CONFIG_SERVICE_TOKEN,
} from "@/interfaces/aggregated-product/amrod/amrod-config.service.interface";
import {
  IAmrodClientService,
  AMROD_CLIENT_SERVICE_TOKEN,
} from "@/interfaces/aggregated-product/amrod/amrod-client.service.interface";
import { HttpException } from "@/exceptions/HttpException";
import fetch, { RequestInit, Response } from "node-fetch";

interface TokenCache {
  token: string;
  expiry: number;
  fetchedAt: number;
}

@Service({ id: AMROD_CLIENT_SERVICE_TOKEN })
export class AmrodClientService implements IAmrodClientService {
  private tokenCache: TokenCache | null = null;
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private readonly REQUEST_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
  private isAuthenticating: boolean = false;
  private authPromise: Promise<string> | null = null;
  private lastError: string | null = null;

  constructor(
    @Inject(AMROD_CONFIG_SERVICE_TOKEN)
    private configService: IAmrodConfigService
  ) {}

  /**
   * Get authentication token from Amrod - ENHANCED with retry logic
   */
  private async getToken(): Promise<string> {
    const now = Date.now();

    // Check if we have a valid cached token (with 10 minute buffer before expiry)
    if (this.tokenCache && now < (this.tokenCache.fetchedAt + (this.tokenCache.expiry - 600) * 1000)) {
      return this.tokenCache.token;
    }

    // If authentication is already in progress, wait for it
    if (this.isAuthenticating && this.authPromise) {
      console.log("🔄 Authentication already in progress, waiting...");
      return await this.authPromise;
    }

    this.isAuthenticating = true;
    this.authPromise = this.performAuthentication();
    
    try {
      const token = await this.authPromise;
      return token;
    } finally {
      this.isAuthenticating = false;
      this.authPromise = null;
    }
  }

  /**
   * Perform the actual authentication with retry logic
   */
  private async performAuthentication(): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔐 Attempting Amrod authentication (attempt ${attempt}/${maxRetries})...`);
        const credentials = this.configService.getCredentials();

        // Validate credentials
        if (!credentials.username || !credentials.password || !credentials.customerCode) {
          throw new Error("Missing Amrod credentials in environment variables");
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response: Response = await fetch(this.configService.getLoginUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          signal: controller.signal as any
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Login failed with status: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json() as { token: string; expiry: number };
        const { token, expiry } = responseData;

        // Cache the token
        this.tokenCache = {
          token,
          expiry,
          fetchedAt: Date.now(),
        };

        this.lastError = null;
        console.log(`✅ Amrod authentication successful, token expires in ${expiry} seconds`);
        return token;

      } catch (error: any) {
        lastError = error;
        console.error(`❌ Amrod authentication attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
          console.log(`⏳ Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // If we get here, all retries failed
    this.lastError = lastError?.message || "Authentication failed after all retries";
    throw new HttpException(401, `Amrod authentication failed: ${this.lastError}`);
  }

  /**
   * Make a request to Amrod API - ENHANCED with authentication retry
   */
  public async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 2
  ): Promise<any> {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // Return cached response if available and fresh
    if (this.requestCache.has(cacheKey)) {
      const cached = this.requestCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.REQUEST_CACHE_TTL) {
        console.log(`📦 Returning cached response for: ${endpoint}`);
        return cached.data;
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const token = await this.getToken();
        const baseUrl = this.configService.getBaseUrl();

        console.log(`🔄 Making request to ${endpoint} (attempt ${attempt}/${maxRetries})`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for data endpoints

        const response: Response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers,
          } as Record<string, string>,
          ...options,
          signal: controller.signal as any
        });

        clearTimeout(timeoutId);

        if (response.status === 401) {
          // Token expired, clear cache and retry
          console.log("🔑 Token expired, clearing cache and retrying...");
          this.clearTokenCache();
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new HttpException(
            response.status,
            `Amrod API error for ${endpoint}: ${response.statusText} - ${errorText}`
          );
        }

        const data = await response.json();
        
        // Cache successful responses
        this.requestCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });

        console.log(`✅ Successfully fetched ${endpoint}`);
        return data;

      } catch (error: any) {
        lastError = error;
        console.error(`❌ Request to ${endpoint} failed (attempt ${attempt}):`, error.message);
        
        if (attempt < maxRetries && !error.message?.includes('timeout')) {
          const waitTime = attempt * 1000;
          console.log(`⏳ Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError || new Error(`Failed to fetch ${endpoint} after ${maxRetries} attempts`);
  }

  /**
   * Get all products from Amrod WITH BRANDING DATA
   */
  public async getProducts(): Promise<any[]> {
    return this.makeRequest("/api/v1/Products/GetProductsAndBranding");
  }

  /**
   * GET ALL PRODUCTS FROM AMROD VIA PRODUCTS ENDPOINT
   */
  public async getProductsFromProductsEndpoint(): Promise<any[]> {
    return this.makeRequest("/api/v1/Products");
  }

  /**
   * GET ALL CATEGORIES FROM AMROD
   */
  public async getCategories(): Promise<any[]> {
    return this.makeRequest("/api/v1/Categories");
  }

  /**
   * Get all prices from Amrod - ENHANCED with better error handling
   */
  public async getPrices(): Promise<any[]> {
    try {
      console.log("💰 Fetching Amrod prices...");
      const prices = await this.makeRequest("/api/v1/Prices", {}, 3); // More retries for prices
      console.log(`✅ Successfully fetched ${prices.length} prices`);
      return prices;
    } catch (error: any) {
      console.error("❌ CRITICAL: Failed to fetch Amrod prices:", error.message);
      throw new Error(`Cannot proceed without prices: ${error.message}`);
    }
  }

  /**
   * Get all stock levels from Amrod
   */
  public async getStock(): Promise<any[]> {
    return this.makeRequest("/api/v1/Stock");
  }

  /**
   * Clear the token cache
   */
  public clearTokenCache(): void {
    this.tokenCache = null;
    this.requestCache.clear();
    console.log("🗑️ Amrod token cache cleared");
  }

  /**
   * Clear request cache
   */
  public clearRequestCache(): void {
    this.requestCache.clear();
    console.log("🗑️ Amrod request cache cleared");
  }

  /**
   * Check if we're currently authenticated
   */
  public isAuthenticated(): boolean {
    return this.tokenCache !== null && 
           Date.now() < (this.tokenCache.fetchedAt + (this.tokenCache.expiry - 600) * 1000);
  }

  /**
   * Get last error message
   */
  public getLastError(): string | null {
    return this.lastError;
  }
}
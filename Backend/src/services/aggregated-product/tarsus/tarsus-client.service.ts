// services/aggregated-product/tarsus/tarsus-client.service.ts
import { Service, Inject } from "typedi";
import { TarsusConfigService } from "./tarsus-config.service";
import { ITarsusClientService, TARSUS_CLIENT_SERVICE_TOKEN } from "@/interfaces/aggregated-product/tarsus/tarsus-client.service.interface";
import { HttpException } from "@/exceptions/HttpException";
import fetch, { RequestInit, Response } from 'node-fetch';

@Service({ id: TARSUS_CLIENT_SERVICE_TOKEN })
export class TarsusClientService implements ITarsusClientService {
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private readonly REQUEST_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
  private productsCache: { data: any[]; timestamp: number } | null = null;
  private readonly PRODUCTS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

  constructor(
    @Inject()
    private configService: TarsusConfigService
  ) {}

  /**
   * OPTIMIZED: Make request with caching and timeout protection
   */
  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {}, 
    useCache: boolean = true
  ): Promise<any> {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // Return cached response if available and fresh
    if (useCache && this.requestCache.has(cacheKey)) {
      const cached = this.requestCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.REQUEST_CACHE_TTL) {
        console.log(`🏢 Returning cached Tarsus response for: ${endpoint}`);
        return cached.data;
      }
    }

    const baseUrl = this.configService.getBaseUrl();
    const apiKey = this.configService.getApiKey();

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response: Response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        } as Record<string, string>,
        ...options,
        signal: controller.signal as any
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new HttpException(
          response.status, 
          `Tarsus API error for ${endpoint}: ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      
      // Cache successful responses
      if (useCache) {
        this.requestCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new HttpException(408, `Tarsus request timeout for ${endpoint}`);
      }
      throw error;
    }
  }

  /**
   * OPTIMIZED: Get products with dedicated caching
   */
  public async getProducts(): Promise<any[]> {
    const now = Date.now();
    
    // Check products-specific cache first (longer TTL for products)
    if (this.productsCache && (now - this.productsCache.timestamp) < this.PRODUCTS_CACHE_TTL) {
      console.log('🏢 Returning cached Tarsus products');
      return this.productsCache.data;
    }

    const endpoint = this.configService.getProductFeedEndpoint();
    
    try {
      console.log('🏢 Fetching fresh Tarsus products...');
      const response = await this.makeRequest(endpoint, {}, false); // Don't use request cache for products
      
      const products = response.Products || [];
      
      // Cache the products separately with longer TTL
      this.productsCache = {
        data: products,
        timestamp: now
      };

      console.log(`🏢 Successfully fetched ${products.length} Tarsus products`);
      return products;
    } catch (error: any) {
      console.error('🏢 Failed to fetch Tarsus products:', error.message);
      
      // If we have stale cache data and the API is failing, return stale data
      if (this.productsCache) {
        console.log('🏢 Returning stale cached products due to API failure');
        return this.productsCache.data;
      }
      
      throw error;
    }
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.requestCache.clear();
    this.productsCache = null;
    console.log('🏢 Tarsus cache cleared');
  }

  /**
   * Get cache statistics (useful for debugging)
   */
  public getCacheStats(): { requestCacheSize: number; productsCacheAge: number | null } {
    const now = Date.now();
    return {
      requestCacheSize: this.requestCache.size,
      productsCacheAge: this.productsCache ? now - this.productsCache.timestamp : null
    };
  }
}
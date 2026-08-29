// interfaces/aggregated-product/amrod/amrod-client.service.interface.ts
import { Token } from "typedi";

export interface IAmrodClientService {

  // Authentication methods
  isAuthenticated(): boolean;
  getLastError(): string | null;
  
  getProducts(): Promise<any[]>; // This should now use GetProductsAndBranding
  // getProductsAndBranding(): Promise<any[]>; 
  getPrices(): Promise<any[]>;
  getStock(): Promise<any[]>;
  getCategories(): Promise<any[]>; // ADD THIS METHOD
  makeRequest(endpoint: string, options?: RequestInit): Promise<any>;
  clearTokenCache(): void;
   /**
   * Get all products from Amrod via Products endpoint
   */
  getProductsFromProductsEndpoint(): Promise<any[]>;
}

export const AMROD_CLIENT_SERVICE_TOKEN = new Token<IAmrodClientService>("IAmrodClientService");
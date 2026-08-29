// interfaces/aggregated-product/parrot/parrot-client.service.interface.ts
import { Token } from "typedi";

export interface IParrotClientService {
  getProducts(): Promise<any[]>;
  clearCache?(): void; // Optional for cache management
}

export const PARROT_CLIENT_SERVICE_TOKEN = new Token<IParrotClientService>("IParrotClientService");
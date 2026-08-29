// interfaces/aggregated-product/tarsus/tarsus-client.service.interface.ts
import { Token } from "typedi";

export interface ITarsusClientService {
  getProducts(): Promise<any[]>;
  clearCache?(): void;
}

export const TARSUS_CLIENT_SERVICE_TOKEN = new Token<ITarsusClientService>("ITarsusClientService");
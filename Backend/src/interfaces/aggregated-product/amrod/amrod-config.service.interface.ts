import { Token } from "typedi";

export interface IAmrodConfigService {
  getCredentials(): { username: string; password: string; customerCode: string };
  getBaseUrl(): string;
  getLoginUrl(): string;
  getPriceMarkupPercentage(): number;
}

export const AMROD_CONFIG_SERVICE_TOKEN = new Token<IAmrodConfigService>("IAmrodConfigService");
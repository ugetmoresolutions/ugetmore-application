// services/aggregated-product/tarsus/tarsus-config.service.ts
import { Service } from "typedi";

@Service()
export class TarsusConfigService {
  public getApiKey(): string {
    return process.env.TARSUS_API_KEY!;
  }

  public getBaseUrl(): string {
    return process.env.TARSUS_BASE_URL!;
  }

  public getProductFeedEndpoint(): string {
    return process.env.TARSUS_PRODUCT_FEED_ENDPOINT!;
  }

  public getRequestTimeout(): number {
    return parseInt(process.env.TARSUS_REQUEST_TIMEOUT || "30000");
  }
}
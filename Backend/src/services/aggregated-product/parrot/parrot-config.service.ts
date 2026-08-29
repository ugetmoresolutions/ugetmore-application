import { Service } from "typedi";

@Service()
export class ParrotConfigService {
  public getBaseUrl(): string {
    return process.env.PARROT_BASE_URL!;
  }

  public getProductFeedEndpoint(): string {
    return process.env.PARROT_PRODUCT_FEED_ENDPOINT!;
  }
}
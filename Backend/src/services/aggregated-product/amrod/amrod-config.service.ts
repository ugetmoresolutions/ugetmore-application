import { Service } from "typedi";
import {
  IAmrodConfigService,
  AMROD_CONFIG_SERVICE_TOKEN,
} from "@/interfaces/aggregated-product/amrod/amrod-config.service.interface";

@Service({ id: AMROD_CONFIG_SERVICE_TOKEN })
export class AmrodConfigService implements IAmrodConfigService {
  public getCredentials() {
    return {
      username: process.env.AMROD_USERNAME!,
      password: process.env.AMROD_PASSWORD!,
      customerCode: process.env.AMROD_CUSTOMER_CODE!,
    };
  }

  public getBaseUrl(): string {
    return process.env.AMROD_BASE_URL!;
  }

  public getLoginUrl(): string {
    return process.env.AMROD_LOGIN_URL!;
  }

  public getPriceMarkupPercentage(): number {
    return parseInt(process.env.PRICE_MARKUP_PERCENTAGE || "25");
  }
}

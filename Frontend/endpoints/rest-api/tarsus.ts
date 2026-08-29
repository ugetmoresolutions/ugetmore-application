import { TARSUS_GET } from "@/endpoints/lib/tarsus-client";

export const TARSUS_API = {
  GET_PRODUCTS: async (): Promise<any> => {
    console.log('🔧 TARSUS_API.GET_PRODUCTS called');
    const result = await TARSUS_GET("Customer-ProductCatalogue");
    console.log('🔧 TARSUS_API.GET_PRODUCTS result:', result);
    return result;
  },
};
import { GET } from "@/endpoints/lib/parrot-client";
import { IProduct } from "@/interfaces/product/product";
import { transformParrotResponse } from "@/utils/parrot-transform";

export const PARROT_API = {
  GET_CUSTOMER_PRODUCT_FEED: async (): Promise<any> => {
    return await GET("customerProductFeed");
  },
  
  GET_PRODUCTS: async (): Promise<IProduct[]> => {
    const rawData = await GET("customerProductFeed");
    return transformParrotResponse(rawData);
  },
  
  GET_PRODUCT_BY_CODE: async (stockCode: string): Promise<IProduct | null> => {
    const rawData = await GET("customerProductFeed");
    const products = transformParrotResponse(rawData);
    return products.find(product => product.simpleCode === stockCode) || null;
  },
  
  GET_PRODUCTS_BY_CATEGORY: async (category: string): Promise<IProduct[]> => {
    const rawData = await GET("customerProductFeed");
    const products = transformParrotResponse(rawData);
    return products.filter(product => 
      product.categories.some(cat => 
        cat.name.toLowerCase().includes(category.toLowerCase()) ||
        cat.path.toLowerCase().includes(category.toLowerCase())
      )
    );
  }
};
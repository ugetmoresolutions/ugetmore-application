import { ParrotProductService } from '@/services/parrotProductService';
import { IProduct } from '@/interfaces/product/product';

export const STATIONERY_API = {
  // Search products using the new service
  SEARCH_PRODUCTS: async (searchTerm: string): Promise<IProduct[]> => {
    return await ParrotProductService.searchProducts(searchTerm);
  },

  // Get product details by codes
  GET_PRODUCTS_BY_CODES: async (productCodes: string[]): Promise<IProduct[]> => {
    return await ParrotProductService.getProductsByCodes(productCodes);
  },

  // Get single product by code
  GET_PRODUCT_BY_CODE: async (productCode: string): Promise<IProduct | null> => {
    return await ParrotProductService.getProductByCode(productCode);
  }
};
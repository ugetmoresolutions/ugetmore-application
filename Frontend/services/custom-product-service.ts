// services/product/custom-product-service.ts
import { PRODUCT_API } from '@/endpoints/rest-api/product';
import { IUnifiedProduct, convertCustomToAmrodFormat } from '@/interfaces/product/unified-product';

export class CustomProductService {
  static isCustomProduct(productId: string): boolean {
    // Check if it's a numeric ID (legacy custom products) or any string (SKU-based)
    return !isNaN(Number(productId)) || true; // All products are considered custom now
  }

  static async getCustomProduct(productIdentifier: string): Promise<IUnifiedProduct | null> {
    try {
      // Try to fetch by SKU first (most common case)
      const response = await PRODUCT_API.GET_PRODUCT_BY_SKU(productIdentifier);
      
      if (response.data) {
        return convertCustomToAmrodFormat(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching custom product by SKU:', error);
      
      // Fallback: try by ID if it's numeric
      if (!isNaN(Number(productIdentifier))) {
        try {
          const id = parseInt(productIdentifier, 10);
          const response = await PRODUCT_API.GET_PRODUCT_BY_ID(id);
          if (response.data) {
            return convertCustomToAmrodFormat(response.data);
          }
        } catch (fallbackError) {
          console.error('Fallback ID fetch also failed:', fallbackError);
        }
      }
      
      return null;
    }
  }

  static async getAllCustomProducts(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
}): Promise<IUnifiedProduct[]> {
  try {
    const response = await PRODUCT_API.GET_ALL_PRODUCTS(params);
    console.log(response.data.products)

    if (response.data?.products) {
      // ✅ Filter only ACTIVE products
      const activeProducts = response.data.products.filter(
        (product: any) => product.status === "Active"
      );

      return activeProducts.map(convertCustomToAmrodFormat);
    }

    return [];
  } catch (error) {
    console.error("Error fetching custom products:", error);
    return [];
  }
}


  static async searchCustomProducts(query: string): Promise<IUnifiedProduct[]> {
    try {
      const response = await PRODUCT_API.SEARCH_PRODUCTS(query);
      
      if (response.data) {
        return response.data.map(convertCustomToAmrodFormat);
      }
      
      return [];
    } catch (error) {
      console.error('Error searching custom products:', error);
      return [];
    }
  }

  static async getCustomProductsByCategory(category: string): Promise<IUnifiedProduct[]> {
  try {
    const response = await PRODUCT_API.GET_PRODUCTS_BY_CATEGORY(category);

    if (response.data) {
      // ✅ Filter only active products
      const activeProducts = response.data.filter(
        (product: any) => product.status === "Active"
      );

      return activeProducts.map(convertCustomToAmrodFormat);
    }

    return [];
  } catch (error) {
    console.error("Error fetching custom products by category:", error);
    return [];
  }
}


  static async getRelatedCustomProducts(currentProductSku: string, category: string): Promise<IUnifiedProduct[]> {
    try {
      const products = await this.getCustomProductsByCategory(category);
      
      return products
        .filter(product => product.simpleCode !== currentProductSku)
        .slice(0, 4);
    } catch (error) {
      console.error('Error fetching related custom products:', error);
      return [];
    }
  }
}
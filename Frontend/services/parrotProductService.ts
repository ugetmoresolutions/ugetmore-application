import { PARROT_API } from '@/endpoints/rest-api/parrot';
import { indexedDBStorage } from '@/utils/indexedDbStorage';
import { IProduct } from '@/interfaces/product/product';

export class ParrotProductService {
  // Get full product details by product codes
  static async getProductsByCodes(productCodes: string[]): Promise<IProduct[]> {
    if (!productCodes || productCodes.length === 0) {
      return [];
    }

    try {
      // Try to get from cache first
      const cachedProducts = await indexedDBStorage.getParrotProducts();
      const products: IProduct[] = [];

      // Find products from cache
      if (cachedProducts && cachedProducts.length > 0) {
        for (const code of productCodes) {
          const cachedProduct = cachedProducts.find(p => p.simpleCode === code);
          if (cachedProduct) {
            products.push(cachedProduct);
          }
        }
      }

      // If we found all products in cache, return them
      if (products.length === productCodes.length) {
        return products;
      }

      // If some products are missing from cache, fetch from API
      const missingCodes = productCodes.filter(
        code => !products.some(p => p.simpleCode === code)
      );

      if (missingCodes.length > 0) {
        console.log(`Fetching ${missingCodes.length} products from API that were not in cache`);
        
        // Get all products from API
        const allProducts = await PARROT_API.GET_PRODUCTS();
        
        // Cache the fresh data
        await indexedDBStorage.setParrotProducts(allProducts);
        
        // Find the missing products
        for (const code of missingCodes) {
          const product = allProducts.find(p => p.simpleCode === code);
          if (product) {
            products.push(product);
          }
        }
      }

      return products;
    } catch (error) {
      console.error('Error fetching products by codes:', error);
      throw error;
    }
  }

  // Get a single product by code
  static async getProductByCode(productCode: string): Promise<IProduct | null> {
    const products = await this.getProductsByCodes([productCode]);
    return products[0] || null;
  }

  // Search products with caching
  static async searchProducts(searchTerm: string): Promise<IProduct[]> {
    try {
      // Try cache first
      const cachedProducts = await indexedDBStorage.getParrotProducts();
      
      if (cachedProducts && cachedProducts.length > 0) {
        const filtered = cachedProducts.filter(product =>
          product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.simpleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.keywords?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filtered.length > 0) {
          return filtered;
        }
      }

      // If no results in cache or cache is empty, fetch from API
      const allProducts = await PARROT_API.GET_PRODUCTS();
      
      // Update cache
      await indexedDBStorage.setParrotProducts(allProducts);
      
      // Filter results
      return allProducts.filter(product =>
        product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.simpleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.keywords?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Preload cache (useful when app starts)
  static async preloadCache(): Promise<void> {
    try {
      const cachedProducts = await indexedDBStorage.getParrotProducts();
      if (!cachedProducts) {
        console.log('Preloading Parrot products cache...');
        await PARROT_API.GET_PRODUCTS();
      }
    } catch (error) {
      console.error('Error preloading cache:', error);
    }
  }
}
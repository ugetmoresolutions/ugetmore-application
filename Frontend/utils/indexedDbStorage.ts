// utils/indexedDbStorage.ts
import { IProduct, IProductPrice } from "@/interfaces/product/product";
import { ICategory } from "@/interfaces/product/category";
import { IStockItem } from "@/interfaces/product/stock";
import { IBrandingOption } from "@/interfaces/branding/branding";
import { IAggregatedProduct } from "@/interfaces/aggregated-product/aggregated-product";

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface StorageConfig {
  prices: {
    key: string;
    ttl: number;
  };
  tarsusProducts: {
    key: string;
    ttl: number;
  };
  parrotProducts: {
    key: string;
    ttl: number;
  };
  parrotProductsByCategory: {
    key: string;
    ttl: number;
  };
  products: {
    key: string;
    ttl: number;
  };
  aggregatedProducts: {
    key: string;
    ttl: number;
  };
  categories: {
    key: string;
    ttl: number;
  };
  stock: {
    key: string;
    ttl: number;
  };
  brandingPrices: {
    key: string;
    ttl: number;
  };
}

const STORAGE_CONFIG: StorageConfig = {
  prices: {
    key: "product_prices",
    ttl: 30 * 60 * 1000,
  },
  products: {
    key: "products_data",
    ttl: 60 * 60 * 1000,
  },
  aggregatedProducts: {
    key: "aggregated_products_data",
    ttl: 60 * 60 * 1000,
  },
  parrotProducts: {
    key: "parrot_products",
    ttl: 60 * 60 * 1000,
  },
  parrotProductsByCategory: {
    key: "parrot_products_category",
    ttl: 60 * 60 * 1000,
  },
  tarsusProducts: {
    key: "tarsus_products",
    ttl: 60 * 60 * 1000,
  },
  categories: {
    key: "categories_data",
    ttl: 60 * 60 * 1000,
  },
  stock: {
    key: "stock_data",
    ttl: 30 * 60 * 1000,
  },
  brandingPrices: {
    key: "branding_prices_data",
    ttl: 60 * 60 * 1000,
  },
};

class IndexedDBStorage {
  private dbName = "ProductCacheDB";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("cache")) {
          db.createObjectStore("cache", { keyPath: "key" });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!;
  }

  private async setItem<T>(key: string, data: T, ttl: number): Promise<void> {
    const db = await this.ensureDB();
    const now = Date.now();
    const cachedData: CachedData<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const request = store.put({ key, ...cachedData });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async getItem<T>(key: string): Promise<T | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cache"], "readonly");
      const store = transaction.objectStore("cache");
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedData<T> & { key: string };

        if (!result) {
          resolve(null);
          return;
        }

        const now = Date.now();
        if (now > result.expiresAt) {
          this.removeItem(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  private async removeItem(key: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Public methods for specific data types

  // Regular products (for non-branding shops)
  async setProducts(products: IProduct[], shopType: string): Promise<void> {
    const key = `${STORAGE_CONFIG.products.key}_${shopType}`;
    await this.setItem(key, products, STORAGE_CONFIG.products.ttl);
  }

  async getProducts(shopType: string): Promise<IProduct[] | null> {
    const key = `${STORAGE_CONFIG.products.key}_${shopType}`;
    return await this.getItem<IProduct[]>(key);
  }

  // Aggregated products (for branding shop - Amrod products with price and stock)
  async setAggregatedProducts(products: IAggregatedProduct[]): Promise<void> {
    await this.setItem(
      STORAGE_CONFIG.aggregatedProducts.key,
      products,
      STORAGE_CONFIG.aggregatedProducts.ttl
    );
  }

  async getAggregatedProducts(): Promise<IAggregatedProduct[] | null> {
    return await this.getItem<IAggregatedProduct[]>(STORAGE_CONFIG.aggregatedProducts.key);
  }

  // Other existing methods remain the same...
  async setPrices(prices: IProductPrice[]): Promise<void> {
    await this.setItem(
      STORAGE_CONFIG.prices.key,
      prices,
      STORAGE_CONFIG.prices.ttl
    );
  }

  async getPrices(): Promise<IProductPrice[] | null> {
    return await this.getItem<IProductPrice[]>(STORAGE_CONFIG.prices.key);
  }

  async setCategories(categories: ICategory[]): Promise<void> {
    await this.setItem(
      STORAGE_CONFIG.categories.key,
      categories,
      STORAGE_CONFIG.categories.ttl
    );
  }

  async getCategories(): Promise<ICategory[] | null> {
    return await this.getItem<ICategory[]>(STORAGE_CONFIG.categories.key);
  }

  async setStock(stock: IStockItem[]): Promise<void> {
    await this.setItem(
      STORAGE_CONFIG.stock.key,
      stock,
      STORAGE_CONFIG.stock.ttl
    );
  }

  async getStock(): Promise<IStockItem[] | null> {
    return await this.getItem<IStockItem[]>(STORAGE_CONFIG.stock.key);
  }

  async setBrandingPrices(brandingPrices: IBrandingOption[]): Promise<void> {
    await this.setItem(
      STORAGE_CONFIG.brandingPrices.key,
      brandingPrices,
      STORAGE_CONFIG.brandingPrices.ttl
    );
  }

  async getBrandingPrices(): Promise<IBrandingOption[] | null> {
    return await this.getItem<IBrandingOption[]>(STORAGE_CONFIG.brandingPrices.key);
  }

  // Parrot products methods
  async setParrotProducts(products: IProduct[]): Promise<void> {
    await this.setItem(
      STORAGE_CONFIG.parrotProducts.key,
      products,
      STORAGE_CONFIG.parrotProducts.ttl
    );
  }

  async getParrotProducts(): Promise<IProduct[] | null> {
    return await this.getItem<IProduct[]>(STORAGE_CONFIG.parrotProducts.key);
  }

  async setParrotProductsByCategory(category: string, products: IProduct[]): Promise<void> {
    const key = `${STORAGE_CONFIG.parrotProductsByCategory.key}_${category}`;
    await this.setItem(key, products, STORAGE_CONFIG.parrotProductsByCategory.ttl);
  }

  async getParrotProductsByCategory(category: string): Promise<IProduct[] | null> {
    const key = `${STORAGE_CONFIG.parrotProductsByCategory.key}_${category}`;
    return await this.getItem<IProduct[]>(key);
  }

  // Tarsus products methods
  async setTarsusProducts(products: IProduct[]): Promise<void> {
    await this.setItem(
      STORAGE_CONFIG.tarsusProducts.key,
      products,
      STORAGE_CONFIG.tarsusProducts.ttl
    );
  }

  async getTarsusProducts(): Promise<IProduct[] | null> {
    return await this.getItem<IProduct[]>(STORAGE_CONFIG.tarsusProducts.key);
  }

  // Utility methods
  async clearExpiredData(): Promise<void> {
    const db = await this.ensureDB();
    const now = Date.now();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const allItems = request.result;
        const expiredKeys = allItems
          .filter((item) => now > item.expiresAt)
          .map((item) => item.key);

        if (expiredKeys.length === 0) {
          resolve();
          return;
        }

        let deletedCount = 0;
        expiredKeys.forEach((key) => {
          const deleteRequest = store.delete(key);
          deleteRequest.onsuccess = () => {
            deletedCount++;
            if (deletedCount === expiredKeys.length) {
              resolve();
            }
          };
        });
      };
    });
  }

  async clearAllCache(): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Update getCacheStatus to include aggregated products
  async getCacheStatus(): Promise<{
    prices: { exists: boolean; expiresAt?: number; timeLeft?: number };
    products: {
      [shopType: string]: {
        exists: boolean;
        expiresAt?: number;
        timeLeft?: number;
      };
    };
    aggregatedProducts: { exists: boolean; expiresAt?: number; timeLeft?: number };
    tarsusProducts: { exists: boolean; expiresAt?: number; timeLeft?: number };
    parrotProducts: { exists: boolean; expiresAt?: number; timeLeft?: number };
    parrotProductsByCategory: { 
      [category: string]: {
        exists: boolean;
        expiresAt?: number;
        timeLeft?: number;
      };
    };
    categories: { exists: boolean; expiresAt?: number; timeLeft?: number };
    stock: { exists: boolean; expiresAt?: number; timeLeft?: number };
    brandingPrices: { exists: boolean; expiresAt?: number; timeLeft?: number };
  }> {
    const db = await this.ensureDB();
    const now = Date.now();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cache"], "readonly");
      const store = transaction.objectStore("cache");
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const allItems = request.result;
        const status: any = {
          prices: { exists: false },
          products: {},
          aggregatedProducts: { exists: false },
          tarsusProducts: { exists: false },
          parrotProducts: { exists: false },
          parrotProductsByCategory: {},
          categories: { exists: false },
          stock: { exists: false },
          brandingPrices: { exists: false },
        };

        allItems.forEach((item) => {
          const timeLeft = item.expiresAt - now;
          const isValid = timeLeft > 0;

          if (item.key === STORAGE_CONFIG.prices.key) {
            status.prices = {
              exists: isValid,
              expiresAt: item.expiresAt,
              timeLeft: isValid ? timeLeft : 0,
            };
          } else if (item.key === STORAGE_CONFIG.categories.key) {
            status.categories = {
              exists: isValid,
              expiresAt: item.expiresAt,
              timeLeft: isValid ? timeLeft : 0,
            };
          } else if (item.key === STORAGE_CONFIG.stock.key) {
            status.stock = {
              exists: isValid,
              expiresAt: item.expiresAt,
              timeLeft: isValid ? timeLeft : 0,
            };
          } else if (item.key === STORAGE_CONFIG.brandingPrices.key) {
            status.brandingPrices = {
              exists: isValid,
              expiresAt: item.expiresAt,
              timeLeft: isValid ? timeLeft : 0,
            };
          } else if (item.key === STORAGE_CONFIG.tarsusProducts.key) {
            status.tarsusProducts = {
              exists: isValid,
              expiresAt: item.expiresAt,
              timeLeft: isValid ? timeLeft : 0,
            };
          } else if (item.key === STORAGE_CONFIG.parrotProducts.key) {
            status.parrotProducts = {
              exists: isValid,
              expiresAt: item.expiresAt,
              timeLeft: isValid ? timeLeft : 0,
            };
          } else if (item.key === STORAGE_CONFIG.aggregatedProducts.key) {
            status.aggregatedProducts = {
              exists: isValid,
              expiresAt: item.expiresAt,
              timeLeft: isValid ? timeLeft : 0,
            };
          } else if (item.key.startsWith(STORAGE_CONFIG.parrotProductsByCategory.key)) {
            const category = item.key.replace(`${STORAGE_CONFIG.parrotProductsByCategory.key}_`, "");
            status.parrotProductsByCategory[category] = {
              exists: isValid,
              expiresAt: item.expiresAt,
              timeLeft: isValid ? timeLeft : 0,
            };
          } else if (item.key.startsWith(STORAGE_CONFIG.products.key)) {
            const shopType = item.key.replace(`${STORAGE_CONFIG.products.key}_`, "");
            status.products[shopType] = {
              exists: isValid,
              expiresAt: item.expiresAt,
              timeLeft: isValid ? timeLeft : 0,
            };
          }
        });

        resolve(status);
      };
    });
  }
}

// Export singleton instance
export const indexedDBStorage = new IndexedDBStorage();

// Export types for use in components
export type { CachedData, StorageConfig };
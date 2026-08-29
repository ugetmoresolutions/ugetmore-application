import { ICategory } from "@/endpoints/rest-api/categories";

export interface IFurnitureCategory {
  name: string;
  subCategories: string[] | null;
}

export interface IFurnitureCategoriesResponse {
  mainCategories: string[];
  categoriesWithSubs: IFurnitureCategory[];
}

export class FurnitureCategoriesService {
  static transformCategories(apiCategories: ICategory[]): IFurnitureCategoriesResponse {
    // Extract main categories (all category names)
    const mainCategories = apiCategories.map(cat => cat.name);
    
    // Transform to categories with subcategories format
    const categoriesWithSubs: IFurnitureCategory[] = [
      // Add "All" option first
      {
        name: "All",
        subCategories: null
      },
      // Transform each category
      ...apiCategories.map(category => ({
        name: category.name,
        subCategories: category.subCategories 
          ? category.subCategories.map(sub => sub.name)
          : null
      }))
    ];
    
    return {
      mainCategories,
      categoriesWithSubs
    };
  }
  
  // Optional: Cache in localStorage like stationery
  static getCachedCategories() {
    const CATEGORIES_STORAGE_KEY = 'furniture_categories';
    const CATEGORIES_TIMESTAMP_KEY = 'furniture_categories_timestamp';
    const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
    
    const cachedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    const cachedTimestamp = localStorage.getItem(CATEGORIES_TIMESTAMP_KEY);
    
    if (cachedCategories && cachedTimestamp) {
      const now = Date.now();
      const cacheAge = now - parseInt(cachedTimestamp);
      
      if (cacheAge < CACHE_DURATION) {
        return JSON.parse(cachedCategories);
      }
    }
    
    return null;
  }
  
  static cacheCategories(categories: IFurnitureCategoriesResponse) {
    const CATEGORIES_STORAGE_KEY = 'furniture_categories';
    const CATEGORIES_TIMESTAMP_KEY = 'furniture_categories_timestamp';
    
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories.categoriesWithSubs));
    localStorage.setItem(CATEGORIES_TIMESTAMP_KEY, Date.now().toString());
  }
  
  static clearCache() {
    localStorage.removeItem('furniture_categories');
    localStorage.removeItem('furniture_categories_timestamp');
  }
}
// interfaces/aggregated-product/product/product-aggregation.service.interface.ts
import { Token } from "typedi";

export interface ProductFilters {
  search?: string;
  category?: string;
  subCategory?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface PaginatedResponse {
  products: any[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  supplierBreakdown: {
    amrod: number;
    parrot: number;
    tarsus: number;
  };
  filters?: ProductFilters;
  searchQuery?: string; // Add this missing property
  categoryType?: "janitorial" | "stationery" | "electronics" | "display-solutions"
}

export interface SidebarCategory {
  name: string;
  subCategories: string[] | null;
}

export interface ICategory {
  id: number;
  categoryName: string;
  categoryPath?: string;
  children?: ICategory[];
}

// Fix the IAggregatedProduct interface to match actual data
export interface IAggregatedProduct {
  simpleCode: string;
  fullCode: string;
  categorisedAttribute: any[];
  gender: string | null;
  material: string;
  fit: string;
  feature: string;
  categories: Array<{
    id: number;
    name: string;
    path: string;
    code: string;
    image: string;
  }>;
  brand: {
    name: string | null;
    brandWebsiteLogo: string;
    code: string;
  } | null; // Fix brand type
  companionCodes: any;
  relatedCodes: any[];
  matchingCodes: any[];
  groupingCodes: any[];
  groupingCodeGiftsets: any;
  productName: string;
  description: string;
  minimum: number;
  maximum: number;
  incrementedBy: number;
  keywords: string;
  tags: string;
  inventoryType: string;
  behaviour: string;
  madeToOrder: string;
  madeToOrderMessage: string;
  displayCountryOfOrigin: string;
  promotion: string;
  fullBrandingGuide: string;
  logo24BrandingGuide: string | null;
  images: Array<{
    name: string;
    isDefault: boolean;
    urls: Array<{
      url: string;
      width: number;
      height: number;
    }>;
    hasLogo: boolean;
    angle: string | null;
    type: string;
  }>;
  videos: any[];
  colourImages: any;
  brandings: any[];
  isLogo24: boolean;
  logo24Branding: any;
  inclusiveBranding: any;
  variants: Array<{
    simpleCode: string;
    fullCode: string;
    codeColour: string | null;
    codeColourName: string | null;
    codeSize: string | null;
    codeSizeName: string | null;
    categorisedAttribute: any;
    packagingAndDimension: {
      cartonSizeDimensionL: number;
      cartonSizeDimensionW: number;
      cartonSizeDimensionH: number;
      piecesPerCarton: number;
      cartonWeight: number;
    };
    productDimension: {
      length: number;
      width: number;
      weight: number;
    };
    isLogo24: boolean;
    components: any;
  }>;
  requiredBrandingPositions: string[];
  noCoBrandingPositions: any;
  brandingTemplates: Array<{
    position: string;
    name: string;
    url: string;
  }>;
  decoupled: boolean;
  type: string;
  originalPrice: number;
  price: number;
  stockInfo: {
    colourCode: string | null;
    fullCode: string;
    incomingStock: any;
    modifiedDate: string;
    reservedStock: number;
    simpleCode: string;
    stock: number;
    stockType: number;
  };
  isAvailable: boolean;
  supplier: string;
  isInternalProduct?: boolean
  isBrandingProduct?: boolean
  isDisplaySolution?: boolean
  
}

export interface IProductAggregationService {
  // Main product endpoints
  getUnifiedProductsWithPriceAndStock(page?: number, pageSize?: number): Promise<PaginatedResponse>;
  getAmrodProductsWithPriceAndStock(page?: number, pageSize?: number): Promise<PaginatedResponse>;
  getParrotProductsWithPriceAndStock(page?: number, pageSize?: number): Promise<PaginatedResponse>;
  getTarsusProductsWithPriceAndStock(page?: number, pageSize?: number): Promise<PaginatedResponse>;
  
  // Enhanced filtering endpoint
  getAmrodProductsWithFilters(filters: ProductFilters): Promise<PaginatedResponse>;

  getTarsusProductsWithFilters(filters: ProductFilters): Promise<PaginatedResponse>;

   getParrotJanitorialWithFilter(filters: ProductFilters): Promise<PaginatedResponse>;
  getParrotStationeryWithFilter(filters: ProductFilters): Promise<PaginatedResponse>;
  getParrotElectronicsWithFilter(filters: ProductFilters): Promise<PaginatedResponse>;
  getParrotDisplaySolutionsWithFilter(filters: ProductFilters): Promise<PaginatedResponse>;

  /**
   * Get product by fullCode with lightning-fast lookup
   */
  getProductByFullCode(fullCode: string): Promise<IAggregatedProduct | null>;

  /**
   * Get related products for a given product
   */
  getRelatedProducts(
    product: IAggregatedProduct, 
    limit?: number
  ): Promise<IAggregatedProduct[]>;

  /**
   * FAST UNIVERSAL SEARCH - Combines all products with lightning-fast filtering
   */
  getUniversalSearch(filters: ProductFilters): Promise<PaginatedResponse>;

  /**
   * Get search suggestions for autocomplete
   */
  getSearchSuggestions(query: string, limit?: number): Promise<{
    products: Array<{ name: string; code: string; supplier: string }>;
    categories: string[];
    brands: string[];
  }>;
  /**
   * Get merged categories from specified category methods
   */
  getMergedCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
    categoryBreakdown: {
      amrod: number;
      tarsus: number;
      parrotStationery: number;
      parrotJanitorial: number;
    };
  }>;

  // Parrot category analysis
  getParrotCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }>;
  
   // Tarsus categories endpoint - ADD THIS
  getTarsusCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }>;
  
  // Category endpoints
  getAmrodCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }>;

  // Parrot category analysis
  getParrotCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }>;

  // Parrot category endpoints for each type
  getParrotJanitorialCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }>;
  

  // Parrot filtered endpoints
  getParrotJanitorialWithFilter(filters: ProductFilters): Promise<PaginatedResponse>;
  getParrotStationeryWithFilter(filters: ProductFilters): Promise<PaginatedResponse>;
  getParrotElectronicsWithFilter(filters: ProductFilters): Promise<PaginatedResponse>;
  getParrotDisplaySolutionsWithFilter(filters: ProductFilters): Promise<PaginatedResponse>;

  // Parrot category endpoints for each type
  getParrotJanitorialCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }>;
  
  getParrotStationeryCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }>;
  
  getParrotElectronicsCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }>;
  
  getParrotDisplaySolutionsCategories(): Promise<{
    mainCategories: string[];
    categoriesWithSubs: SidebarCategory[];
  }>;
  
  // Get raw categories from Amrod
  getRawAmrodCategories(): Promise<ICategory[]>;
  
  // Fast code lookup methods
  getAmrodProductByCode(code: string): Promise<IAggregatedProduct>;
  getParrotProductByCode(code: string): Promise<IAggregatedProduct>;
  getTarsusProductByCode(code: string): Promise<IAggregatedProduct>;
  
  // Search methods
  searchAmrodProductsByCode(query: string, page?: number, pageSize?: number): Promise<PaginatedResponse>;
  searchParrotProductsByCode(query: string, page?: number, pageSize?: number): Promise<PaginatedResponse>;
  searchTarsusProductsByCode(query: string, page?: number, pageSize?: number): Promise<PaginatedResponse>;
  
  clearCache(): void;
}

export const PRODUCT_AGGREGATION_SERVICE_TOKEN = new Token<IProductAggregationService>("IProductAggregationService");
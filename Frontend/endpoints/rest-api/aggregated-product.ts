// endpoints/rest-api/aggregated-product.ts
import { CustomResponse } from "@/interfaces/product/response";
import { GET } from "../lib/rest-api-client";
import { baseUrl } from "../url";
import { IAggregatedCategoriesResponse, IAggregatedProduct, IAggregatedProductsResponse } from "@/interfaces/aggregated-product/aggregated-product";



const AggregatedProductsBaseURL = `${baseUrl}/aggregated-products`;

// Add the universal search interface
export interface UniversalSearchFilters {
  search?: string;
  category?: string;
  subCategory?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface UniversalSearchResponse {
  products: any[]; // Replace with your actual product type
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
    internal?: number;
    branding?: number;
  };
  filters?: UniversalSearchFilters;
}


export interface ProductByCodeResponse {
  data: IAggregatedProduct;
  message: string;
  error: boolean;
}

export interface RelatedProductsResponse {
  data: {
    mainProduct: IAggregatedProduct;
    relatedProducts: IAggregatedProduct[];
  };
  message: string;
  error: boolean;
}

export const AGGREGATED_PRODUCTS_API = {
  // GET all aggregated products with price and stock
  GET_ALL_PRODUCTS: async (page?: number, pageSize?: number): Promise<CustomResponse<IAggregatedProductsResponse>> => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageSize) params.append('pageSize', pageSize.toString());
      
      const queryString = params.toString();
      const url = queryString ? `${AggregatedProductsBaseURL}/?${queryString}` : `${AggregatedProductsBaseURL}/`;
      
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },


   // NEW: Lightning-fast product lookup by fullCode
  GET_PRODUCT_BY_CODE: async (fullCode: string): Promise<ProductByCodeResponse> => {
    try {
      if (!fullCode) throw new Error('fullCode parameter is required');
      console.log(`🔍 [API] Looking up product by code: ${fullCode}`);
      const url = `${AggregatedProductsBaseURL}/code/${encodeURIComponent(fullCode)}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      console.error(`❌ [API] Error looking up product ${fullCode}:`, error);
      throw error;
    }
  },

  // NEW: Get related products
  GET_RELATED_PRODUCTS: async (fullCode: string, limit: number = 5): Promise<RelatedProductsResponse> => {
    try {
      if (!fullCode) throw new Error('fullCode parameter is required');
      console.log(`🔍 [API] Getting related products for: ${fullCode}`);
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      const url = `${AggregatedProductsBaseURL}/code/${encodeURIComponent(fullCode)}/related?${params.toString()}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      console.error(`❌ [API] Error getting related products for ${fullCode}:`, error);
      throw error;
    }
  },


    // NEW: Universal search endpoint
  GET_UNIVERSAL_SEARCH: async (filters: UniversalSearchFilters): Promise<CustomResponse<UniversalSearchResponse>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const url = `${AggregatedProductsBaseURL}/search/universal?${params.toString()}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // NEW: Search suggestions endpoint
  GET_SEARCH_SUGGESTIONS: async (query: string, limit: number = 10): Promise<CustomResponse<{
    products: Array<{ name: string; code: string; supplier: string }>;
    categories: string[];
    brands: string[];
  }>> => {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      if (limit) params.append('limit', limit.toString());
      
      const url = `${AggregatedProductsBaseURL}/search/suggestions?${params.toString()}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  GET_MERGED_CATEGORIES: async (): Promise<CustomResponse<IAggregatedCategoriesResponse>> => {
    try {
      const url = `${AggregatedProductsBaseURL}/categories/merged`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  GET_TARSUS_CATEGORIES: async (): Promise<CustomResponse<IAggregatedCategoriesResponse>> => {
    try {
      const url = `${AggregatedProductsBaseURL}/tarsus/categories`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },


  // ENHANCED: Get Amrod products with search and category filtering
  GET_AMROD_PRODUCTS_WITH_FILTERS: async (filters: {
    search?: string;
    category?: string;
    subCategory?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<CustomResponse<IAggregatedProductsResponse>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const url = `${AggregatedProductsBaseURL}/amrod/filtered?${params.toString()}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET Amrod categories for sidebar
  GET_AMROD_CATEGORIES: async (): Promise<CustomResponse<IAggregatedCategoriesResponse>> => {
    try {
      const url = `${AggregatedProductsBaseURL}/amrod/categories`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // FAST: Get Amrod product by code
  GET_AMROD_PRODUCT_BY_CODE: async (code: string): Promise<CustomResponse<any>> => {
    try {
      const url = `${AggregatedProductsBaseURL}/amrod/code/${encodeURIComponent(code)}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // FAST: Get Parrot product by code
  GET_PARROT_PRODUCT_BY_CODE: async (code: string): Promise<CustomResponse<any>> => {
    try {
      const url = `${AggregatedProductsBaseURL}/parrot/code/${encodeURIComponent(code)}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },


 

  // ENHANCED: Get Tarsus products with search and category filtering
GET_TARSUS_PRODUCTS_WITH_FILTERS: async (filters: {
  search?: string;
  category?: string;
  subCategory?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}): Promise<CustomResponse<IAggregatedProductsResponse>> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.subCategory) params.append('subCategory', filters.subCategory);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    
    const url = `${AggregatedProductsBaseURL}/tarsus/filtered?${params.toString()}`;
    const response = await GET(url);
    return response;
  } catch (error) {
    throw error;
  }
},


// GET Parrot janitorial categories
  GET_PARROT_JANITORIAL_CATEGORIES: async (): Promise<CustomResponse<IAggregatedCategoriesResponse>> => {
    try {
      const url = `${AggregatedProductsBaseURL}/parrot/janitorial/categories`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET Parrot stationery categories
  GET_PARROT_STATIONERY_CATEGORIES: async (): Promise<CustomResponse<IAggregatedCategoriesResponse>> => {
    try {
      const url = `${AggregatedProductsBaseURL}/parrot/stationery/categories`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET Parrot electronics categories
  GET_PARROT_ELECTRONICS_CATEGORIES: async (): Promise<CustomResponse<IAggregatedCategoriesResponse>> => {
    try {
      const url = `${AggregatedProductsBaseURL}/parrot/electronics/categories`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET Parrot display solutions categories
  GET_PARROT_DISPLAY_SOLUTIONS_CATEGORIES: async (): Promise<CustomResponse<IAggregatedCategoriesResponse>> => {
    try {
      const url = `${AggregatedProductsBaseURL}/parrot/display-solutions/categories`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // PARROT FILTERED PRODUCT ENDPOINTS

  // GET Parrot janitorial products with filters
  GET_PARROT_JANITORIAL_PRODUCTS: async (filters: {
    search?: string;
    category?: string;
    subCategory?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<CustomResponse<IAggregatedProductsResponse>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const url = `${AggregatedProductsBaseURL}/parrot/janitorial?${params.toString()}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET Parrot stationery products with filters
  GET_PARROT_STATIONERY_PRODUCTS: async (filters: {
    search?: string;
    category?: string;
    subCategory?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<CustomResponse<IAggregatedProductsResponse>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const url = `${AggregatedProductsBaseURL}/parrot/stationery?${params.toString()}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET Parrot electronics products with filters
  GET_PARROT_ELECTRONICS_PRODUCTS: async (filters: {
    search?: string;
    category?: string;
    subCategory?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<CustomResponse<IAggregatedProductsResponse>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const url = `${AggregatedProductsBaseURL}/parrot/electronics?${params.toString()}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET Parrot display solutions products with filters
  GET_PARROT_DISPLAY_SOLUTIONS_PRODUCTS: async (filters: {
    search?: string;
    category?: string;
    subCategory?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<CustomResponse<IAggregatedProductsResponse>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const url = `${AggregatedProductsBaseURL}/parrot/display-solutions?${params.toString()}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Clear product cache
  CLEAR_CACHE: async (): Promise<CustomResponse<null>> => {
    try {
      const url = `${AggregatedProductsBaseURL}/cache`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  }
};
import { CustomResponse } from "@/interfaces/product/response";
import { GET, POST, PUT, DELETE } from "../lib/rest-api-client";
import { baseUrl } from "../url";
import { IBrandingProduct } from "@/interfaces/brandingProduct/brandingProduct.interface";

const SupplierProductsBaseURL = `${baseUrl}/supplier-products`;

export interface ISupplierProductsResponse {
  products: IBrandingProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ISupplierProductsResponse {
  products: IBrandingProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: ProductFilters;
  searchQuery?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  subCategory?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export const SUPPLIER_PRODUCTS_API = {
  // GET all supplier products with pagination (UPDATED)
  GET_ALL_PRODUCTS: async (page?: number, limit?: number): Promise<CustomResponse<ISupplierProductsResponse>> => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      
      const queryString = params.toString();
      const url = queryString ? `${SupplierProductsBaseURL}?${queryString}` : SupplierProductsBaseURL;
      
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

   // GET all supplier products with advanced filtering
  GET_ALL_PRODUCTS_WITH_FILTERS: async (filters: ProductFilters): Promise<CustomResponse<ISupplierProductsResponse>> => {
    try {
      const params = new URLSearchParams();
      
      // Add all filter parameters
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const queryString = params.toString();
      const url = `${SupplierProductsBaseURL}/filtered?${queryString}`;
      
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET supplier product by ID
  GET_PRODUCT_BY_ID: async (id: number): Promise<CustomResponse<IBrandingProduct>> => {
    try {
      const url = `${SupplierProductsBaseURL}/${id}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET supplier product by simple code
  GET_PRODUCT_BY_SIMPLE_CODE: async (simpleCode: string): Promise<CustomResponse<IBrandingProduct>> => {
    try {
      const url = `${SupplierProductsBaseURL}/simple-code/${encodeURIComponent(simpleCode)}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET supplier product by full code
  GET_PRODUCT_BY_FULL_CODE: async (fullCode: string): Promise<CustomResponse<IBrandingProduct>> => {
    try {
      const url = `${SupplierProductsBaseURL}/full-code/${encodeURIComponent(fullCode)}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // SEARCH supplier products with pagination (UPDATED)
  SEARCH_PRODUCTS: async (query: string, page?: number, limit?: number): Promise<CustomResponse<ISupplierProductsResponse>> => {
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      
      const url = `${SupplierProductsBaseURL}/search/query?${params.toString()}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET products by supplier
  GET_PRODUCTS_BY_SUPPLIER: async (supplier: string): Promise<CustomResponse<IBrandingProduct[]>> => {
    try {
      const url = `${SupplierProductsBaseURL}/supplier/${encodeURIComponent(supplier)}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE new supplier product
  CREATE_PRODUCT: async (productData: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomResponse<IBrandingProduct>> => {
    try {
      const url = SupplierProductsBaseURL;
      const response = await POST(url, productData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE supplier product
  UPDATE_PRODUCT: async (id: number, productData: Partial<IBrandingProduct>): Promise<CustomResponse<IBrandingProduct>> => {
    try {
      const url = `${SupplierProductsBaseURL}/${id}`;
      const response = await PUT(url, productData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE supplier product
  DELETE_PRODUCT: async (id: number): Promise<CustomResponse<{ deleted: boolean }>> => {
    try {
      const url = `${SupplierProductsBaseURL}/${id}`;
      const response = await DELETE(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // BULK create supplier products
  BULK_CREATE_PRODUCTS: async (products: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<CustomResponse<IBrandingProduct[]>> => {
    try {
      const url = `${SupplierProductsBaseURL}/bulk`;
      const response = await POST(url, products);
      return response;
    } catch (error) {
      throw error;
    }
  }
};
import { CustomResponse } from "@/interfaces/product/response";
import { baseUrl } from "../url";
import { DELETE, GET, POST, PUT, POSTFILES } from "../lib/rest-api-client";
import { ICreateProduct, IProduct, ProductStatus } from "@/interfaces/product/newProduct";


const ProductBaseURL = `${baseUrl}/products`;

export const PRODUCT_API = {

  // UPLOAD product images
  UPLOAD_PRODUCT_IMAGES: async (files: File[]): Promise<CustomResponse<any>> => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await POSTFILES(`${ProductBaseURL}/upload`, formData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  // GET all products with optional pagination and filters
  GET_ALL_PRODUCTS: async (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    status?: ProductStatus;
  }): Promise<CustomResponse<{
    products: IProduct[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  }>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);

      const url = `${ProductBaseURL}/all?${queryParams.toString()}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET product by ID
  GET_PRODUCT_BY_ID: async (productId: number): Promise<CustomResponse<IProduct>> => {
    try {
      const response = await GET(`${ProductBaseURL}/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search products
  SEARCH_PRODUCTS: async (query: string): Promise<CustomResponse<IProduct[]>> => {
    try {
      const response = await GET(`${ProductBaseURL}/search?q=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET products by category
  GET_PRODUCTS_BY_CATEGORY: async (category: string): Promise<CustomResponse<IProduct[]>> => {
    try {
      const response = await GET(`${ProductBaseURL}/category/${encodeURIComponent(category)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE new product
  CREATE_PRODUCT: async (productData: ICreateProduct): Promise<CustomResponse<IProduct>> => {
    try {
      const response = await POST(`${ProductBaseURL}/create`, productData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE product
  UPDATE_PRODUCT: async (productId: number, updateData: Partial<IProduct>): Promise<CustomResponse<IProduct>> => {
    try {
      const response = await PUT(`${ProductBaseURL}/${productId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE product status
  UPDATE_PRODUCT_STATUS: async (productId: number, status: ProductStatus): Promise<CustomResponse<IProduct>> => {
    try {
      const response = await PUT(`${ProductBaseURL}/${productId}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

    GET_PRODUCT_BY_SKU: async (sku: string): Promise<CustomResponse<IProduct>> => {
    try {
      const response = await GET(`${ProductBaseURL}/sku/${encodeURIComponent(sku)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE product
  DELETE_PRODUCT: async (productId: number): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${ProductBaseURL}/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  
};
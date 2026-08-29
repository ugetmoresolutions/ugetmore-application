
import { baseUrl } from "../url";
import { DELETE, GET, POST, PUT, POSTFILES } from "../lib/rest-api-client";
import { CustomResponse } from "@/interfaces/product/response";
import { FurnitureProductStatus, ICreateFurnitureProduct, IFurnitureProduct } from "@/interfaces/furniture/furniture";


const FurnitureBaseURL = `${baseUrl}/furniture`;

export const FURNITURE_API = {
  // UPLOAD furniture product images
  UPLOAD_FURNITURE_IMAGES: async (files: File[]): Promise<CustomResponse<any>> => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await POSTFILES(`${FurnitureBaseURL}/upload`, formData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET all furniture products with optional pagination and filters
  GET_ALL_FURNITURE_PRODUCTS: async (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    status?: FurnitureProductStatus;
  }): Promise<CustomResponse<{
    products: IFurnitureProduct[];
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

      const url = `${FurnitureBaseURL}/all?${queryParams.toString()}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET furniture product by ID
  GET_FURNITURE_PRODUCT_BY_ID: async (productId: number): Promise<CustomResponse<IFurnitureProduct>> => {
    try {
      const response = await GET(`${FurnitureBaseURL}/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search furniture products
  SEARCH_FURNITURE_PRODUCTS: async (query: string): Promise<CustomResponse<IFurnitureProduct[]>> => {
    try {
      const response = await GET(`${FurnitureBaseURL}/search?q=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET furniture products by category
  GET_FURNITURE_PRODUCTS_BY_CATEGORY: async (category: string): Promise<CustomResponse<IFurnitureProduct[]>> => {
    try {
      const response = await GET(`${FurnitureBaseURL}/category/${encodeURIComponent(category)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET furniture products by brand
  GET_FURNITURE_PRODUCTS_BY_BRAND: async (brand: string): Promise<CustomResponse<IFurnitureProduct[]>> => {
    try {
      const response = await GET(`${FurnitureBaseURL}/brand/${encodeURIComponent(brand)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE new furniture product
  CREATE_FURNITURE_PRODUCT: async (productData: any): Promise<CustomResponse<IFurnitureProduct>> => {
    try {
      const response = await POST(`${FurnitureBaseURL}/create`, productData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE furniture product
  UPDATE_FURNITURE_PRODUCT: async (productId: number, updateData: Partial<IFurnitureProduct>): Promise<CustomResponse<IFurnitureProduct>> => {
    try {
      const response = await PUT(`${FurnitureBaseURL}/${productId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE furniture product status
  UPDATE_FURNITURE_PRODUCT_STATUS: async (productId: number, status: FurnitureProductStatus): Promise<CustomResponse<IFurnitureProduct>> => {
    try {
      const response = await PUT(`${FurnitureBaseURL}/${productId}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET furniture product by SKU
  GET_FURNITURE_PRODUCT_BY_SKU: async (sku: string): Promise<CustomResponse<IFurnitureProduct>> => {
    try {
      const response = await GET(`${FurnitureBaseURL}/sku/${encodeURIComponent(sku)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE furniture product
  DELETE_FURNITURE_PRODUCT: async (productId: number): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${FurnitureBaseURL}/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
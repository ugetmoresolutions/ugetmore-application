import { CustomResponse } from "@/interfaces/product/response";
import { baseUrl } from "../url";
import { GET, POST, PUT, DELETE, POSTFILES } from "../lib/rest-api-client";
import { IBrandingProduct } from "@/interfaces/brandingProduct/brandingProduct.interface";

const BrandingProductBaseURL = `${baseUrl}/branding-products`;

export const BRANDING_PRODUCT_API = {
  // GET all branding products
  GET_ALL_BRANDING_PRODUCTS: async (): Promise<CustomResponse<IBrandingProduct[]>> => {
    try {
      const response = await GET(`${BrandingProductBaseURL}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET branding product by ID
  GET_BRANDING_PRODUCT_BY_ID: async (id: number): Promise<CustomResponse<IBrandingProduct>> => {
    try {
      const response = await GET(`${BrandingProductBaseURL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET branding product by simple code
  GET_BRANDING_PRODUCT_BY_SIMPLE_CODE: async (simpleCode: string): Promise<CustomResponse<IBrandingProduct>> => {
    try {
      const response = await GET(`${BrandingProductBaseURL}/simple-code/${encodeURIComponent(simpleCode)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET branding product by full code
  GET_BRANDING_PRODUCT_BY_FULL_CODE: async (fullCode: string): Promise<CustomResponse<IBrandingProduct>> => {
    try {
      const response = await GET(`${BrandingProductBaseURL}/full-code/${encodeURIComponent(fullCode)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE new branding product
  CREATE_BRANDING_PRODUCT: async (productData: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomResponse<IBrandingProduct>> => {
    try {
      const response = await POST(`${BrandingProductBaseURL}`, productData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE branding product
  UPDATE_BRANDING_PRODUCT: async (id: number, updateData: Partial<IBrandingProduct>): Promise<CustomResponse<IBrandingProduct>> => {
    try {
      const response = await PUT(`${BrandingProductBaseURL}/${id}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE branding product
  DELETE_BRANDING_PRODUCT: async (id: number): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${BrandingProductBaseURL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // SEARCH branding products
  SEARCH_BRANDING_PRODUCTS: async (query: string): Promise<CustomResponse<IBrandingProduct[]>> => {
    try {
      const response = await GET(`${BrandingProductBaseURL}/search/query?query=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET branding products by type
  GET_BRANDING_PRODUCTS_BY_TYPE: async (type: string): Promise<CustomResponse<IBrandingProduct[]>> => {
    try {
      const response = await GET(`${BrandingProductBaseURL}/type/${encodeURIComponent(type)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET branding products by brand
  GET_BRANDING_PRODUCTS_BY_BRAND: async (brandCode: string): Promise<CustomResponse<IBrandingProduct[]>> => {
    try {
      const response = await GET(`${BrandingProductBaseURL}/brand/${encodeURIComponent(brandCode)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// Image upload API (using existing cart endpoint)
export const BRANDING_PRODUCT_IMAGE_API = {
  UPLOAD_IMAGES: async (files: File[]): Promise<CustomResponse<any>> => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await POSTFILES(`${baseUrl}/cart/artwork/uploadArtWork`, formData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
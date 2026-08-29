// endpoints/rest-api/gradeStationery.ts
import { CustomResponse } from "@/interfaces/product/response";
import { DELETE, GET, POST, PUT} from "../lib/rest-api-client";
import { baseUrl } from "../url";
import { 
  IGradeStationery, 
  ICreateGradeStationery, 
  IUpdateGradeStationery,
  IStationeryItem,
  IGradeStationeryResponse
} from "@/interfaces/gradeStationery/gradeStationery";
import { IAggregatedProduct } from "@/interfaces/aggregated-product/aggregated-product";

const GradeStationeryBaseURL = `${baseUrl}/grade-stationery`;

// Simplified response interface
export interface IStationeryWithProductsResponse {
  stationery: IGradeStationeryResponse | null;
  products: IAggregatedProduct[]; // Products with minQuantity already attached
  gradeInfo: {
    gradeId: number;
    gradeName: string;
    schoolName: string;
  };
}

export const GRADE_STATIONERY_API = {

  // NEW: Get stationery with products and collections
  GET_STATIONERY_WITH_PRODUCTS: async (gradeId: number): Promise<CustomResponse<IStationeryWithProductsResponse>> => {
    try {
      const response = await GET(`${GradeStationeryBaseURL}/grade/${gradeId}/with-products`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // NEW: Search stationery products
  SEARCH_STATIONERY_PRODUCTS: async (
    gradeId: number, 
    searchQuery: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<CustomResponse<{ products: IAggregatedProduct[]; total: number }>> => {
    try {
      const response = await GET(
        `${GradeStationeryBaseURL}/grade/${gradeId}/search?search=${encodeURIComponent(searchQuery)}&page=${page}&limit=${limit}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  // GET stationery for a specific grade
  GET_STATIONERY_BY_GRADE: async (gradeId: number): Promise<CustomResponse<IGradeStationery>> => {
    try {
      const response = await GET(`${GradeStationeryBaseURL}/grade/${gradeId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET stationery with file
  GET_STATIONERY_WITH_FILE: async (gradeId: number): Promise<CustomResponse<IGradeStationery>> => {
    try {
      const response = await GET(`${GradeStationeryBaseURL}/grade/${gradeId}/with-file`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE new stationery for a grade
  CREATE_STATIONERY: async (stationeryData: ICreateGradeStationery): Promise<CustomResponse<IGradeStationery>> => {
    try {
      const response = await POST(`${GradeStationeryBaseURL}`, stationeryData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE entire stationery by ID
  UPDATE_STATIONERY: async (stationeryId: number, updateData: IUpdateGradeStationery): Promise<CustomResponse<IGradeStationery>> => {
    try {
      const response = await PUT(`${GradeStationeryBaseURL}/${stationeryId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE stationery by grade ID
  UPDATE_STATIONERY_BY_GRADE: async (gradeId: number, updateData: IUpdateGradeStationery): Promise<CustomResponse<IGradeStationery>> => {
    try {
      const response = await PUT(`${GradeStationeryBaseURL}/grade/${gradeId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE stationery
  DELETE_STATIONERY: async (stationeryId: number): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${GradeStationeryBaseURL}/${stationeryId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ADD items with quantities to existing stationery
  ADD_ITEMS_TO_STATIONERY: async (gradeId: number, items: IStationeryItem[]): Promise<CustomResponse<IGradeStationery>> => {
    try {
      const response = await POST(`${GradeStationeryBaseURL}/grade/${gradeId}/items`, { items });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE item quantity
  UPDATE_ITEM_QUANTITY: async (gradeId: number, productCode: string, minQuantity: number): Promise<CustomResponse<IGradeStationery>> => {
    try {
      const response = await PUT(`${GradeStationeryBaseURL}/grade/${gradeId}/items/${productCode}/quantity`, { minQuantity });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // REMOVE item from stationery
  REMOVE_ITEM_FROM_STATIONERY: async (gradeId: number, productCode: string): Promise<CustomResponse<IGradeStationery>> => {
    try {
      const response = await DELETE(`${GradeStationeryBaseURL}/grade/${gradeId}/items/${productCode}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CLEAR all items from stationery
  CLEAR_STATIONERY: async (gradeId: number): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${GradeStationeryBaseURL}/grade/${gradeId}/items`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // BULK update stationery items
  BULK_UPDATE_ITEMS: async (gradeId: number, items: IStationeryItem[]): Promise<CustomResponse<IGradeStationery>> => {
    try {
      const response = await PUT(`${GradeStationeryBaseURL}/grade/${gradeId}/items/bulk`, { items });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE file URL
  UPDATE_FILE_URL: async (gradeId: number, fileUrl: string | null): Promise<CustomResponse<IGradeStationery>> => {
    try {
      const response = await PUT(`${GradeStationeryBaseURL}/grade/${gradeId}/file`, { fileUrl });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPLOAD file
  // UPLOAD_FILE: async (gradeId: number, formData: FormData): Promise<CustomResponse<IGradeStationery>> => {
  //   try {
  //     const response = await POST(`${GradeStationeryBaseURL}/grade/${gradeId}/upload`, formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });
  //     return response;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  // REMOVE file
  REMOVE_FILE: async (gradeId: number): Promise<CustomResponse<IGradeStationery>> => {
    try {
      const response = await DELETE(`${GradeStationeryBaseURL}/grade/${gradeId}/file`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // VALIDATE items
  VALIDATE_ITEMS: async (items: IStationeryItem[]): Promise<CustomResponse<{ valid: boolean; error?: string }>> => {
    try {
      const response = await POST(`${GradeStationeryBaseURL}/validate-items`, { items });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
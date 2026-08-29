import { CustomResponse } from "@/interfaces/product/response";
import { baseUrl } from "../url";
import { DELETE, GET, POST, PUT } from "../lib/rest-api-client";

const SubCategoryBaseURL = `${baseUrl}/subcategories`;

export interface ISubCategory {
  id: number;
  name: string;
  code: string;
  categoryId: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: {
    id: number;
    name: string;
    code: string;
    mainCategoryId: string;
  };
}

export interface ICreateSubCategory {
  name: string;
  categoryId: number;
  description?: string;
}

export interface IUpdateSubCategory {
  name?: string;
  description?: string;
  categoryId?: number;
}

export const SUB_CATEGORY_API = {
  // GET all subcategories
  GET_ALL_SUB_CATEGORIES: async (): Promise<CustomResponse<ISubCategory[]>> => {
    try {
      const response = await GET(`${SubCategoryBaseURL}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET subcategories by category ID
  GET_SUB_CATEGORIES_BY_CATEGORY_ID: async (categoryId: number): Promise<CustomResponse<ISubCategory[]>> => {
    try {
      const response = await GET(`${SubCategoryBaseURL}/category/${categoryId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET subcategory by ID
  GET_SUB_CATEGORY_BY_ID: async (id: number): Promise<CustomResponse<ISubCategory>> => {
    try {
      const response = await GET(`${SubCategoryBaseURL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE new subcategory
  CREATE_SUB_CATEGORY: async (subCategoryData: ICreateSubCategory): Promise<CustomResponse<ISubCategory>> => {
    try {
      const response = await POST(`${SubCategoryBaseURL}/create`, subCategoryData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE subcategory
  UPDATE_SUB_CATEGORY: async (id: number, updateData: IUpdateSubCategory): Promise<CustomResponse<ISubCategory>> => {
    try {
      const response = await PUT(`${SubCategoryBaseURL}/${id}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE subcategory
  DELETE_SUB_CATEGORY: async (id: number): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${SubCategoryBaseURL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
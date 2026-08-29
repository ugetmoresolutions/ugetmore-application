import { CustomResponse } from "@/interfaces/product/response";
import { baseUrl } from "../url";
import { DELETE, GET, POST, PUT } from "../lib/rest-api-client";
import { ISubCategory } from "./subCategories";

const CategoryBaseURL = `${baseUrl}/categories`;

export interface IMainCategory {
  id: 'FURNITURE' | 'JANITORIAL' | 'STATIONERY' | 'ELECTRONICS';
  name: string;
  description: string;
  displayOrder: number;
}

export interface ICategory {
  id: number;
  name: string;
  code: string;
  mainCategoryId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  subCategories?: ISubCategory[];
}

export interface ICreateCategory {
  name: string;
  mainCategoryId: string;
  description?: string;
}

export interface IUpdateCategory {
  name?: string;
  mainCategoryId?: string;
  description?: string;
}

export interface IMainCategoryWithHierarchy {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  categories: ICategory[];
}

export const CATEGORY_API = {
  // GET all main categories (static)
  GET_ALL_MAIN_CATEGORIES: async (): Promise<CustomResponse<IMainCategory[]>> => {
    try {
      const response = await GET(`${CategoryBaseURL}/main`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET main category by ID
  GET_MAIN_CATEGORY_BY_ID: async (id: string): Promise<CustomResponse<IMainCategory>> => {
    try {
      const response = await GET(`${CategoryBaseURL}/main/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET all categories
  GET_ALL_CATEGORIES: async (): Promise<CustomResponse<ICategory[]>> => {
    try {
      const response = await GET(`${CategoryBaseURL}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET category by ID
  GET_CATEGORY_BY_ID: async (id: number): Promise<CustomResponse<ICategory>> => {
    try {
      const response = await GET(`${CategoryBaseURL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET categories by main category
  GET_CATEGORIES_BY_MAIN_CATEGORY: async (mainCategoryId: string): Promise<CustomResponse<ICategory[]>> => {
    try {
      const response = await GET(`${CategoryBaseURL}/main-category/${mainCategoryId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET complete hierarchy
  GET_HIERARCHY: async (): Promise<CustomResponse<IMainCategoryWithHierarchy[]>> => {
    try {
      const response = await GET(`${CategoryBaseURL}/hierarchy`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE new category
  CREATE_CATEGORY: async (categoryData: ICreateCategory): Promise<CustomResponse<ICategory>> => {
    try {
      const response = await POST(`${CategoryBaseURL}/create`, categoryData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE category
  UPDATE_CATEGORY: async (id: number, updateData: IUpdateCategory): Promise<CustomResponse<ICategory>> => {
    try {
      const response = await PUT(`${CategoryBaseURL}/${id}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE category
  DELETE_CATEGORY: async (id: number): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${CategoryBaseURL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
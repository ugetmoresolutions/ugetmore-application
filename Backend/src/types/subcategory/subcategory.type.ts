import { MainCategoryType } from "@/types/main-category/main-category.type";

export interface ISubCategory {
  id?: number;
  name: string;
  code: string;
  categoryId: number; // References Category (not Main Category)
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // For convenience in responses
  category?: {
    id: number;
    name: string;
    code: string;
    mainCategoryId: MainCategoryType;
  };
}

export interface ICreateSubCategory {
  name: string;
  categoryId: number; // Admin selects category from dropdown
  description?: string;
}

export interface IUpdateSubCategory {
  name?: string;
  description?: string;
  categoryId?: number;
}
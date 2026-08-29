import { MainCategoryType } from "../main-category/main-category.type";
import { ISubCategory } from "../subcategory/subcategory.type";

// types/category/category.type.ts
export interface ICategory {
  id?: number;
  name: string;
  code: string;
  mainCategoryId: MainCategoryType; // References which main category this belongs to
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  subCategories?: ISubCategory[]; // For nested responses
}

export interface ICreateCategory {
  name: string;
  mainCategoryId: MainCategoryType; // Admin will select from dropdown
  description?: string;
}

export interface IUpdateCategory {
  name?: string;
  mainCategoryId?: MainCategoryType;
  description?: string;
}

// Response types for hierarchical data
export interface IMainCategoryWithHierarchy {
  id: MainCategoryType;
  name: string;
  description: string;
  displayOrder: number;
  categories: ICategoryWithSubCategories[];
}

export interface ICategoryWithSubCategories {
  id: number;
  name: string;
  code: string;
  mainCategoryId: MainCategoryType;
  description?: string;
  subCategories: ISubCategory[];
}
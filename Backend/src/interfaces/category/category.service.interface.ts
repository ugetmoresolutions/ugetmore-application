import { ICategory, ICreateCategory, IUpdateCategory, IMainCategoryWithHierarchy } from "@/types/category/category.type";
import { Token } from "typedi";
import { MainCategoryType } from "@/types/main-category/main-category.type";

export interface ICategoryService {
  // Basic CRUD
  createCategory(categoryData: ICreateCategory): Promise<ICategory>;
  getAllCategories(): Promise<ICategory[]>;
  getCategoryById(id: number): Promise<ICategory | null>;
  updateCategory(id: number, updateData: IUpdateCategory): Promise<ICategory | null>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Hierarchical methods
  getAllMainCategoriesWithHierarchy(): Promise<IMainCategoryWithHierarchy[]>;
  getCategoriesByMainCategory(mainCategoryId: MainCategoryType): Promise<ICategory[]>;
  
  // Main category methods
  getAllMainCategories(): Promise<any[]>;
  getMainCategoryById(id: MainCategoryType): Promise<any | null>;
}

export const CATEGORY_SERVICE_TOKEN = new Token<ICategoryService>("ICategoryService");
import { ISubCategory, ICreateSubCategory, IUpdateSubCategory } from "@/types/subcategory/subcategory.type";
import { Token } from "typedi";

export interface ISubCategoryService {
  createSubCategory(subCategoryData: ICreateSubCategory): Promise<ISubCategory>;
  getAllSubCategories(): Promise<ISubCategory[]>;
  getSubCategoriesByCategoryId(categoryId: number): Promise<ISubCategory[]>;
  getSubCategoryById(id: number): Promise<ISubCategory | null>;
  updateSubCategory(id: number, updateData: IUpdateSubCategory): Promise<ISubCategory | null>;
  deleteSubCategory(id: number): Promise<boolean>;
}

export const SUB_CATEGORY_SERVICE_TOKEN = new Token<ISubCategoryService>("ISubCategoryService");
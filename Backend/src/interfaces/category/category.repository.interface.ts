import { ICategory, ICreateCategory, IUpdateCategory, IMainCategoryWithHierarchy, ICategoryWithSubCategories } from "@/types/category/category.type";
import { MainCategoryType } from "@/types/main-category/main-category.type";

export interface ICategoryRepository {
  create(categoryData: ICreateCategory): Promise<ICategory>;
  findAll(): Promise<ICategory[]>;
  findByCode(code: string): Promise<ICategory | null>;
  findById(id: number): Promise<ICategory | null>;
  findByNameAndMainCategory(name: string, mainCategoryId: MainCategoryType): Promise<ICategory | null>;
  update(id: number, updateData: IUpdateCategory): Promise<ICategory | null>;
  delete(id: number): Promise<boolean>;
  
  // New methods for hierarchical data
  findAllWithSubCategories(): Promise<ICategoryWithSubCategories[]>;
  findByMainCategory(mainCategoryId: MainCategoryType): Promise<ICategoryWithSubCategories[]>;
  
  // Main category methods (static data)
  getAllMainCategories(): Promise<any[]>;
  getMainCategoryById(id: MainCategoryType): Promise<any | null>;
}
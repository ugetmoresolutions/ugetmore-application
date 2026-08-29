import { ISubCategory, ICreateSubCategory, IUpdateSubCategory } from "@/types/subcategory/subcategory.type";

export interface ISubCategoryRepository {
  create(subCategoryData: ICreateSubCategory): Promise<ISubCategory>;
  findAll(): Promise<ISubCategory[]>;
  findByCategoryId(categoryId: number): Promise<ISubCategory[]>;
  findByCode(code: string): Promise<ISubCategory | null>;
  findById(id: number): Promise<ISubCategory | null>;
  findByNameAndCategory(name: string, categoryId: number): Promise<ISubCategory | null>;
  update(id: number, updateData: IUpdateSubCategory): Promise<ISubCategory | null>;
  delete(id: number): Promise<boolean>;
}
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { ISubCategory, ICreateSubCategory, IUpdateSubCategory } from "@/types/subcategory/subcategory.type";
import { SubCategoryRepository } from "@/repositories/subcategory/subcategory.repository";
import { ISubCategoryService, SUB_CATEGORY_SERVICE_TOKEN } from "@/interfaces/subcategory/subcategory.service.interface";

@Service({ id: SUB_CATEGORY_SERVICE_TOKEN })
export class SubCategoryService implements ISubCategoryService {
  constructor(private subCategoryRepository: SubCategoryRepository) {}

  public async createSubCategory(subCategoryData: ICreateSubCategory): Promise<ISubCategory> {
    try {
      return await this.subCategoryRepository.create(subCategoryData);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error creating subcategory');
    }
  }

  public async getAllSubCategories(): Promise<ISubCategory[]> {
    try {
      return await this.subCategoryRepository.findAll();
    } catch (err) {
      throw new HttpException(500, err.message || 'Error fetching subcategories');
    }
  }

  public async getSubCategoriesByCategoryId(categoryId: number): Promise<ISubCategory[]> {
    try {
      return await this.subCategoryRepository.findByCategoryId(categoryId);
    } catch (err) {
      throw new HttpException(500, err.message || 'Error fetching subcategories');
    }
  }

  public async getSubCategoryById(id: number): Promise<ISubCategory | null> {
    try {
      const subCategory = await this.subCategoryRepository.findById(id);
      if (!subCategory) {
        throw new HttpException(404, `SubCategory with ID: ${id} not found`);
      }
      return subCategory;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching subcategory');
    }
  }

  public async updateSubCategory(id: number, updateData: IUpdateSubCategory): Promise<ISubCategory | null> {
    try {
      const subCategory = await this.subCategoryRepository.findById(id);
      if (!subCategory) {
        throw new HttpException(404, `SubCategory with ID: ${id} not found`);
      }

      const updatedSubCategory = await this.subCategoryRepository.update(id, updateData);
      if (!updatedSubCategory) {
        throw new HttpException(500, 'Failed to update subcategory');
      }
      return updatedSubCategory;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error updating subcategory');
    }
  }

  public async deleteSubCategory(id: number): Promise<boolean> {
    try {
      const subCategoryExists = await this.subCategoryRepository.findById(id);
      if (!subCategoryExists) {
        throw new HttpException(404, `SubCategory with ID: ${id} not found`);
      }

      const deleteResult = await this.subCategoryRepository.delete(id);
      if (!deleteResult) {
        throw new HttpException(500, 'Failed to delete subcategory');
      }

      return deleteResult;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error deleting subcategory');
    }
  }
}
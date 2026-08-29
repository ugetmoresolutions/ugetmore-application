import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { ICategory, ICreateCategory, IUpdateCategory, IMainCategoryWithHierarchy } from "@/types/category/category.type";
import { CategoryRepository } from "@/repositories/category/category.repository";
import { ICategoryService, CATEGORY_SERVICE_TOKEN } from "@/interfaces/category/category.service.interface";
import { MainCategoryType, MAIN_CATEGORIES, isValidMainCategory } from "@/types/main-category/main-category.type";

@Service({ id: CATEGORY_SERVICE_TOKEN })
export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  public async createCategory(categoryData: ICreateCategory): Promise<ICategory> {
    try {
      return await this.categoryRepository.create(categoryData);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error creating category');
    }
  }

  public async getAllCategories(): Promise<ICategory[]> {
    try {
      return await this.categoryRepository.findAll();
    } catch (err) {
      throw new HttpException(500, err.message || 'Error fetching categories');
    }
  }

  public async getCategoryById(id: number): Promise<ICategory | null> {
    try {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new HttpException(404, `Category with ID: ${id} not found`);
      }
      return category;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching category');
    }
  }

  public async updateCategory(id: number, updateData: IUpdateCategory): Promise<ICategory | null> {
    try {
      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new HttpException(404, `Category with ID: ${id} not found`);
      }

      const updatedCategory = await this.categoryRepository.update(id, updateData);
      if (!updatedCategory) {
        throw new HttpException(500, 'Failed to update category');
      }
      return updatedCategory;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error updating category');
    }
  }

  public async deleteCategory(id: number): Promise<boolean> {
    try {
      const categoryExists = await this.categoryRepository.findById(id);
      if (!categoryExists) {
        throw new HttpException(404, `Category with ID: ${id} not found`);
      }

      const deleteResult = await this.categoryRepository.delete(id);
      if (!deleteResult) {
        throw new HttpException(500, 'Failed to delete category');
      }

      return deleteResult;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error deleting category');
    }
  }

  // Hierarchical methods

  public async getAllMainCategoriesWithHierarchy(): Promise<IMainCategoryWithHierarchy[]> {
    try {
      // Get all categories with their subcategories
      const categoriesWithSubs = await this.categoryRepository.findAllWithSubCategories();
      
      // Group categories by mainCategoryId
      const categoriesByMainCategory = categoriesWithSubs.reduce((acc, category) => {
        if (!acc[category.mainCategoryId]) {
          acc[category.mainCategoryId] = [];
        }
        acc[category.mainCategoryId].push(category);
        return acc;
      }, {} as Record<MainCategoryType, any[]>);

      // Build the hierarchy response
      return MAIN_CATEGORIES.sort((a, b) => a.displayOrder - b.displayOrder).map(mainCategory => ({
        ...mainCategory,
        categories: categoriesByMainCategory[mainCategory.id] || []
      }));
    } catch (err) {
      throw new HttpException(500, err.message || 'Error fetching category hierarchy');
    }
  }

  public async getCategoriesByMainCategory(mainCategoryId: MainCategoryType): Promise<ICategory[]> {
    try {
      if (!isValidMainCategory(mainCategoryId)) {
        throw new HttpException(400, `Invalid main category. Valid values: ${Object.values(MainCategoryType).join(', ')}`);
      }

      const categories = await this.categoryRepository.findByMainCategory(mainCategoryId);
      return categories;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching categories by main category');
    }
  }

  // Main category methods

  public async getAllMainCategories(): Promise<any[]> {
    try {
      return await this.categoryRepository.getAllMainCategories();
    } catch (err) {
      throw new HttpException(500, err.message || 'Error fetching main categories');
    }
  }

  public async getMainCategoryById(id: MainCategoryType): Promise<any | null> {
    try {
      if (!isValidMainCategory(id)) {
        throw new HttpException(400, `Invalid main category. Valid values: ${Object.values(MainCategoryType).join(', ')}`);
      }

      return await this.categoryRepository.getMainCategoryById(id);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching main category');
    }
  }
}
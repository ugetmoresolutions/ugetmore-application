import { Service } from "typedi";
import { ICategory, ICreateCategory, IUpdateCategory, ICategoryWithSubCategories } from "@/types/category/category.type";
import Category from "@/models/category/category.model";
import { ICategoryRepository } from "@/interfaces/category/category.repository.interface";
import { HttpException } from "@/exceptions/HttpException";
import { MainCategoryType, MAIN_CATEGORIES, isValidMainCategory } from "@/types/main-category/main-category.type";
import SubCategory from "@/models/subcategory/subcategory.model";

@Service()
export class CategoryRepository implements ICategoryRepository {
  public async create(categoryData: ICreateCategory): Promise<ICategory> {
    try {
      // Validate main category
      if (!isValidMainCategory(categoryData.mainCategoryId)) {
        const validValues = Object.values(MainCategoryType).join(', ');
        throw new HttpException(400, `Invalid main category. Valid values: ${validValues}`);
      }

      // Generate unique code
      const code = await this.generateUniqueCode(categoryData.name);
      
      // Check for duplicate name in the same main category
      const existingCategory = await this.findByNameAndMainCategory(
        categoryData.name, 
        categoryData.mainCategoryId
      );
      
      if (existingCategory) {
        throw new HttpException(409, `Category '${categoryData.name}' already exists in this main category`);
      }

      return await Category.create({
        ...categoryData,
        code
      } as any);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || 'Error creating category');
    }
  }

  private async generateUniqueCode(name: string): Promise<string> {
    const baseCode = name.substring(0, 3).toUpperCase();
    let code = baseCode;
    let counter = 1;
    
    // Check if code already exists, add timestamp if needed
    while (await this.findByCode(code)) {
      const timestamp = Date.now().toString().slice(-4);
      code = `${baseCode}${timestamp}`;
      counter++;
      
      if (counter > 5) {
        throw new HttpException(500, 'Failed to generate unique category code');
      }
    }
    
    return code;
  }

  public async findAll(): Promise<ICategory[]> {
    try {
      return await Category.findAll({
        order: [['name', 'ASC']],
        include: [{
          model: SubCategory,
          as: 'subCategories',
          attributes: ['id', 'name', 'code']
        }]
      });
    } catch (error) {
      throw new HttpException(500, error.message || 'Error fetching categories');
    }
  }

  public async findByCode(code: string): Promise<ICategory | null> {
    try {
      return await Category.findOne({ 
        where: { code },
        include: [{
          model: SubCategory,
          as: 'subCategories',
          attributes: ['id', 'name', 'code']
        }]
      });
    } catch (error) {
      throw new HttpException(500, error.message || 'Error finding category');
    }
  }

  public async findById(id: number): Promise<ICategory | null> {
    try {
      return await Category.findOne({ 
        where: { id },
        include: [{
          model: SubCategory,
          as: 'subCategories',
          attributes: ['id', 'name', 'code']
        }]
      });
    } catch (error) {
      throw new HttpException(500, error.message || 'Error finding category');
    }
  }

  public async findByNameAndMainCategory(name: string, mainCategoryId: MainCategoryType): Promise<ICategory | null> {
    try {
      return await Category.findOne({ 
        where: { 
          name,
          mainCategoryId 
        }
      });
    } catch (error) {
      throw new HttpException(500, error.message || 'Error finding category');
    }
  }

  public async update(id: number, updateData: IUpdateCategory): Promise<ICategory | null> {
    try {
      const category = await Category.findOne({ where: { id } });
      if (!category) return null;

      // If mainCategoryId is being changed, validate it
      if (updateData.mainCategoryId && !isValidMainCategory(updateData.mainCategoryId)) {
        const validValues = Object.values(MainCategoryType).join(', ');
        throw new HttpException(400, `Invalid main category. Valid values: ${validValues}`);
      }

      // If name is being changed, check for duplicates in the same main category
      if (updateData.name && updateData.name !== category.name) {
        const mainCategoryId = updateData.mainCategoryId || category.mainCategoryId;
        const existingCategory = await this.findByNameAndMainCategory(updateData.name, mainCategoryId);
        if (existingCategory) {
          throw new HttpException(409, `Category '${updateData.name}' already exists in this main category`);
        }
      }

      await category.update(updateData as any);
      return category;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || 'Error updating category');
    }
  }

  public async delete(id: number): Promise<boolean> {
    try {
      const deletedCount = await Category.destroy({
        where: { id }
      });
      return deletedCount === 1;
    } catch (error) {
      throw new HttpException(500, error.message || 'Error deleting category');
    }
  }

  // Hierarchical methods

  public async findAllWithSubCategories(): Promise<ICategoryWithSubCategories[]> {
    try {
      const categories = await Category.findAll({
        order: [['name', 'ASC']],
        include: [{
          model: SubCategory,
          as: 'subCategories',
          attributes: ['id', 'name', 'code', 'description'],
          order: [['name', 'ASC']]
        }]
      });

      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        code: cat.code,
        mainCategoryId: cat.mainCategoryId,
        description: cat.description,
        subCategories: cat.subCategories || []
      }));
    } catch (error) {
      throw new HttpException(500, error.message || 'Error fetching categories with subcategories');
    }
  }

  public async findByMainCategory(mainCategoryId: MainCategoryType): Promise<ICategoryWithSubCategories[]> {
    try {
      if (!isValidMainCategory(mainCategoryId)) {
        return [];
      }

      const categories = await Category.findAll({
        where: { mainCategoryId },
        order: [['name', 'ASC']],
        include: [{
          model: SubCategory,
          as: 'subCategories',
          attributes: ['id', 'name', 'code', 'description'],
          order: [['name', 'ASC']]
        }]
      });

      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        code: cat.code,
        mainCategoryId: cat.mainCategoryId,
        description: cat.description,
        subCategories: cat.subCategories || []
      }));
    } catch (error) {
      throw new HttpException(500, error.message || 'Error fetching categories by main category');
    }
  }

  // Main category methods (static data)

  public async getAllMainCategories(): Promise<any[]> {
    try {
      // Return static main categories
      return MAIN_CATEGORIES.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      throw new HttpException(500, error.message || 'Error fetching main categories');
    }
  }

  public async getMainCategoryById(id: MainCategoryType): Promise<any | null> {
    try {
      if (!isValidMainCategory(id)) {
        return null;
      }
      return MAIN_CATEGORIES.find(mc => mc.id === id) || null;
    } catch (error) {
      throw new HttpException(500, error.message || 'Error fetching main category');
    }
  }
}
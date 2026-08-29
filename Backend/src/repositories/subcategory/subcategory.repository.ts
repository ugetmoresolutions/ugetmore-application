import { Service } from "typedi";
import { ISubCategory, ICreateSubCategory, IUpdateSubCategory } from "@/types/subcategory/subcategory.type";
import SubCategory from "@/models/subcategory/subcategory.model";
import { ISubCategoryRepository } from "@/interfaces/subcategory/subcategory.repository.interface";
import { HttpException } from "@/exceptions/HttpException";
import Category from "@/models/category/category.model";

@Service()
export class SubCategoryRepository implements ISubCategoryRepository {
  public async create(subCategoryData: ICreateSubCategory): Promise<ISubCategory> {
    try {
      // Verify category exists
      const category = await Category.findOne({ where: { id: subCategoryData.categoryId } });
      if (!category) {
        throw new HttpException(404, `Category with ID: ${subCategoryData.categoryId} not found`);
      }

      // Generate unique code
      const code = await this.generateUniqueCode(subCategoryData.name);
      
      // Check for duplicate name in the same category
      const existingSubCategory = await this.findByNameAndCategory(
        subCategoryData.name, 
        subCategoryData.categoryId
      );
      
      if (existingSubCategory) {
        throw new HttpException(409, `SubCategory '${subCategoryData.name}' already exists in this category`);
      }

      return await SubCategory.create({
        ...subCategoryData,
        code
      } as any);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || 'Error creating subcategory');
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
        throw new HttpException(500, 'Failed to generate unique subcategory code');
      }
    }
    
    return code;
  }

  public async findAll(): Promise<ISubCategory[]> {
    try {
      return await SubCategory.findAll({
        order: [['name', 'ASC']],
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'code', 'mainCategoryId']
        }]
      });
    } catch (error) {
      throw new HttpException(500, error.message || 'Error fetching subcategories');
    }
  }

  public async findByCategoryId(categoryId: number): Promise<ISubCategory[]> {
    try {
      return await SubCategory.findAll({
        where: { categoryId },
        order: [['name', 'ASC']],
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'code', 'mainCategoryId']
        }]
      });
    } catch (error) {
      throw new HttpException(500, error.message || 'Error fetching subcategories by category');
    }
  }

  public async findByCode(code: string): Promise<ISubCategory | null> {
    try {
      return await SubCategory.findOne({ 
        where: { code },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'code', 'mainCategoryId']
        }]
      });
    } catch (error) {
      throw new HttpException(500, error.message || 'Error finding subcategory');
    }
  }

  public async findById(id: number): Promise<ISubCategory | null> {
    try {
      return await SubCategory.findOne({ 
        where: { id },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'code', 'mainCategoryId']
        }]
      });
    } catch (error) {
      throw new HttpException(500, error.message || 'Error finding subcategory');
    }
  }

  public async findByNameAndCategory(name: string, categoryId: number): Promise<ISubCategory | null> {
    try {
      return await SubCategory.findOne({ 
        where: { 
          name,
          categoryId 
        }
      });
    } catch (error) {
      throw new HttpException(500, error.message || 'Error finding subcategory');
    }
  }

  public async update(id: number, updateData: IUpdateSubCategory): Promise<ISubCategory | null> {
    try {
      const subCategory = await SubCategory.findOne({ where: { id } });
      if (!subCategory) return null;

      // If categoryId is being changed, verify new category exists
      if (updateData.categoryId && updateData.categoryId !== subCategory.categoryId) {
        const category = await Category.findOne({ where: { id: updateData.categoryId } });
        if (!category) {
          throw new HttpException(404, `Category with ID: ${updateData.categoryId} not found`);
        }
      }

      // If name is being changed, check for duplicates in the same category
      if (updateData.name && updateData.name !== subCategory.name) {
        const categoryId = updateData.categoryId || subCategory.categoryId;
        const existingSubCategory = await this.findByNameAndCategory(updateData.name, categoryId);
        if (existingSubCategory) {
          throw new HttpException(409, `SubCategory '${updateData.name}' already exists in this category`);
        }
      }

      await subCategory.update(updateData as any);
      return subCategory;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, error.message || 'Error updating subcategory');
    }
  }

  public async delete(id: number): Promise<boolean> {
    try {
      const deletedCount = await SubCategory.destroy({
        where: { id }
      });
      return deletedCount === 1;
    } catch (error) {
      throw new HttpException(500, error.message || 'Error deleting subcategory');
    }
  }
}
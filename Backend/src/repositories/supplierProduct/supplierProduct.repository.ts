import { ISupplierProductRepository, PaginatedResponse, ProductFilters } from "@/interfaces/supplierProduct/supplierProduct.repository.interface";
import { IBrandingProduct } from "@/types/brandingProduct/brandingProduct.type";
import SupplierProduct from "@/models/supplierProduct/supplierProduct.model";
import { Op, Sequelize, WhereOptions } from "sequelize";
import { HttpException } from "@/exceptions/HttpException";
import { logger } from "@/utils/logger";

export class SupplierProductRepository implements ISupplierProductRepository {
  
  async getAllSupplierProducts(page: number = 1, limit: number = 50): Promise<{ products: IBrandingProduct[]; total: number; page: number; totalPages: number }> {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await SupplierProduct.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['createdAt', 'updatedAt'] } // Optimize response size
      });

      return {
        products: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Repository Error - getAllSupplierProducts:', error);
      throw new HttpException(500, 'Failed to retrieve supplier products');
    }
  }

  async getSupplierProductById(id: number): Promise<IBrandingProduct | null> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, 'Invalid product ID');
      }
      return await SupplierProduct.findByPk(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      logger.error('Repository Error - getSupplierProductById:', error);
      throw new HttpException(500, 'Failed to retrieve supplier product');
    }
  }

  async getAllSupplierProductsWithFilters(filters: ProductFilters): Promise<PaginatedResponse> {
  try {
    const {
      search,
      category,
      subCategory,
      page = 1,
      limit = 12,
      sortBy = 'createdAt'
    } = filters;

    const offset = (page - 1) * limit;
    
    // Build where clause using literal SQL for better performance
    const whereConditions: string[] = [];
    const replacements: any = {};

    // Search across multiple fields
// If user searches "gaming laptop", find products with "gaming" OR "laptop"
if (search?.trim()) {
  const searchWords = search.trim().split(/\s+/);
  const wordConditions = [];
  
  searchWords.forEach((word, index) => {
    const wordTerm = `%${word}%`;
    wordConditions.push(`
      (productName LIKE :word${index} OR
       tags LIKE :word${index} OR
       brand LIKE :word${index} OR
       simpleCode LIKE :word${index} OR
       supplier LIKE :word${index} OR
       mainCategory LIKE :word${index} OR
       description LIKE :word${index})
    `);
    replacements[`word${index}`] = wordTerm;
  });
  
  if (wordConditions.length > 0) {
    whereConditions.push(`(${wordConditions.join(' OR ')})`);
  }
}

    // Category filtering
    if (category?.trim()) {
      whereConditions.push('categories LIKE :category');
      replacements.category = `%${category.trim()}%`;
    }

    // Sub-category filtering
    if (subCategory?.trim()) {
      whereConditions.push('categories LIKE :subCategory');
      replacements.subCategory = `%${subCategory.trim()}%`;
    }

    // Combine all conditions
    const whereClause = whereConditions.length > 0 
      ? { [Op.and]: whereConditions.map(cond => Sequelize.literal(cond)) }
      : undefined;

    // Determine sort order
    let order: any[] = [['createdAt', 'DESC']];
    if (sortBy) {
      const [field, direction] = sortBy.split(':');
      if (field && direction) {
        order = [[field, direction.toUpperCase()]];
      } else {
        order = [[sortBy, 'DESC']];
      }
    }

    const { count, rows } = await SupplierProduct.findAndCountAll({
      where: whereClause,
      replacements,
      limit,
      offset,
      order
    });

    const totalPages = Math.ceil(count / limit);
    
    return {
      products: rows,
      totalProducts: count,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      filters,
      searchQuery: search
    };
  } catch (error) {
    logger.error('Repository Error - getAllSupplierProductsWithFilters:', error);
    throw new HttpException(500, 'Failed to retrieve filtered supplier products');
  }
}


  async getSupplierProductBySimpleCode(simpleCode: string): Promise<IBrandingProduct | null> {
    try {
      if (!simpleCode?.trim()) {
        throw new HttpException(400, 'Simple code is required');
      }
      return await SupplierProduct.findOne({ 
        where: { simpleCode: simpleCode.trim() } 
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      logger.error('Repository Error - getSupplierProductBySimpleCode:', error);
      throw new HttpException(500, 'Failed to retrieve supplier product by simple code');
    }
  }

  async getSupplierProductByFullCode(fullCode: string): Promise<IBrandingProduct | null> {
    try {
      if (!fullCode?.trim()) {
        throw new HttpException(400, 'Full code is required');
      }
      return await SupplierProduct.findOne({ 
        where: { fullCode: fullCode.trim() } 
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      logger.error('Repository Error - getSupplierProductByFullCode:', error);
      throw new HttpException(500, 'Failed to retrieve supplier product by full code');
    }
  }

  async searchSupplierProducts(query: string, page: number = 1, limit: number = 50): Promise<{ products: IBrandingProduct[]; total: number; page: number; totalPages: number }> {
    try {
      if (!query?.trim() || query.trim().length < 2) {
        throw new HttpException(400, 'Search query must be at least 2 characters long');
      }

      const searchTerm = `%${query.trim()}%`;
      const offset = (page - 1) * limit;

      const whereClause: WhereOptions = {
        [Op.or]: [
          { productName: { [Op.iLike]: searchTerm } }, // Case-insensitive search
          { description: { [Op.iLike]: searchTerm } },
          { simpleCode: { [Op.iLike]: searchTerm } },
          { fullCode: { [Op.iLike]: searchTerm } },
          { supplier: { [Op.iLike]: searchTerm } }
        ]
      };

      const { count, rows } = await SupplierProduct.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        products: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      logger.error('Repository Error - searchSupplierProducts:', error);
      throw new HttpException(500, 'Failed to search supplier products');
    }
  }

  // KEEP EXISTING METHODS AS THEY ARE - NO CHANGES
  async createSupplierProduct(productData: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IBrandingProduct> {
    return await SupplierProduct.create(productData);
  }

  async updateSupplierProduct(id: number, productData: Partial<IBrandingProduct>): Promise<IBrandingProduct> {
    const product = await SupplierProduct.findByPk(id);
    if (!product) {
      throw new Error(`SupplierProduct with id ${id} not found`);
    }
    return await product.update(productData);
  }

  async deleteSupplierProduct(id: number): Promise<boolean> {
    const deleted = await SupplierProduct.destroy({ where: { id } });
    return deleted > 0;
  }

  async getSupplierProductsBySupplier(supplier: string): Promise<IBrandingProduct[]> {
    return await SupplierProduct.findAll({ where: { supplier } });
  }

  async bulkCreateSupplierProducts(products: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<IBrandingProduct[]> {
    return await SupplierProduct.bulkCreate(products, {
      updateOnDuplicate: [
        'price', 'fullCode', 'categorisedAttribute', 'material', 'fit', 'feature',
        'categories', 'brand', 'companionCodes', 'relatedCodes', 'matchingCodes',
        'groupingCodes', 'groupingCodeGiftsets', 'productName', 'description',
        'minimum', 'maximum', 'incrementedBy', 'keywords', 'tags', 'inventoryType',
        'behaviour', 'madeToOrder', 'madeToOrderMessage', 'displayCountryOfOrigin',
        'promotion', 'fullBrandingGuide', 'logo24BrandingGuide', 'images',
        'colourImages', 'brandings', 'isLogo24', 'logo24Branding', 'inclusiveBranding',
        'variants', 'requiredBrandingPositions', 'noCoBrandingPositions',
        'brandingTemplates', 'decoupled', 'type', 'stock', 'supplier', 'updatedAt'
      ]
    });
  }
}
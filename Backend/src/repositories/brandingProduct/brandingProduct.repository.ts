import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { IBrandingProduct } from "@/types/brandingProduct/brandingProduct.type";
import BrandingProduct from "@/models/brandingProduct/brandingProduct.model";
import { IBrandingProductRepository } from "@/interfaces/brandingProduct/brandingProduct.interface.repositoty";
import { Op } from "sequelize";
import Stock from "@/models/stock/stock.model";

@Service()
export class BrandingProductRepository implements IBrandingProductRepository {
  public async getAllBrandingProducts(): Promise<IBrandingProduct[]> {
    try {
      const brandingProducts = await BrandingProduct.findAll({
        include: [{
          model: Stock,
          as: 'stock',
          required: false,
          attributes: ['stock'] // Only get the stock number
        }],
        order: [['createdAt', 'DESC']]
      });

      return brandingProducts.map(brandingProduct => {
        const product = brandingProduct.toJSON() as any;
        
        return {
          ...product,
          stock: product.stock?.stock || 0 // Just the stock number
        } as IBrandingProduct;
      });
    } catch (error: any) {
      throw new HttpException(500, `Failed to get branding products: ${error.message}`);
    }
  }

 public async getBrandingProductById(id: number): Promise<IBrandingProduct | null> {
    try {
      const brandingProduct = await BrandingProduct.findByPk(id, {
        include: [{
          model: Stock,
          as: 'stock',
          required: false,
          attributes: ['stock']
        }]
      });
      
      if (!brandingProduct) {
        return null;
      }

      const product = brandingProduct.toJSON() as any;
      return {
        ...product,
        stock: product.stock?.stock || 0
      } as IBrandingProduct;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get branding product: ${error.message}`);
    }
  }

  public async getBrandingProductBySimpleCode(simpleCode: string): Promise<IBrandingProduct | null> {
    try {
      const brandingProduct = await BrandingProduct.findOne({
        where: { simpleCode },
        include: [{
          model: Stock,
          as: 'stock',
          required: false,
          attributes: ['stock']
        }]
      });

      if (!brandingProduct) {
        return null;
      }

      const product = brandingProduct.toJSON() as any;
      return {
        ...product,
        stock: product.stock?.stock || 0
      } as IBrandingProduct;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get branding product by simple code: ${error.message}`);
    }
  }

  public async getBrandingProductByFullCode(fullCode: string): Promise<IBrandingProduct | null> {
    try {
      const brandingProduct = await BrandingProduct.findOne({
        where: { fullCode },
        include: [{
          model: Stock,
          as: 'stock',
          required: false,
          attributes: ['stock']
        }]
      });

      if (!brandingProduct) {
        return null;
      }

      const product = brandingProduct.toJSON() as any;
      return {
        ...product,
        stock: product.stock?.stock || 0
      } as IBrandingProduct;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get branding product by full code: ${error.message}`);
    }
  }

  public async createBrandingProduct(brandingProductData: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IBrandingProduct> {
    try {
      // Check if branding product with same codes already exists
      const existingBrandingProduct = await BrandingProduct.findOne({
        where: {
          [Op.or]: [
            { simpleCode: brandingProductData.simpleCode },
            { fullCode: brandingProductData.fullCode }
          ]
        }
      });

      if (existingBrandingProduct) {
        throw new HttpException(409, "Branding product with same simple code or full code already exists");
      }

      const brandingProduct = await BrandingProduct.create(brandingProductData as any);
      return brandingProduct.toJSON() as IBrandingProduct;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Failed to create branding product: ${error.message}`);
    }
  }

  public async updateBrandingProduct(id: number, brandingProductData: Partial<IBrandingProduct>): Promise<IBrandingProduct> {
    try {
      const brandingProduct = await BrandingProduct.findByPk(id);

      if (!brandingProduct) {
        throw new HttpException(404, "Branding product not found");
      }

      // Check if new codes conflict with existing branding products
      if (brandingProductData.simpleCode || brandingProductData.fullCode) {
        const whereClause: any = {
          id: { [Op.ne]: id }
        };

        if (brandingProductData.simpleCode && brandingProductData.fullCode) {
          whereClause[Op.or] = [
            { simpleCode: brandingProductData.simpleCode },
            { fullCode: brandingProductData.fullCode }
          ];
        } else if (brandingProductData.simpleCode) {
          whereClause.simpleCode = brandingProductData.simpleCode;
        } else if (brandingProductData.fullCode) {
          whereClause.fullCode = brandingProductData.fullCode;
        }

        const conflictingBrandingProduct = await BrandingProduct.findOne({
          where: whereClause
        });

        if (conflictingBrandingProduct) {
          throw new HttpException(409, "Another branding product with the same code already exists");
        }
      }

      await brandingProduct.update(brandingProductData as any);
      return brandingProduct.toJSON() as IBrandingProduct;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Failed to update branding product: ${error.message}`);
    }
  }

  public async deleteBrandingProduct(id: number): Promise<boolean> {
    try {
      const brandingProduct = await BrandingProduct.findByPk(id);

      if (!brandingProduct) {
        throw new HttpException(404, "Branding product not found");
      }

      await brandingProduct.destroy();
      return true;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Failed to delete branding product: ${error.message}`);
    }
  }

  public async searchBrandingProducts(query: string): Promise<IBrandingProduct[]> {
    try {
      const brandingProducts = await BrandingProduct.findAll({
        where: {
          [Op.or]: [
            { productName: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } },
            { keywords: { [Op.like]: `%${query}%` } },
            { simpleCode: { [Op.like]: `%${query}%` } },
            { fullCode: { [Op.like]: `%${query}%` } }
          ]
        },
        order: [['createdAt', 'DESC']]
      });

      return brandingProducts.map(brandingProduct => brandingProduct.toJSON() as IBrandingProduct);
    } catch (error: any) {
      throw new HttpException(500, `Failed to search branding products: ${error.message}`);
    }
  }

  public async getBrandingProductsByType(type: string): Promise<IBrandingProduct[]> {
    try {
      const brandingProducts = await BrandingProduct.findAll({
        where: { type },
        order: [['createdAt', 'DESC']]
      });

      return brandingProducts.map(brandingProduct => brandingProduct.toJSON() as IBrandingProduct);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get branding products by type: ${error.message}`);
    }
  }

  public async getBrandingProductsByBrand(brandCode: string): Promise<IBrandingProduct[]> {
  try {
    const brandingProducts = await BrandingProduct.findAll({
      where: {
        brand: brandCode
      },
      order: [['createdAt', 'DESC']]
    });

    return brandingProducts.map(brandingProduct => brandingProduct.toJSON() as IBrandingProduct);
  } catch (error: any) {
    throw new HttpException(500, `Failed to get branding products by brand: ${error.message}`);
  }
}
}
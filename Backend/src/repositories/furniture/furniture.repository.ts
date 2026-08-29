import { Service } from "typedi";
import { IFurnitureProduct, ICreateFurnitureProduct, FurnitureProductStatus } from "@/types/furniture/furniture.type";
import FurnitureProduct from "@/models/furniture/furniture.model";
import { IFurnitureRepository } from "@/interfaces/furniture/furniture.repository.interface";
import { HttpException } from "@/exceptions/HttpException";
import { Op, Sequelize } from "sequelize";

@Service()
export class FurnitureRepository implements IFurnitureRepository {
  public async createFurnitureProduct(productData: ICreateFurnitureProduct): Promise<IFurnitureProduct> {
    try {
      return await FurnitureProduct.create(productData as any);
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async getFurnitureProductById(productId: number): Promise<IFurnitureProduct | null> {
    try {
      return await FurnitureProduct.findByPk(productId);
    } catch (error) {
      throw new HttpException(404, error.message);
    }
  }

  public async updateFurnitureProduct(
    productId: number, 
    updateData: Partial<IFurnitureProduct>
  ): Promise<IFurnitureProduct | null> {
    try {
      const product = await FurnitureProduct.findByPk(productId);
      if (!product) return null;

      await product.update(updateData as any);
      return product;
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async deleteFurnitureProduct(productId: number): Promise<boolean> {
    try {
      const deletedCount = await FurnitureProduct.destroy({
        where: { id: productId }
      });
      return deletedCount === 1;
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async getAllFurnitureProducts(options?: {
    page?: number;
    pageSize?: number;
    category?: string;
    status?: FurnitureProductStatus;
  }): Promise<{ products: IFurnitureProduct[]; totalCount: number }> {
    try {
      const { page = 1, pageSize = 10, category, status } = options || {};
      const offset = (page - 1) * pageSize;

      const where: any = {};
      if (category) {
        where.categories = {
          [Op.like]: `%${category}%`
        };
      }
      if (status) {
        where.status = status;
      }

      const { count, rows } = await FurnitureProduct.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        order: [['createdAt', 'DESC']]
      });

      return {
        products: rows,
        totalCount: count
      };
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async findByTitle(title: string): Promise<IFurnitureProduct | null> {
    try {
      return await FurnitureProduct.findOne({ 
        where: { title }
      });
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async findBySku(sku: string): Promise<IFurnitureProduct | null> {
    try {
      return await FurnitureProduct.findOne({ 
        where: { sku }
      });
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async findByCategory(category: string): Promise<IFurnitureProduct[]> {
    try {
      return await FurnitureProduct.findAll({
        where: Sequelize.literal(`categories LIKE '%${category}%'`)
      });
    } catch (error: any) {
      throw new HttpException(400, error.message);
    }
  }

  public async findByBrand(brand: string): Promise<IFurnitureProduct[]> {
    try {
      return await FurnitureProduct.findAll({
        where: { brand }
      });
    } catch (error: any) {
      throw new HttpException(400, error.message);
    }
  }

  public async searchFurnitureProducts(query: string): Promise<IFurnitureProduct[]> {
    try {
      return await FurnitureProduct.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } },
            { sku: { [Op.like]: `%${query}%` } },
            { brand: { [Op.like]: `%${query}%` } },
            { material: { [Op.like]: `%${query}%` } }
          ]
        },
        limit: 20
      });
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }
}
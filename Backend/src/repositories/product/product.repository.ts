// repositories/product/product.repository.ts
import { Service } from "typedi";
import { IProduct, ICreateProduct, ProductStatus } from "@/types/product/products.type";
import Product from "@/models/product/product.model";
import { IProductRepository } from "@/interfaces/product/product.repository.interface";
import { HttpException } from "@/exceptions/HttpException";
import { Op, Sequelize } from "sequelize";

@Service()
export class ProductRepository implements IProductRepository {
  public async createProduct(productData: ICreateProduct): Promise<IProduct> {
    try {
      return await Product.create(productData as any);
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async getProductById(productId: number): Promise<IProduct | null> {
    try {
      return await Product.findByPk(productId);
    } catch (error) {
      throw new HttpException(404, error.message);
    }
  }

  public async updateProduct(
    productId: number, 
    updateData: Partial<IProduct>
  ): Promise<IProduct | null> {
    try {
      const product = await Product.findByPk(productId);
      if (!product) return null;

      await product.update(updateData as any);
      return product;
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async deleteProduct(productId: number): Promise<boolean> {
    try {
      const deletedCount = await Product.destroy({
        where: { id: productId }
      });
      return deletedCount === 1;
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async getAllProducts(options?: {
    page?: number;
    pageSize?: number;
    category?: string;
    status?: ProductStatus;
  }): Promise<{ products: IProduct[]; totalCount: number }> {
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

      const { count, rows } = await Product.findAndCountAll({
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

  public async findByTitle(title: string): Promise<IProduct | null> {
    try {
      return await Product.findOne({ 
        where: { title }
      });
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async findBySku(sku: string): Promise<IProduct | null> {
    try {
      return await Product.findOne({ 
        where: { sku }
      });
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async findByCategory(category: string): Promise<IProduct[]> {
  try {
    return await Product.findAll({
      where: Sequelize.literal(`categories LIKE '%${category}%'`)
    });
  } catch (error: any) {
    throw new HttpException(400, error.message);
  }
}

  public async searchProducts(query: string): Promise<IProduct[]> {
    try {
      return await Product.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } },
            { sku: { [Op.like]: `%${query}%` } }
          ]
        },
        limit: 20
      });
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }
}
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { IFurnitureProduct, ICreateFurnitureProduct, FurnitureProductStatus } from "@/types/furniture/furniture.type";
import { FurnitureRepository } from "@/repositories/furniture/furniture.repository";
import { IFurnitureService, FURNITURE_SERVICE_TOKEN } from "@/interfaces/furniture/furniture.service.interface";

@Service({ id: FURNITURE_SERVICE_TOKEN })
export class FurnitureService implements IFurnitureService {
  constructor(private furnitureRepository: FurnitureRepository) {}

  public async createFurnitureProduct(productData: ICreateFurnitureProduct): Promise<IFurnitureProduct> {
    try {
      // Check for duplicate SKU
      const existingSku = await this.furnitureRepository.findBySku(productData.sku);
      if (existingSku) {
        throw new HttpException(409, `Furniture product with SKU "${productData.sku}" already exists`);
      }

      // Validate quantities
      if (productData.minQuantity > productData.maxQuantity) {
        throw new HttpException(400, "Minimum quantity cannot be greater than maximum quantity");
      }

      if (productData.stockQuantity < 0) {
        throw new HttpException(400, "Stock quantity cannot be negative");
      }

      const createdProduct = await this.furnitureRepository.createFurnitureProduct(productData);
      return createdProduct;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error creating furniture product');
    }
  }

  public async getFurnitureProductById(productId: number): Promise<IFurnitureProduct | null> {
    try {
      const product = await this.furnitureRepository.getFurnitureProductById(productId);
      if (!product) {
        throw new HttpException(404, `Furniture product with ID: ${productId} not found`);
      }
      return product;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching furniture product');
    }
  }

  public async updateFurnitureProduct(productId: number, updateData: Partial<IFurnitureProduct>): Promise<IFurnitureProduct | null> {
    try {
      const existingProduct = await this.furnitureRepository.getFurnitureProductById(productId);
      if (!existingProduct) {
        throw new HttpException(404, 'Furniture product not found');
      }

      // Check for SKU conflicts if SKU is being updated
      if (updateData.sku && updateData.sku !== existingProduct.sku) {
        const duplicateSku = await this.furnitureRepository.findBySku(updateData.sku);
        if (duplicateSku) {
          throw new HttpException(409, `Furniture product with SKU "${updateData.sku}" already exists`);
        }
      }

      // Validate quantities if updated
      if (updateData.minQuantity !== undefined || updateData.maxQuantity !== undefined) {
        const minQty = updateData.minQuantity ?? existingProduct.minQuantity;
        const maxQty = updateData.maxQuantity ?? existingProduct.maxQuantity;
        if (minQty > maxQty) {
          throw new HttpException(400, "Minimum quantity cannot be greater than maximum quantity");
        }
      }

      if (updateData.stockQuantity !== undefined && updateData.stockQuantity < 0) {
        throw new HttpException(400, "Stock quantity cannot be negative");
      }

      const updatedProduct = await this.furnitureRepository.updateFurnitureProduct(productId, updateData);
      if (!updatedProduct) {
        throw new HttpException(500, 'Failed to update furniture product');
      }
      return updatedProduct;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error updating furniture product');
    }
  }

  public async deleteFurnitureProduct(productId: number): Promise<boolean> {
    try {
      const productExists = await this.furnitureRepository.getFurnitureProductById(productId);
      if (!productExists) {
        throw new HttpException(404, 'Furniture product not found');
      }

      const deleteResult = await this.furnitureRepository.deleteFurnitureProduct(productId);
      if (!deleteResult) {
        throw new HttpException(500, 'Failed to delete furniture product');
      }

      return deleteResult;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error deleting furniture product');
    }
  }

  public async getFurnitureProductBySku(sku: string): Promise<IFurnitureProduct | null> {
    try {
      const product = await this.furnitureRepository.findBySku(sku);
      if (!product) {
        throw new HttpException(404, `Furniture product with SKU: ${sku} not found`);
      }
      return product;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching furniture product by SKU');
    }
  }

  public async getAllFurnitureProducts(options?: { 
    page?: number; 
    pageSize?: number;
    category?: string;
    status?: FurnitureProductStatus;
  }): Promise<{ products: IFurnitureProduct[]; totalCount: number; totalPages: number }> {
    try {
      const result = await this.furnitureRepository.getAllFurnitureProducts(options);
      
      const totalPages = Math.ceil(result.totalCount / (options?.pageSize || 10));
      
      return {
        products: result.products,
        totalCount: result.totalCount,
        totalPages
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching furniture products');
    }
  }

  public async getFurnitureProductsByCategory(category: string): Promise<IFurnitureProduct[]> {
    try {
      const decodedCategory = decodeURIComponent(category);
      const products = await this.furnitureRepository.findByCategory(decodedCategory);
      
      if (!products || products.length === 0) {
        throw new HttpException(404, `No furniture products found in category ${decodedCategory}`);
      }
      
      return products;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching furniture products by category');
    }
  }

  public async getFurnitureProductsByBrand(brand: string): Promise<IFurnitureProduct[]> {
    try {
      const decodedBrand = decodeURIComponent(brand);
      const products = await this.furnitureRepository.findByBrand(decodedBrand);
      
      if (!products || products.length === 0) {
        throw new HttpException(404, `No furniture products found for brand ${decodedBrand}`);
      }
      
      return products;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching furniture products by brand');
    }
  }

  public async searchFurnitureProducts(query: string): Promise<IFurnitureProduct[]> {
    try {
      const products = await this.furnitureRepository.searchFurnitureProducts(query);
      return products;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error searching furniture products');
    }
  }

  public async updateFurnitureProductStatus(productId: number, status: FurnitureProductStatus): Promise<IFurnitureProduct | null> {
    try {
      return await this.furnitureRepository.updateFurnitureProduct(productId, { status });
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error updating furniture product status');
    }
  }
}
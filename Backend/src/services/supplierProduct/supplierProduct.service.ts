import { Service } from "typedi";
import { ISupplierProductService } from "@/interfaces/supplierProduct/supplierProduct.service.interface";
import { IBrandingProduct } from "@/types/brandingProduct/brandingProduct.type";
import { SupplierProductRepository } from "@/repositories/supplierProduct/supplierProduct.repository";
import { HttpException } from "@/exceptions/HttpException";
import { logger } from "@/utils/logger";
import { PaginatedResponse, ProductFilters } from "@/interfaces/supplierProduct/supplierProduct.repository.interface";

@Service()
export class SupplierProductService implements ISupplierProductService {
  
  constructor(private repository: SupplierProductRepository) {}

  // UPDATED: Added pagination
  async getAllSupplierProducts(page: number = 1, limit: number = 50): Promise<{ products: IBrandingProduct[]; total: number; page: number; totalPages: number }> {
    try {
      // Validate pagination parameters
      if (page < 1) throw new HttpException(400, "Page must be greater than 0");
      if (limit < 1 || limit > 100) throw new HttpException(400, "Limit must be between 1 and 100");

      return await this.repository.getAllSupplierProducts(page, limit);
    } catch (error) {
      logger.error('Service Error - getAllSupplierProducts:', error);
      throw error;
    }
  }

  async getAllSupplierProductsWithFilters(filters: ProductFilters): Promise<PaginatedResponse> {
    try {
      // Validate pagination parameters
      if (filters.page && filters.page < 1) {
        throw new HttpException(400, "Page must be greater than 0");
      }
      if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
        throw new HttpException(400, "Limit must be between 1 and 100");
      }

      return await this.repository.getAllSupplierProductsWithFilters(filters);
    } catch (error) {
      logger.error('Service Error - getAllSupplierProductsWithFilters:', error);
      throw error;
    }
  }

  // UPDATED: Added pagination
  async searchSupplierProducts(query: string, page: number = 1, limit: number = 50): Promise<{ products: IBrandingProduct[]; total: number; page: number; totalPages: number }> {
    try {
      // Validate pagination parameters
      if (page < 1) throw new HttpException(400, "Page must be greater than 0");
      if (limit < 1 || limit > 100) throw new HttpException(400, "Limit must be between 1 and 100");

      return await this.repository.searchSupplierProducts(query, page, limit);
    } catch (error) {
      logger.error('Service Error - searchSupplierProducts:', error);
      throw error;
    }
  }

  // KEEP EXACTLY AS IS - NO CHANGES
  async getSupplierProductById(id: number): Promise<IBrandingProduct | null> {
    return await this.repository.getSupplierProductById(id);
  }

  // KEEP EXACTLY AS IS - NO CHANGES
  async getSupplierProductBySimpleCode(simpleCode: string): Promise<IBrandingProduct | null> {
    return await this.repository.getSupplierProductBySimpleCode(simpleCode);
  }

  // KEEP EXACTLY AS IS - NO CHANGES
  async getSupplierProductByFullCode(fullCode: string): Promise<IBrandingProduct | null> {
    return await this.repository.getSupplierProductByFullCode(fullCode);
  }

  // KEEP EXACTLY AS IS - NO CHANGES
  async createSupplierProduct(productData: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IBrandingProduct> {
    return await this.repository.createSupplierProduct(productData);
  }

  // KEEP EXACTLY AS IS - NO CHANGES
  async updateSupplierProduct(id: number, productData: Partial<IBrandingProduct>): Promise<IBrandingProduct> {
    return await this.repository.updateSupplierProduct(id, productData);
  }

  // KEEP EXACTLY AS IS - NO CHANGES
  async deleteSupplierProduct(id: number): Promise<boolean> {
    return await this.repository.deleteSupplierProduct(id);
  }

  // KEEP EXACTLY AS IS - NO CHANGES
  async getSupplierProductsBySupplier(supplier: string): Promise<IBrandingProduct[]> {
    return await this.repository.getSupplierProductsBySupplier(supplier);
  }

  // KEEP EXACTLY AS IS - NO CHANGES
  async bulkCreateSupplierProducts(products: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<IBrandingProduct[]> {
    return await this.repository.bulkCreateSupplierProducts(products);
  }
}
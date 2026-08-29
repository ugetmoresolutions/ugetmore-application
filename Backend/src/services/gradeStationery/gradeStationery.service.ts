// services/gradeStationery/gradeStationery.service.ts
import { Service, Inject } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { IGradeStationeryService, GRADE_STATIONERY_SERVICE_TOKEN } from "@/interfaces/gradeStationery/gradeStationery.service.interface";
import { 
    IGradeStationery, 
    ICreateGradeStationery, 
    IUpdateGradeStationery,
    IStationeryItem,
    IGradeStationeryResponse
} from "@/types/gradeStationery/gradeStationery.interface";
import { GradeStationeryRepository } from "@/repositories/gradeStationery/gradeStationery.repository";
import { GradeRepository } from "@/repositories/grade/grade.repository";
import { 
  IProductAggregationService, 
  PRODUCT_AGGREGATION_SERVICE_TOKEN,
  IAggregatedProduct 
} from "@/interfaces/aggregated-product/product/product-aggregation.service.interface";

// Simplified response interface
export interface IStationeryWithProductsResponse {
  stationery: IGradeStationeryResponse | null;
  products: IAggregatedProduct[]; // Products with minQuantity already attached
  gradeInfo: {
    gradeId: number;
    gradeName: string;
    schoolName: string;
  };
}

@Service({ id: GRADE_STATIONERY_SERVICE_TOKEN })
export class GradeStationeryService implements IGradeStationeryService {
  constructor(
     private readonly gradeStationeryRepository: GradeStationeryRepository,
     private readonly gradeRepository: GradeRepository,
     @Inject(PRODUCT_AGGREGATION_SERVICE_TOKEN)
     private readonly productAggregationService: IProductAggregationService
  ) {}

  // Helper method to transform response
  private transformStationeryResponse(stationery: IGradeStationery): IGradeStationeryResponse {
    return {
      id: stationery.id,
      gradeId: stationery.gradeId,
      stationeryItems: stationery.stationeryItems || [],
      fileUrl: stationery.fileUrl,
      totalItems: stationery.stationeryItems?.length || 0,
      createdAt: stationery.createdAt,
      updatedAt: stationery.updatedAt
    };
  }

  // UPDATED: Get stationery with products (no collections)
  public async getStationeryWithProducts(gradeId: number): Promise<IStationeryWithProductsResponse> {
    try {
      if (!gradeId || gradeId <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }

      // Get stationery data
      const stationery = await this.gradeStationeryRepository.getStationeryByGrade(gradeId);
      
      // Get grade info
      const grade = await this.gradeRepository.getGradeById(gradeId);
      if (!grade) {
        throw new HttpException(404, "Grade not found");
      }

      let products: IAggregatedProduct[] = [];

      if (stationery && stationery.stationeryItems.length > 0) {
        // Get product details with their minimum quantities from Parrot stationery
        products = await this.getStationeryProductsWithQuantities(stationery.stationeryItems);
      }

      return {
        stationery: stationery ? this.transformStationeryResponse(stationery) : null,
        products,
        gradeInfo: {
          gradeId: grade.id,
          gradeName: grade.gradeName,
          schoolName: "Unknown School"
        }
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get grade stationery with products: ${error.message}`);
    }
  }

  // UPDATED: Get stationery products with their minimum quantities from Parrot
  private async getStationeryProductsWithQuantities(stationeryItems: IStationeryItem[]): Promise<IAggregatedProduct[]> {
    if (!stationeryItems.length) return [];

    const products: IAggregatedProduct[] = [];
    const productCodes = stationeryItems.map(item => item.productCode);

    // Fetch products from Parrot stationery in batches
    for (let i = 0; i < productCodes.length; i += 10) {
      const batch = productCodes.slice(i, i + 10);
      
      for (const productCode of batch) {
        try {
          // Get product from Parrot stationery
          const product = await this.productAggregationService.getParrotProductByCode(productCode);
          if (product) {
            // Find the minimum quantity for this product
            const stationeryItem = stationeryItems.find(item => item.productCode === productCode);
            if (stationeryItem) {
              // Add minQuantity to the product object
              const productWithQuantity = {
                ...product,
                minQuantity: stationeryItem.minQuantity
              };
              products.push(productWithQuantity);
            }
          }
        } catch (error) {
          console.warn(`Product ${productCode} not found in Parrot stationery`);
          // Skip products not found in Parrot stationery
          continue;
        }
      }
    }

    return products;
  }

  // UPDATED: Search only Parrot stationery products
  public async searchStationeryProducts(
    gradeId: number,
    searchQuery: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ products: IAggregatedProduct[]; total: number }> {
    try {
      if (!gradeId || gradeId <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }

      // Get stationery to ensure we only search within stationery items
      const stationery = await this.gradeStationeryRepository.getStationeryByGrade(gradeId);
      if (!stationery || !stationery.stationeryItems.length) {
        return { products: [], total: 0 };
      }

      const stationeryProductCodes = stationery.stationeryItems.map(item => item.productCode);
      
      // Search Parrot stationery products
      const searchResponse = await this.productAggregationService.getParrotStationeryWithFilter({
        search: searchQuery,
        page,
        limit
      });

      // Filter results to only include products that are in the stationery list
      const filteredProducts = searchResponse.products.filter(product =>
        stationeryProductCodes.includes(product.fullCode)
      );

      // Add minimum quantities to the products
      const productsWithQuantities = filteredProducts.map(product => {
        const stationeryItem = stationery.stationeryItems.find(item => item.productCode === product.fullCode);
        return {
          ...product,
          minQuantity: stationeryItem?.minQuantity || 1
        };
      });

      return {
        products: productsWithQuantities,
        total: filteredProducts.length
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to search stationery products: ${error.message}`);
    }
  }

  // Rest of the existing methods remain exactly the same...
  public validateStationeryItems(items: IStationeryItem[]): void {
    if (!items || !Array.isArray(items)) {
      throw new HttpException(400, "Stationery items must be an array");
    }

    for (const item of items) {
      if (!item.productCode || item.productCode.trim().length === 0) {
        throw new HttpException(400, "Valid product code is required for all items");
      }
      if (typeof item.minQuantity !== 'number' || item.minQuantity < 0) {
        throw new HttpException(400, "Valid minimum quantity (≥ 0) is required for all items");
      }
      if (!Number.isInteger(item.minQuantity)) {
        throw new HttpException(400, "Minimum quantity must be an integer");
      }
    }

    const productCodes = items.map(item => item.productCode);
    const uniqueCodes = new Set(productCodes);
    if (uniqueCodes.size !== productCodes.length) {
      throw new HttpException(400, "Duplicate product codes are not allowed");
    }
  }

  public async getStationeryByGrade(gradeId: number): Promise<IGradeStationeryResponse | null> {
    try {
      if (!gradeId || gradeId <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }

      const stationery = await this.gradeStationeryRepository.getStationeryByGrade(gradeId);
      return stationery ? this.transformStationeryResponse(stationery) : null;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get grade stationery: ${error.message}`);
    }
  }

  public async getStationeryWithFile(gradeId: number): Promise<IGradeStationeryResponse | null> {
    try {
      if (!gradeId || gradeId <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }

      const stationery = await this.gradeStationeryRepository.getStationeryWithFile(gradeId);
      return stationery ? this.transformStationeryResponse(stationery) : null;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get grade stationery with file: ${error.message}`);
    }
  }

  public async createStationery(stationeryData: ICreateGradeStationery): Promise<IGradeStationeryResponse> {
    try {
      if (!stationeryData.gradeId || stationeryData.gradeId <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }

      this.validateStationeryItems(stationeryData.stationeryItems);

      const grade = await this.gradeRepository.getGradeById(stationeryData.gradeId);
      if (!grade) {
        throw new HttpException(404, "Grade not found");
      }

      const stationery = await this.gradeStationeryRepository.createStationery(stationeryData);
      return this.transformStationeryResponse(stationery);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to create stationery: ${error.message}`);
    }
  }

  public async updateStationery(id: number, stationeryData: IUpdateGradeStationery): Promise<IGradeStationeryResponse> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid stationery ID is required");
      }

      if (stationeryData.stationeryItems) {
        this.validateStationeryItems(stationeryData.stationeryItems);
      }

      const stationery = await this.gradeStationeryRepository.updateStationery(id, stationeryData);
      return this.transformStationeryResponse(stationery);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update stationery: ${error.message}`);
    }
  }

  public async updateStationeryByGrade(gradeId: number, stationeryData: IUpdateGradeStationery): Promise<IGradeStationeryResponse> {
    try {
      if (!gradeId || gradeId <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }

      if (stationeryData.stationeryItems) {
        this.validateStationeryItems(stationeryData.stationeryItems);
      }

      const stationery = await this.gradeStationeryRepository.updateStationeryByGrade(gradeId, stationeryData);
      return this.transformStationeryResponse(stationery);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update stationery: ${error.message}`);
    }
  }

  public async deleteStationery(id: number): Promise<boolean> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid stationery ID is required");
      }

      return await this.gradeStationeryRepository.deleteStationery(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to delete stationery: ${error.message}`);
    }
  }

  public async addItemsToStationery(gradeId: number, items: IStationeryItem[]): Promise<IGradeStationeryResponse> {
    try {
      if (!gradeId || gradeId <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }
      if (!items || items.length === 0) {
        throw new HttpException(400, "Stationery items are required");
      }

      this.validateStationeryItems(items);

      const grade = await this.gradeRepository.getGradeById(gradeId);
      if (!grade) {
        throw new HttpException(404, "Grade not found");
      }

      const stationery = await this.gradeStationeryRepository.addItemsToStationery(gradeId, items);
      return this.transformStationeryResponse(stationery);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to add items to stationery: ${error.message}`);
    }
  }

  public async updateItemQuantity(gradeId: number, productCode: string, minQuantity: number): Promise<IGradeStationeryResponse> {
    try {
      if (!gradeId || gradeId <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }
      if (!productCode || productCode.trim().length === 0) {
        throw new HttpException(400, "Valid product code is required");
      }
      if (typeof minQuantity !== 'number' || minQuantity < 0 || !Number.isInteger(minQuantity)) {
        throw new HttpException(400, "Valid minimum quantity (≥ 0 integer) is required");
      }

      const stationery = await this.gradeStationeryRepository.updateItemQuantity(gradeId, productCode, minQuantity);
      return this.transformStationeryResponse(stationery);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update item quantity: ${error.message}`);
    }
  }

  public async removeItemFromStationery(gradeId: number, productCode: string): Promise<IGradeStationeryResponse> {
    try {
      if (!gradeId || gradeId <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }
      if (!productCode || productCode.trim().length === 0) {
        throw new HttpException(400, "Valid product code is required");
      }

      const stationery = await this.gradeStationeryRepository.removeItemFromStationery(gradeId, productCode);
      return this.transformStationeryResponse(stationery);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to remove item from stationery: ${error.message}`);
    }
  }

  public async clearStationery(gradeId: number): Promise<boolean> {
    try {
      if (!gradeId || gradeId <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }

      return await this.gradeStationeryRepository.clearStationery(gradeId);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to clear stationery: ${error.message}`);
    }
  }

  public async updateFileUrl(gradeId: number, fileUrl: string | null): Promise<IGradeStationeryResponse> {
    try {
      if (!gradeId || gradeId <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }
      if (fileUrl && !this.isValidUrl(fileUrl)) {
        throw new HttpException(400, "Valid file URL is required");
      }

      const stationery = await this.gradeStationeryRepository.updateFileUrl(gradeId, fileUrl);
      return this.transformStationeryResponse(stationery);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update file URL: ${error.message}`);
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { BrandingProductRepository } from "@/repositories/brandingProduct/brandingProduct.repository";
import { IBrandingProduct } from "@/types/brandingProduct/brandingProduct.type";
import { BRANDING_PRODUCT_SERVICE_TOKEN, IBrandingProductService } from "@/interfaces/brandingProduct/brandingProduct.interface.service";

@Service({ id: BRANDING_PRODUCT_SERVICE_TOKEN })
export class BrandingProductService implements IBrandingProductService {
    constructor(
        private readonly brandingProductRepository: BrandingProductRepository
    ) { }

    public async getAllBrandingProducts(): Promise<IBrandingProduct[]> {
        try {
            return await this.brandingProductRepository.getAllBrandingProducts();
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get branding products: ${error.message}`);
        }
    }

    public async getBrandingProductById(id: number): Promise<IBrandingProduct | null> {
        try {
            if (!id || id <= 0) {
                throw new HttpException(400, "Valid branding product ID is required");
            }

            return await this.brandingProductRepository.getBrandingProductById(id);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get branding product: ${error.message}`);
        }
    }

    public async getBrandingProductBySimpleCode(simpleCode: string): Promise<IBrandingProduct | null> {
        try {
            if (!simpleCode || simpleCode.trim() === '') {
                throw new HttpException(400, "Simple code is required");
            }

            return await this.brandingProductRepository.getBrandingProductBySimpleCode(simpleCode);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get branding product by simple code: ${error.message}`);
        }
    }

    public async getBrandingProductByFullCode(fullCode: string): Promise<IBrandingProduct | null> {
        try {
            if (!fullCode || fullCode.trim() === '') {
                throw new HttpException(400, "Full code is required");
            }

            return await this.brandingProductRepository.getBrandingProductByFullCode(fullCode);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get branding product by full code: ${error.message}`);
        }
    }

    public async createBrandingProduct(brandingProductData: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IBrandingProduct> {
        try {
            this.validateBrandingProductData(brandingProductData);

            return await this.brandingProductRepository.createBrandingProduct(brandingProductData);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to create branding product: ${error.message}`);
        }
    }

    public async updateBrandingProduct(id: number, brandingProductData: Partial<IBrandingProduct>): Promise<IBrandingProduct> {
        try {
            if (!id || id <= 0) {
                throw new HttpException(400, "Valid branding product ID is required");
            }

            this.validateBrandingProductData(brandingProductData, true);

            return await this.brandingProductRepository.updateBrandingProduct(id, brandingProductData);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to update branding product: ${error.message}`);
        }
    }

    public async deleteBrandingProduct(id: number): Promise<boolean> {
        try {
            if (!id || id <= 0) {
                throw new HttpException(400, "Valid branding product ID is required");
            }

            return await this.brandingProductRepository.deleteBrandingProduct(id);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to delete branding product: ${error.message}`);
        }
    }

    public async searchBrandingProducts(query: string): Promise<IBrandingProduct[]> {
        try {
            if (!query || query.trim() === '') {
                throw new HttpException(400, "Search query is required");
            }

            return await this.brandingProductRepository.searchBrandingProducts(query);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to search branding products: ${error.message}`);
        }
    }

    public async getBrandingProductsByType(type: string): Promise<IBrandingProduct[]> {
        try {
            if (!type || type.trim() === '') {
                throw new HttpException(400, "Type is required");
            }

            return await this.brandingProductRepository.getBrandingProductsByType(type);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get branding products by type: ${error.message}`);
        }
    }

    public async getBrandingProductsByBrand(brandCode: string): Promise<IBrandingProduct[]> {
        try {
            if (!brandCode || brandCode.trim() === '') {
                throw new HttpException(400, "Brand code is required");
            }

            return await this.brandingProductRepository.getBrandingProductsByBrand(brandCode);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, `Failed to get branding products by brand: ${error.message}`);
        }
    }

    public validateBrandingProductData(brandingProductData: Partial<IBrandingProduct>, isUpdate: boolean = false): void {
        if (!isUpdate) {
            // Required fields for creation
            const requiredFields = [
                'actionType', 'simpleCode', 'fullCode', 'material', 'fit', 'feature',
                'productName', 'description', 'minimum', 'maximum', 'incrementedBy',
                'keywords', 'tags', 'inventoryType', 'behaviour', 'madeToOrder',
                'madeToOrderMessage', 'displayCountryOfOrigin', 'promotion',
                'fullBrandingGuide', 'type'
            ];

            for (const field of requiredFields) {
                if (brandingProductData[field as keyof IBrandingProduct] === undefined || 
                    brandingProductData[field as keyof IBrandingProduct] === null) {
                    throw new HttpException(400, `${field} is required`);
                }
            }
        }

        // Validate specific field types and constraints
        if (brandingProductData.actionType !== undefined && 
            (typeof brandingProductData.actionType !== 'number' || brandingProductData.actionType < 0)) {
            throw new HttpException(400, "Action type must be a non-negative number");
        }

        if (brandingProductData.minimum !== undefined && 
            (typeof brandingProductData.minimum !== 'number' || brandingProductData.minimum < 0)) {
            throw new HttpException(400, "Minimum must be a non-negative number");
        }

        if (brandingProductData.maximum !== undefined && 
            (typeof brandingProductData.maximum !== 'number' || brandingProductData.maximum < 0)) {
            throw new HttpException(400, "Maximum must be a non-negative number");
        }

        if (brandingProductData.incrementedBy !== undefined && 
            (typeof brandingProductData.incrementedBy !== 'number' || brandingProductData.incrementedBy <= 0)) {
            throw new HttpException(400, "Incremented by must be a positive number");
        }

        if (brandingProductData.simpleCode !== undefined && 
            (!brandingProductData.simpleCode || brandingProductData.simpleCode.trim() === '')) {
            throw new HttpException(400, "Simple code cannot be empty");
        }

        if (brandingProductData.fullCode !== undefined && 
            (!brandingProductData.fullCode || brandingProductData.fullCode.trim() === '')) {
            throw new HttpException(400, "Full code cannot be empty");
        }

        if (brandingProductData.productName !== undefined && 
            (!brandingProductData.productName || brandingProductData.productName.trim() === '')) {
            throw new HttpException(400, "Product name cannot be empty");
        }
    }
}
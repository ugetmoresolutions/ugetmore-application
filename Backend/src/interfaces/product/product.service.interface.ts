// interfaces/product/IProductService.interface.ts
import { IProduct, ICreateProduct, ProductStatus } from "@/types/product/products.type";
import { Token } from "typedi";

export interface IProductService {
    createProduct(productData: ICreateProduct): Promise<IProduct>;
    getProductById(productId: number): Promise<IProduct | null>;
    updateProduct(productId: number, updateData: Partial<IProduct>): Promise<IProduct | null>;
    deleteProduct(productId: number): Promise<boolean>;
    getAllProducts(options?: {
        page?: number;
        pageSize?: number;
        category?: string;
        status?: ProductStatus;
    }): Promise<{ products: IProduct[]; totalCount: number; totalPages: number }>;
    getProductsByCategory(category: string): Promise<IProduct[]>;
    searchProducts(query: string): Promise<IProduct[]>;
    updateProductStatus(productId: number, status: ProductStatus): Promise<IProduct | null>;
}

export const PRODUCT_SERVICE_TOKEN = new Token<IProductService>("IProductService");
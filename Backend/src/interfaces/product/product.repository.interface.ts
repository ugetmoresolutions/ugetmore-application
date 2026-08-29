// interfaces/product/IProductRepository.interface.ts
import { IProduct, ICreateProduct, ProductStatus } from "@/types/product/products.type";

export interface IProductRepository {
    createProduct(productData: ICreateProduct): Promise<IProduct>;
    getProductById(productId: number): Promise<IProduct | null>;
    updateProduct(productId: number, updateData: Partial<IProduct>): Promise<IProduct | null>;
    deleteProduct(productId: number): Promise<boolean>;
    getAllProducts(options?: {
        page?: number;
        pageSize?: number;
        category?: string;
        status?: ProductStatus;
    }): Promise<{ products: IProduct[]; totalCount: number }>;
    findByTitle(title: string): Promise<IProduct | null>;
    findBySku(sku: string): Promise<IProduct | null>;
    findByCategory(category: string): Promise<IProduct[]>;
    searchProducts(query: string): Promise<IProduct[]>;
}
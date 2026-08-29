import { IFurnitureProduct, ICreateFurnitureProduct, FurnitureProductStatus } from "@/types/furniture/furniture.type";

export interface IFurnitureRepository {
    createFurnitureProduct(productData: ICreateFurnitureProduct): Promise<IFurnitureProduct>;
    getFurnitureProductById(productId: number): Promise<IFurnitureProduct | null>;
    updateFurnitureProduct(productId: number, updateData: Partial<IFurnitureProduct>): Promise<IFurnitureProduct | null>;
    deleteFurnitureProduct(productId: number): Promise<boolean>;
    getAllFurnitureProducts(options?: {
        page?: number;
        pageSize?: number;
        category?: string;
        status?: FurnitureProductStatus;
    }): Promise<{ products: IFurnitureProduct[]; totalCount: number }>;
    findByTitle(title: string): Promise<IFurnitureProduct | null>;
    findBySku(sku: string): Promise<IFurnitureProduct | null>;
    findByCategory(category: string): Promise<IFurnitureProduct[]>;
    searchFurnitureProducts(query: string): Promise<IFurnitureProduct[]>;
    findByBrand(brand: string): Promise<IFurnitureProduct[]>;
}
import { IFurnitureProduct, ICreateFurnitureProduct, FurnitureProductStatus } from "@/types/furniture/furniture.type";
import { Token } from "typedi";

export interface IFurnitureService {
    createFurnitureProduct(productData: ICreateFurnitureProduct): Promise<IFurnitureProduct>;
    getFurnitureProductById(productId: number): Promise<IFurnitureProduct | null>;
    updateFurnitureProduct(productId: number, updateData: Partial<IFurnitureProduct>): Promise<IFurnitureProduct | null>;
    deleteFurnitureProduct(productId: number): Promise<boolean>;
    getAllFurnitureProducts(options?: {
        page?: number;
        pageSize?: number;
        category?: string;
        status?: FurnitureProductStatus;
    }): Promise<{ products: IFurnitureProduct[]; totalCount: number; totalPages: number }>;
    getFurnitureProductsByCategory(category: string): Promise<IFurnitureProduct[]>;
    searchFurnitureProducts(query: string): Promise<IFurnitureProduct[]>;
    updateFurnitureProductStatus(productId: number, status: FurnitureProductStatus): Promise<IFurnitureProduct | null>;
    getFurnitureProductsByBrand(brand: string): Promise<IFurnitureProduct[]>;
}

export const FURNITURE_SERVICE_TOKEN = new Token<IFurnitureService>("IFurnitureService");
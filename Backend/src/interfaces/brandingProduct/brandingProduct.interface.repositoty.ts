import { IBrandingProduct } from "@/types/brandingProduct/brandingProduct.type";

export interface IBrandingProductRepository {
  getAllBrandingProducts(): Promise<IBrandingProduct[]>;
  getBrandingProductById(id: number): Promise<IBrandingProduct | null>;
  getBrandingProductBySimpleCode(simpleCode: string): Promise<IBrandingProduct | null>;
  getBrandingProductByFullCode(fullCode: string): Promise<IBrandingProduct | null>;
  createBrandingProduct(brandingProductData: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IBrandingProduct>;
  updateBrandingProduct(id: number, brandingProductData: Partial<IBrandingProduct>): Promise<IBrandingProduct>;
  deleteBrandingProduct(id: number): Promise<boolean>;
  searchBrandingProducts(query: string): Promise<IBrandingProduct[]>;
  getBrandingProductsByType(type: string): Promise<IBrandingProduct[]>;
  getBrandingProductsByBrand(brandCode: string): Promise<IBrandingProduct[]>;
}
import { IBrandingProduct } from "@/types/brandingProduct/brandingProduct.type";
import { Token } from "typedi";
import { PaginatedResponse, ProductFilters } from "./supplierProduct.repository.interface";

export interface ISupplierProductService {
  // UPDATED METHODS - With pagination
  getAllSupplierProducts(page?: number, limit?: number): Promise<{ products: IBrandingProduct[]; total: number; page: number; totalPages: number }>;
  searchSupplierProducts(query: string, page?: number, limit?: number): Promise<{ products: IBrandingProduct[]; total: number; page: number; totalPages: number }>;
  getAllSupplierProductsWithFilters(filters: ProductFilters): Promise<PaginatedResponse>;
  // UNCHANGED METHODS
  getSupplierProductById(id: number): Promise<IBrandingProduct | null>;
  getSupplierProductBySimpleCode(simpleCode: string): Promise<IBrandingProduct | null>;
  getSupplierProductByFullCode(fullCode: string): Promise<IBrandingProduct | null>;
  createSupplierProduct(productData: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<IBrandingProduct>;
  updateSupplierProduct(id: number, productData: Partial<IBrandingProduct>): Promise<IBrandingProduct>;
  deleteSupplierProduct(id: number): Promise<boolean>;
  getSupplierProductsBySupplier(supplier: string): Promise<IBrandingProduct[]>;
  bulkCreateSupplierProducts(products: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<IBrandingProduct[]>;
}

export const SUPPLIER_PRODUCT_SERVICE_TOKEN = new Token<ISupplierProductService>("ISupplierProductService");
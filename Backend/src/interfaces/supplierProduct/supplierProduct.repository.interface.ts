import { IBrandingProduct } from "@/types/brandingProduct/brandingProduct.type";


export interface ProductFilters {
  search?: string;
  category?: string;
  subCategory?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface PaginatedResponse {
  products: any[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters?: ProductFilters;
  searchQuery?: string; // Add this missing property
//   categoryType?: "janitorial" | "stationery" | "electronics" | "display-solutions"
}

export interface SidebarCategory {
  name: string;
  subCategories: string[] | null;
}

export interface ICategory {
  id: number;
  categoryName: string;
  categoryPath?: string;
  children?: ICategory[];
}


export interface ISupplierProductRepository {
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
// types/products/product.interface.ts
export interface IImageUrl {
  url: string;
  publicId: string;
}

export interface IColorImage {
  name: string;        // e.g., "Black"
  code: string;        // e.g., "BL" 
  images: IImageUrl[]; // Array of image URLs with publicIds
}

export interface IProduct {
  id: number; // <-- keep it as number for DB, safer
  title: string;
  description: string;
  price: number
  sku: string;

  mainImages: IImageUrl[];
  colorImages: IColorImage[];
  sizes: string[];

  minQuantity: number;
  maxQuantity: number;
  stockQuantity: number;

  categories: string[];
  subCategories: string[];

  supplierName: string;
  supplierAccount: string;

  status: ProductStatus; // <-- use enum instead of plain string

  createdAt: Date;
  updatedAt: Date;
}


// For creating new products
export interface ICreateProduct {
  title: string;
  description: string;
  sku: string;
  mainImages: IImageUrl[];
  colorImages?: IColorImage[];
  sizes?: string[];
  minQuantity: number;
  maxQuantity: number;
  stockQuantity: number;
  categories: string[];
  subCategories: string[];
  supplierName: string;
  supplierAccount: string;
  status: string;
}

// Status enum
export enum ProductStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DRAFT = 'Draft'
}
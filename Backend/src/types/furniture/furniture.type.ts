export interface IImageUrl {
  url: string;
  publicId: string;
}

export interface IColorImage {
  name: string;        // e.g., "Black"
  code: string;        // e.g., "BL" 
  images: IImageUrl[]; // Array of image URLs with publicIds
}

export interface IFurnitureProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  sku: string;
  brand: string; // ✅ Added brand field

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

  status: FurnitureProductStatus;

  // ✅ Furniture specific fields
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  material?: string;
  weight?: number;
  weightUnit?: string;
  assemblyRequired?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// For creating new furniture products
export interface ICreateFurnitureProduct {
  title: string;
  description: string;
  sku: string;
  price: number;
  brand: string; // ✅ Added brand field
  
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

  // ✅ Furniture specific fields
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  material?: string;
  weight?: number;
  weightUnit?: string;
  assemblyRequired?: boolean;
}

// Status enum
export enum FurnitureProductStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DRAFT = 'Draft'
}
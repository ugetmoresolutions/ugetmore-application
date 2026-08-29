export interface IImageUrl {
  url: string;
  publicId: string;
}

export interface IColorImage {
  name: string;
  code: string;
  images: IImageUrl[];
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

  // Furniture specific fields
  dimensions?: {
    length: string ;
    width: string;
    height: string;
    unit: string;
  };
  material?: string;
  weight?: number;
  weightUnit?: string;
  assemblyRequired?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

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

  // Furniture specific fields
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

export enum FurnitureProductStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DRAFT = 'Draft'
}
// dots/product/product.dtos.ts
import { IsString, IsArray, IsNumber, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { IImageUrl, IColorImage, ProductStatus } from '@/types/product/products.type';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsArray()
  @IsNotEmpty()
  mainImages: IImageUrl[];

  @IsArray()
  @IsOptional()
  colorImages?: IColorImage[];

  @IsArray()
  @IsOptional()
  sizes?: string[];

  @IsNumber()
  @IsNotEmpty()
  minQuantity: number;

  @IsNumber()
  @IsNotEmpty()
  maxQuantity: number;

  @IsNumber()
  @IsNotEmpty()
  stockQuantity: number;

  @IsArray()
  @IsNotEmpty()
  categories: string[];

  @IsArray()
  @IsNotEmpty()
  subCategories: string[];

  @IsString()
  @IsNotEmpty()
  supplierName: string;

  @IsString()
  @IsNotEmpty()
  supplierAccount: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsArray()
  @IsOptional()
  mainImages?: IImageUrl[];

  @IsArray()
  @IsOptional()
  colorImages?: IColorImage[];

  @IsArray()
  @IsOptional()
  sizes?: string[];

  @IsNumber()
  @IsOptional()
  minQuantity?: number;

  @IsNumber()
  @IsOptional()
  maxQuantity?: number;

  @IsNumber()
  @IsOptional()
  stockQuantity?: number;

  @IsArray()
  @IsOptional()
  categories?: string[];

  @IsArray()
  @IsOptional()
  subCategories?: string[];

  @IsString()
  @IsOptional()
  supplierName?: string;

  @IsString()
  @IsOptional()
  supplierAccount?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}

export class UpdateProductStatusDto {
  @IsEnum(ProductStatus)
  @IsNotEmpty()
  status: ProductStatus;
}
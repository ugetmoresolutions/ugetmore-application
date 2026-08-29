import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsPositive, 
  IsArray, 
  ValidateNested, 
  IsOptional, 
  Min, 
  IsDateString,
  IsObject
} from "class-validator";
import { Type } from "class-transformer";
import { IProduct } from "@/types/product/product.types";

export class CreateCartItemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public id?: string;

  @IsNotEmpty()
  @IsObject()
  public product: IProduct;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  public quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  public price: number;

  @IsOptional()
  @IsDateString()
  public addedAt?: string;
}

export class UpdateCartItemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public id?: string;

  @IsOptional()
  @IsObject()
  public product?: IProduct;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public price?: number;

  @IsOptional()
  @IsDateString()
  public addedAt?: string;
}

export class UpdateCartDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCartItemDto)
  public items?: UpdateCartItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  public totalPrice?: number;
}

export class UpdateQuantityDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  public quantity: number;
}

export class UpdatePriceDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  public price: number;
}
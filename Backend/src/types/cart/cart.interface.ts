// types/cart/cart.interface.ts
import { Request } from "express";
import { BrandingSetup } from "../branding/branding";
import { IProduct } from "../product/product.types";
import { IBrandedArtwork, IDesignCommunication } from "../order/order.types";

export interface IUserCart {
  id: number;
  userId: number;
  items: ICartItem[];
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICartItem {
  id: string;
  product?: IProduct;
  quantity: number;
  price: number;
  addedAt: string;
  brandingConfigs?: BrandingSetup;
  isBranded?: boolean; // Add this
  brandedArtWorks?: IBrandedArtwork[]; // Add this
  designCommunications?: IDesignCommunication[]; 
  // ADD THESE for bulk stationery detection
  isBulk?: boolean;
  collectionName?: string;
  collectionId?: string;
  schoolInfo?: {
    schoolId: number;
    schoolName: string;
    schoolCode: string;
  };
  studentInfo?: {
    studentNumber: string;
    studentName: string;
    grade: string;
  };
  bulkProducts?: any[];
  bulkTotalPrice?: number;
  bulkTotalItems?: number;// Add this
}

export type IFIleURL = {
  url: string;
  publicId: string;
}

export interface RequestWithFile extends Request {
  file: Express.Multer.File;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: number;
  quantity: number;
}

export interface CartResponse {
  cart: IUserCart;
  itemCount: number;
  totalPrice: number;
}

export interface CartValidationResponse {
  isValid: boolean;
  invalidItems: string[];
  updatedCart?: IUserCart;
  message?: string;
}
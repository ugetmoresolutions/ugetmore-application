// interfaces/gradeStationery/gradeStationery.service.interface.ts
import { 
    IGradeStationery, 
    ICreateGradeStationery, 
    IUpdateGradeStationery,
    IStationeryItem,
    IGradeStationeryResponse
} from "@/types/gradeStationery/gradeStationery.interface";
import { IAggregatedProduct } from "@/interfaces/aggregated-product/product/product-aggregation.service.interface";
import { Token } from "typedi";

// Simplified response interface
export interface IStationeryWithProductsResponse {
  stationery: IGradeStationeryResponse | null;
  products: IAggregatedProduct[]; // Products with minQuantity already attached
  gradeInfo: {
    gradeId: number;
    gradeName: string;
    schoolName: string;
  };
}

export interface IGradeStationeryService {
  // Existing methods
  getStationeryByGrade(gradeId: number): Promise<IGradeStationeryResponse | null>;
  getStationeryWithFile(gradeId: number): Promise<IGradeStationeryResponse | null>;
  createStationery(stationeryData: ICreateGradeStationery): Promise<IGradeStationeryResponse>;
  updateStationery(id: number, stationeryData: IUpdateGradeStationery): Promise<IGradeStationeryResponse>;
  updateStationeryByGrade(gradeId: number, stationeryData: IUpdateGradeStationery): Promise<IGradeStationeryResponse>;
  deleteStationery(id: number): Promise<boolean>;
  addItemsToStationery(gradeId: number, items: IStationeryItem[]): Promise<IGradeStationeryResponse>;
  updateItemQuantity(gradeId: number, productCode: string, minQuantity: number): Promise<IGradeStationeryResponse>;
  removeItemFromStationery(gradeId: number, productCode: string): Promise<IGradeStationeryResponse>;
  clearStationery(gradeId: number): Promise<boolean>;
  updateFileUrl(gradeId: number, fileUrl: string | null): Promise<IGradeStationeryResponse>;
  validateStationeryItems(items: IStationeryItem[]): void;

  // UPDATED METHODS - No collections, just products with quantities
  getStationeryWithProducts(gradeId: number): Promise<IStationeryWithProductsResponse>;
  searchStationeryProducts(gradeId: number, searchQuery: string, page?: number, limit?: number): Promise<{ products: IAggregatedProduct[]; total: number }>;
}

export const GRADE_STATIONERY_SERVICE_TOKEN = new Token<IGradeStationeryService>("IGradeStationeryService");
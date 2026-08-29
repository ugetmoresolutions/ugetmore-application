// types/gradeStationery/gradeStationery.interface.ts

// Individual stationery item with product code and minimum quantity
export interface IStationeryItem {
    productCode: string; // e.g., "DFR-BLK-06", "DGD-F-4"
    minQuantity: number; // Minimum quantity required
}

// Main interface
export interface IGradeStationery {
    id: number;
    gradeId: number;
    stationeryItems: IStationeryItem[];
    fileUrl: string | null;
    createdAt?: Date; // Changed from optional to required
    updatedAt?: Date; // Changed from optional to required
}

// For creating - omit auto-generated fields
export interface ICreateGradeStationery extends Omit<IGradeStationery, 'id' | 'createdAt' | 'updatedAt'> {}

// For updating
export interface IUpdateGradeStationery {
    stationeryItems?: IStationeryItem[];
    fileUrl?: string | null;
}

// Response interface for frontend
export interface IGradeStationeryResponse {
    id: number;
    gradeId: number;
    stationeryItems: IStationeryItem[];
    fileUrl: string | null;
    totalItems: number;
    createdAt: Date; // Required
    updatedAt: Date; // Required
}
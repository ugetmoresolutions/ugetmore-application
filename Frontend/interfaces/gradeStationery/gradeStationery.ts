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

// Keep your Parrot product interfaces for when you fetch product details
export interface IParrotProduct {
    IsServiceItem: boolean;
    IsSpecialProduct: boolean;
    Brand: string;
    HasVariationParent: boolean;
    HasVariationChild: boolean;
    IsDiscountable: boolean;
    ProductDimensions: {
        Length: number;
        Height: number;
        Width: number;
        DimensionUnit: string;
        Mass: number;
        MassUnit: string;
    };
    TariffCode: string;
    TariffDescription: string;
    RetailPriceIncTax: number;
    CustomerDiscount: number;
    FriendlyTitle: string;
    MetaTitle: string;
    MetaDescription: string;
    MetaKeywords: string;
    StockCode: string;
    CustomerPrice: number;
    CustomerTaxAmount: number;
    CustomerPriceWithTax: number;
    Description: string;
    ProductBarCode: string;
    DetailedDescription: string;
    RetailPrice: number;
    ProductImageLinks: string[];
    WarehouseStockLevels: Array<{
        Amount: number;
        SecondHandStockOnly: boolean;
        WarehouseCode: string | null;
        WarehouseDescription: string;
    }>;
    TotalWarehouseStock: number;
    PublishingCategory: {
        CategoryName: string;
    };
}

export interface IParrotProductResponse {
    Products: IParrotProduct[];
}

// Optional: Create a combined interface for frontend display
export interface IGradeStationeryWithProducts extends IGradeStationery {
    stationeryItemsWithDetails?: IParrotProduct[]; // This will be populated on frontend
}
import { BrandingSetup } from "../branding/branding";
import { IProductCouponValidation } from "../coupon/coupon";
import { IProduct } from "../product/product";

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
  quantity?: number;
  price: number;
  brandingConfigs?: BrandingSetup;
  addedAt: string;
  isBulk?: boolean; // NEW: Add isBulk property
  collectionName?: string; // NEW: For bulk items
  collectionId?: string; // NEW: For bulk items
  bulkProducts?: IProductWithQuantity[]; // NEW: For bulk items
  bulkTotalPrice?: number; // NEW: For bulk items
  bulkTotalItems?: number; // NEW: For bulk items
  studentInfo?: StudentInfo; // NEW: For bulk items
  schoolInfo?: SchoolInfo; // NEW: For bulk items
  productId?: number;
  unitPrice?: number;

  // ADD THIS: Selected variant information
  selectedVariant?: {
    colorCode: string;
    colorName: string;
    sizeCode?: string;
    sizeName?: string;
    variantIndex: number;
    imageUrl?: string;
  };

  
}

// NEW: Add missing interfaces for bulk items
export interface IProductWithQuantity extends IProduct {
  quantity: number;
  isInStock: boolean;
}

export interface StudentInfo {
  studentNumber: string;
  studentName: string;
  grade: string;
}

export interface SchoolInfo {
  schoolId: number;
  schoolName: string;
  schoolCode: string;
}

export interface IAddCartItem {
  userId: number;
  item: ICartItem;
}

export interface IRemoveCartItem {
  userId: number;
  itemId: string;
}

export interface IUpdateItemQuantity {
  userId: number;
  itemId: string;
  quantity: number;
}

// Updated CartItemDisplay interface to match the new structure
export interface CartItemDisplay {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  quantity: number;
  sku: string;
  deliveryDate: string;
  image: string | null;
  isBranded: boolean;
  isBulk?: boolean; // NEW: Add isBulk property
  schoolInfo?: SchoolInfo; // NEW: Add schoolInfo property
  bulkProducts?: IProductWithQuantity[]; // NEW: Add bulkProducts property
  brandingConfigs?: BrandingSetup; // NEW: Add brandingConfigs property
  brandingPositions: number;
  totalBrandingCost: number;
  minimum?: number;
  productId?: string;
  supplier?:string

  // ADD THIS: Selected variant information
  selectedVariant?: {
    colorCode: string;
    colorName: string;
    sizeCode?: string;
    sizeName?: string;
    variantIndex: number;
    imageUrl?: string;
  };
}

export interface CartState {
  items: CartItemDisplay[];
  couponCode: string;
  appliedCoupon: string;
  shippingMethod: "shipping" | "pickup";
  isApplyingCoupon: boolean;
  isCheckingOut: boolean;
  isLoading: boolean;
  discount: number;
  error: string;

  // NEW: Product coupon specific fields
  applicableProducts: IProductCouponValidation[];
  couponType: "school" | "general" | "user" | "product" | "category" | null;
  couponData?: any; // Store full coupon data
  categoryBreakdown?: {
    // ADD THIS for category breakdown
    category: string;
    itemCount: number;
    totalAmount: number;
  }[];
  applicableItems?: any[];
  backendCalculation?: any; 
}

export interface CartTotals {
  itemTotal: number;
  discount: number;
  shippingCost: number;
  savings: number;
  grandTotal: number;
}

// NEW: Complete IBulkCartItem interface
export interface IBulkCartItem extends ICartItem {
  isBulk: true;
  collectionName: string;
  collectionId: string;
  bulkProducts: IProductWithQuantity[];
  bulkTotalPrice: number;
  bulkTotalItems: number;
  studentInfo?: StudentInfo;
  schoolInfo?: SchoolInfo;
}

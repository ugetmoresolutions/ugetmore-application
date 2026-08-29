import { ICartItem } from "../cart/cart.interface";
import { IProduct } from "../product/product.types";

export interface ICoupon {
    id: number;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minimumCartAmount: number;
    maximumDiscount: number | null;
    validFrom: Date;
    validTo: Date;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
    couponType: 'school' | 'general' | 'user' | 'product' | 'category'; // ADDED 'category';
    applicableSchoolId: number | null;
    applicableUserId: number | null;
    applicableProductIds: string[] | null; // CHANGED: number[] -> string[]
    applicableCategories: string[] | null; // NEW: For category-based coupons
    isSingleUse: boolean;
    usedBy: number[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICreateCoupon {
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minimumCartAmount?: number;
    maximumDiscount?: number | null;
    validFrom: Date;
    validTo: Date;
    usageLimit?: number | null;
    couponType: 'school' | 'general' | 'user' | 'product' | 'category'; // ADDED 'category';
    applicableSchoolId?: number | null;
    applicableUserId?: number | null;
    applicableProductIds?: string[] | null; // CHANGED: number[] -> string[]
    applicableCategories?: string[] | null; // NEW: For category-based coupons
    isSingleUse?: boolean;
    isActive?: boolean;
}

export interface IUpdateCoupon {
    code?: string;
    description?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    minimumCartAmount?: number;
    maximumDiscount?: number | null;
    validFrom?: Date;
    validTo?: Date;
    usageLimit?: number | null;
    isActive?: boolean;
    couponType?: 'school' | 'general' | 'user' | 'product' | 'category'; // ADDED 'category';
    applicableSchoolId?: number | null;
    applicableUserId?: number | null;
    applicableProductIds?: string[] | null; // CHANGED: number[] -> string[]
    applicableCategories?: string[] | null;
    isSingleUse?: boolean;
}

export interface IProductCouponValidation {
    productId: string; // CHANGED: number -> string
    quantity: number;
    unitPrice: number;
}

export interface IApplyProductCouponRequest {
    code: string;
    userId: number;
    schoolId?: number | null;
    products: IProductCouponValidation[];
    
}

export interface IApplyProductCouponResponse {
    isValid: boolean;
    discountAmount: number;
    finalAmount: number;
    message: string;
    applicableProducts: IProductCouponValidation[];
    originalTotal: number;
    discountedTotal: number;
    coupon?: ICoupon | null;
    totalApplicableAmount?: number; 
}


// types/coupon/coupon.type.ts - UPDATE interfaces

// EXTEND your existing ICartItem for coupon purposes
export interface ICartItemForCoupon {
  id: string;
  product: IProduct; // Your existing product interface
  quantity: number;
  price: number;
  supplier: string; // 'amrod', 'parrot', 'tarsus' - from your aggregated products
  addedAt: string;
  brandingConfigs?: any;
  isBranded?: boolean;
  brandedArtWorks?: any[];
  designCommunications?: any[];
}

// UPDATE the category coupon request to use your cart structure
export interface IApplyCategoryCouponRequest {
  code: string;
  userId: number;
  schoolId?: number | null;
  cartItems: ICartItemForCoupon[]; // Use your cart items
}

// UPDATE the response interface
export interface IApplyCategoryCouponResponse {
  isValid: boolean;
  discountAmount: number;
  finalAmount: number;
  message: string;
  applicableItems: ICartItemForCoupon[];
  originalTotal: number;
  discountedTotal: number;
  coupon?: ICoupon | null;
  categoryBreakdown?: { // ADDED: Show which categories were matched
    category: string;
    itemCount: number;
    totalAmount: number;
  }[];
  totalApplicableAmount?: number;
}

// NEW: Category coupon validation request
export interface IApplyCategoryCouponRequest {
    code: string;
    userId: number;
    schoolId?: number | null;
    cartItems: ICartItemForCoupon[];
}

// NEW: Category coupon response
export interface IApplyCategoryCouponResponse {
    isValid: boolean;
    discountAmount: number;
    finalAmount: number;
    message: string;
    applicableItems: ICartItemForCoupon[];
    originalTotal: number;
    discountedTotal: number;
    coupon?: ICoupon | null;
}


//CALCULATING ON BACKEND

export interface IAppliedCoupon {
  code: string;
  couponType: 'school' | 'general' | 'user' | 'product' | 'category';
  discountAmount: number;
}

export interface ICartTotalWithCoupons {
  subtotal: number;          // Original cart total
  discountAmount: number;    // Total discount from coupons
  shippingAmount: number;    // R180 or 0 if over R2000
  vatAmount: number;         // 15% of (subtotal - discount)
  finalTotal: number;        // subtotal - discount + shipping + vat
  appliedCoupons: IAppliedCoupon[];
  couponData?: { // ADD THIS
    id: number;
    code: string;
    couponType: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maximumDiscount: number | null;
    minimumCartAmount: number;
    applicableItems?: any[]; // ADD THIS - show which items were discounted
    totalApplicableAmount?: number; 
  };
}

export interface IApplyCouponToCartRequest {
  userId: number;
  couponCode: string;
  schoolId?: number | null;
}



export interface IApplySchoolCouponRequest {
  code: string;
  userId: number;
  schoolId: number;
  cartAmount: number;
  cartItems?: any[]; // ADD THIS - make it optional
}



export interface IApplySchoolCouponResponse {
  isValid: boolean;
  discountAmount: number;
  finalAmount: number;
  message: string;
  coupon: ICoupon | null;
  totalApplicableAmount?: number; // Add this line
}
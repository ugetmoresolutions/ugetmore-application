

export interface IProductCouponValidation {
    productId: string;
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
}

// Product interface for coupon selection
export interface IProduct {
    id: number;
    simpleCode: string;
    fullCode: string;
    productName: string;
    description: string;
    price: number;
    supplier: string;
    categories: Array<{
        id: number;
        name: string;
        path: string;
        code: string;
        image: string;
    }>;
    brand: {
        name: string | null;
        brandWebsiteLogo: string;
        code: string;
    } | null;
    images: Array<{
        name: string;
        isDefault: boolean;
        urls: Array<{
            url: string;
            width: number;
            height: number;
        }>;
        hasLogo: boolean;
        angle: string | null;
        type: string;
    }>;
    stockInfo: {
        stock: number;
        reservedStock: number;
        stockType: number;
    };
    isAvailable: boolean;
}



export interface ICoupon {
    id: number;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minimumCartAmount: number;
    maximumDiscount: number | null;
    validFrom: string;
    validTo: string;
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
    createdAt?: string;
    upstringdAt?: string;
}

export interface ICreateCoupon {
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minimumCartAmount?: number;
    maximumDiscount?: number | null;
    validFrom: string;
    validTo: string;
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
    validFrom?: string;
    validTo?: string;
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
}


// types/coupon/coupon.type.ts - UPstring interfaces

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

// UPstring the category coupon request to use your cart structure
export interface IApplyCategoryCouponRequest {
  code: string;
  userId: number;
  schoolId?: number | null;
  cartItems: ICartItemForCoupon[]; // Use your cart items
}

// UPstring the response interface
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
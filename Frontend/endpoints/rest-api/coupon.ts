// endpoints/rest-api/coupon.ts
import { CustomResponse } from "@/interfaces/product/response";
import { DELETE, GET, POST, PUT } from "../lib/rest-api-client";
import { baseUrl } from "../url";
import { IApplyCategoryCouponRequest, IApplyCategoryCouponResponse, IApplyProductCouponRequest, IApplyProductCouponResponse, ICoupon, ICreateCoupon, IUpdateCoupon } from "@/interfaces/coupon/coupon";

const CouponBaseURL = `${baseUrl}/coupons`;

export const COUPON_API = {
  // GET all coupons
  GET_ALL_COUPONS: async (): Promise<CustomResponse<ICoupon[]>> => {
    try {
      const response = await GET(`${CouponBaseURL}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET active coupons
  GET_ACTIVE_COUPONS: async (): Promise<CustomResponse<ICoupon[]>> => {
    try {
      const response = await GET(`${CouponBaseURL}/active`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET general coupons
  GET_GENERAL_COUPONS: async (): Promise<CustomResponse<ICoupon[]>> => {
    try {
      const response = await GET(`${CouponBaseURL}/general`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET coupon by ID
  GET_COUPON_BY_ID: async (couponId: number): Promise<CustomResponse<ICoupon>> => {
    try {
      const response = await GET(`${CouponBaseURL}/${couponId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET coupons by school
  GET_COUPONS_BY_SCHOOL: async (schoolId: number): Promise<CustomResponse<ICoupon[]>> => {
    try {
      const response = await GET(`${CouponBaseURL}/school/${schoolId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE new coupon
  CREATE_COUPON: async (couponData: ICreateCoupon): Promise<CustomResponse<ICoupon>> => {
    try {
      const response = await POST(`${CouponBaseURL}`, couponData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE coupon
  UPDATE_COUPON: async (couponId: number, updateData: IUpdateCoupon): Promise<CustomResponse<ICoupon>> => {
    try {
      const response = await PUT(`${CouponBaseURL}/${couponId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE coupon
  DELETE_COUPON: async (couponId: number): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${CouponBaseURL}/${couponId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // VALIDATE coupon
  VALIDATE_COUPON: async (code: string, schoolId: number | null, userId: number): Promise<CustomResponse<{ isValid: boolean; coupon: ICoupon | null; message: string }>> => {
    try {
      const response = await POST(`${CouponBaseURL}/validate`, { code, schoolId, userId });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET coupons by user
  GET_COUPONS_BY_USER: async (userId: number): Promise<CustomResponse<ICoupon[]>> => {
    try {
      const response = await GET(`${CouponBaseURL}/user/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },


   APPLY_COUPON: async (
    code: string, 
    userId: number, 
    cartAmount: number,
    schoolId?: number | null // NEW: Add optional schoolId parameter for stationery coupons
  ): Promise<CustomResponse<{ 
    isValid: boolean; 
    discountAmount: number; 
    finalAmount: number; 
    message: string;
    coupon?: any;
  }>> => {
    try {
      const response = await POST(`${CouponBaseURL}/apply`, { 
        code, 
        schoolId: schoolId || null, // Pass schoolId (could be null for general coupons)
        userId, 
        cartAmount 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET category coupons
  GET_CATEGORY_COUPONS: async (): Promise<CustomResponse<ICoupon[]>> => {
    try {
      const response = await GET(`${CouponBaseURL}/category`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // APPLY CATEGORY COUPON
  APPLY_CATEGORY_COUPON: async (
    request: IApplyCategoryCouponRequest
  ): Promise<CustomResponse<IApplyCategoryCouponResponse>> => {
    try {
      const response = await POST(`${CouponBaseURL}/apply-category`, request);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Convenience method for applying category coupon with cart items
  APPLY_CATEGORY_COUPON_TO_CART: async (
    code: string,
    userId: number,
    cartItems: any[], // Your cart items from the frontend
    schoolId?: number | null
  ): Promise<CustomResponse<IApplyCategoryCouponResponse>> => {
    try {
      const request: IApplyCategoryCouponRequest = {
        code,
        userId,
        schoolId: schoolId || null,
        cartItems
      };
      const response = await POST(`${CouponBaseURL}/apply-category`, request);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Quick validate category coupon
  VALIDATE_CATEGORY_COUPON: async (
    code: string,
    userId: number,
    cartItems: any[],
    schoolId?: number | null
  ): Promise<CustomResponse<{ 
    isValid: boolean; 
    coupon: ICoupon | null; 
    message: string;
    applicableItems?: any[];
    totalApplicableAmount?: number;
  }>> => {
    try {
      const request: IApplyCategoryCouponRequest = {
        code,
        userId,
        schoolId: schoolId || null,
        cartItems
      };
      const response = await POST(`${CouponBaseURL}/apply-category`, request);
      
      // Return validation info without applying the coupon
      return {
        ...response,
        data: {
          isValid: response.data.isValid,
          coupon: response.data.coupon,
          message: response.data.message,
          applicableItems: response.data.applicableItems,
          totalApplicableAmount: response.data.totalApplicableAmount
        }
      } as CustomResponse<any>;
    } catch (error) {
      throw error;
    }
  },
  // NEW: APPLY PRODUCT COUPON
  APPLY_PRODUCT_COUPON: async (
    request: IApplyProductCouponRequest
  ): Promise<CustomResponse<IApplyProductCouponResponse>> => {
    try {
      const response = await POST(`${CouponBaseURL}/apply-product`, request);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // NEW: VALIDATE COUPON WITH PRODUCTS
  VALIDATE_COUPON_WITH_PRODUCTS: async (
    code: string, 
    schoolId: number | null, 
    userId: number, 
    productIds?: string[]
  ): Promise<CustomResponse<{ isValid: boolean; coupon: any; message: string }>> => {
    try {
      const response = await POST(`${CouponBaseURL}/validate`, { 
        code, 
        schoolId, 
        userId, 
        productIds 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
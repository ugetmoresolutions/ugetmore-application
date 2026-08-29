import {
  ICoupon,
  ICreateCoupon,
  IUpdateCoupon,
  IApplyProductCouponRequest,
  IApplyProductCouponResponse,
  IApplyCategoryCouponRequest,
  IApplyCategoryCouponResponse,
  IApplySchoolCouponRequest,
  IApplySchoolCouponResponse,
} from "@/types/coupon/coupon.type";
import { Token } from "typedi";

export interface ICouponService {
  getAllCoupons(): Promise<ICoupon[]>;
  getCouponById(id: number): Promise<ICoupon | null>;
  getCouponByCode(code: string): Promise<ICoupon | null>;
  createCoupon(couponData: ICreateCoupon): Promise<ICoupon>;
  updateCoupon(id: number, couponData: IUpdateCoupon): Promise<ICoupon>;
  deleteCoupon(id: number): Promise<boolean>;
  getActiveCoupons(): Promise<ICoupon[]>;
  getCouponsBySchool(schoolId: number): Promise<ICoupon[]>;
  getGeneralCoupons(): Promise<ICoupon[]>;
  getCouponsByUser(userId: number): Promise<ICoupon[]>;
  getProductCoupons(): Promise<ICoupon[]>;
  getCouponsByProduct(productId: string): Promise<ICoupon[]>; // CHANGED: number -> string
  validateCoupon(
    code: string,
    schoolId: number | null,
    userId: number,
    productIds?: string[]
  ): Promise<{ isValid: boolean; coupon: ICoupon | null; message: string }>; // CHANGED: productIds?: string[]
  applyCoupon(
    code: string,
    schoolId: number | null,
    userId: number,
    cartAmount: number
  ): Promise<{
    isValid: boolean;
    discountAmount: number;
    finalAmount: number;
    message: string;
  }>;
  applyProductCoupon(
    request: IApplyProductCouponRequest
  ): Promise<IApplyProductCouponResponse>;
  applyCategoryCoupon(
    request: IApplyCategoryCouponRequest
  ): Promise<IApplyCategoryCouponResponse>;
  getCategoryCoupons(): Promise<ICoupon[]>; // ADD this method
  registerCouponUsage(couponId: number, userId: number): Promise<boolean>;
  // incrementCouponUsage(couponId: number, userId: number): Promise<boolean>;
   applyCategoryCoupon(request: IApplyCategoryCouponRequest): Promise<IApplyCategoryCouponResponse>;
  applySchoolCoupon(request: IApplySchoolCouponRequest): Promise<IApplySchoolCouponResponse>;
}

export const COUPON_SERVICE_TOKEN = new Token<ICouponService>("ICouponService");

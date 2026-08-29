import { ICoupon, ICreateCoupon, IUpdateCoupon, IProductCouponValidation, IApplyProductCouponRequest } from "@/types/coupon/coupon.type";

export interface ICouponRepository {
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
  incrementCouponUsage(id: number, userId: number): Promise<boolean>;
  validateCoupon(code: string, schoolId: number | null, userId: number, productIds?: string[]): Promise<{ isValid: boolean; coupon: ICoupon | null; message: string }>; // CHANGED: productIds?: string[]
  validateProductCoupon(code: string, userId: number, products: IProductCouponValidation[]): Promise<{ isValid: boolean; coupon: ICoupon | null; message: string; applicableProducts: IProductCouponValidation[]; totalApplicableAmount: number }>;
  
}
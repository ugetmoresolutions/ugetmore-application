// controllers/coupon/coupon.controller.ts
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { COUPON_SERVICE_TOKEN } from "@/interfaces/coupon/coupon.service.interface";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";

export class CouponController {
  private couponService;

  constructor() {
    this.couponService = Container.get(COUPON_SERVICE_TOKEN);
  }

  public getAllCoupons = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const coupons = await this.couponService.getAllCoupons();

      const response: CustomResponse<any> = {
        data: coupons,
        message: "Coupons retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getCouponById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = parseInt(req.params.id);
      const coupon = await this.couponService.getCouponById(id);

      const response: CustomResponse<any> = {
        data: coupon,
        message: "Coupon retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getCouponsByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = parseInt(req.params.userId);
      const coupons = await this.couponService.getCouponsByUser(userId);

      const response: CustomResponse<any> = {
        data: coupons,
        message: "User coupons retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const couponData = req.body;

      if (!couponData.code) {
        throw new HttpException(400, "Coupon code is required");
      }
      if (!couponData.discountType || !['percentage', 'fixed'].includes(couponData.discountType)) {
        throw new HttpException(400, "Valid discount type is required");
      }
      // UPDATE: Include 'category' in valid coupon types
      if (!couponData.couponType || !['school', 'general', 'user', 'product', 'category'].includes(couponData.couponType)) {
        throw new HttpException(400, "Valid coupon type is required (school, general, user, product, or category)");
      }

      if (couponData.couponType === 'user' && !couponData.applicableUserId) {
        throw new HttpException(400, "User ID is required for user-specific coupons");
      }

      if (couponData.couponType === 'product' && (!couponData.applicableProductIds || couponData.applicableProductIds.length === 0)) {
        throw new HttpException(400, "Product IDs are required for product-specific coupons");
      }

      // ADD: Validate category coupon requirements
      if (couponData.couponType === 'category' && (!couponData.applicableCategories || couponData.applicableCategories.length === 0)) {
        throw new HttpException(400, "Categories are required for category-specific coupons");
      }

      const coupon = await this.couponService.createCoupon(couponData);

      const response: CustomResponse<any> = {
        data: coupon,
        message: "Coupon created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  // ADD: Get category coupons endpoint
  public getCategoryCoupons = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const coupons = await this.couponService.getCategoryCoupons();

      const response: CustomResponse<any> = {
        data: coupons,
        message: "Category coupons retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };



  // ADD: Apply category coupon endpoint
  public applyCategoryCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { code, userId, schoolId, cartItems } = req.body;

      if (!code || !userId || !cartItems) {
        throw new HttpException(400, "Code, userId, and cartItems are required");
      }

      const result = await this.couponService.applyCategoryCoupon({
        code,
        userId,
        schoolId: schoolId || null,
        cartItems
      });

      const response: CustomResponse<any> = {
        data: result,
        message: result.isValid ? "Category coupon applied successfully" : "Failed to apply category coupon",
        error: !result.isValid,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = parseInt(req.params.id);
      const couponData = req.body;
      const coupon = await this.couponService.updateCoupon(id, couponData);

      const response: CustomResponse<any> = {
        data: coupon,
        message: "Coupon updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = parseInt(req.params.id);
      await this.couponService.deleteCoupon(id);

      const response: CustomResponse<any> = {
        data: null,
        message: "Coupon deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getActiveCoupons = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const coupons = await this.couponService.getActiveCoupons();

      const response: CustomResponse<any> = {
        data: coupons,
        message: "Active coupons retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getCouponsBySchool = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const coupons = await this.couponService.getCouponsBySchool(schoolId);

      const response: CustomResponse<any> = {
        data: coupons,
        message: "School coupons retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getGeneralCoupons = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const coupons = await this.couponService.getGeneralCoupons();

      const response: CustomResponse<any> = {
        data: coupons,
        message: "General coupons retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getProductCoupons = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const coupons = await this.couponService.getProductCoupons();

      const response: CustomResponse<any> = {
        data: coupons,
        message: "Product coupons retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getCouponsByProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const productId = req.params.productId; // CHANGED: no parseInt for string
    const coupons = await this.couponService.getCouponsByProduct(productId);

      const response: CustomResponse<any> = {
        data: coupons,
        message: "Product-specific coupons retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public validateCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { code, schoolId, userId, productIds } = req.body;

      if (!code || !userId) {
        throw new HttpException(400, "Code and userId are required");
      }

      const validation = await this.couponService.validateCoupon(
        code, 
        schoolId || null, 
        userId, 
        productIds || []
      );

      const response: CustomResponse<any> = {
        data: validation,
        message: validation.isValid ? "Coupon is valid" : "Coupon validation failed",
        error: !validation.isValid,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public applyCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { code, schoolId, userId, cartAmount } = req.body;

      if (!code || !userId || cartAmount === undefined) {
        throw new HttpException(400, "Code, userId, and cartAmount are required");
      }

      const result = await this.couponService.applyCoupon(code, schoolId || null, userId, cartAmount);

      const response: CustomResponse<any> = {
        data: result,
        message: result.isValid ? "Coupon applied successfully" : "Failed to apply coupon",
        error: !result.isValid,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public applyProductCoupon = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { code, userId, schoolId, products } = req.body;

      if (!code || !userId || !products) {
        throw new HttpException(400, "Code, userId, and products are required");
      }

      const result = await this.couponService.applyProductCoupon({
        code,
        userId,
        schoolId: schoolId || null,
        products
      });

      const response: CustomResponse<any> = {
        data: result,
        message: result.isValid ? "Product coupon applied successfully" : "Failed to apply product coupon",
        error: !result.isValid,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
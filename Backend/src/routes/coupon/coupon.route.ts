// routes/coupon/coupon.route.ts
import { Router } from "express";
import { CouponController } from "../../controllers/coupon/coupon.controller";
import { Routes } from "@/types/routes.interface";

export class CouponRoute implements Routes {
    public path = "/coupons";
    public router = Router();
    public couponController = new CouponController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Admin routes
        this.router.get(`${this.path}`, this.couponController.getAllCoupons);
        this.router.get(`${this.path}/active`, this.couponController.getActiveCoupons);
        this.router.get(`${this.path}/general`, this.couponController.getGeneralCoupons);
        this.router.get(`${this.path}/product`, this.couponController.getProductCoupons);
        this.router.get(`${this.path}/:id`, this.couponController.getCouponById);
        this.router.post(`${this.path}`, this.couponController.createCoupon);
        this.router.put(`${this.path}/:id`, this.couponController.updateCoupon);
        this.router.delete(`${this.path}/:id`, this.couponController.deleteCoupon);
        
        // School-specific routes
        this.router.get(`${this.path}/school/:schoolId`, this.couponController.getCouponsBySchool);
        // User-specific routes
        this.router.get(`${this.path}/user/:userId`, this.couponController.getCouponsByUser);
        // Product-specific routes
        this.router.get(`${this.path}/product/:productId`, this.couponController.getCouponsByProduct);

        this.router.get(`${this.path}/category/:category`, this.couponController.getCategoryCoupons);
        
        // Validation and application routes
        this.router.post(`${this.path}/validate`, this.couponController.validateCoupon);
        this.router.post(`${this.path}/apply`, this.couponController.applyCoupon);
        this.router.post(`${this.path}/apply-product`, this.couponController.applyProductCoupon);
        this.router.post(`${this.path}/apply-category`, this.couponController.applyCategoryCoupon); 
    }
}
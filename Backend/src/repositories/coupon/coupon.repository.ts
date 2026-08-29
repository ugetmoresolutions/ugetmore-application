// repositories/coupon/coupon.repository.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { ICoupon, ICreateCoupon, IUpdateCoupon, IProductCouponValidation, ICartItemForCoupon } from "@/types/coupon/coupon.type";
import Coupon from "@/models/coupon/coupon.model";
import { ICouponRepository } from "@/interfaces/coupon/coupon.repository.interface";
import { Op, WhereOptions } from "sequelize";
import { CategoryDetectionUtil } from "@/utils/category-detection.util";
import { ICartItem } from "@/types/cart/cart.interface";

@Service()
export class CouponRepository implements ICouponRepository {
  public async getAllCoupons(): Promise<ICoupon[]> {
    try {
      const coupons = await Coupon.findAll({
        order: [['createdAt', 'DESC']]
      });
      return coupons.map(coupon => coupon.toJSON() as ICoupon);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get coupons: ${error.message}`);
    }
  }

  // ADD: Get category coupons method
  public async getCategoryCoupons(): Promise<ICoupon[]> {
    try {
      const now = new Date();
      const coupons = await Coupon.findAll({
        where: {
          isActive: true,
          couponType: 'category',
          validFrom: { [Op.lte]: now },
          validTo: { [Op.gte]: now }
        },
        order: [['createdAt', 'DESC']]
      });
      return coupons.map(coupon => coupon.toJSON() as ICoupon);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get category coupons: ${error.message}`);
    }
  }
  
  public async getCouponById(id: number): Promise<ICoupon | null> {
    try {
      const coupon = await Coupon.findByPk(id);
      return coupon ? coupon.toJSON() as ICoupon : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get coupon: ${error.message}`);
    }
  }

  public async getCouponByCode(code: string): Promise<ICoupon | null> {
    try {
      const coupon = await Coupon.findOne({
        where: { code }
      });
      return coupon ? coupon.toJSON() as ICoupon : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get coupon by code: ${error.message}`);
    }
  }

  public async createCoupon(couponData: ICreateCoupon): Promise<ICoupon> {
    try {
      const existingCoupon = await Coupon.findOne({
        where: { code: couponData.code }
      });

      if (existingCoupon) {
        throw new HttpException(409, "Coupon with this code already exists");
      }

      // Validate coupon type specific requirements
      if (couponData.couponType === 'school' && !couponData.applicableSchoolId) {
        throw new HttpException(400, "School ID is required for school-specific coupons");
      }

      if (couponData.couponType === 'user' && !couponData.applicableUserId) {
        throw new HttpException(400, "User ID is required for user-specific coupons");
      }

      if (couponData.couponType === 'product' && (!couponData.applicableProductIds || couponData.applicableProductIds.length === 0)) {
        throw new HttpException(400, "Product IDs are required for product-specific coupons");
      }

      // Validate category coupon requirements
      if (couponData.couponType === 'category' && (!couponData.applicableCategories || couponData.applicableCategories.length === 0)) {
        throw new HttpException(400, "Categories are required for category-specific coupons");
      }

      // For category coupons, ensure other IDs are null
      if (couponData.couponType === 'category') {
        couponData.applicableSchoolId = null;
        couponData.applicableUserId = null;
        couponData.applicableProductIds = null;
      }

      // For general coupons, ensure applicable IDs are null
      if (couponData.couponType === 'general') {
        couponData.applicableSchoolId = null;
        couponData.applicableUserId = null;
        couponData.applicableProductIds = null;
      }

      // For school coupons, ensure other IDs are null
      if (couponData.couponType === 'school') {
        couponData.applicableUserId = null;
        couponData.applicableProductIds = null;
      }

      // For user coupons, ensure other IDs are null
      if (couponData.couponType === 'user') {
        couponData.applicableSchoolId = null;
        couponData.applicableProductIds = null;
      }

      // For product coupons, ensure other IDs are null
      if (couponData.couponType === 'product') {
        couponData.applicableSchoolId = null;
        couponData.applicableUserId = null;
      }

      const couponPayload = {
        ...couponData,
        description: couponData.description || '',
        minimumCartAmount: couponData.minimumCartAmount || 0,
        maximumDiscount: couponData.maximumDiscount || null,
        usageLimit: couponData.usageLimit || null,
        isSingleUse: couponData.isSingleUse || false,
        isActive: couponData.isActive !== undefined ? couponData.isActive : true,
        usedCount: 0,
        usedBy: []
      };

      const coupon = await Coupon.create(couponPayload as any);
      return coupon.toJSON() as ICoupon;
    } catch (error: any) {
      throw new HttpException(500, `Failed to create coupon: ${error.message}`);
    }
  }

  // ADD NEW METHOD: Validate category coupon
  public async validateCategoryCoupon(
    code: string, 
    userId: number, 
    cartItems: ICartItemForCoupon[]
  ): Promise<{ 
    isValid: boolean; 
    coupon: ICoupon | null; 
    message: string;
    applicableItems: ICartItemForCoupon[];
    totalApplicableAmount: number;
  }> {
    try {
      const coupon = await this.getCouponByCode(code);
      
      if (!coupon) {
        return { 
          isValid: false, 
          coupon: null, 
          message: "Invalid coupon code",
          applicableItems: [],
          totalApplicableAmount: 0
        };
      }

      // Basic coupon validation
      if (!coupon.isActive) {
        return { 
          isValid: false, 
          coupon: null, 
          message: "Coupon is not active",
          applicableItems: [],
          totalApplicableAmount: 0
        };
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validTo) {
        return { 
          isValid: false, 
          coupon: null, 
          message: "Coupon is expired or not yet valid",
          applicableItems: [],
          totalApplicableAmount: 0
        };
      }

      // Check if it's a category coupon
      if (coupon.couponType !== 'category') {
        return { 
          isValid: false, 
          coupon: null, 
          message: "This coupon is not a category coupon",
          applicableItems: [],
          totalApplicableAmount: 0
        };
      }

      // Check usage limits
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { 
          isValid: false, 
          coupon: null, 
          message: "Coupon usage limit reached",
          applicableItems: [],
          totalApplicableAmount: 0
        };
      }

      // Check single use per user
      if (coupon.isSingleUse && coupon.usedBy.includes(userId)) {
        return { 
          isValid: false, 
          coupon: null, 
          message: "You have already used this coupon",
          applicableItems: [],
          totalApplicableAmount: 0
        };
      }

      // Filter applicable items based on categories USING YOUR CART ITEMS
      const applicableItems = cartItems.filter(item => 
        CategoryDetectionUtil.isItemApplicableForCoupon(item, coupon.applicableCategories || [])
      );

      if (applicableItems.length === 0) {
        return { 
          isValid: false, 
          coupon: null, 
          message: "No products in cart match the coupon categories",
          applicableItems: [],
          totalApplicableAmount: 0
        };
      }

      // Calculate total using your cart item price and quantity
      const totalApplicableAmount = applicableItems.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );


      // Check minimum cart amount for applicable products
      if (totalApplicableAmount < coupon.minimumCartAmount) {
        return {
          isValid: false,
          coupon: null,
          message: `Minimum amount of R${coupon.minimumCartAmount} required for applicable category products`,
          applicableItems: [],
          totalApplicableAmount: 0
        };
      }

      return {
        isValid: true,
        coupon,
        message: "Category coupon is valid",
        applicableItems,
        totalApplicableAmount
      };
    } catch (error: any) {
      throw new HttpException(500, `Failed to validate category coupon: ${error.message}`);
    }
  }


  public async getCouponsByUser(userId: number): Promise<ICoupon[]> {
    try {
      const now = new Date();
      const coupons = await Coupon.findAll({
        where: {
          isActive: true,
          validFrom: { [Op.lte]: now },
          validTo: { [Op.gte]: now },
          [Op.or]: [
            { 
              couponType: 'user', 
              applicableUserId: userId 
            },
            { 
              couponType: 'general' 
            },
            { 
              couponType: 'product' 
            },
            { 
              couponType: 'category' // ADDED category coupons
            }
          ]
        },
        order: [['createdAt', 'DESC']]
      });
      return coupons.map(coupon => coupon.toJSON() as ICoupon);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get user coupons: ${error.message}`);
    }
  }

  public async getCouponsBySchool(schoolId: number): Promise<ICoupon[]> {
    try {
      const now = new Date();
      const coupons = await Coupon.findAll({
        where: {
          isActive: true,
          validFrom: { [Op.lte]: now },
          validTo: { [Op.gte]: now },
          [Op.or]: [
            { 
              couponType: 'school', 
              applicableSchoolId: schoolId 
            },
            { 
              couponType: 'general' 
            },
            { 
              couponType: 'product' 
            }
          ]
        },
        order: [['createdAt', 'DESC']]
      });
      return coupons.map(coupon => coupon.toJSON() as ICoupon);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get school coupons: ${error.message}`);
    }
  }

  public async getGeneralCoupons(): Promise<ICoupon[]> {
    try {
      const now = new Date();
      const coupons = await Coupon.findAll({
        where: {
          isActive: true,
          couponType: 'general',
          validFrom: { [Op.lte]: now },
          validTo: { [Op.gte]: now }
        },
        order: [['createdAt', 'DESC']]
      });
      return coupons.map(coupon => coupon.toJSON() as ICoupon);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get general coupons: ${error.message}`);
    }
  }

  public async getProductCoupons(): Promise<ICoupon[]> {
    try {
      const now = new Date();
      const coupons = await Coupon.findAll({
        where: {
          isActive: true,
          couponType: 'product',
          validFrom: { [Op.lte]: now },
          validTo: { [Op.gte]: now }
        },
        order: [['createdAt', 'DESC']]
      });
      return coupons.map(coupon => coupon.toJSON() as ICoupon);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get product coupons: ${error.message}`);
    }
  }

  public async getCouponsByProduct(productId: string): Promise<ICoupon[]> {
    try {
      const now = new Date();
      const allCoupons = await Coupon.findAll({
        where: {
          isActive: true,
          validFrom: { [Op.lte]: now },
          validTo: { [Op.gte]: now },
          [Op.or]: [
            { couponType: 'product' },
            { couponType: 'general' }
          ]
        },
        order: [['createdAt', 'DESC']]
      });
      
      // Filter in memory for exact product ID match
      return allCoupons
        .map(coupon => coupon.toJSON() as ICoupon)
        .filter(coupon => 
          coupon.couponType === 'general' || 
          (coupon.couponType === 'product' && 
           coupon.applicableProductIds && 
           coupon.applicableProductIds.includes(productId))
        );
    } catch (error: any) {
      throw new HttpException(500, `Failed to get coupons by product: ${error.message}`);
    }
  }

  public async incrementCouponUsage(id: number, userId: number): Promise<boolean> {
    try {
      const coupon = await Coupon.findByPk(id);
      if (!coupon) {
        throw new HttpException(404, "Coupon not found");
      }

      const usedBy = coupon.get('usedBy') as number[] || [];

      // Check if user already used this coupon (for single use)
    if (coupon.isSingleUse && usedBy.includes(userId)) {
      throw new HttpException(400, "User has already used this coupon");
    }
      
      await coupon.update({
        usedCount: coupon.usedCount + 1,
        usedBy: [...usedBy, userId]
      });

      return true;
    } catch (error: any) {
      throw new HttpException(500, `Failed to increment coupon usage: ${error.message}`);
    }
  }

  public async updateCoupon(id: number, couponData: IUpdateCoupon): Promise<ICoupon> {
    try {
      const coupon = await Coupon.findByPk(id);
      if (!coupon) {
        throw new HttpException(404, "Coupon not found");
      }

      await coupon.update(couponData as any);
      return coupon.toJSON() as ICoupon;
    } catch (error: any) {
      throw new HttpException(500, `Failed to update coupon: ${error.message}`);
    }
  }

  public async deleteCoupon(id: number): Promise<boolean> {
    try {
      const coupon = await Coupon.findByPk(id);
      if (!coupon) {
        throw new HttpException(404, "Coupon not found");
      }

      await coupon.destroy();
      return true;
    } catch (error: any) {
      throw new HttpException(500, `Failed to delete coupon: ${error.message}`);
    }
  }

  public async getActiveCoupons(): Promise<ICoupon[]> {
    try {
      const now = new Date();
      const coupons = await Coupon.findAll({
        where: {
          isActive: true,
          validFrom: { [Op.lte]: now },
          validTo: { [Op.gte]: now }
        },
        order: [['createdAt', 'DESC']]
      });
      return coupons.map(coupon => coupon.toJSON() as ICoupon);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get active coupons: ${error.message}`);
    }
  }

  public async validateCoupon(code: string, schoolId: number | null, userId: number, productIds?: string[]): Promise<{ isValid: boolean; coupon: ICoupon | null; message: string }> {
    try {
      const coupon = await this.getCouponByCode(code);
      
      if (!coupon) {
        return { isValid: false, coupon: null, message: "Invalid coupon code" };
      }

      if (!coupon.isActive) {
        return { isValid: false, coupon: null, message: "Coupon is not active" };
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validTo) {
        return { isValid: false, coupon: null, message: "Coupon is expired or not yet valid" };
      }

      // Check coupon type restrictions
      if (coupon.couponType === 'school') {
        if (!schoolId) {
          return { isValid: false, coupon: null, message: "This coupon requires school selection" };
        }
        if (coupon.applicableSchoolId !== schoolId) {
          return { isValid: false, coupon: null, message: "This coupon is not valid for your selected school" };
        }
      } else if (coupon.couponType === 'user') {
        if (coupon.applicableUserId !== userId) {
          return { isValid: false, coupon: null, message: "This coupon is not assigned to you" };
        }
      } else if (coupon.couponType === 'product') {
        if (!productIds || productIds.length === 0) {
          return { isValid: false, coupon: null, message: "This coupon requires specific products in cart" };
        }
        
        const hasApplicableProduct = productIds.some(productId => 
          coupon.applicableProductIds?.includes(productId)
        );
        
        if (!hasApplicableProduct) {
          return { isValid: false, coupon: null, message: "This coupon is not valid for the products in your cart" };
        }
      }

      // Check usage limits
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { isValid: false, coupon: null, message: "Coupon usage limit reached" };
      }

      // Check single use per user
      if (coupon.isSingleUse && coupon.usedBy.includes(userId)) {
        return { isValid: false, coupon: null, message: "You have already used this coupon" };
      }

      return { isValid: true, coupon, message: "Coupon is valid" };
    } catch (error: any) {
      throw new HttpException(500, `Failed to validate coupon: ${error.message}`);
    }
  }


  // In CouponRepository
public async validateSchoolCoupon(
  code: string, 
  userId: number, 
  schoolId: number,
  cartAmount: number
): Promise<{ 
  isValid: boolean; 
  coupon: ICoupon | null; 
  message: string;
  totalApplicableAmount: number;
}> {
  try {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return { 
        isValid: false, 
        coupon: null, 
        message: "Invalid coupon code",
        totalApplicableAmount: 0
      };
    }

    // Basic coupon validation
    if (!coupon.isActive) {
      return { 
        isValid: false, 
        coupon: null, 
        message: "Coupon is not active",
        totalApplicableAmount: 0
      };
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      return { 
        isValid: false, 
        coupon: null, 
        message: "Coupon is expired or not yet valid",
        totalApplicableAmount: 0
      };
    }

    // Check if it's a school coupon
    if (coupon.couponType !== 'school') {
      return { 
        isValid: false, 
        coupon: null, 
        message: "This coupon is not a school coupon",
        totalApplicableAmount: 0
      };
    }

    // Check school-specific validation
    if (!coupon.applicableSchoolId) {
      return { 
        isValid: false, 
        coupon: null, 
        message: "This coupon is not assigned to any school",
        totalApplicableAmount: 0
      };
    }

    if (coupon.applicableSchoolId !== schoolId) {
      return { 
        isValid: false, 
        coupon: null, 
        message: "This coupon is not valid for your selected school",
        totalApplicableAmount: 0
      };
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { 
        isValid: false, 
        coupon: null, 
        message: "Coupon usage limit reached",
        totalApplicableAmount: 0
      };
    }

    // Check single use per user
    if (coupon.isSingleUse && coupon.usedBy.includes(userId)) {
      return { 
        isValid: false, 
        coupon: null, 
        message: "You have already used this coupon",
        totalApplicableAmount: 0
      };
    }

    // Check minimum cart amount
    if (cartAmount < coupon.minimumCartAmount) {
      return {
        isValid: false,
        coupon: null,
        message: `Minimum amount of R${coupon.minimumCartAmount} required for this coupon`,
        totalApplicableAmount: 0
      };
    }

    return {
      isValid: true,
      coupon,
      message: "School coupon is valid",
      totalApplicableAmount: cartAmount
    };
  } catch (error: any) {
    throw new HttpException(500, `Failed to validate school coupon: ${error.message}`);
  }
}

  public async validateProductCoupon(
    code: string, 
    userId: number, 
    products: IProductCouponValidation[]
  ): Promise<{ 
    isValid: boolean; 
    coupon: ICoupon | null; 
    message: string;
    applicableProducts: IProductCouponValidation[];
    totalApplicableAmount: number;
  }> {
    try {
      const productIds = products.map(p => p.productId);
      const validation = await this.validateCoupon(code, null, userId, productIds);
      
      if (!validation.isValid || !validation.coupon) {
        return { 
          isValid: false, 
          coupon: null, 
          message: validation.message,
          applicableProducts: [],
          totalApplicableAmount: 0
        };
      }

      const coupon = validation.coupon;

      // Filter only applicable products
      const applicableProducts = products.filter(product => 
        coupon.applicableProductIds?.includes(product.productId)
      );

      const totalApplicableAmount = applicableProducts.reduce(
        (total, product) => total + (product.unitPrice * product.quantity), 
        0
      );

    

      // Check minimum cart amount for applicable products
      if (totalApplicableAmount < coupon.minimumCartAmount) {
        return {
          isValid: false,
          coupon: null,
          message: `Minimum amount of R${coupon.minimumCartAmount} required for applicable products`,
          applicableProducts: [],
          totalApplicableAmount: 0
        };
      }

      return {
        isValid: true,
        coupon,
        message: "Product coupon is valid",
        applicableProducts,
        totalApplicableAmount
      };
    } catch (error: any) {
      throw new HttpException(500, `Failed to validate product coupon: ${error.message}`);
    }
  }
}
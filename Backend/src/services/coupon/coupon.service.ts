// services/coupon/coupon.service.ts
import { Service, Inject } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  ICouponService,
  COUPON_SERVICE_TOKEN,
} from "@/interfaces/coupon/coupon.service.interface";
import {
  IApplyCategoryCouponRequest,
  IApplyCategoryCouponResponse,
  IApplyProductCouponRequest,
  IApplyProductCouponResponse,
  IApplySchoolCouponRequest,
  IApplySchoolCouponResponse,
  ICartItemForCoupon,
  ICoupon,
  ICreateCoupon,
  IProductCouponValidation,
  IUpdateCoupon,
} from "@/types/coupon/coupon.type";
import { CouponRepository } from "@/repositories/coupon/coupon.repository";
import { AuthRepository } from "@/repositories/auth/auth.repository";
import { 
  generalCouponTemplate, 
  userSpecificCouponTemplate,
  categoryCouponTemplate,
  productCouponTemplate,
  schoolCouponTemplate,
  sendMail 
} from "@/utils/email";
import { 
  IProductAggregationService, 
  PRODUCT_AGGREGATION_SERVICE_TOKEN 
} from "@/interfaces/aggregated-product/product/product-aggregation.service.interface";
import { CategoryDetectionUtil } from "@/utils/category-detection.util";

@Service({ id: COUPON_SERVICE_TOKEN })
export class CouponService implements ICouponService {
  constructor(
    private couponRepository: CouponRepository,
    private authRepository: AuthRepository,
    @Inject(PRODUCT_AGGREGATION_SERVICE_TOKEN)
    private productService: IProductAggregationService
  ) {}

  /**
   * CREATE COUPON - Main method with email sending
   */
  public async createCoupon(couponData: ICreateCoupon): Promise<ICoupon> {
    try {
      // Validation
      if (!couponData.code || couponData.code.trim().length === 0) {
        throw new HttpException(400, "Coupon code is required");
      }
      if (!couponData.discountType || !['percentage', 'fixed'].includes(couponData.discountType)) {
        throw new HttpException(400, "Valid discount type is required (percentage or fixed)");
      }
      if (!couponData.discountValue || couponData.discountValue <= 0) {
        throw new HttpException(400, "Discount value must be greater than 0");
      }
      if (!couponData.validFrom || !couponData.validTo) {
        throw new HttpException(400, "Valid from and valid to dates are required");
      }
      if (!couponData.couponType || !['school', 'general', 'user', 'product', 'category'].includes(couponData.couponType)) {
        throw new HttpException(400, "Valid coupon type is required (school, general, user, category, or product)");
      }
      if (couponData.validFrom >= couponData.validTo) {
        throw new HttpException(400, "Valid from date must be before valid to date");
      }

      // Validate type-specific requirements
      if (couponData.couponType === 'school' && !couponData.applicableSchoolId) {
        throw new HttpException(400, "School ID is required for school-specific coupons");
      }
      if (couponData.couponType === 'user' && !couponData.applicableUserId) {
        throw new HttpException(400, "User ID is required for user-specific coupons");
      }
      if (couponData.couponType === 'product' && (!couponData.applicableProductIds || couponData.applicableProductIds.length === 0)) {
        throw new HttpException(400, "Product IDs are required for product-specific coupons");
      }
      if (couponData.couponType === 'category' && (!couponData.applicableCategories || couponData.applicableCategories.length === 0)) {
        throw new HttpException(400, "Categories are required for category-specific coupons");
      }
      if (couponData.discountType === 'percentage' && couponData.discountValue > 100) {
        throw new HttpException(400, "Percentage discount cannot exceed 100%");
      }

      // Validate category values
      if (couponData.applicableCategories) {
        const validCategories = Object.values(CategoryDetectionUtil.BASE_CATEGORIES);
        const invalidCategories = couponData.applicableCategories.filter(
          cat => !validCategories.includes(cat)
        );
        if (invalidCategories.length > 0) {
          throw new HttpException(400, `Invalid categories: ${invalidCategories.join(', ')}. Valid categories are: ${validCategories.join(', ')}`);
        }
      }

      // Create coupon
      const coupon = await this.couponRepository.createCoupon(couponData);

      // Send email based on coupon type
      if (coupon.isActive) {
        try {
          switch (coupon.couponType) {
            case 'general':
              await this.sendCouponToAllCustomers(coupon);
              console.log('General coupon announcement emails sent successfully');
              break;
              
            case 'user':
              await this.sendCouponToSpecificUser(coupon);
              console.log('User-specific coupon email sent successfully');
              break;
              
            case 'school':
              await this.sendCouponToAllCustomers(coupon);
              console.log('School coupon emails sent to all customers');
              break;
              
            case 'category':
            case 'product':
              await this.sendCouponToAllCustomers(coupon);
              console.log(`${coupon.couponType} coupon emails sent successfully`);
              break;
          }
        } catch (emailError) {
          console.error('Failed to send coupon emails:', emailError);
          // Don't throw error - coupon creation should still succeed
        }
      }

      return coupon;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to create coupon: ${error.message}`);
    }
  }

  /**
   * FAST PARALLEL PRODUCT FETCHING
   */
  private async getProductDetailsFast(productIds: string[]): Promise<Array<{
    fullCode: string;
    productName: string;
    price: number;
    imageUrl: string;
  }>> {
    if (!productIds || productIds.length === 0) {
      return [];
    }

    try {
      console.log(`🔄 Fetching ${productIds.length} products in parallel...`);

      // Create all promises at once for parallel execution
      const productPromises = productIds.map(productId => 
        this.fetchProductFromAllSuppliers(productId)
      );

      // Execute all promises in parallel
      const results = await Promise.allSettled(productPromises);
      
      // Filter out successful results
      const productDetails = results
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      console.log(`✅ Successfully fetched ${productDetails.length} out of ${productIds.length} products`);
      return productDetails;

    } catch (error) {
      console.error('Error in parallel product fetching:', error);
      return [];
    }
  }

  /**
   * Fetch product from all suppliers with timeout
   */
  private async fetchProductFromAllSuppliers(productId: string): Promise<{
    fullCode: string;
    productName: string;
    price: number;
    imageUrl: string;
  } | null> {
    // Set a timeout to prevent hanging requests
    const timeoutPromise = new Promise<null>((resolve) => 
      setTimeout(() => resolve(null), 3000) // 3 second timeout per product
    );

    const fetchPromise = (async () => {
      try {
        // Try all suppliers in sequence but with fast failover
        const suppliers = [
          { name: 'amrod', method: () => this.productService.getAmrodProductByCode(productId) },
          { name: 'parrot', method: () => this.productService.getParrotProductByCode(productId) },
          { name: 'tarsus', method: () => this.productService.getTarsusProductByCode(productId) }
        ];

        for (const supplier of suppliers) {
          try {
            const product = await supplier.method();
            if (product) {
              const primaryImage = this.getPrimaryImage(product);
              return {
                fullCode: product.fullCode,
                productName: product.productName,
                price: product.price,
                imageUrl: primaryImage
              };
            }
          } catch (error) {
            // Continue to next supplier
            continue;
          }
        }
        return null;
      } catch (error) {
        return null;
      }
    })();

    // Race between fetch and timeout
    return Promise.race([fetchPromise, timeoutPromise]);
  }

  /**
   * Extract primary image from product
   */
  private getPrimaryImage(product: any): string {
    if (product.images && product.images.length > 0) {
      const mainImage = product.images.find((img: any) => img.isDefault) || product.images[0];
      if (mainImage?.urls?.[0]?.url) {
        return mainImage.urls[0].url;
      }
    }
    return 'https://via.placeholder.com/120x120/155874/ffffff?text=UGetMo';
  }

  /**
   * SEND COUPON EMAIL BASED ON TYPE
   */
  private async sendCouponEmail(coupon: ICoupon, user: any): Promise<boolean> {
    try {
      let html: string;
      let subject: string;
      let text: string;

      const discountText = coupon.discountType === 'percentage' 
        ? `${coupon.discountValue}% OFF` 
        : `R${coupon.discountValue} OFF`;

      const userName = user.fullName || 'Valued Customer';

      switch (coupon.couponType) {
        case 'general':
          html = generalCouponTemplate(
            userName,
            coupon.code,
            coupon.discountValue,
            coupon.discountType,
            coupon.validFrom.toString(),
            coupon.validTo.toString(),
            coupon.minimumCartAmount,
            coupon.maximumDiscount
          );
          subject = `🎁 Exclusive ${discountText} for Everyone! - UGetMo`;
          text = `Get ${discountText} with code ${coupon.code}. Valid until ${new Date(coupon.validTo).toLocaleDateString()}. Shop now!`;
          break;

        case 'user':
          html = userSpecificCouponTemplate(
            userName,
            coupon.code,
            coupon.discountValue,
            coupon.discountType,
            coupon.validFrom.toString(),
            coupon.validTo.toString(),
            coupon.minimumCartAmount,
            coupon.maximumDiscount
          );
          subject = `🎁 Your Personal ${discountText} Exclusive Offer! - UGetMo`;
          text = `Personal offer! Get ${discountText} with your exclusive code ${coupon.code}. Valid until ${new Date(coupon.validTo).toLocaleDateString()}.`;
          break;

        case 'category':
          const categories = coupon.applicableCategories || [];
          html = categoryCouponTemplate(
            userName,
            coupon.code,
            coupon.discountValue,
            coupon.discountType,
            coupon.validFrom.toString(),
            coupon.validTo.toString(),
            categories,
            coupon.minimumCartAmount,
            coupon.maximumDiscount
          );
          subject = `🎁 Special ${discountText} on ${categories.join(', ')}! - UGetMo`;
          text = `Get ${discountText} on ${categories.join(', ')} with code ${coupon.code}. Valid until ${new Date(coupon.validTo).toLocaleDateString()}.`;
          break;

        case 'product':
          const productIds = coupon.applicableProductIds || [];
          const productDetails = await this.getProductDetailsFast(productIds);
          
          html = productCouponTemplate(
            userName,
            coupon.code,
            coupon.discountValue,
            coupon.discountType,
            coupon.validFrom.toString(),
            coupon.validTo.toString(),
            productDetails,
            coupon.minimumCartAmount,
            coupon.maximumDiscount
          );
          subject = `🎁 Special ${discountText} on Selected Products! - UGetMo`;
          text = `Get ${discountText} on specific products with code ${coupon.code}. Valid until ${new Date(coupon.validTo).toLocaleDateString()}.`;
          break;

        case 'school':
          const schoolName = coupon.applicableSchoolId ? `School #${coupon.applicableSchoolId}` : 'Your School';
          
          html = schoolCouponTemplate(
            userName,
            schoolName,
            coupon.code,
            coupon.discountValue,
            coupon.discountType,
            coupon.validFrom.toString(),
            coupon.validTo.toString(),
            coupon.minimumCartAmount,
            coupon.maximumDiscount
          );
          subject = `🏫 ${schoolName} Exclusive ${discountText} Offer! - UGetMo`;
          text = `School exclusive! Get ${discountText} with code ${coupon.code}. Valid until ${new Date(coupon.validTo).toLocaleDateString()}.`;
          break;

        default:
          html = generalCouponTemplate(
            userName,
            coupon.code,
            coupon.discountValue,
            coupon.discountType,
            coupon.validFrom.toString(),
            coupon.validTo.toString(),
            coupon.minimumCartAmount,
            coupon.maximumDiscount
          );
          subject = `🎁 Special ${discountText} Offer! - UGetMo`;
          text = `Get ${discountText} with code ${coupon.code}. Valid until ${new Date(coupon.validTo).toLocaleDateString()}.`;
      }

      await sendMail(user.email, subject, text, html);
      console.log(`✅ ${coupon.couponType} coupon email sent to ${user.email}`);
      return true;

    } catch (error: any) {
      console.error(`❌ Failed to send ${coupon.couponType} coupon email to ${user.email}:`, error);
      return false;
    }
  }

  /**
   * SEND COUPON TO ALL CUSTOMERS
   */
  private async sendCouponToAllCustomers(coupon: ICoupon): Promise<{ sent: number; failed: number }> {
    try {
      const allCustomers = await this.authRepository.findUsersByRole('customer');
      
      let sentCount = 0;
      let failedCount = 0;

      // Pre-fetch product data for product coupons ONCE
      let preFetchedProducts: any[] = [];
      if (coupon.couponType === 'product' && coupon.applicableProductIds) {
        console.log('🔄 Pre-fetching product data for all customers...');
        preFetchedProducts = await this.getProductDetailsFast(coupon.applicableProductIds);
        console.log(`✅ Pre-fetched ${preFetchedProducts.length} products`);
      }

      const batchSize = 50;
      for (let i = 0; i < allCustomers.length; i += batchSize) {
        const batch = allCustomers.slice(i, i + batchSize);
        
        const emailPromises = batch.map(async (user) => {
          const success = await this.sendCouponEmail(coupon, user);
          if (success) sentCount++; else failedCount++;
        });

        await Promise.allSettled(emailPromises);
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < allCustomers.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`📧 Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allCustomers.length/batchSize)}`);
      }

      console.log(`🎉 Coupon emails completed: ${sentCount} successful, ${failedCount} failed`);
      return { sent: sentCount, failed: failedCount };

    } catch (error: any) {
      console.error('Failed to send coupon emails:', error);
      throw error;
    }
  }

  /**
   * SEND COUPON TO SPECIFIC USER
   */
  private async sendCouponToSpecificUser(coupon: ICoupon): Promise<boolean> {
    try {
      if (!coupon.applicableUserId) {
        console.warn('No applicable user ID found for user-specific coupon');
        return false;
      }

      const user = await this.authRepository.findUserById(coupon.applicableUserId);
      if (!user) {
        console.warn(`User with ID ${coupon.applicableUserId} not found`);
        return false;
      }

      return await this.sendCouponEmail(coupon, user);

    } catch (error: any) {
      console.error('Failed to send user-specific coupon email:', error);
      throw error;
    }
  }

  /**
   * EXISTING METHODS FROM YOUR CODE (I'm including all of them)
   */

  public async applyCategoryCoupon(request: IApplyCategoryCouponRequest): Promise<IApplyCategoryCouponResponse> {
    try {
      const { code, userId, schoolId, cartItems } = request;

      if (!code || code.trim().length === 0) {
        throw new HttpException(400, "Coupon code is required");
      }
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }
      if (!cartItems || cartItems.length === 0) {
        throw new HttpException(400, "Cart items are required");
      }

      const validation = await this.couponRepository.validateCategoryCoupon(code, userId, cartItems);
      
      if (!validation.isValid || !validation.coupon) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: this.calculateCategoryCartTotal(cartItems),
          message: validation.message,
          applicableItems: [],
          originalTotal: 0,
          discountedTotal: 0,
          coupon: null,
          categoryBreakdown: []
        };
      }

      const coupon = validation.coupon;
      const applicableItems = validation.applicableItems;
      const totalApplicableAmount = validation.totalApplicableAmount;

      let discountAmount = 0;

      if (coupon.discountType === 'percentage') {
        discountAmount = (totalApplicableAmount * coupon.discountValue) / 100;
        
        if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
          discountAmount = coupon.maximumDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
        
        if (discountAmount > totalApplicableAmount) {
          discountAmount = totalApplicableAmount;
        }
      }

      const originalTotal = this.calculateCategoryCartTotal(cartItems); 
      const finalAmount = originalTotal - discountAmount;
      const discountedTotal = totalApplicableAmount - discountAmount;

      const categoryBreakdown = CategoryDetectionUtil.getCategoryBreakdown(applicableItems);

      if (coupon.isSingleUse) {
        await this.couponRepository.incrementCouponUsage(coupon.id, userId);
      }

      const categoryNames = coupon.applicableCategories?.join(', ') || 'selected categories';
      
      return {
        isValid: true,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100,
        message: `Coupon applied successfully! You saved R${discountAmount.toFixed(2)} on ${applicableItems.length} product(s) in ${categoryNames}`,
        applicableItems,
        originalTotal: Math.round(originalTotal * 100) / 100,
        discountedTotal: Math.round(discountedTotal * 100) / 100,
        coupon,
        categoryBreakdown
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to apply category coupon: ${error.message}`);
    }
  }

  private calculateCategoryCartTotal(cartItems: ICartItemForCoupon[]): number {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  public async getAllCoupons(): Promise<ICoupon[]> {
    try {
      return await this.couponRepository.getAllCoupons();
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get coupons: ${error.message}`);
    }
  }

  public async getCouponsByUser(userId: number): Promise<ICoupon[]> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }
      return await this.couponRepository.getCouponsByUser(userId);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get user coupons: ${error.message}`);
    }
  }

  public async getCategoryCoupons(): Promise<ICoupon[]> {
    try {
      return await this.couponRepository.getCategoryCoupons();
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get category coupons: ${error.message}`);
    }
  }

  public async getCouponById(id: number): Promise<ICoupon | null> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid coupon ID is required");
      }
      return await this.couponRepository.getCouponById(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get coupon: ${error.message}`);
    }
  }

  public async getCouponByCode(code: string): Promise<ICoupon | null> {
    try {
      if (!code || code.trim().length === 0) {
        throw new HttpException(400, "Coupon code is required");
      }
      return await this.couponRepository.getCouponByCode(code);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get coupon: ${error.message}`);
    }
  }

  public async updateCoupon(id: number, couponData: IUpdateCoupon): Promise<ICoupon> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid coupon ID is required");
      }

      if (couponData.discountType === 'percentage' && couponData.discountValue && couponData.discountValue > 100) {
        throw new HttpException(400, "Percentage discount cannot exceed 100%");
      }

      const coupon = await this.couponRepository.updateCoupon(id, couponData);

      // You can add email update logic here if needed
      if (coupon.isActive && this.shouldSendUpdateEmail(couponData)) {
        console.log('Coupon updated - consider sending update emails');
      }

      return coupon;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update coupon: ${error.message}`);
    }
  }

  public async deleteCoupon(id: number): Promise<boolean> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid coupon ID is required");
      }
      return await this.couponRepository.deleteCoupon(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to delete coupon: ${error.message}`);
    }
  }

  public async getActiveCoupons(): Promise<ICoupon[]> {
    try {
      return await this.couponRepository.getActiveCoupons();
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get active coupons: ${error.message}`);
    }
  }

  public async getCouponsBySchool(schoolId: number): Promise<ICoupon[]> {
    try {
      if (!schoolId || schoolId <= 0) {
        throw new HttpException(400, "Valid school ID is required");
      }
      return await this.couponRepository.getCouponsBySchool(schoolId);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get school coupons: ${error.message}`);
    }
  }

  public async getGeneralCoupons(): Promise<ICoupon[]> {
    try {
      return await this.couponRepository.getGeneralCoupons();
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get general coupons: ${error.message}`);
    }
  }

  public async getProductCoupons(): Promise<ICoupon[]> {
    try {
      return await this.couponRepository.getProductCoupons();
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get product coupons: ${error.message}`);
    }
  }

  public async getCouponsByProduct(productId: string): Promise<ICoupon[]> {
    try {
      if (!productId || productId.trim().length === 0) {
        throw new HttpException(400, "Valid product ID is required");
      }
      return await this.couponRepository.getCouponsByProduct(productId);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get coupons by product: ${error.message}`);
    }
  }

  public async validateCoupon(code: string, schoolId: number | null, userId: number, productIds?: string[]): Promise<{ isValid: boolean; coupon: ICoupon | null; message: string }> {
    try {
      if (!code || code.trim().length === 0) {
        throw new HttpException(400, "Coupon code is required");
      }
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const coupon = await this.couponRepository.getCouponByCode(code);
      if (coupon && coupon.couponType === 'school' && !schoolId) {
        throw new HttpException(400, "School ID is required for school coupons");
      }

      if (coupon && coupon.couponType === 'product' && (!productIds || productIds.length === 0)) {
        throw new HttpException(400, "Product IDs are required for product coupons");
      }

      return await this.couponRepository.validateCoupon(code, schoolId, userId, productIds);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to validate coupon: ${error.message}`);
    }
  }

  public async applyCoupon(code: string, schoolId: number | null, userId: number, cartAmount: number): Promise<{ isValid: boolean; discountAmount: number; finalAmount: number; message: string }> {
    try {
      if (!code || code.trim().length === 0) {
        throw new HttpException(400, "Coupon code is required");
      }
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }
      if (cartAmount < 0) {
        throw new HttpException(400, "Cart amount must be positive");
      }

      const validation = await this.validateCoupon(code, schoolId, userId);
      
      if (!validation.isValid || !validation.coupon) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: cartAmount,
          message: validation.message
        };
      }

      const coupon = validation.coupon;

      if (cartAmount < coupon.minimumCartAmount) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: cartAmount,
          message: `Minimum cart amount of R${coupon.minimumCartAmount} required for this coupon`
        };
      }

      let discountAmount = 0;

      if (coupon.discountType === 'percentage') {
        discountAmount = (cartAmount * coupon.discountValue) / 100;
        
        if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
          discountAmount = coupon.maximumDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
        
        if (discountAmount > cartAmount) {
          discountAmount = cartAmount;
        }
      }

      const finalAmount = cartAmount - discountAmount;

      if (coupon.isSingleUse) {
        await this.couponRepository.incrementCouponUsage(coupon.id, userId);
      }

      return {
        isValid: true,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100,
        message: `Coupon applied successfully! You saved R${discountAmount.toFixed(2)}`
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to apply coupon: ${error.message}`);
    }
  }

  public async applyProductCoupon(request: IApplyProductCouponRequest): Promise<IApplyProductCouponResponse> {
    try {
      const { code, userId, schoolId, products } = request;

      if (!code || code.trim().length === 0) {
        throw new HttpException(400, "Coupon code is required");
      }
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }
      if (!products || products.length === 0) {
        throw new HttpException(400, "Products are required");
      }

      const validation = await this.couponRepository.validateProductCoupon(code, userId, products);
      
      if (!validation.isValid || !validation.coupon) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: this.calculateCartTotal(products),
          message: validation.message,
          applicableProducts: [],
          originalTotal: 0,
          discountedTotal: 0,
          coupon: null
        };
      }

      const coupon = validation.coupon;
      const applicableProducts = validation.applicableProducts;
      const totalApplicableAmount = validation.totalApplicableAmount;

      let discountAmount = 0;

      if (coupon.discountType === 'percentage') {
        discountAmount = (totalApplicableAmount * coupon.discountValue) / 100;
        
        if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
          discountAmount = coupon.maximumDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
        
        if (discountAmount > totalApplicableAmount) {
          discountAmount = totalApplicableAmount;
        }
      }

      const originalTotal = this.calculateCartTotal(products);
      const finalAmount = originalTotal - discountAmount;
      const discountedTotal = totalApplicableAmount - discountAmount;

      if (coupon.isSingleUse) {
        await this.couponRepository.incrementCouponUsage(coupon.id, userId);
      }

      return {
        isValid: true,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100,
        message: `Coupon applied successfully! You saved R${discountAmount.toFixed(2)} on ${applicableProducts.length} product(s)`,
        applicableProducts,
        originalTotal: Math.round(originalTotal * 100) / 100,
        discountedTotal: Math.round(discountedTotal * 100) / 100,
        coupon
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to apply product coupon: ${error.message}`);
    }
  }

 public async applySchoolCoupon(
  request: IApplySchoolCouponRequest & { cartItems?: any[] }
): Promise<IApplySchoolCouponResponse> {
  try {
    const { code, userId, schoolId, cartAmount, cartItems } = request;

    console.log(`🏫 Applying school coupon ${code} for user ${userId}, school ${schoolId}`);
    console.log(`📦 Discounting ${cartItems?.length || 0} stationery collections, Total: R${cartAmount}`);

    if (!code || code.trim().length === 0) {
      throw new HttpException(400, "Coupon code is required");
    }
    if (!userId || userId <= 0) {
      throw new HttpException(400, "Valid user ID is required");
    }
    if (!schoolId || schoolId <= 0) {
      throw new HttpException(400, "Valid school ID is required for school coupons");
    }
    if (cartAmount < 0) {
      throw new HttpException(400, "Cart amount must be positive");
    }

    // Use your existing repository validation
    const validation = await this.couponRepository.validateSchoolCoupon(
      code, 
      userId, 
      schoolId,
      cartAmount
    );

    if (!validation.isValid || !validation.coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: cartAmount,
        message: validation.message,
        coupon: null,
        totalApplicableAmount: 0
      };
    }

    const coupon = validation.coupon;

    // Additional validation: Check if we have stationery collections
    if (cartAmount === 0) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: cartAmount,
        message: "No stationery collections found for this school in your cart",
        coupon: null,
        totalApplicableAmount: 0
      };
    }

    // Calculate discount on the collection total
    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = (cartAmount * coupon.discountValue) / 100;
      
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
      
      if (discountAmount > cartAmount) {
        discountAmount = cartAmount;
      }
    }

    const finalAmount = cartAmount - discountAmount;

    // Register usage if single use
    if (coupon.isSingleUse) {
      await this.couponRepository.incrementCouponUsage(coupon.id, userId);
    }

    console.log(`✅ School coupon applied successfully: R${discountAmount} discount on stationery collections`);

    return {
      isValid: true,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
      message: `School coupon applied successfully! You saved R${discountAmount.toFixed(2)} on stationery collections`,
      coupon,
      totalApplicableAmount: cartAmount
    };
  } catch (error: any) {
    if (error instanceof HttpException) throw error;
    throw new HttpException(500, `Failed to apply school coupon: ${error.message}`);
  }
}

  private calculateCartTotal(products: IProductCouponValidation[]): number {
    return products.reduce((total, product) => total + (product.unitPrice * product.quantity), 0);
  }

  private shouldSendUpdateEmail(updateData: IUpdateCoupon): boolean {
    return !!(updateData.discountValue || updateData.validTo || updateData.maximumDiscount);
  }


  // Add this to your CouponService class
public async registerCouponUsage(couponId: number, userId: number): Promise<boolean> {
  try {
    return await this.couponRepository.incrementCouponUsage(couponId, userId);
  } catch (error: any) {
    throw new HttpException(500, `Failed to register coupon usage: ${error.message}`);
  }
}


  public async hasUserUsedCoupon(userId: number, couponCode: string): Promise<boolean> {
  try {
    const coupon = await this.getCouponByCode(couponCode);
    if (!coupon) {
      return false;
    }
    
    return coupon.usedBy.includes(userId);
  } catch (error: any) {
    throw new HttpException(500, `Failed to check coupon usage: ${error.message}`);
  }
}

public async getCouponsUsedByUser(userId: number): Promise<ICoupon[]> {
  try {
    const allCoupons = await this.getAllCoupons();
    return allCoupons.filter(coupon => 
      coupon.usedBy && coupon.usedBy.includes(userId)
    );
  } catch (error: any) {
    throw new HttpException(500, `Failed to get user coupon history: ${error.message}`);
  }
}
}
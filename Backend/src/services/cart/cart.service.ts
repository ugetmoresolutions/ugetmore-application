import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { AuthRepository } from "@/repositories/auth/auth.repository";
import { CartRepository } from "@/repositories/cart/cart.repository";
import { IUserCart, ICartItem } from "@/types/cart/cart.interface";
import { IProduct } from "@/types/product/product.types";
import { v4 as uuidv4 } from "uuid";
import {
  CART_SERVICE_TOKEN,
  ICartService,
} from "@/interfaces/cart/cart.service.interface";
import {
  COUPON_SERVICE_TOKEN,
  ICouponService,
} from "@/interfaces/coupon/coupon.service.interface";
import {
  IAppliedCoupon,
  IApplyCouponToCartRequest,
  ICartItemForCoupon,
  ICartTotalWithCoupons,
  ICoupon,
  IProductCouponValidation,
} from "@/types/coupon/coupon.type";

@Service({ id: CART_SERVICE_TOKEN })
export class CartService implements ICartService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly cartRepository: CartRepository,
    @Inject(COUPON_SERVICE_TOKEN) private couponService: ICouponService // ADD THIS
  ) {}

  public async applyCouponToCart(
    request: IApplyCouponToCartRequest
  ): Promise<ICartTotalWithCoupons> {
    try {
      const { userId, couponCode, schoolId } = request;

      console.log(`🛒 Applying coupon ${couponCode} to user ${userId}'s cart`);

      // 1. Get user's cart
      const cart = await this.getUserCart(userId);
      if (!cart || !cart.items?.length) {
        throw new HttpException(404, "Cart not found or empty");
      }

      const subtotal = cart.totalPrice;

      // 2. Get coupon to determine type
      const coupon = await this.couponService.getCouponByCode(couponCode);
      if (!coupon) {
        throw new HttpException(400, "Invalid coupon code");
      }

      let discountAmount = 0;
      let applicableItems: any[] = [];
      let totalApplicableAmount = subtotal;

      // 3. Handle different coupon types
      switch (coupon.couponType) {
        case "product":
          // PRODUCT COUPON - Your existing working code
          const productResult = await this.couponService.applyProductCoupon({
            code: couponCode,
            userId,
            schoolId,
            products: this.convertCartToProductValidation(cart.items),
          });

          if (!productResult.isValid) {
            throw new HttpException(400, productResult.message);
          }

          discountAmount = productResult.discountAmount;
          applicableItems = productResult.applicableProducts;
          totalApplicableAmount =
            productResult.totalApplicableAmount || subtotal;
          break;

        case "category":
          // CATEGORY COUPON - NEW
          const categoryResult = await this.couponService.applyCategoryCoupon({
            code: couponCode,
            userId,
            schoolId,
            cartItems: this.convertCartToCategoryValidation(cart.items),
          });

          if (!categoryResult.isValid) {
            throw new HttpException(400, categoryResult.message);
          }

          discountAmount = categoryResult.discountAmount;
          applicableItems = categoryResult.applicableItems;
          totalApplicableAmount =
            categoryResult.totalApplicableAmount || subtotal;
          break;

        case "school":
          // SCHOOL COUPON - Apply to total of stationery collections with matching school
          console.log(`🏫 Processing school coupon for school ID: ${schoolId}`);

          // Filter only bulk stationery collections that belong to the specified school
          const schoolStationeryCollections = cart.items.filter((item) => {
            const isBulkStationery = item.isBulk === true; // Check if it's a bulk stationery collection
            const hasMatchingSchool = item.schoolInfo?.schoolId === schoolId;

            console.log(
              `📦 Collection ${item.collectionName} - Bulk: ${isBulkStationery}, School Match: ${hasMatchingSchool}, School ID: ${item.schoolInfo?.schoolId}`
            );

            return isBulkStationery && hasMatchingSchool;
          });

          console.log(
            `📚 Found ${schoolStationeryCollections.length} stationery collections for school ${schoolId}`
          );

          if (schoolStationeryCollections.length === 0) {
            throw new HttpException(
              400,
              `No stationery collections found for school ID ${schoolId} in your cart`
            );
          }

          // Calculate total of ALL stationery collections for this school
          const schoolCollectionsTotal = schoolStationeryCollections.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          );

          console.log(
            `💰 School stationery collections total: R${schoolCollectionsTotal}`
          );

          const schoolResult = await this.couponService.applySchoolCoupon({
            code: couponCode,
            userId,
            schoolId: schoolId || 0,
            cartAmount: schoolCollectionsTotal, // Pass the total of stationery collections
            cartItems: schoolStationeryCollections, // Pass the collections for reference
          });

          if (!schoolResult.isValid) {
            throw new HttpException(400, schoolResult.message);
          }

          discountAmount = schoolResult.discountAmount;
          applicableItems = schoolStationeryCollections; // Show which collections were discounted
          totalApplicableAmount =
            schoolResult.totalApplicableAmount || schoolCollectionsTotal;
          break;
        default:
          // GENERAL/USER COUPON - Your existing working code
          const validation = await this.couponService.validateCoupon(
            couponCode,
            schoolId,
            userId
          );

          if (!validation.isValid || !validation.coupon) {
            throw new HttpException(400, validation.message);
          }

          if (subtotal < validation.coupon.minimumCartAmount) {
            throw new HttpException(
              400,
              `Minimum cart amount of R${validation.coupon.minimumCartAmount} required for this coupon`
            );
          }

          discountAmount = this.calculateDiscountAmount(
            subtotal,
            validation.coupon
          );
          applicableItems = cart.items;
          totalApplicableAmount = subtotal;
      }

      // 4. Your existing calculation logic (NO CHANGES - this is safe)
      const shippingAmount = subtotal >= 2000 ? 0 : 180;
      const vatRate = 0.15;
      const amountAfterDiscount = subtotal - discountAmount;
      const vatAmount = amountAfterDiscount * vatRate;
      const finalTotal = amountAfterDiscount + shippingAmount + vatAmount;

      // 5. Your existing response structure (NO CHANGES - this is safe)
      const appliedCoupon: IAppliedCoupon = {
        code: coupon.code,
        couponType: coupon.couponType,
        discountAmount: Math.round(discountAmount * 100) / 100,
      };

      const result: ICartTotalWithCoupons = {
        subtotal: Math.round(subtotal * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        shippingAmount: Math.round(shippingAmount * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        finalTotal: Math.round(finalTotal * 100) / 100,
        appliedCoupons: [appliedCoupon],
        couponData: {
          id: coupon.id,
          code: coupon.code,
          couponType: coupon.couponType,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maximumDiscount: coupon.maximumDiscount,
          minimumCartAmount: coupon.minimumCartAmount,
          applicableItems: applicableItems, // Show which products were discounted
        },
      };

      console.log("💰 Final calculation with coupon:", {
        couponType: coupon.couponType,
        originalSubtotal: subtotal,
        discount: discountAmount,
        applicableItemsCount: applicableItems.length,
        afterDiscount: amountAfterDiscount,
        shipping: shippingAmount,
        vat: vatAmount,
        final: finalTotal,
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        500,
        `Failed to apply coupon to cart: ${error.message}`
      );
    }
  }

  // Add this helper method to convert cart items for category validation
  private convertCartToCategoryValidation(
    cartItems: ICartItem[]
  ): ICartItemForCoupon[] {
    return cartItems.map(
      (item) =>
        ({
          id: item.id,
          productId: item.product?.fullCode || "",
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          supplier: item.product?.supplier || "", // Important for category detection
        } as any)
    );
  }

  // Add this helper method to convert cart items
  private convertCartToProductValidation(
    cartItems: ICartItem[]
  ): IProductCouponValidation[] {
    return cartItems.map((item) => ({
      productId: item.product?.fullCode || "", // Use fullCode to match product IDs
      quantity: item.quantity,
      unitPrice: item.price,
    }));
  }

  // Your existing method (NO CHANGES)
  private calculateDiscountAmount(amount: number, coupon: ICoupon): number {
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      discountAmount = (amount * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
      if (discountAmount > amount) {
        discountAmount = amount;
      }
    }

    return discountAmount;
  }
  public async getUserCart(userId: number): Promise<IUserCart | null> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        throw new HttpException(404, "User not found");
      }

      return await this.cartRepository.getUserCart(userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Failed to get user cart: ${error.message}`);
    }
  }

  public async updateUserCart(
    userId: number,
    cartData: Partial<Pick<IUserCart, "items" | "totalPrice">>
  ): Promise<IUserCart> {
    try {
      console.log("UserId", userId);
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        throw new HttpException(404, "User not found");
      }

      if (cartData.totalPrice !== undefined && cartData.totalPrice < 0) {
        throw new HttpException(400, "Total price cannot be negative");
      }

      return await this.cartRepository.updateUserCart(userId, cartData);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to update user cart: ${error.message}`
      );
    }
  }

  public async createUserCart(userId: number): Promise<IUserCart> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        throw new HttpException(404, "User not found");
      }

      return await this.cartRepository.createUserCart(userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to create user cart: ${error.message}`
      );
    }
  }

  public async clearUserCart(userId: number): Promise<IUserCart> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      return await this.cartRepository.clearUserCart(userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to clear user cart: ${error.message}`
      );
    }
  }

  public async addItemToCart(
    userId: number,
    item: ICartItem
  ): Promise<IUserCart> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      this.validateCartItem(item);

      const itemWithDefaults: ICartItem = {
        ...item,
        id: item.id || uuidv4(),
        addedAt: item.addedAt || new Date().toISOString(),
      };

      return await this.cartRepository.addItemToCart(userId, itemWithDefaults);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to add item to cart: ${error.message}`
      );
    }
  }

  public async removeItemFromCart(
    userId: number,
    itemId: string
  ): Promise<IUserCart> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      if (!itemId || itemId.trim().length === 0) {
        throw new HttpException(400, "Valid item ID is required");
      }

      return await this.cartRepository.removeItemFromCart(userId, itemId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to remove item from cart: ${error.message}`
      );
    }
  }

  public async updateItemQuantity(
    userId: number,
    itemId: string,
    quantity: number
  ): Promise<IUserCart> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      if (!itemId || itemId.trim().length === 0) {
        throw new HttpException(400, "Valid item ID is required");
      }

      if (quantity < 0) {
        throw new HttpException(400, "Quantity cannot be negative");
      }

      if (quantity === 0) {
        return await this.removeItemFromCart(userId, itemId);
      }

      const currentCart = await this.getUserCart(userId);
      if (!currentCart || !currentCart.items) {
        throw new HttpException(404, "Cart not found or empty");
      }

      const updatedItems = currentCart.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity };
        }
        return item;
      });

      const itemExists = updatedItems.some((item) => item.id === itemId);
      if (!itemExists) {
        throw new HttpException(404, "Item not found in cart");
      }

      const totalPrice = updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      return await this.updateUserCart(userId, {
        items: updatedItems,
        totalPrice,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to update item quantity: ${error.message}`
      );
    }
  }

  public async getCartItemCount(userId: number): Promise<any> {
    try {
      const cart = await this.getUserCart(userId);
      if (!cart || !cart.items) {
        return 0;
      }
      return {
        count: cart.items.length,
        total: cart.totalPrice,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to get cart item count: ${error.message}`
      );
    }
  }

  public async getCartTotal(userId: number): Promise<number> {
    try {
      const cart = await this.getUserCart(userId);
      if (!cart) {
        return 0;
      }

      return cart.totalPrice || 0;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to get cart total: ${error.message}`
      );
    }
  }

  public async findCartItemByProduct(
    userId: number,
    product: IProduct
  ): Promise<ICartItem | null> {
    try {
      const cart = await this.getUserCart(userId);
      if (!cart || !cart.items) {
        return null;
      }

      return (
        cart.items.find(
          (item) => JSON.stringify(item.product) === JSON.stringify(product)
        ) || null
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to find cart item: ${error.message}`
      );
    }
  }

  public async updateItemPrice(
    userId: number,
    itemId: string,
    newPrice: number
  ): Promise<IUserCart> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      if (!itemId || itemId.trim().length === 0) {
        throw new HttpException(400, "Valid item ID is required");
      }

      if (newPrice < 0) {
        throw new HttpException(400, "Price cannot be negative");
      }

      const currentCart = await this.getUserCart(userId);
      if (!currentCart || !currentCart.items) {
        throw new HttpException(404, "Cart not found or empty");
      }

      const updatedItems = currentCart.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, price: newPrice };
        }
        return item;
      });

      const itemExists = updatedItems.some((item) => item.id === itemId);
      if (!itemExists) {
        throw new HttpException(404, "Item not found in cart");
      }

      const totalPrice = updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      console.log("Before update ", userId);
      return await this.updateUserCart(userId, {
        items: updatedItems,
        totalPrice,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to update item price: ${error.message}`
      );
    }
  }

  private validateCartItem(item: ICartItem): void {
    if (!item.id || item.id.trim().length === 0) {
      throw new HttpException(400, "Valid item ID is required");
    }

    if (!item.quantity || item.quantity <= 0) {
      throw new HttpException(400, "Quantity must be greater than 0");
    }

    if (item.price === undefined || item.price < 0) {
      throw new HttpException(400, "Valid price is required");
    }

    if (!item.addedAt) {
      throw new HttpException(400, "Added at timestamp is required");
    }
  }

  //NEW COUPON CALCULATION CODE
}

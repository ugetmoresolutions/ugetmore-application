import { IUserCart, ICartItem } from "@/types/cart/cart.interface";
import { IApplyCouponToCartRequest, ICartTotalWithCoupons } from "@/types/coupon/coupon.type";
import { IProduct } from "@/types/product/product.types";
import { Token } from "typedi";
export interface ICartService {
  getUserCart(userId: number): Promise<IUserCart | null>;
  updateUserCart(userId: number, cartData: Partial<Pick<IUserCart, 'items' | 'totalPrice'>>): Promise<IUserCart>;
  createUserCart(userId: number): Promise<IUserCart>;
  clearUserCart(userId: number): Promise<IUserCart>;
  addItemToCart(userId: number, item: ICartItem): Promise<IUserCart>;
  removeItemFromCart(userId: number, itemId: string): Promise<IUserCart>;
  updateItemQuantity(userId: number, itemId: string, quantity: number): Promise<IUserCart>;
  getCartItemCount(userId: number): Promise<number>;
  getCartTotal(userId: number): Promise<number>;
  findCartItemByProduct(userId: number, product: IProduct): Promise<ICartItem | null>;
  updateItemPrice(userId: number, itemId: string, newPrice: number): Promise<IUserCart>;

  /**
   * Apply coupon and calculate final total with discounts
   */
  applyCouponToCart(
    request: IApplyCouponToCartRequest
  ): Promise<ICartTotalWithCoupons>;

  
}

export const CART_SERVICE_TOKEN = new Token<ICartService>("ICartService");
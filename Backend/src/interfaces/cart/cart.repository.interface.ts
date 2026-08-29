import { ICartItem, IUserCart } from "@/types/cart/cart.interface";

export interface ICartRepository {
  getUserCart(userId: number): Promise<IUserCart | null>;
  updateUserCart(userId: number, cartData: Partial<Pick<IUserCart, 'items' | 'totalPrice'>>): Promise<IUserCart>;
  createUserCart(userId: number): Promise<IUserCart>;
  clearUserCart(userId: number): Promise<IUserCart>;
  addItemToCart(userId: number, item: ICartItem): Promise<IUserCart>;
  removeItemFromCart(userId: number, itemId: string): Promise<IUserCart>;
}
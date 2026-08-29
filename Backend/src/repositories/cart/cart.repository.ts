import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { IUserCart, ICartItem } from "@/types/cart/cart.interface";
import Cart from "@/models/cart/cart.model";
import { ICartRepository } from "@/interfaces/cart/cart.repository.interface";

@Service()
export class CartRepository implements ICartRepository {
  public async getUserCart(userId: number): Promise<IUserCart | null> {
    try {
      const cart = await Cart.findOne({
        where: { userId },
        raw: true,
      });

      if (!cart) {
        return null;
      }

      return {
        ...cart,
        items: cart.items ? JSON.parse(cart.items as any) : [],
      } as IUserCart;
    } catch (error: any) {
      throw new HttpException(409, `Failed to get user cart: ${error.message}`);
    }
  }

  public async updateUserCart(
    userId: number, 
    cartData: Partial<Pick<IUserCart, 'items' | 'totalPrice'>>
  ): Promise<IUserCart> {
    const transaction = await Cart.sequelize.transaction();

    try {
      const cart = await Cart.findOne({
        where: { userId },
        transaction,
      });

      if (!cart) {
        const newCart = await Cart.create(
          {
            userId,
            items: cartData.items || [],
            totalPrice: cartData.totalPrice || 0,
          },
          { transaction }
        );

        await transaction.commit();
        return newCart.toJSON() as IUserCart;
      }

      const updateData: any = {};
      
      if (cartData.items !== undefined) {
        updateData.items = cartData.items;
      }
      
      if (cartData.totalPrice !== undefined) {
        updateData.totalPrice = cartData.totalPrice;
      }

      await cart.update(updateData, { transaction });
      await transaction.commit();

      const updatedCart = cart.toJSON() as IUserCart;
      return {
        ...updatedCart,
        items: updatedCart.items || [],
      };
    } catch (error: any) {
      await transaction.rollback();
      throw new HttpException(409, `Failed to update user cart: ${error.message}`);
    }
  }

  public async createUserCart(userId: number): Promise<IUserCart> {
    const transaction = await Cart.sequelize.transaction();

    try {
      const existingCart = await Cart.findOne({
        where: { userId },
        transaction,
      });

      if (existingCart) {
        await transaction.rollback();
        throw new HttpException(409, "Cart already exists for this user");
      }

      const cart = await Cart.create(
        {
          userId,
          items: [],
          totalPrice: 0,
        },
        { transaction }
      );

      await transaction.commit();
      return cart.toJSON() as IUserCart;
    } catch (error: any) {
      await transaction.rollback();
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(409, `Failed to create user cart: ${error.message}`);
    }
  }

  public async clearUserCart(userId: number): Promise<IUserCart> {
    try {
      return await this.updateUserCart(userId, {
        items: [],
        totalPrice: 0,
      });
    } catch (error: any) {
      throw new HttpException(409, `Failed to clear user cart: ${error.message}`);
    }
  }

public async addItemToCart(userId: number, item: ICartItem): Promise<IUserCart> {
  try {
    const currentCart = await this.getUserCart(userId);
    
    if (!currentCart) {
      return await this.updateUserCart(userId, {
        items: [item],
        totalPrice: item.price * item.quantity,
      });
    }

    const existingItems = currentCart.items || [];
    
    // Fixed comparison logic to handle both regular products and branded products
    const existingItemIndex = existingItems.findIndex((cartItem) => {
      // For regular products - compare product fullCode
      if (item.product && cartItem.product) {
        return cartItem.product.fullCode === item.product.fullCode;
      }
      
      // For branded products - always treat as unique (never merge)
      // This ensures each branded configuration gets its own cart entry
      if (item.brandingConfigs && cartItem.brandingConfigs) {
        return false; // Always add as new item
      }
      
      // Different types of items (regular vs branded) - never match
      return false;
    });

    let updatedItems: ICartItem[];
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      updatedItems = existingItems.map((cartItem, index) =>
        index === existingItemIndex
          ? { 
              ...cartItem, 
              quantity: cartItem.quantity + item.quantity,
              price: item.price,
              addedAt: new Date().toISOString()
            }
          : cartItem
      );
    } else {
      // Add new item to cart
      updatedItems = [...existingItems, item];
    }

    const totalPrice = updatedItems.reduce(
      (total, cartItem) => total + (cartItem.price * cartItem.quantity),
      0
    );

    return await this.updateUserCart(userId, {
      items: updatedItems,
      totalPrice,
    });
  } catch (error: any) {
    throw new HttpException(409, `Failed to add item to cart: ${error.message}`);
  }
}

  public async removeItemFromCart(userId: number, itemId: string): Promise<IUserCart> {
  const transaction = await Cart.sequelize.transaction();
  
  try {
    // Single database call with transaction
    const cart = await Cart.findOne({
      where: { userId },
      transaction,
    });

    if (!cart) {
      await transaction.rollback();
      throw new HttpException(404, "Cart not found");
    }

    // FIX: Handle items properly - they might already be parsed or might be stringified
    let currentItems: ICartItem[] = [];
    
    if (cart.items) {
      if (typeof cart.items === 'string') {
        // Items are stored as JSON string
        currentItems = JSON.parse(cart.items);
      } else {
        // Items are already parsed (object/array)
        currentItems = cart.items as any;
      }
    }

    if (!currentItems.length) {
      await transaction.rollback();
      throw new HttpException(404, "Cart is empty");
    }

    // Find and remove item in single operation
    let itemRemoved = false;
    let priceReduction = 0;
    
    const updatedItems = currentItems.filter((item: ICartItem) => {
      if (item.id === itemId) {
        itemRemoved = true;
        priceReduction = item.price * item.quantity;
        return false;
      }
      return true;
    });

    if (!itemRemoved) {
      await transaction.rollback();
      throw new HttpException(404, "Item not found in cart");
    }

    // Calculate new total efficiently
    const newTotalPrice = Math.max(0, cart.totalPrice - priceReduction);

    // Single update operation
    await cart.update({
      items: updatedItems, // Sequelize will handle serialization
      totalPrice: newTotalPrice
    }, { transaction });

    await transaction.commit();

    return {
      ...cart.toJSON(),
      items: updatedItems,
    } as IUserCart;

  } catch (error: any) {
    await transaction.rollback();
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(409, `Failed to remove item from cart: ${error.message}`);
  }
}
}
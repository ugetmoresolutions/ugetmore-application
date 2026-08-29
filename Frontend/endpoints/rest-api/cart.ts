import { CustomResponse } from "@/interfaces/product/response";
import { baseUrl } from "../url";
import {
  IUpdatePassword,
  IUser,
  IUserLogin,
  TokenData,
} from "@/interfaces/user/user";
import { DELETE, GET, POST, POSTFILES, PUT } from "../lib/rest-api-client";
import {
  IAddCartItem,
  IRemoveCartItem,
  IUpdateItemQuantity,
  IUserCart,
} from "@/interfaces/cart/cart";

const CartbaseURL = `${baseUrl}/cart`;

export const CART_API = {
  GET_USER_CART: async (userId: number): Promise<CustomResponse<IUserCart>> => {
    try {
      const response = await GET(`${CartbaseURL}/getUserCart/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Apply coupon to cart and get final total calculation
   */
  APPLY_COUPON_TO_CART: async (data: {
    userId: number;
    couponCode: string;
    schoolId?: number | null;
  }): Promise<CustomResponse<any>> => {
    try {
      const response = await POST(`${CartbaseURL}/apply-coupon`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  GET_CART_COUNT: async (userId: number) => {
    try {
      const response = await GET(`${CartbaseURL}/${userId}/count`);
      return response.data ?? [];
    } catch (error) {
      throw error;
    }
  },
  ADD_CART_ITEM: async (
    data: IAddCartItem
  ): Promise<CustomResponse<IUserCart>> => {
    try {
      const response = await POST(
        `${CartbaseURL}/${data.userId}/items`,
        data.item
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  UPDATE_CART: async (data: IUserCart): Promise<CustomResponse<IUserCart>> => {
    try {
      const response = await PUT(`${CartbaseURL}/${data.userId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  REMOVE_CART_ITEM: async (
    data: IRemoveCartItem
  ): Promise<CustomResponse<IUserCart>> => {
    try {
      const response = await DELETE(
        `${CartbaseURL}/${data.userId}/items/${data.itemId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  UPDATE_ITEM_QUANTITY: async (
    data: IUpdateItemQuantity
  ): Promise<CustomResponse<IUserCart>> => {
    try {
      const response = await PUT(
        `${CartbaseURL}/updateItemQuantity/${data.userId}`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  UPLOAD_FILE: async (formData: FormData) => {
    try {
      const response = await POSTFILES(
        `${CartbaseURL}/artwork/uploadArtWork`,
        formData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

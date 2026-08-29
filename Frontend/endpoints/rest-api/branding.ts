import { GET } from "@/endpoints/lib/client";
import { IBrandingOption } from "@/interfaces/branding/branding";
import { ICategory } from "@/interfaces/product/category";
import { IProduct, IProductPrice } from "@/interfaces/product/product";
import { IStockItem } from "@/interfaces/product/stock";

export const PRODUCT_API = {
  GET_PRODUCTS_WITHBRANDING: async (): Promise<IProduct[]> => {
    return await GET("productsWithBranding");
  },
  GET_PRODUCTS_PRICES: async (): Promise<IProductPrice[]> => {
    return await GET("prices");
  },
  GET_PRODUCTS: async (): Promise<IProduct[]> => {
    return await GET("products");
  },
  GET_CATEGORIES: async (): Promise<ICategory[]> => {
    return await GET("categories");
  },
    GET_BRANDNG_PRICES: async (): Promise<IBrandingOption[]> => {
    return await GET("brandingPrices");
  },

  GET_PRODUCTS_STOCK: async (): Promise<IStockItem[]> => {
    return await GET("stock");
  },
};
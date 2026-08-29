// endpoints/rest-api/stock/index.ts
import { CustomResponse } from "@/interfaces/product/response";
import { baseUrl } from "../url";
import { GET, POST, PUT, DELETE } from "../lib/rest-api-client";
import { IStock, ICreateStock, IUpdateStock } from "@/interfaces/stock/stock.interface";

const StockBaseURL = `${baseUrl}/stocks`;

export const STOCK_API = {
  // GET all stocks
  GET_ALL_STOCKS: async (): Promise<CustomResponse<IStock[]>> => {
    try {
      const response = await GET(`${StockBaseURL}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET stock by ID
  GET_STOCK_BY_ID: async (id: number): Promise<CustomResponse<IStock>> => {
    try {
      const response = await GET(`${StockBaseURL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET stock by product ID
  GET_STOCK_BY_PRODUCT_ID: async (productId: number): Promise<CustomResponse<IStock>> => {
    try {
      const response = await GET(`${StockBaseURL}/product/${productId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET stock by full code
  GET_STOCK_BY_FULL_CODE: async (fullCode: string): Promise<CustomResponse<IStock>> => {
    try {
      const response = await GET(`${StockBaseURL}/code/${encodeURIComponent(fullCode)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE stock
  CREATE_STOCK: async (stockData: ICreateStock): Promise<CustomResponse<IStock>> => {
    try {
      const response = await POST(`${StockBaseURL}`, stockData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE stock by ID
  UPDATE_STOCK: async (id: number, stockData: IUpdateStock): Promise<CustomResponse<IStock>> => {
    try {
      const response = await PUT(`${StockBaseURL}/${id}`, stockData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE stock by product ID
  UPDATE_STOCK_BY_PRODUCT_ID: async (productId: number, stockData: IUpdateStock): Promise<CustomResponse<IStock>> => {
    try {
      const response = await PUT(`${StockBaseURL}/product/${productId}`, stockData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE stock by full code
  UPDATE_STOCK_BY_FULL_CODE: async (fullCode: string, stockData: IUpdateStock): Promise<CustomResponse<IStock>> => {
    try {
      const response = await PUT(`${StockBaseURL}/code/${encodeURIComponent(fullCode)}`, stockData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE stock quantity
  UPDATE_STOCK_QUANTITY: async (id: number, stock: number, reservedStock: number): Promise<CustomResponse<IStock>> => {
    try {
      const response = await PUT(`${StockBaseURL}/${id}/quantity`, { stock, reservedStock });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE stock
  DELETE_STOCK: async (id: number): Promise<CustomResponse<boolean>> => {
    try {
      const response = await DELETE(`${StockBaseURL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
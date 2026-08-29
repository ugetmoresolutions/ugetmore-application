// src/interfaces/stock/stock.interface.service.ts
import { IStock } from "@/types/stock/stock.type";
import { Token } from "typedi";

export interface IStockService {
  getAllStocks(): Promise<IStock[]>;
  getStockById(id: number): Promise<IStock | null>;
  getStockByProductId(productId: number): Promise<IStock | null>;
  getStockByFullCode(fullCode: string): Promise<IStock | null>;
  createStock(stockData: Omit<IStock, 'id' | 'createdAt' | 'updatedAt'>): Promise<IStock>;
  updateStock(id: number, stockData: Partial<IStock>): Promise<IStock>;
  updateStockByProductId(productId: number, stockData: Partial<IStock>): Promise<IStock>;
  updateStockByFullCode(fullCode: string, stockData: Partial<IStock>): Promise<IStock>;
  deleteStock(id: number): Promise<boolean>;
  updateStockQuantity(id: number, stock: number, reservedStock: number): Promise<IStock>;
  validateStockData(stockData: Partial<IStock>): void;
}

export const STOCK_SERVICE_TOKEN = new Token<IStockService>("IStockService");
// src/types/stock/stock.type.ts
export interface IStock {
  id: number;
  productId: number;
  fullCode: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  createdAt?: Date;
  updatedAt?: Date;
}
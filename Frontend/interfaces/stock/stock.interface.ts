// interfaces/stock/stock.interface.ts
export interface IStock {
  id: number;
  productId: number;
  fullCode: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  createdAt?: string;
  updatedAt?: string;
}

// For creating new stock (availableStock is optional as it will be calculated on backend)
export interface ICreateStock {
  productId: number;
  fullCode: string;
  stock: number;
  reservedStock: number;
  availableStock?: number; // Make it optional for creation
}

// For updating stock
export interface IUpdateStock {
  stock?: number;
  reservedStock?: number;
  availableStock?: number;
}

// Extended interface for frontend display
export interface IStockItem extends IStock {
  productName?: string;
  simpleCode?: string;
  colourCode?: string;
  colourName?: string;
  category?: string;
  material?: string;
  minimumStock?: number;
  maximumStock?: number;
  incomingStock?: number | null;
  stockType?: number;
}
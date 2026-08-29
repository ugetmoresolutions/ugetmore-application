// src/repositories/stock/stock.repository.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { IStock } from "@/types/stock/stock.type";
import Stock from "@/models/stock/stock.model";
import { IStockRepository } from "@/interfaces/stock/stock.respository.interface";

@Service()
export class StockRepository implements IStockRepository {
  public async getAllStocks(): Promise<IStock[]> {
    try {
      const stocks = await Stock.findAll({
        order: [['createdAt', 'DESC']]
      });
      return stocks.map(stock => stock.toJSON() as IStock);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get stocks: ${error.message}`);
    }
  }

  public async getStockById(id: number): Promise<IStock | null> {
    try {
      const stock = await Stock.findByPk(id);
      return stock ? stock.toJSON() as IStock : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get stock: ${error.message}`);
    }
  }

  public async getStockByProductId(productId: number): Promise<IStock | null> {
    try {
      const stock = await Stock.findOne({
        where: { productId }
      });
      return stock ? stock.toJSON() as IStock : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get stock by product ID: ${error.message}`);
    }
  }

  public async getStockByFullCode(fullCode: string): Promise<IStock | null> {
    try {
      const stock = await Stock.findOne({
        where: { fullCode }
      });
      return stock ? stock.toJSON() as IStock : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get stock by full code: ${error.message}`);
    }
  }

  public async createStock(stockData: Omit<IStock, 'id' | 'createdAt' | 'updatedAt'>): Promise<IStock> {
    try {
      // Calculate available stock
      const availableStock = stockData.stock - stockData.reservedStock;
      const stockWithAvailable = { ...stockData, availableStock };

      const stock = await Stock.create(stockWithAvailable as any);
      return stock.toJSON() as IStock;
    } catch (error: any) {
      throw new HttpException(500, `Failed to create stock: ${error.message}`);
    }
  }

  public async updateStock(id: number, stockData: Partial<IStock>): Promise<IStock> {
    try {
      const stock = await Stock.findByPk(id);
      if (!stock) {
        throw new HttpException(404, "Stock not found");
      }

      // Recalculate available stock if stock or reservedStock is being updated
      if (stockData.stock !== undefined || stockData.reservedStock !== undefined) {
        const currentStock = stockData.stock !== undefined ? stockData.stock : stock.stock;
        const currentReserved = stockData.reservedStock !== undefined ? stockData.reservedStock : stock.reservedStock;
        stockData.availableStock = currentStock - currentReserved;
      }

      await stock.update(stockData);
      return stock.toJSON() as IStock;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update stock: ${error.message}`);
    }
  }

  public async updateStockByProductId(productId: number, stockData: Partial<IStock>): Promise<IStock> {
    try {
      const stock = await Stock.findOne({ where: { productId } });
      if (!stock) {
        throw new HttpException(404, "Stock not found for this product");
      }

      // Recalculate available stock
      if (stockData.stock !== undefined || stockData.reservedStock !== undefined) {
        const currentStock = stockData.stock !== undefined ? stockData.stock : stock.stock;
        const currentReserved = stockData.reservedStock !== undefined ? stockData.reservedStock : stock.reservedStock;
        stockData.availableStock = currentStock - currentReserved;
      }

      await stock.update(stockData);
      return stock.toJSON() as IStock;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update stock by product ID: ${error.message}`);
    }
  }

  public async updateStockByFullCode(fullCode: string, stockData: Partial<IStock>): Promise<IStock> {
    try {
      const stock = await Stock.findOne({ where: { fullCode } });
      if (!stock) {
        throw new HttpException(404, "Stock not found for this product code");
      }

      // Recalculate available stock
      if (stockData.stock !== undefined || stockData.reservedStock !== undefined) {
        const currentStock = stockData.stock !== undefined ? stockData.stock : stock.stock;
        const currentReserved = stockData.reservedStock !== undefined ? stockData.reservedStock : stock.reservedStock;
        stockData.availableStock = currentStock - currentReserved;
      }

      await stock.update(stockData);
      return stock.toJSON() as IStock;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update stock by full code: ${error.message}`);
    }
  }

  public async deleteStock(id: number): Promise<boolean> {
    try {
      const stock = await Stock.findByPk(id);
      if (!stock) {
        throw new HttpException(404, "Stock not found");
      }

      await stock.destroy();
      return true;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to delete stock: ${error.message}`);
    }
  }

  public async updateStockQuantity(id: number, stock: number, reservedStock: number): Promise<IStock> {
    try {
      const stockRecord = await Stock.findByPk(id);
      if (!stockRecord) {
        throw new HttpException(404, "Stock not found");
      }

      const availableStock = stock - reservedStock;
      await stockRecord.update({ stock, reservedStock, availableStock });
      return stockRecord.toJSON() as IStock;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update stock quantity: ${error.message}`);
    }
  }
}
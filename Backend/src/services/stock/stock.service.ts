// src/services/stock/stock.service.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { StockRepository } from "@/repositories/stock/stock.repository";
import { IStock } from "@/types/stock/stock.type";
import { STOCK_SERVICE_TOKEN, IStockService } from "@/interfaces/stock/stock.service.interface";

@Service({ id: STOCK_SERVICE_TOKEN })
export class StockService implements IStockService {
    constructor(
        private readonly stockRepository: StockRepository
    ) { }

    public async getAllStocks(): Promise<IStock[]> {
        try {
            return await this.stockRepository.getAllStocks();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, `Failed to get stocks: ${error.message}`);
        }
    }

    public async getStockById(id: number): Promise<IStock | null> {
        try {
            if (!id || id <= 0) {
                throw new HttpException(400, "Valid stock ID is required");
            }
            return await this.stockRepository.getStockById(id);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, `Failed to get stock: ${error.message}`);
        }
    }

    public async getStockByProductId(productId: number): Promise<IStock | null> {
        try {
            if (!productId || productId <= 0) {
                throw new HttpException(400, "Valid product ID is required");
            }
            return await this.stockRepository.getStockByProductId(productId);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, `Failed to get stock by product ID: ${error.message}`);
        }
    }

    public async getStockByFullCode(fullCode: string): Promise<IStock | null> {
        try {
            if (!fullCode || fullCode.trim() === '') {
                throw new HttpException(400, "Valid full code is required");
            }
            return await this.stockRepository.getStockByFullCode(fullCode);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, `Failed to get stock by full code: ${error.message}`);
        }
    }

    public async createStock(stockData: Omit<IStock, 'id' | 'createdAt' | 'updatedAt'>): Promise<IStock> {
        try {
            this.validateStockData(stockData);
            return await this.stockRepository.createStock(stockData);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, `Failed to create stock: ${error.message}`);
        }
    }

    public async updateStock(id: number, stockData: Partial<IStock>): Promise<IStock> {
        try {
            if (!id || id <= 0) {
                throw new HttpException(400, "Valid stock ID is required");
            }
            this.validateStockData(stockData, true);
            return await this.stockRepository.updateStock(id, stockData);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, `Failed to update stock: ${error.message}`);
        }
    }

    public async updateStockByProductId(productId: number, stockData: Partial<IStock>): Promise<IStock> {
        try {
            if (!productId || productId <= 0) {
                throw new HttpException(400, "Valid product ID is required");
            }
            this.validateStockData(stockData, true);
            return await this.stockRepository.updateStockByProductId(productId, stockData);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, `Failed to update stock by product ID: ${error.message}`);
        }
    }

    public async updateStockByFullCode(fullCode: string, stockData: Partial<IStock>): Promise<IStock> {
        try {
            if (!fullCode || fullCode.trim() === '') {
                throw new HttpException(400, "Valid full code is required");
            }
            this.validateStockData(stockData, true);
            return await this.stockRepository.updateStockByFullCode(fullCode, stockData);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, `Failed to update stock by full code: ${error.message}`);
        }
    }

    public async deleteStock(id: number): Promise<boolean> {
        try {
            if (!id || id <= 0) {
                throw new HttpException(400, "Valid stock ID is required");
            }
            return await this.stockRepository.deleteStock(id);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, `Failed to delete stock: ${error.message}`);
        }
    }

    public async updateStockQuantity(id: number, stock: number, reservedStock: number): Promise<IStock> {
        try {
            if (!id || id <= 0) {
                throw new HttpException(400, "Valid stock ID is required");
            }
            if (stock < 0 || reservedStock < 0) {
                throw new HttpException(400, "Stock and reserved stock cannot be negative");
            }
            if (reservedStock > stock) {
                throw new HttpException(400, "Reserved stock cannot exceed total stock");
            }
            return await this.stockRepository.updateStockQuantity(id, stock, reservedStock);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, `Failed to update stock quantity: ${error.message}`);
        }
    }

    public validateStockData(stockData: Partial<IStock>, isUpdate: boolean = false): void {
        if (!isUpdate) {
            if (!stockData.productId || stockData.productId <= 0) {
                throw new HttpException(400, "Valid product ID is required");
            }
            if (!stockData.fullCode || stockData.fullCode.trim() === '') {
                throw new HttpException(400, "Full code is required");
            }
        }

        if (stockData.stock !== undefined && stockData.stock < 0) {
            throw new HttpException(400, "Stock cannot be negative");
        }

        if (stockData.reservedStock !== undefined && stockData.reservedStock < 0) {
            throw new HttpException(400, "Reserved stock cannot be negative");
        }

        if (stockData.stock !== undefined && stockData.reservedStock !== undefined) {
            if (stockData.reservedStock > stockData.stock) {
                throw new HttpException(400, "Reserved stock cannot exceed total stock");
            }
        }
    }
}
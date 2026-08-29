// src/controllers/stock/stock.controller.ts
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { STOCK_SERVICE_TOKEN } from "@/interfaces/stock/stock.service.interface";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";
import { IStock } from "@/types/stock/stock.type";

export class StockController {
  private stockService;

  constructor() {
    this.stockService = Container.get(STOCK_SERVICE_TOKEN);
  }

  public getAllStocks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stocks = await this.stockService.getAllStocks();

      const response: CustomResponse<any> = {
        data: stocks,
        message: "Stocks retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getStockById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const stock = await this.stockService.getStockById(id);

      if (!stock) {
        throw new HttpException(404, "Stock not found");
      }

      const response: CustomResponse<any> = {
        data: stock,
        message: "Stock retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getStockByProductId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.productId);
      const stock = await this.stockService.getStockByProductId(productId);

      if (!stock) {
        throw new HttpException(404, "Stock not found for this product");
      }

      const response: CustomResponse<any> = {
        data: stock,
        message: "Stock retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getStockByFullCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fullCode } = req.params;
      const stock = await this.stockService.getStockByFullCode(fullCode);

      if (!stock) {
        throw new HttpException(404, "Stock not found for this product code");
      }

      const response: CustomResponse<any> = {
        data: stock,
        message: "Stock retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stockData: Omit<IStock, 'id' | 'createdAt' | 'updatedAt'> = req.body;
      const newStock = await this.stockService.createStock(stockData);

      const response: CustomResponse<any> = {
        data: newStock,
        message: "Stock created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const stockData: Partial<IStock> = req.body;
      const updatedStock = await this.stockService.updateStock(id, stockData);

      const response: CustomResponse<any> = {
        data: updatedStock,
        message: "Stock updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateStockByProductId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.productId);
      const stockData: Partial<IStock> = req.body;
      const updatedStock = await this.stockService.updateStockByProductId(productId, stockData);

      const response: CustomResponse<any> = {
        data: updatedStock,
        message: "Stock updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateStockByFullCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fullCode } = req.params;
      const stockData: Partial<IStock> = req.body;
      const updatedStock = await this.stockService.updateStockByFullCode(fullCode, stockData);

      const response: CustomResponse<any> = {
        data: updatedStock,
        message: "Stock updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateStockQuantity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const { stock, reservedStock } = req.body;

      if (stock === undefined || reservedStock === undefined) {
        throw new HttpException(400, "Both stock and reservedStock are required");
      }

      const updatedStock = await this.stockService.updateStockQuantity(id, stock, reservedStock);

      const response: CustomResponse<any> = {
        data: updatedStock,
        message: "Stock quantity updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await this.stockService.deleteStock(id);

      const response: CustomResponse<any> = {
        data: null,
        message: "Stock deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
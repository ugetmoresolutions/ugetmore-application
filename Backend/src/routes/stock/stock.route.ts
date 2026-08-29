// src/routes/stock/stock.route.ts
import { Router } from "express";
import { StockController } from "../../controllers/stock/stock.controller";
import { Routes } from "@/types/routes.interface";

export class StockRoute implements Routes {
  public path = "/stocks";
  public router = Router();
  public stockController = new StockController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all stocks
    this.router.get(
      `${this.path}`,
      this.stockController.getAllStocks
    );
    
    // Get stock by ID
    this.router.get(
      `${this.path}/:id`,
      this.stockController.getStockById
    );
    
    // Get stock by product ID
    this.router.get(
      `${this.path}/product/:productId`,
      this.stockController.getStockByProductId
    );
    
    // Get stock by full code
    this.router.get(
      `${this.path}/code/:fullCode`,
      this.stockController.getStockByFullCode
    );
    
    // Create new stock
    this.router.post(
      `${this.path}`,
      this.stockController.createStock
    );
    
    // Update stock by ID
    this.router.put(
      `${this.path}/:id`,
      this.stockController.updateStock
    );
    
    // Update stock by product ID
    this.router.put(
      `${this.path}/product/:productId`,
      this.stockController.updateStockByProductId
    );
    
    // Update stock by full code
    this.router.put(
      `${this.path}/code/:fullCode`,
      this.stockController.updateStockByFullCode
    );
    
    // Update stock quantity (specific endpoint for stock updates)
    this.router.patch(
      `${this.path}/:id/quantity`,
      this.stockController.updateStockQuantity
    );
    
    // Delete stock
    this.router.delete(
      `${this.path}/:id`,
      this.stockController.deleteStock
    );
  }
}
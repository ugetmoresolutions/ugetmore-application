import { Router } from "express";
import { FurnitureController } from "@/controllers/furniture/furniture.controller";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import { Routes } from "@/types/routes.interface";

import multerMiddleware from "@/middlewares/MulterMiddleware";

export class FurnitureRoute implements Routes {
  public path = "/furniture";
  public router = Router();
  public furnitureController = new FurnitureController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET Routes
    this.router.get(`${this.path}/all`, this.furnitureController.getAllFurnitureProducts);
    this.router.get(`${this.path}/search`, this.furnitureController.searchFurnitureProducts);
    this.router.get(`${this.path}/sku/:sku`, this.furnitureController.getFurnitureProductBySku);
    this.router.get(`${this.path}/:id`, this.furnitureController.getFurnitureProductById);
    this.router.get(`${this.path}/category/:category`, this.furnitureController.getFurnitureProductsByCategory);
    this.router.get(`${this.path}/brand/:brand`, this.furnitureController.getFurnitureProductsByBrand);

    // POST Routes
    this.router.post(
      `${this.path}/upload`,
      multerMiddleware,
      this.furnitureController.uploadMediaToS3
    );

    this.router.post(
      `${this.path}/create`,
      
      this.furnitureController.createFurnitureProduct
    );

    // PUT/PATCH Routes
    this.router.put(
      `${this.path}/:id`,
     
      this.furnitureController.updateFurnitureProduct
    );

    this.router.patch(
      `${this.path}/:id/status`,
      
      this.furnitureController.updateFurnitureProductStatus
    );

    // DELETE Routes
    this.router.delete(
      `${this.path}/:id`,
      this.furnitureController.deleteFurnitureProduct
    );
  }
}
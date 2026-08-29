// routes/product/product.route.ts
import { Router } from "express";
import { ProductController } from "@/controllers/product/product.controller";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import { Routes } from "@/types/routes.interface";
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateProductStatusDto,
} from "@/dots/product/product.dto";
import { authorizationMiddleware } from "@/middlewares/authorizationMiddleware";
import multerMiddleware from "@/middlewares/MulterMiddleware";

export class ProductRoute implements Routes {
  public path = "/products";
  public router = Router();
  public productController = new ProductController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET Routes
    this.router.get(`${this.path}/all`, this.productController.getAllProducts);

    this.router.get(
      `${this.path}/search`,
      this.productController.searchProducts
    );

    this.router.get(
      `${this.path}/sku/:sku`,
      this.productController.getProductBySku
    );

    this.router.get(`${this.path}/:id`, this.productController.getProductById);

    this.router.get(
      `${this.path}/category/:category`,
      this.productController.getProductsByCategory
    );

    // POST Routes
    this.router.post(
      `${this.path}/upload`,
      multerMiddleware,
      this.productController.uploadMediaToS3
    );

    this.router.post(
      `${this.path}/create`,
      ValidationMiddleware(CreateProductDto),
      this.productController.createProduct
    );

    // PUT/PATCH Routes
    this.router.put(
      `${this.path}/:id`,
      ValidationMiddleware(UpdateProductDto),
      this.productController.updateProduct
    );

    this.router.patch(
      `${this.path}/:id/status`,
      ValidationMiddleware(UpdateProductStatusDto),
      this.productController.updateProductStatus
    );

    // DELETE Routes
    this.router.delete(
      `${this.path}/:id`,
      this.productController.deleteProduct
    );
  }
}

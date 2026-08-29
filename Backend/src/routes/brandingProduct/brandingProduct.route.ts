import { Router } from "express";
import { BrandingProductController } from "../../controllers/brandingProduct/brandingProduct.controller";
import { Routes } from "@/types/routes.interface";

export class BrandingProductRoute implements Routes {
  public path = "/branding-products";
  public router = Router();
  public brandingProduct = new BrandingProductController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all branding products
    this.router.get(
      `${this.path}`,
      this.brandingProduct.getAllBrandingProducts
    );
    
    // Get branding product by ID
    this.router.get(
      `${this.path}/:id`,
      this.brandingProduct.getBrandingProductById
    );
    
    // Get branding product by simple code
    this.router.get(
      `${this.path}/simple-code/:simpleCode`,
      this.brandingProduct.getBrandingProductBySimpleCode
    );
    
    // Get branding product by full code
    this.router.get(
      `${this.path}/full-code/:fullCode`,
      this.brandingProduct.getBrandingProductByFullCode
    );
    
    // Create new branding product
    this.router.post(
      `${this.path}`,
      this.brandingProduct.createBrandingProduct
    );
    
    // Update branding product
    this.router.put(
      `${this.path}/:id`,
      this.brandingProduct.updateBrandingProduct
    );
    
    // Delete branding product
    this.router.delete(
      `${this.path}/:id`,
      this.brandingProduct.deleteBrandingProduct
    );
    
    // Search branding products
    this.router.get(
      `${this.path}/search/query`,
      this.brandingProduct.searchBrandingProducts
    );
    
    // Get branding products by type
    this.router.get(
      `${this.path}/type/:type`,
      this.brandingProduct.getBrandingProductsByType
    );
    
    // Get branding products by brand
    this.router.get(
      `${this.path}/brand/:brandCode`,
      this.brandingProduct.getBrandingProductsByBrand
    );
  }
}
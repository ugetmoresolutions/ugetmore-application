import { Router } from "express";
import { SupplierProductController } from "../../controllers/supplierProduct/supplierProduct.controller";
import { Routes } from "@/types/routes.interface";

export class SupplierProductRoute implements Routes {
  public path = "/supplier-products";
  public router = Router();
  public supplierProduct = new SupplierProductController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all supplier products
    this.router.get(
      `${this.path}`,
      this.supplierProduct.getAllSupplierProducts
    );

    this.router.get(
      `${this.path}/filtered`,
      this.supplierProduct.getAllSupplierProductsWithFilters
    );
    
    // Get supplier product by ID
    this.router.get(
      `${this.path}/:id`,
      this.supplierProduct.getSupplierProductById
    );
    
    // Get supplier product by simple code
    this.router.get(
      `${this.path}/simple-code/:simpleCode`,
      this.supplierProduct.getSupplierProductBySimpleCode
    );
    
    // Get supplier product by full code
    this.router.get(
      `${this.path}/full-code/:fullCode`,
      this.supplierProduct.getSupplierProductByFullCode
    );
    
    // Create new supplier product
    this.router.post(
      `${this.path}`,
      this.supplierProduct.createSupplierProduct
    );
    
    // Update supplier product
    this.router.put(
      `${this.path}/:id`,
      this.supplierProduct.updateSupplierProduct
    );
    
    // Delete supplier product
    this.router.delete(
      `${this.path}/:id`,
      this.supplierProduct.deleteSupplierProduct
    );
    
    // Search supplier products
    this.router.get(
      `${this.path}/search/query`,
      this.supplierProduct.searchSupplierProducts
    );
    
    // Get supplier products by supplier
    this.router.get(
      `${this.path}/supplier/:supplier`,
      this.supplierProduct.getSupplierProductsBySupplier
    );
    
    // Bulk create supplier products
    this.router.post(
      `${this.path}/bulk`,
      this.supplierProduct.bulkCreateSupplierProducts
    );
  }
}
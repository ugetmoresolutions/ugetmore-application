import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { SUPPLIER_PRODUCT_SERVICE_TOKEN } from "@/interfaces/supplierProduct/supplierProduct.service.interface";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";
import { IBrandingProduct } from "@/types/brandingProduct/brandingProduct.type";
import { ProductFilters } from "@/interfaces/supplierProduct/supplierProduct.repository.interface";

export class SupplierProductController {
  
  private get supplierProductService() {
    return Container.get(SUPPLIER_PRODUCT_SERVICE_TOKEN);
  }

  // UPDATED: Get all with pagination
  public getAllSupplierProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Validate pagination parameters
      if (page < 1) throw new HttpException(400, "Page must be greater than 0");
      if (limit < 1 || limit > 100) throw new HttpException(400, "Limit must be between 1 and 100");

      const result = await this.supplierProductService.getAllSupplierProducts(page, limit);

      const response: CustomResponse<any> = {
        data: {
          products: result.products,
          pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalItems: result.total,
            itemsPerPage: limit,
            hasNext: result.page < result.totalPages,
            hasPrev: result.page > 1
          }
        },
        message: "Supplier products retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  // UPDATED: Search with pagination
  public searchSupplierProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (!query || typeof query !== 'string') {
        throw new HttpException(400, "Search query is required");
      }
      if (page < 1) throw new HttpException(400, "Page must be greater than 0");
      if (limit < 1 || limit > 100) throw new HttpException(400, "Limit must be between 1 and 100");

      const result = await this.supplierProductService.searchSupplierProducts(query, page, limit);

      const response: CustomResponse<any> = {
        data: {
          products: result.products,
          pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalItems: result.total,
            itemsPerPage: limit,
            hasNext: result.page < result.totalPages,
            hasPrev: result.page > 1
          }
        },
        message: "Supplier products search completed successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  // UNCHANGED METHODS - Keep exactly as they are
  public getSupplierProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const supplierProduct = await this.supplierProductService.getSupplierProductById(id);

      if (!supplierProduct) {
        throw new HttpException(404, "Supplier product not found");
      }

      const response: CustomResponse<any> = {
        data: supplierProduct,
        message: "Supplier product retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getSupplierProductBySimpleCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { simpleCode } = req.params;
      const supplierProduct = await this.supplierProductService.getSupplierProductBySimpleCode(simpleCode);

      if (!supplierProduct) {
        throw new HttpException(404, "Supplier product not found");
      }

      const response: CustomResponse<any> = {
        data: supplierProduct,
        message: "Supplier product retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getSupplierProductByFullCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fullCode } = req.params;
      const supplierProduct = await this.supplierProductService.getSupplierProductByFullCode(fullCode);

      if (!supplierProduct) {
        throw new HttpException(404, "Supplier product not found");
      }

      const response: CustomResponse<any> = {
        data: supplierProduct,
        message: "Supplier product retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  // KEEP ALL OTHER METHODS EXACTLY AS THEY WERE
  public createSupplierProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supplierProductData: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'> = req.body;
      const newSupplierProduct = await this.supplierProductService.createSupplierProduct(supplierProductData);

      const response: CustomResponse<any> = {
        data: newSupplierProduct,
        message: "Supplier product created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateSupplierProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const supplierProductData: Partial<IBrandingProduct> = req.body;
      const updatedSupplierProduct = await this.supplierProductService.updateSupplierProduct(id, supplierProductData);

      const response: CustomResponse<any> = {
        data: updatedSupplierProduct,
        message: "Supplier product updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteSupplierProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.supplierProductService.deleteSupplierProduct(id);

      const response: CustomResponse<any> = {
        data: { deleted: result },
        message: "Supplier product deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getSupplierProductsBySupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplier } = req.params;
      const supplierProducts = await this.supplierProductService.getSupplierProductsBySupplier(supplier);

      const response: CustomResponse<any> = {
        data: supplierProducts,
        message: "Supplier products retrieved by supplier successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

   // NEW: Get all with advanced filtering
  public getAllSupplierProductsWithFilters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: ProductFilters = {
        search: req.query.search as string,
        category: req.query.category as string,
        subCategory: req.query.subCategory as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as string
      };

      const result = await this.supplierProductService.getAllSupplierProductsWithFilters(filters);

      const response: CustomResponse<any> = {
        data: {
          products: result.products,
          pagination: {
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalItems: result.totalProducts,
            itemsPerPage: result.pageSize,
            hasNext: result.hasNextPage,
            hasPrev: result.hasPreviousPage
          },
          filters: result.filters,
          searchQuery: result.searchQuery
        },
        message: "Supplier products retrieved successfully with filters",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public bulkCreateSupplierProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'>[] = req.body;
      const newSupplierProducts = await this.supplierProductService.bulkCreateSupplierProducts(products);

      const response: CustomResponse<any> = {
        data: newSupplierProducts,
        message: "Supplier products bulk created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
}
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { BRANDING_PRODUCT_SERVICE_TOKEN } from "@/interfaces/brandingProduct/brandingProduct.interface.service";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";
import { IBrandingProduct } from "@/types/brandingProduct/brandingProduct.type";

export class BrandingProductController {
  private brandingProductService;

  constructor() {
    this.brandingProductService = Container.get(BRANDING_PRODUCT_SERVICE_TOKEN);
  }

  public getAllBrandingProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const brandingProducts = await this.brandingProductService.getAllBrandingProducts();

      const response: CustomResponse<any> = {
        data: brandingProducts,
        message: "Branding products retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getBrandingProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const brandingProduct = await this.brandingProductService.getBrandingProductById(id);

      if (!brandingProduct) {
        throw new HttpException(404, "Branding product not found");
      }

      const response: CustomResponse<any> = {
        data: brandingProduct,
        message: "Branding product retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getBrandingProductBySimpleCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { simpleCode } = req.params;
      const brandingProduct = await this.brandingProductService.getBrandingProductBySimpleCode(simpleCode);

      if (!brandingProduct) {
        throw new HttpException(404, "Branding product not found");
      }

      const response: CustomResponse<any> = {
        data: brandingProduct,
        message: "Branding product retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getBrandingProductByFullCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fullCode } = req.params;
      const brandingProduct = await this.brandingProductService.getBrandingProductByFullCode(fullCode);

      if (!brandingProduct) {
        throw new HttpException(404, "Branding product not found");
      }

      const response: CustomResponse<any> = {
        data: brandingProduct,
        message: "Branding product retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createBrandingProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const brandingProductData: Omit<IBrandingProduct, 'id' | 'createdAt' | 'updatedAt'> = req.body;
      const newBrandingProduct = await this.brandingProductService.createBrandingProduct(brandingProductData);

      const response: CustomResponse<any> = {
        data: newBrandingProduct,
        message: "Branding product created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateBrandingProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const brandingProductData: Partial<IBrandingProduct> = req.body;
      const updatedBrandingProduct = await this.brandingProductService.updateBrandingProduct(id, brandingProductData);

      const response: CustomResponse<any> = {
        data: updatedBrandingProduct,
        message: "Branding product updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteBrandingProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.brandingProductService.deleteBrandingProduct(id);

      const response: CustomResponse<any> = {
        data: { deleted: result },
        message: "Branding product deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public searchBrandingProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        throw new HttpException(400, "Search query is required");
      }

      const brandingProducts = await this.brandingProductService.searchBrandingProducts(query);

      const response: CustomResponse<any> = {
        data: brandingProducts,
        message: "Branding products search completed successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getBrandingProductsByType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;
      const brandingProducts = await this.brandingProductService.getBrandingProductsByType(type);

      const response: CustomResponse<any> = {
        data: brandingProducts,
        message: "Branding products retrieved by type successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getBrandingProductsByBrand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { brandCode } = req.params;
      const brandingProducts = await this.brandingProductService.getBrandingProductsByBrand(brandCode);

      const response: CustomResponse<any> = {
        data: brandingProducts,
        message: "Branding products retrieved by brand successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
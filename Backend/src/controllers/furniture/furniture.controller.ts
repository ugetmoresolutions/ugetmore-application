import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { IFurnitureProduct, FurnitureProductStatus } from "@/types/furniture/furniture.type";
import { CustomResponse } from "@/types/response.interface";
import { FURNITURE_SERVICE_TOKEN } from "@/interfaces/furniture/furniture.service.interface";
import { FILE_UPLOAD_SERVICE_TOKEN } from "@/interfaces/file-upload/file-upload.service.interface";
import { promisify } from "util";
import fs from 'fs';
import { RequestWithFile } from "@/types/cart/cart.interface";

export class FurnitureController {
  private furnitureService;
  private fileUploadService;

  constructor() {
    this.furnitureService = Container.get(FURNITURE_SERVICE_TOKEN);
    this.fileUploadService = Container.get(FILE_UPLOAD_SERVICE_TOKEN);
  }

  public uploadMediaToS3 = async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const unlinkAsync = promisify(fs.unlink);
    try {
      let files: Express.Multer.File[] = [];
      
      if (req.file) {
        files = [req.file];
      } else if (req.files) {
        files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      }

      if (files.length === 0) {
        return next(new Error('No files were uploaded'));
      }

      const createMediaArray: any[] = [];
      let errorOccurred = false;

      for (const file of files) {
        try {
          if (!fs.existsSync(file.path)) {
            console.warn(`File ${file.filename} does not exist at path: ${file.path}`);
            errorOccurred = true;
            continue;
          }

          const s3Result = await this.fileUploadService.uploadFileToS3(
            file.path, 
            file.filename, 
            file.mimetype
          );

          if (s3Result) {
            createMediaArray.push({
              publicId: `leaves/${file.filename}`,
              url: s3Result
            });
            
            try {
              await unlinkAsync(file.path);
            } catch (unlinkError) {
              console.error(`Error deleting file ${file.path}:`, unlinkError);
            }
          }
        } catch (uploadError) {
          errorOccurred = true;
          console.error(`Error uploading file ${file.filename}:`, uploadError);
          
          if (fs.existsSync(file.path)) {
            try {
              await unlinkAsync(file.path);
            } catch (unlinkError) {
              console.error(`Error deleting failed upload file ${file.path}:`, unlinkError);
            }
          }
        }
      }

      if (createMediaArray.length === 0) {
        return next(new Error('No files were uploaded successfully'));
      }

      const statusCode = errorOccurred ? 207 : 201;
      const message = errorOccurred
        ? 'Partial upload completed, but some files failed to upload'
        : files.length > 1 
          ? `${createMediaArray.length} media files uploaded successfully`
          : 'Media file uploaded successfully';

      const responseData = files.length === 1 ? createMediaArray[0] : createMediaArray;

      const response: CustomResponse<any> = {
        data: responseData,
        message: message,
        error: errorOccurred
      };

      return res.status(statusCode).json(response);
    } catch (error) {
      console.error('Unexpected error in upload handler:', error);
      next(error);
    }
  };

  public getAllFurnitureProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const category = req.query.category as string;
      const status = req.query.status as FurnitureProductStatus;

      const result = await this.furnitureService.getAllFurnitureProducts({ page, pageSize, category, status });

      const response: CustomResponse<any> = {
        data: {
          products: result.products,
          pagination: {
            page,
            pageSize,
            totalCount: result.totalCount,
            totalPages: result.totalPages
          }
        },
        message: "Furniture products retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getFurnitureProductBySku = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sku = req.params.sku;
      const product = await this.furnitureService.getFurnitureProductBySku(sku);

      const response: CustomResponse<IFurnitureProduct> = {
        data: product,
        message: "Furniture product retrieved successfully by SKU",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getFurnitureProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await this.furnitureService.getFurnitureProductById(productId);

      const response: CustomResponse<IFurnitureProduct> = {
        data: product,
        message: "Furniture product retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getFurnitureProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = decodeURIComponent(req.params.category);
      const products = await this.furnitureService.getFurnitureProductsByCategory(category);

      const response: CustomResponse<IFurnitureProduct[]> = {
        data: products,
        message: "Furniture category products retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err)
    }
  }

  public getFurnitureProductsByBrand = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const brand = decodeURIComponent(req.params.brand);
      const products = await this.furnitureService.getFurnitureProductsByBrand(brand);

      const response: CustomResponse<IFurnitureProduct[]> = {
        data: products,
        message: "Furniture brand products retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err)
    }
  }

  public searchFurnitureProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        throw new Error('Search query is required');
      }

      const products = await this.furnitureService.searchFurnitureProducts(query);

      const response: CustomResponse<IFurnitureProduct[]> = {
        data: products,
        message: "Furniture products search completed successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public createFurnitureProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createdProduct = await this.furnitureService.createFurnitureProduct(req.body);
      const response: CustomResponse<IFurnitureProduct> = {
        data: createdProduct,
        message: "Furniture product created successfully",
        error: false
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public updateFurnitureProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.id);
      const updatedProduct = await this.furnitureService.updateFurnitureProduct(productId, req.body);
      const response: CustomResponse<IFurnitureProduct> = {
        data: updatedProduct,
        message: "Furniture product updated successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public updateFurnitureProductStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedProduct = await this.furnitureService.updateFurnitureProductStatus(productId, status);
      const response: CustomResponse<IFurnitureProduct> = {
        data: updatedProduct,
        message: "Furniture product status updated successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public deleteFurnitureProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.id);
      await this.furnitureService.deleteFurnitureProduct(productId);
      const response: CustomResponse<null> = {
        data: null,
        message: "Furniture product deleted successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}
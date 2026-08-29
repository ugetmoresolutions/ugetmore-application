// controllers/product/product.controller.ts
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { IImageUrl, IProduct, ProductStatus } from "@/types/product/products.type";
import { CustomResponse } from "@/types/response.interface";
import { PRODUCT_SERVICE_TOKEN } from "@/interfaces/product/product.service.interface";
import { FILE_UPLOAD_SERVICE_TOKEN } from "@/interfaces/file-upload/file-upload.service.interface";
import { promisify } from "util";
import fs from 'fs';
import { RequestWithFile } from "@/types/cart/cart.interface";

export class ProductController {
  private productService;
  private fileUploadService;

  constructor() {
    this.productService = Container.get(PRODUCT_SERVICE_TOKEN);
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

      const createMediaArray: IImageUrl[] = [];
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
              publicId: `products/${file.filename}`,
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

  public getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const category = req.query.category as string;
      const status = req.query.status as ProductStatus;

      const result = await this.productService.getAllProducts({ page, pageSize, category, status });

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
        message: "Products retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getProductBySku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sku = req.params.sku;
    const product = await this.productService.getProductBySku(sku);

    const response: CustomResponse<IProduct> = {
      data: product,
      message: "Product retrieved successfully by SKU",
      error: false
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

  public getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await this.productService.getProductById(productId);

      const response: CustomResponse<IProduct> = {
        data: product,
        message: "Product retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = decodeURIComponent(req.params.category);
      const products = await this.productService.getProductsByCategory(category);

      const response: CustomResponse<IProduct[]> = {
        data: products,
        message: "Category products retrieved successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err)
    }
  }

  public searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        throw new Error('Search query is required');
      }

      const products = await this.productService.searchProducts(query);

      const response: CustomResponse<IProduct[]> = {
        data: products,
        message: "Products search completed successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createdProduct = await this.productService.createProduct(req.body);
      const response: CustomResponse<IProduct> = {
        data: createdProduct,
        message: "Product created successfully",
        error: false
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.id);
      const updatedProduct = await this.productService.updateProduct(productId, req.body);
      const response: CustomResponse<IProduct> = {
        data: updatedProduct,
        message: "Product updated successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public updateProductStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedProduct = await this.productService.updateProductStatus(productId, status);
      const response: CustomResponse<IProduct> = {
        data: updatedProduct,
        message: "Product status updated successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = parseInt(req.params.id);
      await this.productService.deleteProduct(productId);
      const response: CustomResponse<null> = {
        data: null,
        message: "Product deleted successfully",
        error: false
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}
import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { CART_SERVICE_TOKEN } from "@/interfaces/cart/cart.service.interface";
import { ICartItem, IFIleURL, RequestWithFile } from "@/types/cart/cart.interface";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";
import fs from 'fs';
import { promisify } from 'util';
import { FILE_UPLOAD_SERVICE_TOKEN } from "@/interfaces/file-upload/file-upload.service.interface";


export class CartController {
  private cartService;
  private fileUploadService;

  constructor() {
    this.cartService = Container.get(CART_SERVICE_TOKEN);
    this.fileUploadService = Container.get(FILE_UPLOAD_SERVICE_TOKEN);
  }


  // controllers/cart/cart.controller.ts - ADD THIS METHOD

public applyCouponToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, couponCode, schoolId } = req.body;

    if (!userId || !couponCode) {
      throw new HttpException(400, "userId and couponCode are required");
    }

    const result = await this.cartService.applyCouponToCart({
      userId: Number(userId),
      couponCode,
      schoolId: schoolId || null
    });

    const response: CustomResponse<any> = {
      data: result,
      message: "Coupon applied successfully",
      error: false,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

  public getUserCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const userCart = await this.cartService.getUserCart(userId);

      const response: CustomResponse<any> = {
        data: userCart,
        message: "Cart retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createUserCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const userCart = await this.cartService.createUserCart(userId);

      const response: CustomResponse<any> = {
        data: userCart,
        message: "Cart created successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateUserCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const cartData = req.body;
      const updatedCart = await this.cartService.updateUserCart(userId, cartData);

      const response: CustomResponse<any> = {
        data: updatedCart,
        message: "Cart updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public clearUserCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const clearedCart = await this.cartService.clearUserCart(userId);

      const response: CustomResponse<any> = {
        data: clearedCart,
        message: "Cart cleared successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public addItemToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const item: ICartItem = req.body;
      const updatedCart = await this.cartService.addItemToCart(userId, item);

      const response: CustomResponse<any> = {
        data: updatedCart,
        message: "Item added to cart successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public removeItemFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const itemId = req.params.itemId;
      const updatedCart = await this.cartService.removeItemFromCart(userId, itemId);

      const response: CustomResponse<any> = {
        data: updatedCart,
        message: "Item removed from cart successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateItemQuantity = async (req: Request, res: Response, next: NextFunction) => {
    try {
    
      const { userId,itemId,quantity } = req.body;
      const updatedCart = await this.cartService.updateItemQuantity(userId, itemId, quantity);

      const response: CustomResponse<any> = {
        data: updatedCart,
        message: "Item quantity updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateItemPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const itemId = req.params.itemId;
      const { price } = req.body;

      if (price === undefined || price === null) {
        throw new HttpException(400, "Price is required");
      }

      const updatedCart = await this.cartService.updateItemPrice(userId, itemId, price);

      const response: CustomResponse<any> = {
        data: updatedCart,
        message: "Item price updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getCartItemCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const itemCount = await this.cartService.getCartItemCount(userId);

      const response: CustomResponse<number> = {
        data: itemCount,
        message: "Cart item count retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getCartTotal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const cartTotal = await this.cartService.getCartTotal(userId);

      const response: CustomResponse<number> = {
        data: cartTotal,
        message: "Cart total retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public findCartItemByProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      const product = req.body;
      const cartItem = await this.cartService.findCartItemByProduct(userId, product);

      const response: CustomResponse<any> = {
        data: cartItem,
        message: cartItem ? "Cart item found" : "Cart item not found",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  
  public uploadMediaToS3 = async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const unlinkAsync = promisify(fs.unlink);
    try {
        const files = req.files as Express.Multer.File[];
        const createMediaArray: IFIleURL[] = [];
        const uploadedFiles: string[] = [];
        let errorOccurred = false;

        for (const file of files) {
            try {
                const s3Result = await this.fileUploadService.uploadFileToS3(file.path, file.filename, file.mimetype);
                
                if (s3Result) {
                    createMediaArray.push({
                        publicId: `leaves/${file.filename}`,
                        url: s3Result
                    });
                    uploadedFiles.push(file.path); 
                }
                await unlinkAsync(file.path);
            } catch (uploadError) {
                errorOccurred = true;
                console.error(`Error uploading file ${file.filename}:`, uploadError);
            }
        }

        // Cleanup any remaining local files not handled during upload
        for (const file of files) {
            if (fs.existsSync(file.path) && !uploadedFiles.includes(file.path)) {
                try {
                    await unlinkAsync(file.path);
                } catch (cleanupError) {
                    console.error(`Error deleting local file ${file.path}:`, cleanupError);
                }
            }
        }

        if (createMediaArray.length === 0) {
            return next(new Error('No files were uploaded successfully'));
        }
        const statusCode = errorOccurred ? 207 : 201;
        const message = errorOccurred 
            ? 'Partial upload completed, but some files failed to upload' 
            : `${createMediaArray.length} media files uploaded successfully`;

        const response: CustomResponse<any> = {
            data: createMediaArray,
            message: message,
            error: errorOccurred
        };

        return res.status(statusCode).json(response);
    } catch (error) {
        if (req.files) {
            const files = req.files as Express.Multer.File[];
            await Promise.all(
                files.map(file => 
                    unlinkAsync(file.path).catch(cleanupError => 
                        console.error(`Error deleting local file ${file.path}:`, cleanupError)
                    )
                )
            );
        }
        next(error);
    }
};

}
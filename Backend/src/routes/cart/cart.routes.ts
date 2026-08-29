import { Router } from "express";
import { CartController } from "../../controllers/cart/cart.controller";
import { Routes } from "@/types/routes.interface";
import multerMiddleware from "@/middlewares/MulterMiddleware";
;

export class CartRoute implements Routes {
  public path = "/cart";
  public router = Router();
  public cart = new CartController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/getUserCart/:userId`,
      this.cart.getUserCart
    );
    

    this.router.post(
    `${this.path}/apply-coupon`,
    this.cart.applyCouponToCart
  );
  
    this.router.post(
      `${this.path}/:userId`,
      this.cart.createUserCart
    );
    
    this.router.put(
      `${this.path}/:userId`,
      this.cart.updateUserCart
    );
    
    this.router.delete(
      `${this.path}/:userId`,
      this.cart.clearUserCart
    );
    
    this.router.post(
      `${this.path}/:userId/items`,
      this.cart.addItemToCart
    );
    
    this.router.delete(
      `${this.path}/:userId/items/:itemId`,
      this.cart.removeItemFromCart
    );
        this.router.post(
            `${this.path}/artwork/uploadArtWork`,
            multerMiddleware,
            this.cart.uploadMediaToS3
        );
    this.router.put(
      `${this.path}/updateItemQuantity/:userId`,
      this.cart.updateItemQuantity
    );
    
    this.router.put(
      `${this.path}/:userId/items/:itemId/price`,
      this.cart.updateItemPrice
    );
    
    this.router.get(
      `${this.path}/:userId/count`,
      this.cart.getCartItemCount
    );
    
    this.router.get(
      `${this.path}/:userId/total`,
      this.cart.getCartTotal
    );
    
    this.router.post(
      `${this.path}/:userId/find-item`,
      this.cart.findCartItemByProduct
    );
  }
}
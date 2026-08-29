import { Router } from "express";
import { OrderController } from "@/controllers/order/order.controller";
import { Routes } from "@/types/routes.interface";
import multerMiddleware from "@/middlewares/MulterMiddleware";

export class OrderRoute implements Routes {
  public path = "/orders";
  public router = Router();
  public orderController = new OrderController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/create-from-cart`,
      this.orderController.createOrderFromCart
    );
    this.router.post(`${this.path}/create`, this.orderController.createOrder);
    this.router.get(`${this.path}/:orderId`, this.orderController.getOrderById);
    this.router.get(
      `${this.path}/user/:userId`,
      this.orderController.getUserOrders
    );
    this.router.put(
      `${this.path}/:orderId/status`,
      this.orderController.updateOrderStatus
    );
    this.router.put(
      `${this.path}/:orderId/payment-status`,
      this.orderController.updatePaymentStatus
    );
    this.router.get(
      `${this.path}/payment/:paymentReference`,
      this.orderController.getOrderByPaymentReference
    );
    this.router.get(
      `${this.path}/status/:status`,
      this.orderController.getOrdersByStatus
    );
    this.router.get(
      `${this.path}/count/total`,
      this.orderController.getTotalOrdersCount
    );
    this.router.put(
      `${this.path}/:orderId/cancel`,
      this.orderController.cancelOrder
    );
    this.router.get(
      `${this.path}/:orderId/total`,
      this.orderController.getOrderTotal
    );
    this.router.get(
      `${this.path}/:orderId/items-count`,
      this.orderController.getOrderItemsCount
    );
    this.router.get(
      `${this.path}/admin/getUsersWithOrderDetails`,
      this.orderController.getUsersWithOrderDetails
    );
    this.router.get(
      `${this.path}/bestselling/getBestSellingProducts`,
      this.orderController.getTop5Products
    );
    this.router.get(
      `${this.path}/admin/userAnalytics`,
      this.orderController.getUserAnalytics
    );
    this.router.delete(
      `${this.path}/deleteAllOrders`,
      this.orderController.deleteAllOrders
    );
    this.router.get(
      `${this.path}/all/getAllOrders`,
      this.orderController.getAllOrders
    );
    this.router.post(
      `${this.path}/mockup/uploadMockup`,
      multerMiddleware,
      this.orderController.uploadMediaToS3
    );

    this.router.post(
      `${this.path}/:orderId/mockup`,
      this.orderController.addMockupToOrder
    );
    this.router.get(
      `${this.path}/:orderId/design-history/:itemId`,
      this.orderController.getDesignHistory
    );
    this.router.get(
      `${this.path}/:orderId/design-communications/:itemId`,
      this.orderController.getDesignCommunications
    );
    this.router.put(
      `${this.path}/:orderId/branding-status`,
      this.orderController.updateBrandingStatus
    );
    // this.router.get(`${this.path}/:orderId/communications`, this.orderController.getOrderCommunications);
    // this.router.post(`${this.path}/:orderId/communication`, this.orderController.addCommunication);

    this.router.put(
      `${this.path}/:orderId/address`,
      this.orderController.updateOrderAddress
    );
    this.router.get(
      `${this.path}/:orderId/address`,
      this.orderController.getOrderAddress
    );
    this.router.post(
      `${this.path}/:orderId/address`,
      this.orderController.addAddressToOrder
    );

    this.router.get(`${this.path}/dashboard/stats`, this.orderController.getDashboardStats);
    this.router.get(
      `${this.path}/dashboard/analytics`,
      this.orderController.getSalesAnalytics
    );
  }
}

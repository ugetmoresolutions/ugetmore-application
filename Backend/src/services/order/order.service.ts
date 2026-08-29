import { Inject, Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { AuthRepository } from "@/repositories/auth/auth.repository";
import { CartRepository } from "@/repositories/cart/cart.repository";
import { OrderRepository } from "@/repositories/order/order.repository";
import {
  Address,
  IBrandedArtwork,
  IDesignCommunication,
  IOrder,
  OrderStatus,
  PaymentStatus,
} from "@/types/order/order.types";
import { ICartItem } from "@/types/cart/cart.interface";
import {
  IOrderService,
  ORDER_SERVICE_TOKEN,
} from "@/interfaces/order/order.service.intreface";
import { IProduct } from "@/types/product/product.types";
import { OrderNotificationService } from "./orderNotification.service";
import {
  IOrderNotificationService,
  ORDER_NOTIFICATION_SERVICE_TOKEN,
} from "@/interfaces/order/order.noification.service.interface";

@Service({ id: ORDER_SERVICE_TOKEN })
export class OrderService implements IOrderService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly cartRepository: CartRepository,
    private readonly orderRepository: OrderRepository,
    @Inject(ORDER_NOTIFICATION_SERVICE_TOKEN)
    private readonly orderNotificationService: IOrderNotificationService
  ) {}

  public async getAllOrders(): Promise<IOrder[]> {
    try {
      return await this.orderRepository.getAllOrders();
    } catch (error) {
      throw new HttpException(
        500,
        `Failed to get all orders: ${error.message}`
      );
    }
  }
  public async getUsersWithOrderDetails(): Promise<
    Array<{
      id: number;
      email: string;
      fullName: string;
      phone: string;
      role: "client" | "admin";
      address?: string[];
      businessName?: string;
      businessType?: string;
      vatNumber?: string;
      createdAt: Date;
      updatedAt: Date;
      activityStatus: "active" | "inactive";
      totalOrders: number;
      lastOrderDate: Date | null;
      totalAmountSpent: number;
    }>
  > {
    try {
      return await this.orderRepository.getUsersWithOrderDetails();
    } catch (error) {
      throw new HttpException(
        500,
        `Failed to get users with order details: ${error.message}`
      );
    }
  }
  public async getUserAnalytics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newCustomersThisMonth: number;
    averageOrderValue: number;
    topSpenders: Array<{
      userId: number;
      fullName: string;
      email: string;
      totalSpent: number;
      orderCount: number;
    }>;
  }> {
    try {
      return await this.orderRepository.getUserAnalytics();
    } catch (error) {
      throw new HttpException(
        500,
        `Failed to get user analytics: ${error.message}`
      );
    }
  }

  public async addMockupToOrder(
    orderId: number,
    itemId: string, // Changed from productId (number) to itemId (string)
    mockupData: {
      url: string;
      notes?: string;
      adminId: number;
    }
  ): Promise<IOrder> {
    try {
      // Get the order first to get user info
      const order = await this.getOrderById(orderId);

      // Add the mockup
      const updatedOrder = await this.orderRepository.addMockupToOrder(
        orderId,
        itemId,
        mockupData
      );

      // Get admin info for notification
      let adminName: string | undefined;
      if (mockupData.adminId) {
        const admin = await this.authRepository.findUserById(
          mockupData.adminId
        );
        adminName = admin?.fullName;
      }

      // Send notification to the user
      await this.orderNotificationService.createMockupAddedNotification(
        order.userId,
        orderId,
        itemId,
        adminName
      );


      // Send notification to all admins
    await this.orderNotificationService.createAdminMockupAddedNotification(
      orderId,
      itemId,
      mockupData.adminId,
      adminName
    );

      return updatedOrder;
    } catch (error) {
      throw new HttpException(
        500,
        `Failed to add mockup to order: ${error.message}`
      );
    }
  }

  public async getDesignHistory(
    orderId: number,
    itemId: string
  ): Promise<IBrandedArtwork[]> {
    try {
      return await this.orderRepository.getDesignHistory(orderId, itemId);
    } catch (error) {
      throw new HttpException(
        500,
        `Failed to get design history: ${error.message}`
      );
    }
  }

  public async updateBrandingStatus(
    orderId: number,
    itemId: string, // Changed from productId (number) to itemId (string)
    statusData: {
      isApproved: boolean;
      notes?: string;
      userId: number;
      isAdmin: boolean;
    }
  ): Promise<IOrder> {
    try {
      const order = await this.getOrderById(orderId);

      // Update the branding status
      const updatedOrder = await this.orderRepository.updateBrandingStatus(
        orderId,
        itemId,
        statusData
      );

      // Get admin info for notification if it's an admin action
      let adminName: string | undefined;
      if (statusData.isAdmin && statusData.userId) {
        const admin = await this.authRepository.findUserById(statusData.userId);
        adminName = admin?.fullName;
      }

      // Send notification to the user about the status update
      await this.orderNotificationService.createMockupStatusNotification(
        order.userId,
        orderId,
        itemId,
        statusData.isApproved,
        adminName,
        statusData.notes
      );

      // If it's a user action (not admin), notify admins
    if (!statusData.isAdmin) {
      await this.orderNotificationService.createAdminMockupStatusNotification(
        orderId,
        itemId,
        statusData.isApproved,
        statusData.userId,
        statusData.notes
      );
    }

      return updatedOrder;
    } catch (error) {
      throw new HttpException(
        500,
        `Failed to update branding status: ${error.message}`
      );
    }
  }

  public async getDesignCommunications(
    orderId: number,
    itemId: string
  ): Promise<IDesignCommunication[]> {
    try {
      return await this.orderRepository.getDesignCommunications(
        orderId,
        itemId
      );
    } catch (error) {
      throw new HttpException(
        500,
        `Failed to get design communications: ${error.message}`
      );
    }
  }

  public async updateOrderStatus(
  orderId: number,
  status: OrderStatus,
  userId?: number
): Promise<IOrder> {
  try {
    if (!orderId || orderId <= 0) {
      throw new HttpException(400, "Valid order ID is required");
    }

    if (!Object.values(OrderStatus).includes(status)) {
      throw new HttpException(400, "Invalid order status");
    }

    const existingOrder = await this.getOrderById(orderId, userId);

    // ✅ Check for approved branding artwork ONLY if order has branded items
    const hasBrandedItems = existingOrder.items.some(item => item.isBranded);
    
    if (hasBrandedItems) {
      let hasApprovedBranding = false;

      for (const item of existingOrder.items) {
        if (item.isBranded) {
          const artworks = await this.getDesignHistory(orderId, item.id);
          if (artworks.some((art) => art.isApproved)) {
            hasApprovedBranding = true;
            break; // One approved artwork is enough
          }
        }
      }

      if (!hasApprovedBranding) {
        throw new HttpException(
          400,
          "Cannot update order status: No approved branding artwork found for any branded item"
        );
      }
    }

    this.validateStatusTransition(existingOrder.status, status);

    const updatedOrder = await this.orderRepository.updateOrderStatus(
      orderId,
      status
    );

    await this.orderNotificationService.createOrderStatusNotification(
      updatedOrder.userId,
      orderId,
      status
    );

    // Send notification to admins
    await this.orderNotificationService.createAdminOrderStatusNotification(
      orderId,
      status,
      userId
    );

    return updatedOrder;
  } catch (error) {
    if (error instanceof HttpException) throw error;
    throw new HttpException(
      500,
      `Failed to update order status: ${error.message}`
    );
  }
}

  public async createOrderFromCart(
    userId: number,
    paymentReference?: string
  ): Promise<IOrder> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        throw new HttpException(404, "User not found");
      }

      const cart = await this.cartRepository.getUserCart(userId);
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new HttpException(400, "Cart is empty");
      }

      this.validateOrderItems(cart.items);

      const order = await this.orderRepository.createOrder(userId, {
        total: cart.totalPrice,
        items: cart.items,
        paymentReference,
      });

      await this.cartRepository.clearUserCart(userId);

      return order;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to create order from cart: ${error.message}`
      );
    }
  }

  public async getDashboardStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    totalRefunds: number;
  }> {
    try {
      return await this.orderRepository.getDashboardStats();
    } catch (error) {
      throw new HttpException(
        500,
        `Failed to get dashboard stats: ${error.message}`
      );
    }
  }

  // In your OrderService interface
public async getSalesAnalytics(timeRange?: {
  startDate?: Date;
  endDate?: Date;
  timeframe?: "Week" | "Month" | "Year"; // Add timeframe parameter
}): Promise<{
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueTrend: number;
  orderTrend: number;
  timeSeriesData: Array<{ // Add time series data for charts
    period: string;
    sales: number;
    orders: number;
  }>;
}> {
  try {
    return await this.orderRepository.getSalesAnalytics(timeRange);
  } catch (error) {
    throw new HttpException(
      500,
      `Failed to get sales analytics: ${error.message}`
    );
  }
}

  public async deleteAllOrders(): Promise<void> {
    try {
      await this.orderRepository.deleteAllOrders();
    } catch (error) {
      throw new HttpException(
        500,
        `Failed to delete all orders: ${error.message}`
      );
    }
  }

  public async createOrder(
    userId: number,
    orderData: {
      total: number;
      items: ICartItem[];
      paymentReference?: string;
    }
  ): Promise<IOrder> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        throw new HttpException(404, "User not found");
      }

      if (!orderData.items || orderData.items.length === 0) {
        throw new HttpException(400, "Order items are required");
      }

      if (orderData.total <= 0) {
        throw new HttpException(400, "Order total must be greater than 0");
      }

      return await this.orderRepository.createOrder(userId, orderData);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Failed to create order: ${error.message}`);
    }
  }

  public async getOrderById(orderId: number, userId?: number): Promise<IOrder> {
    try {
      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }

      const order = await this.orderRepository.getOrderById(orderId);
      if (!order) {
        throw new HttpException(404, "Order not found");
      }

      if (userId && order.userId !== userId) {
        throw new HttpException(403, "Access denied to this order");
      }

      return order;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Failed to get order: ${error.message}`);
    }
  }

  public async getUserOrders(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<IOrder[]> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      if (limit <= 0 || limit > 100) {
        throw new HttpException(400, "Limit must be between 1 and 100");
      }

      if (offset < 0) {
        throw new HttpException(400, "Offset cannot be negative");
      }

      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        throw new HttpException(404, "User not found");
      }

      return await this.orderRepository.getUserOrders(userId, limit, offset);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to get user orders: ${error.message}`
      );
    }
  }

  

  public async updatePaymentStatus(
    orderId: number,
    paymentStatus: PaymentStatus,
    paymentReference?: string
  ): Promise<IOrder> {
    try {
      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }

      if (!Object.values(PaymentStatus).includes(paymentStatus)) {
        throw new HttpException(400, "Invalid payment status");
      }

      const existingOrder = await this.getOrderById(orderId);
      this.validatePaymentStatusTransition(
        existingOrder.paymentStatus,
        paymentStatus
      );

      return await this.orderRepository.updatePaymentStatus(
        orderId,
        paymentStatus,
        paymentReference
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to update payment status: ${error.message}`
      );
    }
  }

  public async getOrderByPaymentReference(
    paymentReference: string
  ): Promise<IOrder> {
    try {
      if (!paymentReference || paymentReference.trim().length === 0) {
        throw new HttpException(400, "Valid payment reference is required");
      }

      const order = await this.orderRepository.getOrderByPaymentReference(
        paymentReference
      );
      if (!order) {
        throw new HttpException(
          404,
          "Order not found with this payment reference"
        );
      }

      return order;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to get order by payment reference: ${error.message}`
      );
    }
  }

  public async getOrdersByStatus(
    status: OrderStatus,
    limit: number = 50,
    offset: number = 0
  ): Promise<IOrder[]> {
    try {
      if (!Object.values(OrderStatus).includes(status)) {
        throw new HttpException(400, "Invalid order status");
      }

      if (limit <= 0 || limit > 100) {
        throw new HttpException(400, "Limit must be between 1 and 100");
      }

      if (offset < 0) {
        throw new HttpException(400, "Offset cannot be negative");
      }

      return await this.orderRepository.getOrdersByStatus(
        status,
        limit,
        offset
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to get orders by status: ${error.message}`
      );
    }
  }

  public async getTotalOrdersCount(userId?: number): Promise<number> {
    try {
      if (userId && userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      if (userId) {
        const user = await this.authRepository.findUserById(userId);
        if (!user) {
          throw new HttpException(404, "User not found");
        }
      }

      return await this.orderRepository.getTotalOrdersCount(userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to get orders count: ${error.message}`
      );
    }
  }

  public async cancelOrder(orderId: number, userId?: number): Promise<IOrder> {
    try {
      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }

      const existingOrder = await this.getOrderById(orderId, userId);

      if (existingOrder.status !== OrderStatus.PENDING) {
        throw new HttpException(400, "Only pending orders can be cancelled");
      }

      return await this.orderRepository.cancelOrder(orderId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Failed to cancel order: ${error.message}`);
    }
  }

  public async getOrderTotal(orderId: number): Promise<number> {
    try {
      const order = await this.getOrderById(orderId);
      return order.total;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to get order total: ${error.message}`
      );
    }
  }

  public async getOrderItemsCount(orderId: number): Promise<number> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order.items) {
        return 0;
      }

      return order.items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to get order items count: ${error.message}`
      );
    }
  }

  private validateOrderItems(items: ICartItem[]): void {
    if (!Array.isArray(items)) {
      throw new HttpException(400, "Items must be an array");
    }

    for (const item of items) {
      if (!item.id || item.id.trim().length === 0) {
        throw new HttpException(400, "Valid item ID is required");
      }

      if (!item.quantity || item.quantity <= 0) {
        throw new HttpException(400, "Quantity must be greater than 0");
      }

      if (item.price === undefined || item.price < 0) {
        throw new HttpException(400, "Valid price is required");
      }
    }

    const itemIds = items.map((item) => item.id);
    const uniqueItemIds = new Set(itemIds);
    if (itemIds.length !== uniqueItemIds.size) {
      throw new HttpException(400, "Duplicate items found in order");
    }
  }

  private validateOrderTotal(items: ICartItem[], expectedTotal: number): void {
    const calculatedTotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const difference = Math.abs(calculatedTotal - expectedTotal);
    if (difference > 0.01) {
      throw new HttpException(
        400,
        "Order total does not match calculated total"
      );
    }
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new HttpException(
        400,
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  private validatePaymentStatusTransition(
    currentStatus: PaymentStatus,
    newStatus: PaymentStatus
  ): void {
    const validTransitions = {
      [PaymentStatus.PENDING]: [
        PaymentStatus.PAID,
        PaymentStatus.FAILED,
        PaymentStatus.DECLINED,
        PaymentStatus.CANCELLED,
        PaymentStatus.PROCESSING,
      ],
      [PaymentStatus.PROCESSING]: [
        PaymentStatus.PAID,
        PaymentStatus.FAILED,
        PaymentStatus.DECLINED,
        PaymentStatus.CANCELLED,
      ],
      [PaymentStatus.PAID]: [PaymentStatus.REFUNDED],
      [PaymentStatus.FAILED]: [
        PaymentStatus.PAID,
        PaymentStatus.CANCELLED,
        PaymentStatus.PROCESSING,
      ],
      [PaymentStatus.DECLINED]: [
        PaymentStatus.PAID,
        PaymentStatus.CANCELLED,
        PaymentStatus.PROCESSING,
      ],
      [PaymentStatus.REFUNDED]: [],
      [PaymentStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new HttpException(
        400,
        `Cannot transition payment status from ${currentStatus} to ${newStatus}`
      );
    }
  }

  public async getTop5Products(): Promise<
    Array<{
      product: IProduct;
      orderCount: number;
      totalQuantity: number;
      brandingInfo: {
        isBranded: boolean;
        brandingMethods?: string[];
        avgBrandingCost?: number;
      };
    }>
  > {
    try {
      return await this.orderRepository.getTop5Products();
    } catch (error) {
      throw new HttpException(
        500,
        `Failed to get top 5 products: ${error.message}`
      );
    }
  }
}

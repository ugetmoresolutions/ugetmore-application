import { IBrandedArtwork, IDesignCommunication, IOrder, OrderStatus, PaymentStatus } from "@/types/order/order.types";
import { ICartItem } from "@/types/cart/cart.interface";
import { Token } from "typedi";
import { IProduct } from "@/types/product/product.types";



export interface IOrderService {
  createOrderFromCart(userId: number, paymentReference?: string): Promise<IOrder>;
   getUsersWithOrderDetails(): Promise<Array<{
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
  }>>
  createOrder(userId: number, orderData: {
    total: number;
    items: ICartItem[];
    paymentReference?: string;
  }): Promise<IOrder>;
  
  getOrderById(orderId: number, userId?: number): Promise<IOrder>;
  getUserAnalytics(): Promise<{
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
    }>
  }> 
  getUserOrders(userId: number, limit?: number, offset?: number): Promise<IOrder[]>;
  
  updateOrderStatus(orderId: number, status: OrderStatus, userId?: number): Promise<IOrder>;
  
  updatePaymentStatus(orderId: number, paymentStatus: PaymentStatus, paymentReference?: string): Promise<IOrder>;
  
  getOrderByPaymentReference(paymentReference: string): Promise<IOrder>;
  
  getOrdersByStatus(status: OrderStatus, limit?: number, offset?: number): Promise<IOrder[]>;
  
  getTotalOrdersCount(userId?: number): Promise<number>;
  deleteAllOrders(): Promise<void>
  cancelOrder(orderId: number, userId?: number): Promise<IOrder>;
  
  getOrderTotal(orderId: number): Promise<number>;
  getAllOrders(): Promise<IOrder[]>
  getOrderItemsCount(orderId: number): Promise<number>;
  getTop5Products(): Promise<Array<{ 
    product: IProduct; 
    orderCount: number; 
    totalQuantity: number;
    brandingInfo: {
      isBranded: boolean;
      brandingMethods?: string[];
      avgBrandingCost?: number;
    };
  }>>

  addMockupToOrder(
    orderId: number, 
    itemId: string, 
    mockupData: {
      url: string;
      notes?: string;
      adminId: number;
    }
  ): Promise<IOrder>;
  
  getDesignHistory(orderId: number, itemId: string): Promise<IBrandedArtwork[]>;
  
  updateBrandingStatus(
    orderId: number, 
    itemId: string, 
    statusData: {
      isApproved: boolean;
      notes?: string;
      userId: number;
      isAdmin: boolean;
    }
  ): Promise<IOrder>;

  getDesignCommunications(orderId: number, itemId: string): Promise<IDesignCommunication[]>;

  

  
  
}

export const ORDER_SERVICE_TOKEN = new Token<IOrderService>("IOrderService");
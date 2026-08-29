import { IDesignCommunication, IOrder, OrderStatus, PaymentStatus } from "@/types/order/order.types";
import { ICartItem } from "@/types/cart/cart.interface";
import { IProduct } from "@/types/product/product.types";
import { Address } from "@/models/user/user.model";

export interface IOrderRepository {
  createOrder(userId: number, orderData: {
    total: number;
    items: ICartItem[];
    paymentReference?: string;
  }): Promise<IOrder>;
  
  getOrderById(orderId: number): Promise<IOrder | null>;
  
  getUserOrders(userId: number, limit?: number, offset?: number): Promise<IOrder[]>;
  
  updateOrderStatus(orderId: number, status: OrderStatus): Promise<IOrder>;
  
  updatePaymentStatus(orderId: number, paymentStatus: PaymentStatus, paymentReference?: string): Promise<IOrder>;
  
  getOrderByPaymentReference(paymentReference: string): Promise<IOrder | null>;
  
  getOrdersByStatus(status: OrderStatus, limit?: number, offset?: number): Promise<IOrder[]>;
  getTotalOrdersCount(userId?: number): Promise<number>;
  getAllOrders(): Promise<IOrder[]>;
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

    getDesignCommunications(orderId: number, itemId: string): Promise<IDesignCommunication[]>;
  
  cancelOrder(orderId: number): Promise<IOrder>;
  deleteAllOrders(): Promise<void>;
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
    }>;
  }>;

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
  }>>;
}
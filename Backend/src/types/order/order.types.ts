import { ICartItem } from "../cart/cart.interface";

export enum OrderStatus {
  PENDING = "pending",
  SHIPPED = "shipped", 
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
  DECLINED = "declined",
  CANCELLED = "cancelled",
  PROCESSING = "processing"
}

export type PaymentMethod = "bank";
export type DeliveryOption = "delivery" | "collection";


export interface IUserInfo {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  businessName?: string;
  businessType?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

// types/order/order.types.ts
export interface IBrandedArtwork {
  url: string;
  notes?: string;
  isApproved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrder {
  id: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  status: OrderStatus;
  address: string;
  items: ICartItem[];
  userId: number;
  user?: IUserInfo;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDesignCommunication {
  id?: string;
  type: 'mockup_submission' | 'customer_feedback' | 'revision_request' | 'approval';
  message: string;
  sender: 'admin' | 'customer';
  attachments?: Array<{
    url: string;
    fileName: string;
    fileType: string;
  }>;
  createdAt?: Date;
  isRead?: boolean;
}


export interface PaginatedOrders {
  orders: IOrder[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
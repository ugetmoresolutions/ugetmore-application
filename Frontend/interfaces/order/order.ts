import { ICartItem } from "../cart/cart";
import { IProduct } from "../product/product";

export type OrderStatus = "pending" | "shipped" | "completed" | "cancelled";

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
  DECLINED = "declined",
  CANCELLED = "cancelled",
  PROCESSING = "processing",
}

export type PaymentMethod = "bank";
export type DeliveryOption = "delivery" | "collection";

// Bulk Order Interfaces
export interface BulkProduct {
  id: string;
  name: string;
  productName?: string;
  price: number;
  quantity: number;
  category?: string;
  brand?: string;
  image?: string;
  product?: IProduct;
}

export interface StudentInfo {
  studentNumber: string;
  studentName: string;
  grade: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: any;
  category: string;
  brand: string;
  image: string;
  isBranded?: boolean;
  isBulk?: boolean;
  product?: any;
  brandingConfig: any;
  
  // Bulk order properties
  bulkProducts?: BulkProduct[];
  bulkTotalItems?: number;
  bulkTotalPrice?: number;
  collectionId?: string;
  collectionName?: string;
  studentInfo?: StudentInfo;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  shipTo: string;
  customerName?: string;
  customerEmail?: string;
  phoneNumber?: string;
  userId?: number | number;
  address: string;
  items: OrderItem[];
  itemCount: number;
  total: number;
  savings?: number;
  deliveryDate?: string;
  trackOrder: boolean;
   businessName?: string;
  businessType?: string;
  vatNumber?: string;
  
  // Bulk order flag
  isBulkOrder?: boolean;
}

export interface PriceInfo {
  totalRevenue: number;
  avgPricePerUnit: number;
  minPrice: number;
  maxPrice: number;
}

export interface TopProduct {
  product: IProduct;
  orderCount: number;
  totalQuantity: number;
  priceInfo: PriceInfo;
  brandingInfo: BrandingInfo;
}

export interface BrandingInfo {
  isBranded: boolean;
  brandingMethods?: string[];
  avgBrandingCost?: number;
}

/**
 * Branding Communication
 */

// New models for mockup management
export interface DesignRevision {
  id: string;
  orderId: string;
  productId: string;
  adminId: string;
  mockupImages: Array<{
    url: string;
    publicId: string;
  }>;
  adminNotes: string;
  status: "pending_approval" | "approved" | "rejected" | "revision_requested";
  customerFeedback?: string;
  revisionNotes?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface DesignCommunication {
  id: string;
  orderId: string;
  productId: string;
  userId: string;
  adminId: string;
  type:
    | "mockup_submission"
    | "customer_feedback"
    | "revision_request"
    | "approval";
  message: string;
  attachments: Array<{
    id: string;
    url: string;
    fileName: string;
    fileType: string;
  }>;
  createdAt: string;
  isRead: boolean;
}

// interfaces/order/order.ts
export interface IBrandedArtwork {
  id?: string;
  url: string;
  notes?: string;
  customerFeedback?: string
  attachments?: []
  isApproved: boolean;
  createdAt?: string ;
  updatedAt?: string ;
}

export interface IDesignCommunication {
  id?: string;
  type:
    | "mockup_submission"
    | "customer_feedback"
    | "revision_request"
    | "approval";
  message: string;
  sender: "admin" | "customer";
  attachments?: Array<{
    url: string;
    fileName: string;
    fileType: string;
  }>;
  createdAt?: Date;
  isRead?: boolean;
}

// Bulk Order specific interfaces for API responses
export interface BulkOrderApiResponse {
  id: number;
  total: number;
  paymentStatus: string;
  paymentReference: string;
  status: OrderStatus;
  address: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user: {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    businessName: string | null;
  };
  items: Array<{
    id: string;
    addedAt: string;
    isBulk: boolean;
    bulkProducts: BulkProduct[];
    bulkTotalItems: number;
    bulkTotalPrice: number;
    collectionId: string;
    collectionName: string;
    price: number;
    quantity: number;
    studentInfo: StudentInfo;
    product: {
      fullCode: string;
      productName: string;
      price: number;
      stock: number;
      images: Array<any>;
    };
  }>;
}
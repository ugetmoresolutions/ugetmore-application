import { IOrder, OrderStatus, PaymentStatus, PaymentMethod, DeliveryOption } from "@/types/order/order.types";
import { Token } from "typedi";


export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  paymentUrl: string;
  isProduction: boolean;
}

export interface PaymentRequest {
  userId: number;
}

export interface PaymentResponse {
  paymentUrl: string;
  paymentReference: string;
  amount: number;
  merchantId: string;
}

export interface PaymentStatusResponse {
  status: PaymentStatus;
  orderExists: boolean;
  order?: IOrder;
  verified: boolean;
}

export interface ITNHandleResponse {
  success: boolean;
  order?: IOrder;
  message: string;
}

export interface IUnifiedPayFastService {
  generatePaymentFromCart(userId: number): Promise<PaymentResponse>;
  
  handlePayFastITN(itnData: any): Promise<ITNHandleResponse>;
  
  
  createOrderFromPayment(paymentReference: string): Promise<IOrder | null>;
  
  validatePayFastConfig(): void;
}

export const UNIFIED_PAYFAST_SERVICE_TOKEN = new Token<IUnifiedPayFastService>("IUnifiedPayFastService");

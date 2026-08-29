import { CustomResponse } from "@/interfaces/product/response";
import { baseUrl } from "../url";
import { DELETE, GET, POST, PUT, POSTFILES } from "../lib/rest-api-client";
import {
  IBrandedArtwork,
  IDesignCommunication,
  OrderStatus,
  TopProduct,
} from "@/interfaces/order/order";
import { IUserAnalytics, IUserProfile } from "@/interfaces/analytics/analytics";

const OrderbaseURL = `${baseUrl}/orders`;

export const ORDER_API = {
  GET_USER_ORDERS: async (userId: number): Promise<CustomResponse<any>> => {
    try {
      const response = await GET(`${OrderbaseURL}/user/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  GET_BEST_SELLING: async (): Promise<CustomResponse<TopProduct[]>> => {
    try {
      const response = await GET(
        `${OrderbaseURL}/bestselling/getBestSellingProducts`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

 GET_DASHBOARD_STATS: async (): Promise<CustomResponse<{
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    totalRefunds: number;
  }>> => {
    try {
      const response = await GET(`${OrderbaseURL}/dashboard/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add to your ORDER_API
GET_SALES_ANALYTICS: async (params?: {
  startDate?: string;
  endDate?: string;
  timeframe?: string;
}): Promise<CustomResponse<{
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueTrend: number;
  orderTrend: number;
  timeSeriesData: Array<{
    period: string;
    sales: number;
    orders: number;
  }>;
}>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.timeframe) queryParams.append('timeframe', params.timeframe);
    
    const response = await GET(`${OrderbaseURL}/dashboard/analytics?${queryParams.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
},

  GET_ADMIN_USER_ANALYTICS: async (): Promise<
    CustomResponse<IUserAnalytics>
  > => {
    try {
      const response = await GET(`${OrderbaseURL}/admin/userAnalytics`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  GET_ADMIN_USERPROFILE_ANALYTICS: async (): Promise<
    CustomResponse<IUserProfile[]>
  > => {
    try {
      const response = await GET(
        `${OrderbaseURL}/admin/getUsersWithOrderDetails`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
  GET_ALL_ORDERS: async (): Promise<CustomResponse<any>> => {
    try {
      const response = await GET(`${OrderbaseURL}/all/getAllOrders`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  UPDATE_ORDER_STATUS: async (
    orderId: number,
    status: OrderStatus
  ): Promise<CustomResponse<any>> => {
    try {
      const response = await PUT(`${OrderbaseURL}/${orderId}/status`, {
        status,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // BRANDED ARTWORK ENDPOINTS
  ADD_MOCKUP_TO_ORDER: async (
    orderId: number,
    data: {
      itemId: string;
      url: string;
      notes?: string;
      adminId: number;
    }
  ): Promise<CustomResponse<any>> => {
    try {
      const response = await POST(`${OrderbaseURL}/${orderId}/mockup`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  UPLOAD_FILE: async (formData: FormData) => {
    try {
      const response = await POSTFILES(
        `${OrderbaseURL}/mockup/uploadMockup`,
        formData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  GET_DESIGN_HISTORY: async (
    orderId: number,
    itemId: string
  ): Promise<CustomResponse<IBrandedArtwork[]>> => {
    try {
      const response = await GET(
        `${OrderbaseURL}/${orderId}/design-history/${itemId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  GET_DESIGN_COMMUNICATIONS: async (
    orderId: number,
    itemId: string
  ): Promise<CustomResponse<IDesignCommunication[]>> => {
    try {
      const response = await GET(
        `${OrderbaseURL}/${orderId}/design-communications/${itemId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  UPDATE_BRANDING_STATUS: async (
    orderId: number,
    data: {
      itemId: string;
      isApproved: boolean;
      notes?: string;
      userId: number;
      isAdmin: boolean;
    }
  ): Promise<CustomResponse<any>> => {
    try {
      const response = await PUT(
        `${OrderbaseURL}/${orderId}/branding-status`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  GET_ORDER_COMMUNICATIONS: async (
    orderId: number
  ): Promise<CustomResponse<IDesignCommunication[]>> => {
    try {
      const response = await GET(`${OrderbaseURL}/${orderId}/communications`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  ADD_COMMUNICATION: async (
    orderId: number,
    data: {
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
      userId: number;
    }
  ): Promise<CustomResponse<any>> => {
    try {
      const response = await POST(
        `${OrderbaseURL}/${orderId}/communication`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Optional: Get single order with details
  GET_ORDER_BY_ID: async (
    orderId: number,
    userId?: number
  ): Promise<CustomResponse<any>> => {
    try {
      const url = userId
        ? `${OrderbaseURL}/${orderId}?userId=${userId}`
        : `${OrderbaseURL}/${orderId}`;
      const response = await GET(url);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

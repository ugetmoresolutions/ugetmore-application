import { CustomResponse } from "@/interfaces/product/response";
import { POST } from "../lib/rest-api-client";
import { baseUrl } from "../url";

const PaymentbaseURL = `${baseUrl}/payfast`;


export const PAYMENT_API = {
    GENERATE_PAYMENT: async (userId: number, couponCode?: string): Promise<CustomResponse<{paymentUrl: string}>> => {
    try {
      const response = await POST(`${PaymentbaseURL}/generate-user-payment`, {
        userId,
        couponCode // ADD THIS
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
      

};
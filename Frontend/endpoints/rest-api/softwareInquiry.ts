import { CustomResponse } from "@/interfaces/product/response";
import { GET, POST, PUT, DELETE } from "../lib/rest-api-client";
import { baseUrl } from "../url";
import { ISoftwareInquiry, ICreateSoftwareInquiry } from "@/interfaces/softwareInquiry/softwareInquiry";

const SoftwareInquiryBaseURL = `${baseUrl}/software-inquiry`;

export const SOFTWARE_INQUIRY_API = {
  // CREATE new software inquiry
  CREATE_INQUIRY: async (inquiryData: ICreateSoftwareInquiry): Promise<CustomResponse<ISoftwareInquiry>> => {
    try {
      const response = await POST(`${SoftwareInquiryBaseURL}`, inquiryData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET inquiry by ID (Admin)
  GET_INQUIRY_BY_ID: async (id: number): Promise<CustomResponse<ISoftwareInquiry>> => {
    try {
      const response = await GET(`${SoftwareInquiryBaseURL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET all inquiries (Admin)
  GET_ALL_INQUIRIES: async (): Promise<CustomResponse<ISoftwareInquiry[]>> => {
    try {
      const response = await GET(`${SoftwareInquiryBaseURL}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET inquiries by status (Admin)
  GET_INQUIRIES_BY_STATUS: async (status: string): Promise<CustomResponse<ISoftwareInquiry[]>> => {
    try {
      const response = await GET(`${SoftwareInquiryBaseURL}/status/${status}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE inquiry status (Admin)
  UPDATE_INQUIRY_STATUS: async (id: number, status: string, reviewedBy?: string): Promise<CustomResponse<ISoftwareInquiry>> => {
    try {
      const response = await PUT(`${SoftwareInquiryBaseURL}/${id}/status`, { status, reviewedBy });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE inquiry (Admin)
  DELETE_INQUIRY: async (id: number): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${SoftwareInquiryBaseURL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET inquiry statistics (Admin)
  GET_INQUIRY_STATS: async (): Promise<CustomResponse<{ total: number; byStatus: Record<string, number>; byServiceType: Record<string, number> }>> => {
    try {
      const response = await GET(`${SoftwareInquiryBaseURL}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
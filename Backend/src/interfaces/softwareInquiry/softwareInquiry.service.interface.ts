
import { ICreateSoftwareInquiry, ISoftwareInquiry } from "@/types/softwareInquiry/softwareInquiry.type";
import { Token } from "typedi";

export interface ISoftwareInquiryService {
  createInquiry(inquiryData: ICreateSoftwareInquiry): Promise<ISoftwareInquiry>;
  getInquiryById(id: number): Promise<ISoftwareInquiry | null>;
  getAllInquiries(): Promise<ISoftwareInquiry[]>;
  getInquiriesByStatus(status: string): Promise<ISoftwareInquiry[]>;
  updateInquiryStatus(id: number, status: string, reviewedBy?: string): Promise<ISoftwareInquiry>;
  deleteInquiry(id: number): Promise<boolean>;
  getInquiryStats(): Promise<{ total: number; byStatus: Record<string, number>; byServiceType: Record<string, number> }>;
}

export const SOFTWARE_INQUIRY_SERVICE_TOKEN = new Token<ISoftwareInquiryService>("ISoftwareInquiryService");
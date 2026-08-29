import { ICreateSoftwareInquiry, ISoftwareInquiry } from "@/types/softwareInquiry/softwareInquiry.type";


export interface ISoftwareInquiryRepository {
  create(inquiryData: ICreateSoftwareInquiry): Promise<ISoftwareInquiry>;
  getById(id: number): Promise<ISoftwareInquiry | null>;
  getAll(): Promise<ISoftwareInquiry[]>;
  getByStatus(status: string): Promise<ISoftwareInquiry[]>;
  updateStatus(id: number, status: string, reviewedBy?: string): Promise<ISoftwareInquiry>;
  delete(id: number): Promise<boolean>;
  getStats(): Promise<{ total: number; byStatus: Record<string, number>; byServiceType: Record<string, number> }>;
}
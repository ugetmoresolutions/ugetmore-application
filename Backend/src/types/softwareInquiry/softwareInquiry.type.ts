export interface ISoftwareInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  serviceType: string;
  projectDetails: string;
  status: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface ICreateSoftwareInquiry {
  name: string;
  email: string;
  phone: string;
  company: string;
  serviceType: string;
  projectDetails: string;
}
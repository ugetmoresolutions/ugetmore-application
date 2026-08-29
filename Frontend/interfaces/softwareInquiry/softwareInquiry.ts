export interface ISoftwareInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  serviceType: string;
  projectDetails: string;
  status: string;
  submittedAt: string;
  reviewedAt: string;
  reviewedBy: string | null;
  
  readonly createdAt?: Date | string;
  readonly updatedAt?: Date | string;
}

export interface ICreateSoftwareInquiry {
  name: string;
  email: string;
  phone: string;
  company: string;
  serviceType: string;
  projectDetails: string;
}
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";

import { 
  softwareInquiryNotificationTemplate,
  sendMail 
} from "@/utils/email";
import { ISoftwareInquiryService, SOFTWARE_INQUIRY_SERVICE_TOKEN } from "@/interfaces/softwareInquiry/softwareInquiry.service.interface";
import { SoftwareInquiryRepository } from "@/repositories/softwareInquiry/softwareInquiry.repository";
import { ICreateSoftwareInquiry, ISoftwareInquiry } from "@/types/softwareInquiry/softwareInquiry.type";

@Service({ id: SOFTWARE_INQUIRY_SERVICE_TOKEN })
export class SoftwareInquiryService implements ISoftwareInquiryService {
  constructor(private softwareInquiryRepository: SoftwareInquiryRepository) {}

  public async createInquiry(inquiryData: ICreateSoftwareInquiry): Promise<ISoftwareInquiry> {
    try {
      this.validateInquiryData(inquiryData);

      const inquiry = await this.softwareInquiryRepository.create(inquiryData);

      // Send notification emails
      try {
        await this.sendNotificationEmails(inquiry);
      } catch (emailError) {
        console.error('Failed to send notification emails:', emailError);
        // Don't throw error - inquiry should still be created
      }

      return inquiry;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to create inquiry: ${error.message}`);
    }
  }

  public async getInquiryById(id: number): Promise<ISoftwareInquiry | null> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid ID is required");
      }

      return await this.softwareInquiryRepository.getById(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get inquiry: ${error.message}`);
    }
  }

  public async getAllInquiries(): Promise<ISoftwareInquiry[]> {
    try {
      return await this.softwareInquiryRepository.getAll();
    } catch (error: any) {
      throw new HttpException(500, `Failed to get inquiries: ${error.message}`);
    }
  }

  public async getInquiriesByStatus(status: string): Promise<ISoftwareInquiry[]> {
    try {
      const validStatuses = ['new', 'in-review', 'contacted', 'archived'];
      if (!validStatuses.includes(status)) {
        throw new HttpException(400, "Invalid status value. Must be one of: " + validStatuses.join(', '));
      }

      return await this.softwareInquiryRepository.getByStatus(status);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get inquiries by status: ${error.message}`);
    }
  }

  public async updateInquiryStatus(id: number, status: string, reviewedBy?: string): Promise<ISoftwareInquiry> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid ID is required");
      }

      const validStatuses = ['new', 'in-review', 'contacted', 'archived'];
      if (!validStatuses.includes(status)) {
        throw new HttpException(400, "Invalid status value. Must be one of: " + validStatuses.join(', '));
      }

      return await this.softwareInquiryRepository.updateStatus(id, status, reviewedBy);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update inquiry status: ${error.message}`);
    }
  }

  public async deleteInquiry(id: number): Promise<boolean> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid ID is required");
      }

      return await this.softwareInquiryRepository.delete(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to delete inquiry: ${error.message}`);
    }
  }

  public async getInquiryStats(): Promise<{ total: number; byStatus: Record<string, number>; byServiceType: Record<string, number> }> {
    try {
      return await this.softwareInquiryRepository.getStats();
    } catch (error: any) {
      throw new HttpException(500, `Failed to get inquiry stats: ${error.message}`);
    }
  }

  private validateInquiryData(inquiryData: ICreateSoftwareInquiry): void {
    const { name, email, phone, company, serviceType, projectDetails } = inquiryData;

    if (!name || name.trim().length < 2) {
      throw new HttpException(400, "Name must be at least 2 characters long");
    }

    if (!email || !this.isValidEmail(email)) {
      throw new HttpException(400, "Valid email address is required");
    }

    if (!phone || phone.trim().length < 5) {
      throw new HttpException(400, "Valid phone number is required");
    }

    if (!company || company.trim().length < 1) {
      throw new HttpException(400, "Company name is required");
    }

    const validServiceTypes = ['web-development', 'mobile-development', 'backend-development', 'custom-software', 'consultation'];
    if (!serviceType || !validServiceTypes.includes(serviceType)) {
      throw new HttpException(400, "Valid service type is required. Must be one of: " + validServiceTypes.join(', '));
    }

    if (!projectDetails || projectDetails.trim().length < 10) {
      throw new HttpException(400, "Project details must be at least 10 characters long");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async sendNotificationEmails(inquiry: ISoftwareInquiry): Promise<void> {
    try {
      // Send to admin
      const adminHtml = softwareInquiryNotificationTemplate(inquiry, 'admin');
      const adminSubject = `🚀 New Software Inquiry: ${inquiry.name} - ${inquiry.serviceType}`;
      const adminText = `New software inquiry received from ${inquiry.name} (${inquiry.email}) for ${inquiry.serviceType}.`;

      await sendMail('admin@ugetmo.com', adminSubject, adminText, adminHtml);

      // Send confirmation to client
      const clientHtml = softwareInquiryNotificationTemplate(inquiry, 'client');
      const clientSubject = "🎉 Thank You for Your Software Inquiry - UGetMo";
      const clientText = `Thank you for your software inquiry, ${inquiry.name}! We'll review your project and get back to you soon.`;

      await sendMail(inquiry.email, clientSubject, clientText, clientHtml);

      console.log(`✅ Notification emails sent for inquiry from ${inquiry.email}`);
    } catch (error: any) {
      console.error(`❌ Failed to send notification emails:`, error);
      throw error;
    }
  }
}
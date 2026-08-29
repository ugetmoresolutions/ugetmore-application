import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { ISoftwareInquiryRepository } from "@/interfaces/softwareInquiry/softwareInquiry.repository.interface";
import { ICreateSoftwareInquiry, ISoftwareInquiry } from "@/types/softwareInquiry/softwareInquiry.type";
import SoftwareInquiry from "@/models/softwareInquiry/SoftwareInquiry.model";


@Service()
export class SoftwareInquiryRepository implements ISoftwareInquiryRepository {
  public async create(inquiryData: ICreateSoftwareInquiry): Promise<ISoftwareInquiry> {
    try {
      const inquiry = await SoftwareInquiry.create({
        ...inquiryData,
        status: 'new',
        submittedAt: new Date(),
      });

      return inquiry.toJSON() as ISoftwareInquiry;
    } catch (error: any) {
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map((e: any) => e.message).join(', ');
        throw new HttpException(400, `Validation error: ${messages}`);
      }
      throw new HttpException(500, `Failed to create inquiry: ${error.message}`);
    }
  }

  public async getById(id: number): Promise<ISoftwareInquiry | null> {
    try {
      const inquiry = await SoftwareInquiry.findByPk(id);
      return inquiry ? (inquiry.toJSON() as ISoftwareInquiry) : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get inquiry: ${error.message}`);
    }
  }

  public async getAll(): Promise<ISoftwareInquiry[]> {
    try {
      const inquiries = await SoftwareInquiry.findAll({
        order: [["submittedAt", "DESC"]],
      });
      return inquiries.map((inquiry) => inquiry.toJSON() as ISoftwareInquiry);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get inquiries: ${error.message}`);
    }
  }

  public async getByStatus(status: string): Promise<ISoftwareInquiry[]> {
    try {
      const inquiries = await SoftwareInquiry.findAll({
        where: { status },
        order: [["submittedAt", "DESC"]],
      });
      return inquiries.map((inquiry) => inquiry.toJSON() as ISoftwareInquiry);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get inquiries by status: ${error.message}`);
    }
  }

  public async updateStatus(id: number, status: string, reviewedBy?: string): Promise<ISoftwareInquiry> {
    try {
      const updateData: any = { status };
      
      if (status !== 'new') {
        updateData.reviewedAt = new Date();
        updateData.reviewedBy = reviewedBy || 'system';
      }

      const [affectedRows] = await SoftwareInquiry.update(updateData, {
        where: { id },
      });

      if (affectedRows === 0) {
        throw new HttpException(404, "Inquiry not found");
      }

      const updatedInquiry = await SoftwareInquiry.findByPk(id);
      return updatedInquiry!.toJSON() as ISoftwareInquiry;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update inquiry status: ${error.message}`);
    }
  }

  public async delete(id: number): Promise<boolean> {
    try {
      const affectedRows = await SoftwareInquiry.destroy({
        where: { id },
      });

      if (affectedRows === 0) {
        throw new HttpException(404, "Inquiry not found");
      }

      return true;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to delete inquiry: ${error.message}`);
    }
  }

  public async getStats(): Promise<{ total: number; byStatus: Record<string, number>; byServiceType: Record<string, number> }> {
    try {
      const total = await SoftwareInquiry.count();
      
      const statusCounts = await SoftwareInquiry.findAll({
        attributes: ['status', [SoftwareInquiry.sequelize!.fn('COUNT', SoftwareInquiry.sequelize!.col('id')), 'count']],
        group: ['status'],
      });

      const serviceTypeCounts = await SoftwareInquiry.findAll({
        attributes: ['serviceType', [SoftwareInquiry.sequelize!.fn('COUNT', SoftwareInquiry.sequelize!.col('id')), 'count']],
        group: ['serviceType'],
      });

      const byStatus: Record<string, number> = {};
      statusCounts.forEach((item: any) => {
        byStatus[item.status] = parseInt(item.get('count'));
      });

      const byServiceType: Record<string, number> = {};
      serviceTypeCounts.forEach((item: any) => {
        byServiceType[item.serviceType] = parseInt(item.get('count'));
      });

      return { total, byStatus, byServiceType };
    } catch (error: any) {
      throw new HttpException(500, `Failed to get inquiry stats: ${error.message}`);
    }
  }
}
// interfaces/design/design.service.interface.ts
import { DesignRevisionAttributes } from "@/models/design/DesignRevision.model";
import { DesignCommunicationAttributes } from "@/models/design/DesignCommunication.model";
import { Token } from "typedi";

export interface IDesignService {
  // Design Revision methods
  uploadMockup(orderId: number, productId: number, adminId: number, files: Express.Multer.File[], notes: string): Promise<DesignRevisionAttributes>;
  getDesignHistory(orderId: number, productId: number): Promise<DesignRevisionAttributes[]>;
  updateDesignStatus(revisionId: string, status: DesignRevisionAttributes['status'], adminNotes?: string): Promise<DesignRevisionAttributes>;
  requestRevision(revisionId: string, customerFeedback: string, userId: number): Promise<DesignRevisionAttributes>;
  approveMockup(revisionId: string, userId: number): Promise<DesignRevisionAttributes>;
  
  // Design Communication methods
  sendMessageToCustomer(orderId: number, productId: number, adminId: number, message: string, files?: Express.Multer.File[]): Promise<DesignCommunicationAttributes>;
  getOrderCommunications(orderId: number, productId?: number): Promise<DesignCommunicationAttributes[]>;
  getCustomerUnreadCount(userId: number): Promise<number>;
  markAsRead(communicationId: string): Promise<DesignCommunicationAttributes>;
  
  // Notification methods
  notifyCustomerNewMockup(revisionId: string): Promise<void>;
  notifyAdminRevisionRequest(revisionId: string): Promise<void>;
}

export const DESIGN_SERVICE_TOKEN = new Token<IDesignService>("IDesignService");
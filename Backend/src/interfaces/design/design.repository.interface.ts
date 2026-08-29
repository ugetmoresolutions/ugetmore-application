// interfaces/design/design.repository.interface.ts
import { DesignRevisionAttributes, DesignRevisionCreationAttributes } from "@/models/design/DesignRevision.model";
import { DesignCommunicationAttributes, DesignCommunicationCreationAttributes } from "@/models/design/DesignCommunication.model";

export interface IDesignRepository {
  // Design Revision methods
  createDesignRevision(revisionData: DesignRevisionCreationAttributes): Promise<DesignRevisionAttributes>;
  getDesignRevisionById(revisionId: string): Promise<DesignRevisionAttributes | null>;
  getDesignRevisionsByProduct(orderId: number, productId: number): Promise<DesignRevisionAttributes[]>;
  updateDesignRevisionStatus(revisionId: string, status: DesignRevisionAttributes['status'], notes?: string): Promise<DesignRevisionAttributes>;
  addCustomerFeedback(revisionId: string, feedback: string): Promise<DesignRevisionAttributes>;
  
  // Design Communication methods
  createDesignCommunication(communicationData: DesignCommunicationCreationAttributes): Promise<DesignCommunicationAttributes>;
  getDesignCommunicationsByOrder(orderId: number, productId?: number): Promise<DesignCommunicationAttributes[]>;
  markCommunicationAsRead(communicationId: string): Promise<DesignCommunicationAttributes>;
  getUnreadCommunicationsCount(userId: number): Promise<number>;
}
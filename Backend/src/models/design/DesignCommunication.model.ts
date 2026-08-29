// models/design/DesignCommunication.model.ts
import { Model, DataTypes, Sequelize, Optional } from "sequelize";

export interface DesignCommunicationAttributes {
  id: string;
  orderId: number;
  productId?: number;
  userId: number;
  adminId: number;
  type: 'mockup_submission' | 'customer_feedback' | 'revision_request' | 'approval';
  message: string;
  attachments: Array<{
    id: string;
    url: string;
    fileName: string;
    fileType: string;
  }>;
  isRead: boolean;
  createdAt?: Date;
}

export interface DesignCommunicationCreationAttributes extends Optional<DesignCommunicationAttributes, 'id' | 'productId' | 'isRead' | 'createdAt'> {}

class DesignCommunication extends Model<DesignCommunicationAttributes, DesignCommunicationCreationAttributes> implements DesignCommunicationAttributes {
  public id!: string;
  public orderId!: number;
  public productId?: number;
  public userId!: number;
  public adminId!: number;
  public type!: 'mockup_submission' | 'customer_feedback' | 'revision_request' | 'approval';
  public message!: string;
  public attachments!: Array<{
    id: string;
    url: string;
    fileName: string;
    fileType: string;
  }>;
  public isRead!: boolean;
  public readonly createdAt!: Date;

  static initialize(sequelize: Sequelize) {
    DesignCommunication.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true
        },
        orderId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        productId: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        adminId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        type: {
          type: DataTypes.ENUM('mockup_submission', 'customer_feedback', 'revision_request', 'approval'),
          allowNull: false
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        attachments: {
          type: DataTypes.TEXT,
          allowNull: false,
          get() {
            const rawValue = this.getDataValue('attachments') as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: Array<any>) {
            this.setDataValue('attachments', JSON.stringify(value) as any);
          }
        },
        isRead: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        }
      },
      {
        sequelize,
        modelName: "DesignCommunication",
        tableName: "DesignCommunications",
        timestamps: true,
        updatedAt: false
      }
    );
  }
}

export default DesignCommunication;
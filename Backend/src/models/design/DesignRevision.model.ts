// models/design/DesignRevision.model.ts
import { Model, DataTypes, Sequelize, Optional } from "sequelize";

export interface DesignRevisionAttributes {
  id: string;
  orderId: number;
  productId: number;
  adminId: number;
  mockupImages: Array<{
    id: string;
    url: string;
    publicId: string;
    fileName: string;
    fileType: string;
    uploadDate: Date;
  }>;
  adminNotes: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'revision_requested';
  customerFeedback?: string;
  revisionNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  version: number;
}

export interface DesignRevisionCreationAttributes extends Optional<DesignRevisionAttributes, 'id' | 'customerFeedback' | 'revisionNotes' | 'createdAt' | 'updatedAt'> {}

class DesignRevision extends Model<DesignRevisionAttributes, DesignRevisionCreationAttributes> implements DesignRevisionAttributes {
  public id!: string;
  public orderId!: number;
  public productId!: number;
  public adminId!: number;
  public mockupImages!: Array<{
    id: string;
    url: string;
    publicId: string;
    fileName: string;
    fileType: string;
    uploadDate: Date;
  }>;
  public adminNotes!: string;
  public status!: 'pending_approval' | 'approved' | 'rejected' | 'revision_requested';
  public customerFeedback?: string;
  public revisionNotes?: string;
  public version!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    DesignRevision.init(
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
          allowNull: false
        },
        adminId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        mockupImages: {
          type: DataTypes.TEXT,
          allowNull: false,
          get() {
            const rawValue = this.getDataValue('mockupImages') as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: Array<any>) {
            this.setDataValue('mockupImages', JSON.stringify(value) as any);
          }
        },
        adminNotes: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        status: {
          type: DataTypes.ENUM('pending_approval', 'approved', 'rejected', 'revision_requested'),
          defaultValue: 'pending_approval'
        },
        customerFeedback: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        revisionNotes: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        version: {
          type: DataTypes.INTEGER,
          defaultValue: 1
        }
      },
      {
        sequelize,
        modelName: "DesignRevision",
        tableName: "DesignRevisions",
        timestamps: true
      }
    );
  }
}

export default DesignRevision;
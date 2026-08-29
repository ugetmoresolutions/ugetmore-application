import { Model, DataTypes, Sequelize } from "sequelize";

export interface IPFNotification {
  id: number;
  merchantId: number;
  pfPaymentId: number;
  paymentStatus: string;
  paymentReference: string;
  amountGross: number | null;
  amountFee: number | null;
  amountNet: number | null;
  signature: string | null;
  rawItnData: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPFNotificationSummary {
  id: number;
  merchantId: number;
  pfPaymentId: number;
  paymentStatus: string;
  paymentReference: string; // Your m_payment_id
  amountGross: number | null;
  amountFee: number | null;
  amountNet: number | null;
  signature: string | null;
  rawItnData: string; // Store full ITN as JSON for debugging
  createdAt: Date;
  updatedAt: Date;
}

export interface IPFNotificationCreate {
  merchantId: number;
  pfPaymentId: number;
  paymentStatus: string;
  paymentReference: string;
  amountGross?: number | null;
  amountFee?: number | null;
  amountNet?: number | null;
  signature?: string | null;
  rawItnData?: string;
}



class PFNotification extends Model<IPFNotification> implements IPFNotification {
  public id!: number;
  public merchantId!: number;
  public pfPaymentId!: number;
  public paymentStatus!: string;
  public paymentReference!: string;
  public amountGross!: number | null;
  public amountFee!: number | null;
  public amountNet!: number | null;
  public signature!: string | null;
  public rawItnData!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    PFNotification.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        merchantId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        pfPaymentId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        paymentStatus: {
          type: DataTypes.STRING(50),
          allowNull: false
        },
        paymentReference: {
          type: DataTypes.STRING(255),
          allowNull: false
        },
        amountGross: {
          type: DataTypes.DECIMAL(18, 2),
          allowNull: true
        },
        amountFee: {
          type: DataTypes.DECIMAL(18, 2),
          allowNull: true
        },
        amountNet: {
          type: DataTypes.DECIMAL(18, 2),
          allowNull: true
        },
        signature: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        rawItnData: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue('rawItnData') as any;
            return rawValue ? JSON.parse(rawValue) : {};
          },
          set(value: any) {
            this.setDataValue('rawItnData', JSON.stringify(value) as any);
          }
        }
      },
      {
        sequelize,
        modelName: "PFNotification",
        tableName: "PFNotifications",
        timestamps: true
      }
    );
  }
    // Helper method to get parsed ITN data
  public getParsedItnData(): any {
    try {
      return JSON.parse(this.rawItnData);
    } catch (error) {
      console.error('Error parsing ITN data:', error);
      return {};
    }
  }

  // Helper method to check if payment is successful
  public isSuccessfulPayment(): boolean {
    return this.paymentStatus === 'COMPLETE';
  }

  public toJSON(): IPFNotificationSummary {
    return {
      id: this.id,
      merchantId: this.merchantId,
      pfPaymentId: this.pfPaymentId,
      paymentStatus: this.paymentStatus,
      paymentReference: this.paymentReference,
      amountGross: this.amountGross,
      amountFee: this.amountFee,
      amountNet: this.amountNet,
      signature: this.signature,
      rawItnData: this.rawItnData,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default PFNotification;
// models/order/order.model.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import { IBrandedArtwork, IDesignCommunication, IOrder, OrderStatus, PaymentStatus } from "@/types/order/order.types";
import { ICartItem } from "@/types/cart/cart.interface";

class Order extends Model<IOrder> implements IOrder {
  public id!: number;
  public total!: number;
  public status!: OrderStatus;
  public paymentStatus!: PaymentStatus;
  public paymentReference!: string | null;
  public address!: string;
  public items!: ICartItem[];
  public isBranded!: boolean;
  public brandedArtWorks!: IBrandedArtwork[];
  public designCommunications!: IDesignCommunication[];
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Order.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        paymentStatus: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        
        paymentReference: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        items: {
          type: DataTypes.TEXT,
          allowNull: false,
          get() {
            const rawValue = this.getDataValue('items') as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: ICartItem[]) {
            this.setDataValue('items', JSON.stringify(value) as any);
          }
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: "Order",
        tableName: "Orders",
        timestamps: true
      }
    );
  }
}

export default Order;
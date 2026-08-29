import { Model, DataTypes, Sequelize } from "sequelize";
import { ICoupon } from "@/types/coupon/coupon.type";

class Coupon extends Model<ICoupon> implements ICoupon {
  public id!: number;
  public code!: string;
  public description!: string;
  public discountType!: "percentage" | "fixed";
  public discountValue!: number;
  public minimumCartAmount!: number;
  public maximumDiscount!: number | null;
  public validFrom!: Date;
  public validTo!: Date;
  public usageLimit!: number | null;
  public usedCount!: number;
  public isActive!: boolean;
  public couponType!: "school" | "general" | "user" | "product" | "category";
  public applicableSchoolId!: number | null;
  public applicableUserId!: number | null;
  public applicableProductIds!: string[] | null; // CHANGED: number[] -> string[]
   public applicableCategories!: string[] | null; // ADD THIS
  public isSingleUse!: boolean;
  public usedBy!: number[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Coupon.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        code: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        description: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        discountType: {
          type: DataTypes.STRING(50),
          allowNull: true,
          validate: {
            isIn: [["percentage", "fixed"]],
          },
        },
        discountValue: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        minimumCartAmount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        maximumDiscount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        validFrom: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        validTo: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        usageLimit: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        usedCount: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        couponType: {
          type: DataTypes.STRING(50),
          allowNull: true,
          validate: {
            isIn: [["school", "general", "user", "product", "category"]],
          },
        },
        applicableSchoolId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "schools",
            key: "id",
          },
        },
        applicableUserId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
        },
        applicableProductIds: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("applicableProductIds") as any;
            return rawValue ? JSON.parse(rawValue) : null;
          },
          set(value: string[] | null) { // CHANGED: number[] -> string[]
            this.setDataValue("applicableProductIds", value ? JSON.stringify(value) : null as any);
          },
        },
        // ADD THIS NEW FIELD
        applicableCategories: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("applicableCategories") as any;
            return rawValue ? JSON.parse(rawValue) : null;
          },
          set(value: string[] | null) {
            this.setDataValue("applicableCategories", value ? JSON.stringify(value) : null as any);
          },
        },
        
        isSingleUse: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
        },
        usedBy: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("usedBy") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: number[]) {
            this.setDataValue("usedBy", JSON.stringify(value) as any);
          },
        },
      },
      {
        sequelize,
        modelName: "Coupon",
        tableName: "coupons",
        timestamps: true,
      }
    );
  }
}

export default Coupon;
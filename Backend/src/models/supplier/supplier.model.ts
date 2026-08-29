// models/supplier/supplier.model.ts
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { ISupplier } from "@/types/supplier/supplier.type";

interface SupplierCreationAttributes extends Optional<ISupplier, "id" | "createdAt" | "updatedAt"> {}

class Supplier extends Model<ISupplier, SupplierCreationAttributes> implements ISupplier {
  public id!: number;
  public name!: string;
  public account!: string;
  public contactPerson?: string;
  public email?: string;
  public phone?: string;
  public address?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Supplier.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        account: {
          type: DataTypes.STRING(100),
          allowNull: true,
          unique: false,
        },
        contactPerson: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
          validate: {
            isEmail: true,
          },
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "Supplier",
        tableName: "Suppliers",
        timestamps: true,
        indexes: [
          {
            unique: false,
            fields: ['account']
          },
          {
            unique: false,
            fields: ['name']
          }
        ]
      }
    );
  }
}

export default Supplier;
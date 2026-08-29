// src/models/stock/stock.model.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import { IStock } from "@/types/stock/stock.type";

class Stock extends Model<IStock> implements IStock {
  public id!: number;
  public productId!: number;
  public fullCode!: string;
  public stock!: number;
  public reservedStock!: number;
  public availableStock!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Stock.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        productId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        fullCode: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        stock: {
          type: DataTypes.INTEGER,
          allowNull: true,
          
        },
        reservedStock: {
          type: DataTypes.INTEGER,
          allowNull: true,
         
        },
        availableStock: {
          type: DataTypes.INTEGER,
          allowNull: true,
          
        },
      },
      {
        sequelize,
        modelName: "Stock",
        tableName: "Stocks",
        timestamps: true,
      }
    );
  }
}

export default Stock;
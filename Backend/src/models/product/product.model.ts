// models/product/product.model.ts
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import {
  IProduct,
  IImageUrl,
  IColorImage,
  ProductStatus,
} from "@/types/product/products.type";

interface ProductCreationAttributes
  extends Optional<IProduct, "id" | "createdAt" | "updatedAt"> {}

class Product
  extends Model<IProduct, ProductCreationAttributes>
  implements IProduct
{
  public id!: number;
  public title!: string;
  public price!: number; 
  public description!: string;
  public sku!: string;
  public mainImages!: IImageUrl[];
  public colorImages!: IColorImage[];
  public sizes!: string[];
  public minQuantity!: number;
  public maxQuantity!: number;
  public stockQuantity!: number;
  public categories!: string[];
  public subCategories!: string[];
  public supplierName!: string;
  public supplierAccount!: string;
  public status!: ProductStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    Product.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        price: {
          type: DataTypes.FLOAT, // or DECIMAL(10, 2) if you want exact values
          allowNull: true,
          
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        sku: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },

        // ✅ Arrays stored as TEXT (stringified JSON)
        mainImages: {
          type: DataTypes.TEXT,
          allowNull: true,

          get() {
            const rawValue = this.getDataValue("mainImages") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: IImageUrl[]) {
            this.setDataValue("mainImages", JSON.stringify(value) as any);
          },
        },
        colorImages: {
          type: DataTypes.TEXT,
          allowNull: true,

          get() {
            const rawValue = this.getDataValue("colorImages") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: IColorImage[]) {
            this.setDataValue("colorImages", JSON.stringify(value) as any);
          },
        },
        sizes: {
          type: DataTypes.TEXT,
          allowNull: true,

          get() {
            const rawValue = this.getDataValue("sizes") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: string[]) {
            this.setDataValue("sizes", JSON.stringify(value) as any);
          },
        },
        categories: {
          type: DataTypes.TEXT,
          allowNull: true,

          get() {
            const rawValue = this.getDataValue("categories") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: string[]) {
            this.setDataValue("categories", JSON.stringify(value) as any);
          },
        },
        subCategories: {
          type: DataTypes.TEXT,
          allowNull: true,

          get() {
            const rawValue = this.getDataValue("subCategories") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: string[]) {
            this.setDataValue("subCategories", JSON.stringify(value) as any);
          },
        },

        // ✅ Numbers
        minQuantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        maxQuantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        stockQuantity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        // ✅ Strings
        supplierName: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        supplierAccount: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },

        // ✅ Enum
        status: {
          type: DataTypes.STRING(20),
          allowNull: true,

          validate: {
            isIn: [Object.values(ProductStatus)],
          },
        },

        // ✅ Timestamps
        createdAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: "Product",
        tableName: "Products",
        timestamps: true,
      }
    );
  }
}

export default Product;

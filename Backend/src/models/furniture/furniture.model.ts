import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import {
  IFurnitureProduct,
  IImageUrl,
  IColorImage,
  FurnitureProductStatus,
} from "@/types/furniture/furniture.type";

interface FurnitureProductCreationAttributes
  extends Optional<IFurnitureProduct, "id" | "createdAt" | "updatedAt"> {}

class FurnitureProduct
  extends Model<IFurnitureProduct, FurnitureProductCreationAttributes>
  implements IFurnitureProduct
{
  public id!: number;
  public title!: string;
  public price!: number; 
  public description!: string;
  public sku!: string;
  public brand!: string;
  
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
  public status!: FurnitureProductStatus;
  
  public dimensions!: { length: number; width: number; height: number; unit: string };
  public material!: string;
  public weight!: number;
  public weightUnit!: string;
  public assemblyRequired!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    FurnitureProduct.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        price: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        sku: {
          type: DataTypes.STRING(100),
          allowNull: false,
          
        },
        brand: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },

        // ✅ Arrays stored as TEXT (stringified JSON)
        mainImages: {
          type: DataTypes.TEXT,
          allowNull: false,
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
          allowNull: false,
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
          allowNull: false,
          get() {
            const rawValue = this.getDataValue("subCategories") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: string[]) {
            this.setDataValue("subCategories", JSON.stringify(value) as any);
          },
        },

        // ✅ Furniture specific fields
        dimensions: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("dimensions") as any;
            return rawValue ? JSON.parse(rawValue) : null;
          },
          set(value: { length: number; width: number; height: number; unit: string }) {
            this.setDataValue("dimensions", value ? JSON.stringify(value) as any : null);
          },
        },
        material: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        weight: {
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        weightUnit: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        assemblyRequired: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          
        },

        // ✅ Numbers
        minQuantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        maxQuantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        stockQuantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        // ✅ Strings
        supplierName: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        supplierAccount: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },

        // ✅ Enum
        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
          validate: {
            isIn: [Object.values(FurnitureProductStatus)],
          },
        },

        // ✅ Timestamps
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: "FurnitureProduct",
        tableName: "FurnitureProducts",
        timestamps: true,
      }
    );
  }
}

export default FurnitureProduct;
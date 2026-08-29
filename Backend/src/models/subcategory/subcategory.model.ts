import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { ISubCategory } from "@/types/subcategory/subcategory.type";

interface SubCategoryCreationAttributes extends Optional<ISubCategory, "id" | "createdAt" | "updatedAt" | "category"> {}

class SubCategory extends Model<ISubCategory, SubCategoryCreationAttributes> implements ISubCategory {
  public id!: number;
  public name!: string;
  public code!: string;
  public categoryId!: number;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public category?: any;

  static initialize(sequelize: Sequelize) {
    SubCategory.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        code: {
          type: DataTypes.STRING(20),
          allowNull: false,
          
        },
        categoryId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Categories',
            key: 'id'
          }
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
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
        modelName: "SubCategory",
        tableName: "SubCategories",
        timestamps: true,
      }
    );
  }
}

export default SubCategory;
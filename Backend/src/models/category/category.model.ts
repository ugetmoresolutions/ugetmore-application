import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { ICategory } from "@/types/category/category.type";
import { MainCategoryType } from "@/types/main-category/main-category.type";

interface CategoryCreationAttributes
  extends Optional<ICategory, "id" | "createdAt" | "updatedAt" | "subCategories"> {}

class Category
  extends Model<ICategory, CategoryCreationAttributes>
  implements ICategory
{
  public id!: number;
  public name!: string;
  public code!: string;
  public mainCategoryId!: MainCategoryType;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public subCategories?: any[];

  static initialize(sequelize: Sequelize) {
    Category.init(
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
        mainCategoryId: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            isIn: {
              args: [['FURNITURE', 'JANITORIAL', 'STATIONERY', 'ELECTRONICS']],
              msg: "Main category must be: FURNITURE, JANITORIAL, STATIONERY, or ELECTRONICS"
            }
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
        modelName: "Category",
        tableName: "Categories",
        timestamps: true,
      }
    );
  }
}

export default Category;
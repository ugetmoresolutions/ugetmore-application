import { ISoftwareInquiry } from "@/types/softwareInquiry/softwareInquiry.type";
import { Model, DataTypes, Sequelize } from "sequelize";

class SoftwareInquiry extends Model<ISoftwareInquiry> implements ISoftwareInquiry {
  public id!: number;
  public name!: string;
  public email!: string;
  public phone!: string;
  public company!: string;
  public serviceType!: string;
  public projectDetails!: string;
  public status!: string;
  public submittedAt!: Date;
  public reviewedAt!: Date | null;
  public reviewedBy!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    SoftwareInquiry.init(
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
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            isEmail: true,
          },
        },
        phone: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        company: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        serviceType: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            isIn: [['web-development', 'mobile-development', 'backend-development', 'custom-software', 'consultation']]
          }
        },
        projectDetails: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
          validate: {
            isIn: [['new', 'in-review', 'contacted', 'archived']]
          }
        },
        submittedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        reviewedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        reviewedBy: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "SoftwareInquiry",
        tableName: "software_inquiries",
        timestamps: true,
      }
    );
  }
}

export default SoftwareInquiry;
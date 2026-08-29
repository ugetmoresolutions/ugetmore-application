import { DataTypes, Model } from "sequelize";
import { Sequelize } from "sequelize";

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public fullName!: string;
  public phone!: string;
  public role!: "customer" | "admin" | "business";
  public address?: string;
  public businessName?: string;
  public businessType?: string;
  public vatNumber?: string;
  public otp?: string;
  public isEmailVerified!: boolean; // NEW: Email verification status
  public emailVerificationToken?: string; // NEW: Token for email verification
  public emailVerificationExpires?: Date; // NEW: Token expiration
  public createdAt?: Date;
  public updatedAt?: Date;

  public static initialize(sequelize: Sequelize) {
    User.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        fullName: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING, allowNull: false },
        address: {
          type: DataTypes.TEXT, // Changed to TEXT to store longer addresses
          allowNull: true,
        },
        businessName: { type: DataTypes.STRING, allowNull: true },
        businessType: { type: DataTypes.STRING, allowNull: true },
        vatNumber: { type: DataTypes.STRING, allowNull: true },

        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        otp: { type: DataTypes.STRING },
        isEmailVerified: {
          // NEW FIELD
          type: DataTypes.BOOLEAN,
          allowNull: false,
          
        },
        emailVerificationToken: {
          // NEW FIELD
          type: DataTypes.STRING,
          allowNull: true,
        },
        emailVerificationExpires: {
          // NEW FIELD
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "user",
        timestamps: true,
      }
    );
  }
}

export default User;

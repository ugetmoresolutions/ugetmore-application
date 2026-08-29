// models/school/school.model.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import { ISchool } from "@/types/school/school.interface";

class School extends Model<ISchool> implements ISchool {
    public id!: number;
    public name!: string;
    public code!: string;
    public type!: 'preschool' | 'primary' | 'high' | 'combined'; // UPDATED
    public address!: string;
    public city!: string;
    public imageUrl!: string;
    public province!: string;
    public contactEmail!: string;
    public contactPhone!: string;
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        School.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                name: {
                    type: DataTypes.STRING(255),
                    allowNull: true
                },
                imageUrl: {
                    type: DataTypes.STRING(255),
                    allowNull: true
                },
                code: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                    
                },
                type: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                    validate: {
                        isIn: [['preschool', 'primary', 'high', 'combined']] // UPDATED
                    },
                    
                },
                address: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                city: {
                    type: DataTypes.STRING(100),
                    allowNull: true
                },
                province: {
                    type: DataTypes.STRING(100),
                    allowNull: true
                },
                contactEmail: {
                    type: DataTypes.STRING(255),
                    allowNull: true
                },
                contactPhone: {
                    type: DataTypes.STRING(20),
                    allowNull: true
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    allowNull: true
                }
            },
            {
                sequelize,
                modelName: "School",
                tableName: "schools",
                timestamps: true
            }
        );
    }
}

export default School;
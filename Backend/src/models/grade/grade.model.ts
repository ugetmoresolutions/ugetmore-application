// models/grade/grade.model.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import { IGrade } from "@/types/grade/grade.interface";

class Grade extends Model<IGrade> implements IGrade {
    public id!: number;
    public schoolId!: number;
    public gradeName!: string;
    public gradeLevel!: number;
    public description!: string;
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Grade.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                schoolId: {
                    type: DataTypes.INTEGER,
                    allowNull: true, // Changed to true for initialization
                    references: {
                        model: "schools",
                        key: "id"
                    }
                },
                gradeName: {
                    type: DataTypes.STRING(50),
                    allowNull: true // Changed to true for initialization
                },
                gradeLevel: {
                    type: DataTypes.INTEGER,
                    allowNull: true // Changed to true for initialization
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    
                }
            },
            {
                sequelize,
                modelName: "Grade",
                tableName: "grades",
                timestamps: true,
                indexes: [
                    {
                        unique: true,
                        fields: ['schoolId', 'gradeLevel']
                    }
                ]
            }
        );
    }
}

export default Grade;
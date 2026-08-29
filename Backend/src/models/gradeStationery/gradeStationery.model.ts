// models/gradeStationery/gradeStationery.model.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import { IGradeStationery, IStationeryItem } from "@/types/gradeStationery/gradeStationery.interface";

class GradeStationery extends Model<IGradeStationery> implements IGradeStationery {
    public id!: number;
    public gradeId!: number;
    public stationeryItems!: IStationeryItem[];
    public fileUrl!: string | null;
    public createdAt!: Date; // Now required
    public updatedAt!: Date; // Now required

    static initialize(sequelize: Sequelize) {
        GradeStationery.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                gradeId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "grades",
                        key: "id"
                    },
                    
                },
                stationeryItems: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    get() {
                        const rawValue = this.getDataValue('stationeryItems') as any;
                        return rawValue ? JSON.parse(rawValue) : [];
                    },
                    set(value: IStationeryItem[]) {
                        this.setDataValue('stationeryItems', JSON.stringify(value) as any);
                    }
                },
                fileUrl: {
                    type: DataTypes.STRING(500),
                    allowNull: true,
                   
                }
            },
            {
                sequelize,
                modelName: "GradeStationery",
                tableName: "grade_stationeries",
                timestamps: true, // This ensures createdAt and updatedAt are always set
                
            }
        );
    }
}

export default GradeStationery;
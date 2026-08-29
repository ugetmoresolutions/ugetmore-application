// interfaces/grade/grade.service.interface.ts
import { IGrade, ICreateGrade, IUpdateGrade, IGradeWithSchool } from "@/types/grade/grade.interface";
import { Token } from "typedi";

export interface IGradeService {
    getGradesBySchool(schoolId: number): Promise<IGrade[]>;
    getGradeById(id: number): Promise<IGrade | null>;
    getGradeWithSchool(id: number): Promise<IGradeWithSchool | null>;
    createGrade(gradeData: ICreateGrade): Promise<IGrade>;
    updateGrade(id: number, gradeData: IUpdateGrade): Promise<IGrade>;
    deleteGrade(id: number): Promise<boolean>;
    // createGradesForSchool(schoolId: number, schoolType: 'preschool' | 'primary' | 'high'): Promise<IGrade[]>; // ADD THIS METHOD
}

export const GRADE_SERVICE_TOKEN = new Token<IGradeService>("IGradeService");
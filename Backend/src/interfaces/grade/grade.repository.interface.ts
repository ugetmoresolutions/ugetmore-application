// interfaces/grade/grade.repository.interface.ts
import { IGrade, ICreateGrade, IUpdateGrade, IGradeWithSchool } from "@/types/grade/grade.interface";

export interface IGradeRepository {
  getGradesBySchool(schoolId: number): Promise<IGrade[]>;
  getGradeById(id: number): Promise<IGrade | null>;
  getGradeBySchoolAndLevel(schoolId: number, gradeLevel: number): Promise<IGrade | null>;
  createGrade(gradeData: Omit<IGrade, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGrade>;
  updateGrade(id: number, gradeData: IUpdateGrade): Promise<IGrade>;
  deleteGrade(id: number): Promise<boolean>;
  getGradeWithSchool(id: number): Promise<IGradeWithSchool | null>;
}
// interfaces/school/school.repository.interface.ts
import { ISchool, ICreateSchool, IUpdateSchool } from "@/types/school/school.interface";

export interface ISchoolRepository {
  getAllSchools(): Promise<ISchool[]>;
  getSchoolById(id: number): Promise<ISchool | null>;
  getSchoolByCode(code: string): Promise<ISchool | null>;
  createSchool(schoolData: Omit<ISchool, 'id' | 'createdAt' | 'updatedAt'>): Promise<ISchool>;
  updateSchool(id: number, schoolData: IUpdateSchool): Promise<ISchool>;
  deleteSchool(id: number): Promise<boolean>;
  getActiveSchools(): Promise<ISchool[]>;
}
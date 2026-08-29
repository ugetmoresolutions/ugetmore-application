// interfaces/school/school.service.interface.ts
import { ISchool, ICreateSchool, IUpdateSchool } from "@/types/school/school.interface";
import { Token } from "typedi";

export interface ISchoolService {
  getAllSchools(): Promise<ISchool[]>;
  getSchoolById(id: number): Promise<ISchool | null>;
  getSchoolByCode(code: string): Promise<ISchool | null>;
  createSchool(schoolData: ICreateSchool): Promise<ISchool>;
  updateSchool(id: number, schoolData: IUpdateSchool): Promise<ISchool>;
  deleteSchool(id: number): Promise<boolean>;
  getActiveSchools(): Promise<ISchool[]>;
}

export const SCHOOL_SERVICE_TOKEN = new Token<ISchoolService>("ISchoolService");
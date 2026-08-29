// services/school/school.service.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  ISchoolService,
  SCHOOL_SERVICE_TOKEN,
} from "@/interfaces/school/school.service.interface";
import {
  ISchool,
  ICreateSchool,
  IUpdateSchool,
} from "@/types/school/school.interface";
import { SchoolRepository } from "@/repositories/school/school.repository";
import { GradeRepository } from "@/repositories/grade/grade.repository";

@Service({ id: SCHOOL_SERVICE_TOKEN })
export class SchoolService implements ISchoolService {
  constructor(
    private schoolRepository: SchoolRepository,
    private gradeRepository: GradeRepository
  ) {}

  // Updated South African grade configurations with combined school support
  private readonly gradeConfigurations = {
    preschool: [
      { gradeLevel: -2, gradeName: "Pre-school Grade RR", description: "Pre-Reception Year" },
      { gradeLevel: -1, gradeName: "Pre-school Grade R", description: "Reception Year" }
    ],
    primary: [
      { gradeLevel: 0, gradeName: "Grade R", description: "Reception Year" },
      { gradeLevel: 1, gradeName: "Grade 1", description: "Foundation Phase" },
      { gradeLevel: 2, gradeName: "Grade 2", description: "Foundation Phase" },
      { gradeLevel: 3, gradeName: "Grade 3", description: "Foundation Phase" },
      { gradeLevel: 4, gradeName: "Grade 4", description: "Intermediate Phase" },
      { gradeLevel: 5, gradeName: "Grade 5", description: "Intermediate Phase" },
      { gradeLevel: 6, gradeName: "Grade 6", description: "Intermediate Phase" },
      { gradeLevel: 7, gradeName: "Grade 7", description: "Senior Phase" }
    ],
    high: [
      { gradeLevel: 8, gradeName: "Grade 8", description: "Senior Phase" },
      { gradeLevel: 9, gradeName: "Grade 9", description: "Senior Phase" },
      { gradeLevel: 10, gradeName: "Grade 10", description: "Further Education and Training" },
      { gradeLevel: 11, gradeName: "Grade 11", description: "Further Education and Training" },
      { gradeLevel: 12, gradeName: "Grade 12", description: "Further Education and Training" }
    ],
    combined: [ // NEW: Combined school grades from RR to Grade 12
      { gradeLevel: -2, gradeName: "Pre-school Grade RR", description: "Pre-Reception Year" },
      { gradeLevel: -1, gradeName: "Pre-school Grade R", description: "Reception Year" },
      { gradeLevel: 1, gradeName: "Grade 1", description: "Foundation Phase" },
      { gradeLevel: 2, gradeName: "Grade 2", description: "Foundation Phase" },
      { gradeLevel: 3, gradeName: "Grade 3", description: "Foundation Phase" },
      { gradeLevel: 4, gradeName: "Grade 4", description: "Intermediate Phase" },
      { gradeLevel: 5, gradeName: "Grade 5", description: "Intermediate Phase" },
      { gradeLevel: 6, gradeName: "Grade 6", description: "Intermediate Phase" },
      { gradeLevel: 7, gradeName: "Grade 7", description: "Senior Phase" },
      { gradeLevel: 8, gradeName: "Grade 8", description: "Senior Phase" },
      { gradeLevel: 9, gradeName: "Grade 9", description: "Senior Phase" },
      { gradeLevel: 10, gradeName: "Grade 10", description: "Further Education and Training" },
      { gradeLevel: 11, gradeName: "Grade 11", description: "Further Education and Training" },
      { gradeLevel: 12, gradeName: "Grade 12", description: "Further Education and Training" }
    ]
  };

  private async createGradesForSchool(schoolId: number, schoolType: 'preschool' | 'primary' | 'high' | 'combined'): Promise<any[]> {
    try {
      const gradeConfigs = this.gradeConfigurations[schoolType];
      const createdGrades = [];

      for (const config of gradeConfigs) {
        const gradeData = {
          schoolId,
          gradeName: config.gradeName,
          gradeLevel: config.gradeLevel,
          description: config.description,
          isActive: true
        };

        const grade = await this.gradeRepository.createGrade(gradeData);
        createdGrades.push(grade);
      }

      return createdGrades;
    } catch (error: any) {
      throw new HttpException(500, `Failed to create grades for school: ${error.message}`);
    }
  }

  public async createSchool(schoolData: ICreateSchool): Promise<ISchool> {
    try {
      if (!schoolData.name || schoolData.name.trim().length === 0) {
        throw new HttpException(400, "School name is required");
      }
      if (!schoolData.code || schoolData.code.trim().length === 0) {
        throw new HttpException(400, "School code is required");
      }
      // Updated validation to include 'combined' type
      if (!schoolData.type || !['preschool', 'primary', 'high', 'combined'].includes(schoolData.type)) {
        throw new HttpException(400, "Valid school type is required (preschool, primary, high, or combined)");
      }

      // Create the school
      const school = await this.schoolRepository.createSchool(schoolData);
      
      // Automatically create grades based on school type
      await this.createGradesForSchool(school.id, schoolData.type);
      
      return school;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to create school: ${error.message}`);
    }
  }

  // ... rest of your methods remain the same
  public async getAllSchools(): Promise<ISchool[]> {
    try {
      return await this.schoolRepository.getAllSchools();
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get schools: ${error.message}`);
    }
  }

  public async getSchoolById(id: number): Promise<ISchool | null> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid school ID is required");
      }
      return await this.schoolRepository.getSchoolById(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get school: ${error.message}`);
    }
  }

  public async getSchoolByCode(code: string): Promise<ISchool | null> {
    try {
      if (!code || code.trim().length === 0) {
        throw new HttpException(400, "School code is required");
      }
      return await this.schoolRepository.getSchoolByCode(code);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get school: ${error.message}`);
    }
  }

  public async updateSchool(id: number, schoolData: IUpdateSchool): Promise<ISchool> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid school ID is required");
      }

      return await this.schoolRepository.updateSchool(id, schoolData);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update school: ${error.message}`);
    }
  }

  public async deleteSchool(id: number): Promise<boolean> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid school ID is required");
      }

      return await this.schoolRepository.deleteSchool(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to delete school: ${error.message}`);
    }
  }

  public async getActiveSchools(): Promise<ISchool[]> {
    try {
      return await this.schoolRepository.getActiveSchools();
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get active schools: ${error.message}`);
    }
  }
}
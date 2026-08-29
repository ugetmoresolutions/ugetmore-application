// services/grade/grade.service.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  GRADE_SERVICE_TOKEN,
  IGradeService,
} from "@/interfaces/grade/grade.service.interface";
import {
  IGrade,
  ICreateGrade,
  IUpdateGrade,
  IGradeWithSchool,
} from "@/types/grade/grade.interface";
import { GradeRepository } from "@/repositories/grade/grade.repository";

@Service({ id: GRADE_SERVICE_TOKEN })
export class GradeService implements IGradeService {
  constructor(private gradeRepository: GradeRepository) {}

  // REMOVE the gradeConfigurations and createGradesForSchool from here
  // They are now in SchoolService

  public async getGradesBySchool(schoolId: number): Promise<IGrade[]> {
    try {
      if (!schoolId || schoolId <= 0) {
        throw new HttpException(400, "Valid school ID is required");
      }

      return await this.gradeRepository.getGradesBySchool(schoolId);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get grades: ${error.message}`);
    }
  }

  public async getGradeById(id: number): Promise<IGrade | null> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }

      return await this.gradeRepository.getGradeById(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get grade: ${error.message}`);
    }
  }

  public async getGradeWithSchool(id: number): Promise<IGradeWithSchool | null> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }

      return await this.gradeRepository.getGradeWithSchool(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get grade with school: ${error.message}`);
    }
  }

  public async createGrade(gradeData: ICreateGrade): Promise<IGrade> {
    try {
      if (!gradeData.schoolId || gradeData.schoolId <= 0) {
        throw new HttpException(400, "Valid school ID is required");
      }
      if (!gradeData.gradeName || gradeData.gradeName.trim().length === 0) {
        throw new HttpException(400, "Grade name is required");
      }
      if (gradeData.gradeLevel === undefined || gradeData.gradeLevel < -2) {
        throw new HttpException(400, "Valid grade level is required");
      }

      // Updated grade level validation for South African system
      if (gradeData.gradeLevel < -2 || gradeData.gradeLevel > 12) {
        throw new HttpException(400, "Grade level must be between -2 and 12");
      }

      return await this.gradeRepository.createGrade(gradeData);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to create grade: ${error.message}`);
    }
  }

  public async updateGrade(id: number, gradeData: IUpdateGrade): Promise<IGrade> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }

      // Validate grade level if provided
      if (gradeData.gradeLevel !== undefined) {
        if (gradeData.gradeLevel < -2 || gradeData.gradeLevel > 12) {
          throw new HttpException(400, "Grade level must be between -2 and 12");
        }
      }

      return await this.gradeRepository.updateGrade(id, gradeData);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update grade: ${error.message}`);
    }
  }

  public async deleteGrade(id: number): Promise<boolean> {
    try {
      if (!id || id <= 0) {
        throw new HttpException(400, "Valid grade ID is required");
      }

      return await this.gradeRepository.deleteGrade(id);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to delete grade: ${error.message}`);
    }
  }
}
// repositories/grade/grade.repository.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { IGradeRepository } from "@/interfaces/grade/grade.repository.interface";
import { IGrade, ICreateGrade, IUpdateGrade, IGradeWithSchool } from "@/types/grade/grade.interface";
import Grade from "@/models/grade/grade.model";
import School from "@/models/school/school.model";

@Service()
export class GradeRepository implements IGradeRepository {
  public async getGradesBySchool(schoolId: number): Promise<IGrade[]> {
    try {
      const grades = await Grade.findAll({
        where: { schoolId},
        order: [['gradeLevel', 'ASC']],
        include: [{
          model: School,
          as: 'school', // Add the alias
          attributes: ['id', 'name', 'code'],
          required: true
        }]
      });
      return grades.map(grade => grade.toJSON() as IGrade);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get grades: ${error.message}`);
    }
  }

  public async getGradeById(id: number): Promise<IGrade | null> {
    try {
      const grade = await Grade.findByPk(id);
      return grade ? grade.toJSON() as IGrade : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get grade: ${error.message}`);
    }
  }

  public async getGradeBySchoolAndLevel(schoolId: number, gradeLevel: number): Promise<IGrade | null> {
    try {
      const grade = await Grade.findOne({
        where: { schoolId, gradeLevel }
      });
      return grade ? grade.toJSON() as IGrade : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get grade: ${error.message}`);
    }
  }

  public async createGrade(gradeData: Omit<IGrade, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGrade> {
    try {
      // Check if school exists
      const school = await School.findByPk(gradeData.schoolId);
      if (!school) {
        throw new HttpException(404, "School not found");
      }

      // Check if grade level already exists for this school
      const existingGrade = await Grade.findOne({
        where: {
          schoolId: gradeData.schoolId,
          gradeLevel: gradeData.gradeLevel
        }
      });

      if (existingGrade) {
        throw new HttpException(409, `Grade level ${gradeData.gradeLevel} already exists for this school`);
      }

      const grade = await Grade.create(gradeData as any);
      return grade.toJSON() as IGrade;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to create grade: ${error.message}`);
    }
  }

  public async updateGrade(id: number, gradeData: IUpdateGrade): Promise<IGrade> {
    try {
      const grade = await Grade.findByPk(id);
      if (!grade) {
        throw new HttpException(404, "Grade not found");
      }

      await grade.update(gradeData as any);
      return grade.toJSON() as IGrade;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update grade: ${error.message}`);
    }
  }

  public async deleteGrade(id: number): Promise<boolean> {
  try {
    const grade = await Grade.findByPk(id);
    if (!grade) {
      throw new HttpException(404, "Grade not found");
    }

    // Permanently delete the grade record
    await grade.destroy();
    return true;
  } catch (error: any) {
    if (error instanceof HttpException) throw error;
    throw new HttpException(500, `Failed to delete grade: ${error.message}`);
  }
}

  public async getGradeWithSchool(id: number): Promise<IGradeWithSchool | null> {
    try {
      const grade = await Grade.findByPk(id, {
        include: [{
          model: School,
          as: 'school', // Add the alias
          attributes: ['id', 'name', 'code'],
          required: true
        }]
      });
      return grade ? grade.toJSON() as IGradeWithSchool : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get grade with school: ${error.message}`);
    }
  }
}
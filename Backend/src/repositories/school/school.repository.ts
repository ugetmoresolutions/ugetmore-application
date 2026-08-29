// repositories/school/school.repository.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { ISchool, ICreateSchool, IUpdateSchool } from "@/types/school/school.interface";
import School from "@/models/school/school.model";
import { ISchoolRepository } from "@/interfaces/school/school.repository.interface";

@Service()
export class SchoolRepository implements ISchoolRepository {
  public async getAllSchools(): Promise<ISchool[]> {
  try {
    const schools = await School.findAll({
      order: [['name', 'ASC']]
    });
    return schools.map(school => school.toJSON() as ISchool);
  } catch (error: any) {
    throw new HttpException(500, `Failed to get schools: ${error.message}`);
  }
}

  public async getSchoolById(id: number): Promise<ISchool | null> {
    try {
      const school = await School.findByPk(id);
      return school ? school.toJSON() as ISchool : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get school: ${error.message}`);
    }
  }

  public async getSchoolByCode(code: string): Promise<ISchool | null> {
    try {
      const school = await School.findOne({
        where: { code }
      });
      return school ? school.toJSON() as ISchool : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get school by code: ${error.message}`);
    }
  }

  public async createSchool(schoolData: Omit<ISchool, 'id' | 'createdAt' | 'updatedAt'>): Promise<ISchool> {
    try {
      const existingSchool = await School.findOne({
        where: { code: schoolData.code }
      });

      if (existingSchool) {
        throw new HttpException(409, "School with this code already exists");
      }

      const school = await School.create(schoolData as any);
      return school.toJSON() as ISchool;
    } catch (error: any) {
      throw new HttpException(500, `Failed to create school: ${error.message}`);
    }
  }

  public async updateSchool(id: number, schoolData: IUpdateSchool): Promise<ISchool> {
    try {
      const school = await School.findByPk(id);
      if (!school) {
        throw new HttpException(404, "School not found");
      }

      await school.update(schoolData as any);
      return school.toJSON() as ISchool;
    } catch (error: any) {
      throw new HttpException(500, `Failed to update school: ${error.message}`);
    }
  }

 public async deleteSchool(id: number): Promise<boolean> {
  try {
    const school = await School.findByPk(id);
    if (!school) {
      throw new HttpException(404, "School not found");
    }

    // Permanently delete the record
    await school.destroy();
    return true;
  } catch (error: any) {
    throw new HttpException(500, `Failed to delete school: ${error.message}`);
  }
}

  public async getActiveSchools(): Promise<ISchool[]> {
    try {
      const schools = await School.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
      });
      return schools.map(school => school.toJSON() as ISchool);
    } catch (error: any) {
      throw new HttpException(500, `Failed to get active schools: ${error.message}`);
    }
  }
}
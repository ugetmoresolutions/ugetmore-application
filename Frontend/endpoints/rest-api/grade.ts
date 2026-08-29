import { CustomResponse } from "@/interfaces/product/response";
import { DELETE, GET, POST, PUT } from "../lib/rest-api-client";
import { baseUrl } from "../url";
import { ICreateGrade, IGrade, IGradeWithSchool, IUpdateGrade } from "@/interfaces/grade/grade";

const GradeBaseURL = `${baseUrl}/grades`;

export const GRADE_API = {
  // GET all grades for a specific school
  GET_GRADES_BY_SCHOOL: async (schoolId: number): Promise<CustomResponse<IGrade[]>> => {
    try {
      const response = await GET(`${GradeBaseURL}/school/${schoolId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET grade by ID
  GET_GRADE_BY_ID: async (gradeId: number): Promise<CustomResponse<IGrade>> => {
    try {
      const response = await GET(`${GradeBaseURL}/${gradeId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET grade with school information
  GET_GRADE_WITH_SCHOOL: async (gradeId: number): Promise<CustomResponse<IGradeWithSchool>> => {
    try {
      const response = await GET(`${GradeBaseURL}/${gradeId}/with-school`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE new grade
  CREATE_GRADE: async (gradeData: ICreateGrade): Promise<CustomResponse<IGrade>> => {
    try {
      const response = await POST(`${GradeBaseURL}`, gradeData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE grade
  UPDATE_GRADE: async (gradeId: number, updateData: IUpdateGrade): Promise<CustomResponse<IGrade>> => {
    try {
      const response = await PUT(`${GradeBaseURL}/${gradeId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE grade (soft delete)
  DELETE_GRADE: async (gradeId: number): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${GradeBaseURL}/${gradeId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
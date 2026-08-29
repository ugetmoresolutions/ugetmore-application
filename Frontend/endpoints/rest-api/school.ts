import { CustomResponse } from "@/interfaces/product/response";
import { DELETE, GET, POST, PUT } from "../lib/rest-api-client";
import { baseUrl } from "../url";
import { ISchool, ICreateSchool, IUpdateSchool } from "@/interfaces/school/school";

const SchoolBaseURL = `${baseUrl}/schools`;

export const SCHOOL_API = {
  // GET all schools
  GET_ALL_SCHOOLS: async (): Promise<CustomResponse<ISchool[]>> => {
    try {
      const response = await GET(`${SchoolBaseURL}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET active schools only
  GET_ACTIVE_SCHOOLS: async (): Promise<CustomResponse<ISchool[]>> => {
    try {
      const response = await GET(`${SchoolBaseURL}/active`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET school by ID
  GET_SCHOOL_BY_ID: async (schoolId: number): Promise<CustomResponse<ISchool>> => {
    try {
      const response = await GET(`${SchoolBaseURL}/${schoolId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET school by code
  GET_SCHOOL_BY_CODE: async (code: string): Promise<CustomResponse<ISchool>> => {
    try {
      const response = await GET(`${SchoolBaseURL}/code/${encodeURIComponent(code)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE new school
  CREATE_SCHOOL: async (schoolData: ICreateSchool): Promise<CustomResponse<ISchool>> => {
    try {
      const response = await POST(`${SchoolBaseURL}`, schoolData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE school
  UPDATE_SCHOOL: async (schoolId: number, updateData: IUpdateSchool): Promise<CustomResponse<ISchool>> => {
    try {
      const response = await PUT(`${SchoolBaseURL}/${schoolId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE school (soft delete)
  DELETE_SCHOOL: async (schoolId: number): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${SchoolBaseURL}/${schoolId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
import { CustomResponse } from "@/interfaces/product/response";
import { baseUrl } from "../url";
import { DELETE, GET, POST, PUT } from "../lib/rest-api-client";

const SupplierBaseURL = `${baseUrl}/suppliers`;


// types/supplier/supplier.type.ts
export interface ISupplier {
  id?: number;
  name: string;
  account: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateSupplier {
  name: string;
  account: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface IUpdateSupplier {
  name?: string;
  account?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const SUPPLIER_API = {
  // GET all suppliers
  GET_ALL_SUPPLIERS: async (): Promise<CustomResponse<ISupplier[]>> => {
    try {
      const response = await GET(`${SupplierBaseURL}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // GET supplier by account
  GET_SUPPLIER_BY_ACCOUNT: async (account: string): Promise<CustomResponse<ISupplier>> => {
    try {
      const response = await GET(`${SupplierBaseURL}/${account}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // CREATE new supplier
  CREATE_SUPPLIER: async (supplierData: ICreateSupplier): Promise<CustomResponse<ISupplier>> => {
    try {
      const response = await POST(`${SupplierBaseURL}/create`, supplierData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE supplier
  UPDATE_SUPPLIER: async (account: string, updateData: Partial<ICreateSupplier>): Promise<CustomResponse<ISupplier>> => {
    try {
      const response = await PUT(`${SupplierBaseURL}/${account}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE supplier
  DELETE_SUPPLIER: async (account: string): Promise<CustomResponse<null>> => {
    try {
      const response = await DELETE(`${SupplierBaseURL}/${account}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
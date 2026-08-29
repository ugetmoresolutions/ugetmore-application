import { Address } from "@/models/user/user.model";
import { Request } from "express";

export type TokenData = {

  accessToken: string;
  refreshToken: string;
  expiresAt: Date
}

export interface RequestWithUser extends Request {
  user: DataStoreInToken;
}

export type IUser = {
  id?: number;
  email: string;
  password: string;
  role: string;
  phone : string;
  fullName: string;
  address?: string;
  businessName?: string;
  businessType?: string;
  taxNumber?: string;
  ordersCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isEmailVerified? : boolean
}

export type DataStoreInToken = {
  id: number,
  email: string,
  role: string,
  phone : string;
  fullName: string,
  address?: string;
  businessName?: string;
  businessType?: string;
  vatNumber?: string;
}
export enum UserRole {
  Customer = "customer",
  Admin = "admin",
  Business = "business"
}


export type IUserLogin = {
  email: string;
  password: string
}
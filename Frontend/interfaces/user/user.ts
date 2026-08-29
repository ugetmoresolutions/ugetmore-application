export type TokenData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

export interface RequestWithUser extends Request {
  user: DataStoreInToken;
}

export type IAdminUser = {
  id?: number;
  email: string;
  password: string;
  role: string;
  phone: string;
  fullName: string;
  address?: string;
  businessName?: string;
  businessType?: string;
  vatNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IUser = {
  id: number;
  email: string;
  password: string;
  role: string;
  phone: string;
  fullName: string;
  address?: string;
  businessName?: string;
  businessType?: string;
  vatNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IUserSignUp = {
  email: string;
  password: string;
  role: string;
  phone: string;
  fullName: string;
  address?: string;
  businessName?: string;
  businessType?: string;
  vatNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface IUpdatePassword {
  userId: number;
  oldPassword: string;
  newPassword: string;
}

export type DataStoreInToken = {
  id: number;
  email: string;
  role: string;
  phone: string;
  fullName: string;
  address?: string;
};
export enum UserRole {
  Customer = "customer",
  Business = "business",
  Admin = "admin",
}

export type IUserLogin = {
  email: string;
  password: string;
};

export interface IDecodedJWT {
  id: number;
  email: string;
  role: string;
  phone: string;
  businessName?: string;
  fullName: string;
  address?: string;
  vatNumber: number;
  exp: number;
  iat: number;
}

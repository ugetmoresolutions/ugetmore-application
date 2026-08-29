import { IUser, TokenData } from "@/types/user/auth.types";
import { Token } from "typedi";

export interface IAuthService {
  signup(userData: IUser): Promise<TokenData>;
  login(userData: IUser): Promise<IUser>;
  refreshToken(token: string): Promise<TokenData>;
  logout(token: string): Promise<void>;
  updateUser(userData: Partial<IUser>): Promise<TokenData>;
  sendOtp(email: string): Promise<string>;
  verifyOtp(email: string, otp: string): Promise<string>;
  findUserById(userId: number): Promise<IUser | null>
  resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<IUser>;
  updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<IUser>
   deleteUser(userId: number): Promise<boolean>;
  getAdminUsers(): Promise<IUser[]>;
   getAllUsers(): Promise<IUser[]>;
   adminSignup(userData: IUser): Promise<TokenData>; 
}


export const AUTH_SERVICE_TOKEN = new Token<IAuthService>("IAuthService");
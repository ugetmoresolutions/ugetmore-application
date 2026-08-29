import RefreshToken from "@/models/user/refreshToken.model";
import { IUser } from "@/types/user/auth.types";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date
  ): Promise<void>;
  findRefreshToken(token: string): Promise<RefreshToken | null>;
  findUserById(userId: number): Promise<IUser | null>;
  deleteRefreshToken(tokenId: string): Promise<void>;
  updateUser(userData: Partial<IUser>): Promise<IUser>;
  findById(userId: number): Promise<IUser>;
  findUsersByRole(role: string): Promise<IUser[]>;
  saveOtp(email: string, otp: string): Promise<void>;
  validateOtp(email: string, otp: string): Promise<IUser>;
  forgotPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<IUser>;
  resetPasswordWithOtp(
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

  getAllUsers(): Promise<IUser[]>;
}

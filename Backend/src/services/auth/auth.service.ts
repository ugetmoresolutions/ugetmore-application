import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { Service } from "typedi";
import { FRONT_END_URL, SECRET_KEY } from "../../config";
import { HttpException } from "../../exceptions/HttpException";
import crypto from "crypto";
import { AuthRepository } from "@/repositories/auth/auth.repository";
import {
  AUTH_SERVICE_TOKEN,
  IAuthService,
} from "@/interfaces/auth/IAuthService.interface";
import {
  DataStoreInToken,
  IUser,
  IUserLogin,
  TokenData,
} from "@/types/user/auth.types";
import { Response } from "express";
import { Address } from "@/models/user/user.model";
import { adminCredentialsTemplate, sendMail } from "@/utils/email";

@Service({ id: AUTH_SERVICE_TOKEN })
export class AuthService implements IAuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  private async createToken(
    userData: IUser,
    res?: Response
  ): Promise<TokenData> {
    const dataStoredInToken: DataStoreInToken = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      fullName: userData.fullName,
      phone: userData.phone,
      address: userData.address,
      businessName: userData.businessName,
      businessType: userData.businessType,
      vatNumber: userData.taxNumber,
    };

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    const accessToken = sign(dataStoredInToken, SECRET_KEY, {
      expiresIn: "3d",
    });

    const refreshToken = crypto.randomBytes(40).toString("hex");

    if (res) {
      res.cookie(
        "user_data",
        JSON.stringify({
          email: userData.email,
          role: userData.role,
          fullName: userData.fullName,
          phone: userData.phone,
          address: userData.address,
          businessName: userData.businessName,
          businessType: userData.businessType,
          taxNumber: userData.taxNumber,
        }),
        {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 72 * 60 * 60 * 1000,
          path: "/",
          signed: true,
        }
      );
    }

    return { expiresAt, accessToken, refreshToken };
  }

  // In your AuthService class - ADD THIS METHOD
  public async adminSignup(
    userData: IUser & { password: string }
  ): Promise<TokenData> {
    const findUser = await this.authRepository.findUserByEmail(userData.email);
    if (findUser) {
      throw new HttpException(
        409,
        `This email ${userData.email} already exists`
      );
    }

    // Force admin role and remove email sending from regular signup
    const adminUserData = {
      ...userData,
      role: "admin",
    };

    const hashedPassword = await hash(adminUserData.password, 10);
    const createdUser = await this.authRepository.createUser({
      ...adminUserData,
      password: hashedPassword,
      isEmailVerified: false
    });

    // Send admin credentials email - MOVED FROM REGULAR SIGNUP
    try {
      const loginUrl = `${FRONT_END_URL}/client/auth/login`;
      const emailSubject = `Admin Account Created - UGetMo`;
      const emailText = `Dear ${userData.fullName},\n\nYour admin account has been created.\n\nEmail: ${userData.email}\nPassword: ${userData.password}\n\nPlease login at: ${loginUrl}\n\nBest regards,\nUGetMo Team`;
      const emailHtml = adminCredentialsTemplate(
        userData.fullName,
        userData.email,
        userData.password,
        loginUrl
      );

      await sendMail(userData.email, emailSubject, emailText, emailHtml);

      console.log(`✅ Admin credentials sent to: ${userData.email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send admin credentials email:`, emailError);
    }

    return await this.createToken(createdUser);
  }

  // UPDATE YOUR SIGNUP METHOD TO SEND VERIFICATION EMAIL
  public async signup(
    userData: IUser & { password: string }
  ): Promise<TokenData> {
    const findUser = await this.authRepository.findUserByEmail(userData.email);
    if (findUser) {
      throw new HttpException(
        409,
        `This email ${userData.email} already exists`
      );
    }

    const hashedPassword = await hash(userData.password, 10);
    const createdUser = await this.authRepository.createUser({
      ...userData,
      password: hashedPassword,
      isEmailVerified: false, // Ensure new users start unverified
    });

    // Send verification email
    await this.sendVerificationEmail(createdUser);

    return await this.createToken(createdUser);
  }

  public async deleteUser(userId: number): Promise<boolean> {
    try {
      // Optional: Add business logic checks here
      // For example, prevent deleting your own account:
      // if (userId === currentUserId) {
      //   throw new HttpException(400, "Cannot delete your own account");
      // }

      return await this.authRepository.deleteUser(userId);
    } catch (error) {
      // Just re-throw HttpExceptions, they already have proper messages
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Failed to delete user: ${error.message}`);
    }
  }

  public async getAdminUsers(): Promise<IUser[]> {
    try {
      return await this.authRepository.findUsersByRole("admin");
    } catch (error) {
      throw new HttpException(
        500,
        `Failed to retrieve admin users: ${error.message}`
      );
    }
  }

  public async sendVerificationEmail(userData: IUser): Promise<void> {
    try {
      // Generate verification token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Save token to database
      await this.authRepository.saveEmailVerificationToken(
        userData.email,
        token,
        expiresAt
      );

      // Create verification URL
      const verificationUrl = `${FRONT_END_URL}/client/auth/verify-email?token=${token}`;

      // Send verification email
      const emailSubject = "Verify Your Email - UGetMo";
      const emailText = `Please verify your email by clicking the following link: ${verificationUrl}`;

      // You'll need to create this template or use your existing one
      const emailHtml = this.createVerificationEmailTemplate(
        userData.fullName,
        verificationUrl
      );

      await sendMail(userData.email, emailSubject, emailText, emailHtml);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new HttpException(500, "Failed to send verification email");
    }
  }

  private createVerificationEmailTemplate(
    fullName: string,
    verificationUrl: string
  ): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
        .button { background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Verify Your Email Address</h2>
        <p>Hello ${fullName},</p>
        <p>Thank you for signing up with UGetMo! Please verify your email address by clicking the button below:</p>
        <p><a href="${verificationUrl}" class="button">Verify Email</a></p>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;
  }

  public async verifyEmail(token: string): Promise<IUser> {
    try {
      return await this.authRepository.verifyEmail(token);
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async resendVerificationEmail(email: string): Promise<void> {
  try {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (user.isEmailVerified) {
      throw new HttpException(400, "Email is already verified");
    }

    // Generate new verification token
    const token = await this.authRepository.resendVerificationEmail(email);

    const verificationUrl = `${FRONT_END_URL}/client/auth/verify-email?token=${token}`;
    const emailSubject = "Verify Your Email - UGetMo";
    const emailText = `Please verify your email by clicking the following link: ${verificationUrl}`;
    const emailHtml = this.createVerificationEmailTemplate(
      user.fullName,
      verificationUrl
    );

    await sendMail(email, emailSubject, emailText, emailHtml);
    
    console.log(`✅ Verification email sent to: ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error);
    
    // If it's an HttpException, re-throw it
    if (error instanceof HttpException) {
      throw error;
    }
    
    // For other errors, throw a more specific error
    throw new HttpException(500, "Failed to send verification email. Please try again.");
  }
}
  public async checkEmailVerification(userId: number): Promise<boolean> {
    try {
      return await this.authRepository.isEmailVerified(userId);
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  // UPDATE YOUR LOGIN METHOD TO PROPERLY HANDLE EMAIL VERIFICATION ERRORS
public async login(userData: IUserLogin): Promise<IUser> {
  try {
    if (!userData.password) {
      throw new HttpException(400, "Password is required");
    }

    const findUser = await this.authRepository.findUserByEmail(
      userData.email
    );
    if (!findUser) {
      throw new HttpException(404, `Email ${userData.email} not found`);
    }

    if (!findUser.password) {
      throw new HttpException(404, "User password not found in database");
    }

    const comparePassword = await compare(
      userData.password,
      findUser.password
    );
    if (!comparePassword) {
      throw new HttpException(400, "Invalid password");
    }

    // CHECK IF EMAIL IS VERIFIED - DON'T THROW 500 ERROR
    if (!findUser.isEmailVerified) {
      // Send verification email automatically when user tries to login
      await this.resendVerificationEmail(userData.email);
      
      throw new HttpException(
        403, // Use 403 Forbidden instead of 500
        "Please verify your email before logging in. We've sent a new verification link to your email."
      );
    }

    return findUser;
  } catch (error) {
    // Don't wrap HttpExceptions in 500 errors
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(500, error.message);
  }
}

  public async refreshToken(token: string): Promise<TokenData> {
    if (!token) {
      throw new HttpException(404, "Token not provided");
    }

    const storedToken = await this.authRepository.findRefreshToken(token);
    if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
      throw new HttpException(401, "Invalid or expired token");
    }

    const user = await this.authRepository.findUserById(storedToken.userId);
    if (!user) {
      throw new HttpException(404, `User associated with this token not found`);
    }

    const newToken = await this.createToken(user);
    await this.authRepository.deleteRefreshToken(token);
    await this.authRepository.saveRefreshToken(
      user.id,
      newToken.refreshToken,
      newToken.expiresAt
    );
    return newToken;
  }

  /**
   * Get all users except admins
   */
  public async getAllUsers(): Promise<IUser[]> {
    try {
      return await this.authRepository.getAllUsers();
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get all users: ${error.message}`);
    }
  }

  public async logout(token: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(token);
  }

  public async updateUser(userData: Partial<IUser>): Promise<TokenData> {
    if (!userData.id) {
      throw new HttpException(400, "User ID is required for update");
    }

    const existingUser = await this.authRepository.findById(userData.id);
    if (!existingUser) {
      throw new HttpException(404, "User not found");
    }

    if (userData.password) {
      userData.password = await hash(userData.password, 10);
    }

    const updateResult = await this.authRepository.updateUser(userData);

    if (!updateResult) {
      throw new HttpException(500, "Failed to update user");
    }
    const updatedUser = await this.authRepository.findById(userData.id);

    if (!updatedUser) {
      throw new HttpException(500, "Failed to retrieve updated user");
    }

    return await this.createToken(updatedUser);
  }

  public async sendOtp(email: string): Promise<any> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpException(404, "User Not Found");
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.authRepository.saveOtp(email, otp);
    const response = {
      otp,
      fullName: user.fullName,
    };
    return response;
  }

  public async verifyOtp(email: string, otp: string): Promise<string> {
    const isValid = await this.authRepository.validateOtp(email, otp);
    if (!isValid) {
      throw new HttpException(400, "Invalid or expired OTP");
    }
    return "OTP verified successfully";
  }

  public async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<IUser> {
    try {
      const updatedUser = await this.authRepository.resetPasswordWithOtp(
        email,
        otp,
        newPassword
      );

      return updatedUser;
    } catch (error) {
      throw new HttpException(400, error.message || "Password reset failed");
    }
  }

  public async findUserById(userId: number): Promise<IUser | null> {
    try {
      return await this.authRepository.findUserById(userId);
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<IUser> {
    try {
      return await this.authRepository.updatePassword(
        userId,
        oldPassword,
        newPassword
      );
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  /**
   * Add address to user
   */
  public async addUserAddress(userId: number, address: string): Promise<IUser> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      if (!address || typeof address !== "string") {
        throw new HttpException(400, "Valid address string is required");
      }

      return await this.authRepository.addUserAddress(userId, address);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Failed to add address: ${error.message}`);
    }
  }

  /**
   * Update user addresses
   */
  public async updateUserAddresses(
    userId: number,
    addresses: string // Changed from string[] to string
  ): Promise<IUser> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      if (!addresses || typeof addresses !== "string") {
        // Changed validation
        throw new HttpException(400, "Valid address string is required");
      }

      return await this.authRepository.updateUserAddresses(userId, addresses);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to update addresses: ${error.message}`
      );
    }
  }

  /**
   * Get user addresses
   */
  public async getUserAddresses(userId: number): Promise<string> {
    // Changed return type
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      return await this.authRepository.getUserAddresses(userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, `Failed to get addresses: ${error.message}`);
    }
  }

  /**
   * Remove address from user
   * Updated to remove addressIndex parameter since it's no longer relevant
   */
  public async removeUserAddress(userId: number): Promise<IUser> {
    try {
      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      return await this.authRepository.removeUserAddress(userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        `Failed to remove address: ${error.message}`
      );
    }
  }
}

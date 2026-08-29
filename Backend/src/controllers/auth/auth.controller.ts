import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { AUTH_SERVICE_TOKEN } from "@/interfaces/auth/IAuthService.interface";
import {
  DataStoreInToken,
  IUser,
  IUserLogin,
  TokenData,
} from "@/types/user/auth.types";
import { CustomResponse } from "@/types/response.interface";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { HttpException } from "@/exceptions/HttpException";
import { otpEmailTemplate, sendMail } from "@/utils/email";
import { FRONT_END_URL, SECRET_KEY } from "@/config";
import { Address } from "@/models/user/user.model";

export class AuthController {
  private auth;

  constructor() {
    this.auth = Container.get(AUTH_SERVICE_TOKEN);
  }

  private setAuthCookies(res: Response, tokenData: TokenData, userData: IUser) {
    const isProduction = true;

    res.cookie("access_token", tokenData.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 259200000,
      path: "/",
      signed: true,
    });

    res.cookie(
      "user_data",
      JSON.stringify({
        id: userData.id,
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
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 259200000,
        path: "/",
        signed: true,
      }
    );
  }

  private clearAuthCookies(res: Response) {
    const isProduction = true;

    res.clearCookie("access_token", {
      path: "/",
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.clearCookie("user_data", {
      path: "/",
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
  }
  private createToken(userData: DataStoreInToken): TokenData {
    const payload: DataStoreInToken = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      fullName: userData.fullName,
      phone: userData.phone,
      address: userData.address,
      businessName: userData.businessName,
      businessType: userData.businessType,
      vatNumber: userData.vatNumber,
    };

    return {
      expiresAt: new Date(Date.now() + 259200000),
      accessToken: jwt.sign(payload, SECRET_KEY, { expiresIn: "3d" }),
      refreshToken: crypto.randomBytes(40).toString("hex"),
    };
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: IUserLogin = req.body;
      const loggedInUser = await this.auth.login(userData);
      const tokenData = this.createToken({
        id: loggedInUser.id,
        email: loggedInUser.email,
        role: loggedInUser.role,
        fullName: loggedInUser.fullName,
        phone: loggedInUser.phone,
        address: loggedInUser.address,
        businessName: loggedInUser.businessName,
        businessType: loggedInUser.businessType,
        vatNumber: loggedInUser.vatNumber,
      });

      this.setAuthCookies(res, tokenData, loggedInUser);

      const response: CustomResponse<TokenData> = {
        data: tokenData,
        message: "User logged in successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };


   /**
   * Get all users except admins
   */
  public getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const users = await this.auth.getAllUsers();

      const response: CustomResponse<IUser[]> = {
        data: users,
        message: "Non-admin users retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
  
  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const signUpUserData = await this.auth.signup(userData);
      this.setAuthCookies(res, signUpUserData, userData);

      const response: CustomResponse<TokenData> = {
        data: signUpUserData,
        message: "User registered successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      // If it's an HttpException, handle it with proper response format
      if (error instanceof HttpException) {
        const response: CustomResponse<null> = {
          data: null,
          message: error.message,
          error: true,
        };
        return res.status(error.status).json(response);
      }
      // For other errors, pass to the global error handler
      next(error);
    }
  };

  // In your AuthController class - ADD THIS METHOD
public adminSignup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = req.body;
    const signUpUserData = await this.auth.adminSignup(userData);
    this.setAuthCookies(res, signUpUserData, userData);

    const response: CustomResponse<TokenData> = {
      data: signUpUserData,
      message: "Admin user registered successfully",
      error: false,
    };
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof HttpException) {
      const response: CustomResponse<null> = {
        data: null,
        message: error.message,
        error: true,
      };
      return res.status(error.status).json(response);
    }
    next(error);
  }
};

  public findUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.userId;
      const user = await this.auth.findUserById(userId);
      const response: CustomResponse<IUser> = {
        data: user,
        message: "User fetched successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        const response: CustomResponse<null> = {
          data: null,
          message: "Invalid user ID",
          error: true,
        };
        return res.status(400).json(response);
      }

      const isDeleted = await this.auth.deleteUser(userId);

      const response: CustomResponse<{ deleted: boolean }> = {
        data: { deleted: isDeleted },
        message: "User deleted successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      // Handle HttpException with proper response format
      if (error instanceof HttpException) {
        const response: CustomResponse<null> = {
          data: null,
          message: error.message,
          error: true,
        };
        return res.status(error.status).json(response);
      }
      next(error);
    }
  };

  // Add these methods to your AuthController class

public verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      throw new HttpException(400, "Verification token is required");
    }

    const verifiedUser = await this.auth.verifyEmail(token);

    const response: CustomResponse<IUser> = {
      data: verifiedUser,
      message: "Email verified successfully",
      error: false,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

public resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new HttpException(400, "Email is required");
    }

    await this.auth.resendVerificationEmail(email);

    const response: CustomResponse<null> = {
      data: null,
      message: "Verification email sent successfully",
      error: false,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

public checkEmailVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId || userId <= 0) {
      throw new HttpException(400, "Valid user ID is required");
    }

    const isVerified = await this.auth.checkEmailVerification(userId);

    const response: CustomResponse<{ isVerified: boolean }> = {
      data: { isVerified },
      message: isVerified ? "Email is verified" : "Email is not verified",
      error: false,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
  
  public getAdminUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const adminUsers = await this.auth.getAdminUsers();

      const response: CustomResponse<IUser[]> = {
        data: adminUsers,
        message: "Admin users retrieved successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = req.body;
      const user = await this.auth.updatePassword(
        data.userId,
        data.oldPassword,
        data.newPassword
      );
      const response: CustomResponse<IUser> = {
        data: user,
        message: "Password updated successfully",
        error: false,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token: string = req.body.token;
      const newToken = await this.auth.refreshToken(token);
      this.setAuthCookies(res, newToken, newToken);
      const response: CustomResponse<TokenData> = {
        data: newToken,
        message: "Token refreshed successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.params.token;
      await this.auth.logout(token.toString());
      this.clearAuthCookies(res);
      const response: CustomResponse<null> = {
        data: null,
        message: "User logged out successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData: Partial<IUser> = req.body;
      const updatedUser = await this.auth.updateUser(userData);
      const response: CustomResponse<IUser> = {
        data: updatedUser,
        message: "User updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      console.log("Email", email);
      const message = await this.auth.sendOtp(email);
      await sendMail(
        email,
        "One Time OTP",
        "One time OTP",
        otpEmailTemplate(
          message.fullName,
          message.otp,
          "UGetMo ",
          "Reset Password"
        )
      );
      const response: CustomResponse<null> = {
        data: null,
        message: "OTP sent successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public verifyOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, otp } = req.body;
      const message = await this.auth.verifyOtp(email, otp);
      const response: CustomResponse<null> = {
        data: null,
        message,
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updatePasswordWithOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, otp, newPassword } = req.body;

      // Basic validation in controller
      if (!email || !otp || !newPassword) {
        throw new HttpException(
          400,
          "Email, OTP and new password are required"
        );
      }

      const updatedUser = await this.auth.resetPassword(
        email,
        otp,
        newPassword
      );

      const response: CustomResponse<IUser> = {
        data: updatedUser,
        message: "Password updated successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user addresses
   */
  public updateUserAddresses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, addresses } = req.body;

      if (!userId || !addresses) {
        throw new HttpException(400, "User ID and addresses are required");
      }

      const updatedUser = await this.auth.updateUserAddresses(
        userId,
        addresses
      );

      const response: CustomResponse<IUser> = {
        data: updatedUser,
        message: "Addresses updated successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user addresses
   */
  public getUserAddresses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = parseInt(req.params.userId);

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const addresses = await this.auth.getUserAddresses(userId);

      const response: CustomResponse<string[]> = {
        data: addresses,
        message: "Addresses fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add address to user
   */
  public addUserAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, address } = req.body;

      if (!userId || !address) {
        throw new HttpException(400, "User ID and address are required");
      }

      const updatedUser = await this.auth.addUserAddress(userId, address);

      const response: CustomResponse<IUser> = {
        data: updatedUser,
        message: "Address added successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove address from user
   */
  public removeUserAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, addressIndex } = req.body;

      if (!userId || addressIndex === undefined) {
        throw new HttpException(400, "User ID and address index are required");
      }

      const updatedUser = await this.auth.removeUserAddress(
        userId,
        addressIndex
      );

      const response: CustomResponse<IUser> = {
        data: updatedUser,
        message: "Address removed successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

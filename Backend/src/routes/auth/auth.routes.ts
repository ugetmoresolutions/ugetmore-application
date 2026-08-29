import { Router } from "express";
import { AuthController } from "../../controllers/auth/auth.controller";
import { ValidationMiddleware } from "@/middlewares/ValidationMiddleware";
import { Routes } from "@/types/routes.interface";
import { CreateUserDto } from "@/dots/auth/user.dot";


export class AuthRoute implements Routes {
  public path = "/auth";
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/signup`,
      ValidationMiddleware(CreateUserDto),
      this.auth.signup
    );
    this.router.post(`${this.path}/login`, this.auth.login);
    this.router.post(`${this.path}/refreshtoken`, this.auth.refreshToken);
    this.router.put(`${this.path}/updateUser`, this.auth.updateUser);
    this.router.post(`${this.path}/send-otp`, this.auth.sendOtp);
    this.router.get(`${this.path}/findUserById/:userId`, this.auth.findUserById);
    this.router.post(`${this.path}/verify-otp`, this.auth.verifyOtp);
      this.router.put(`${this.path}/updatePassword`, this.auth.updatePassword);
    this.router.post(
      `${this.path}/update-password`,
      this.auth.updatePasswordWithOtp
    );
      // Email Verification Routes
  this.router.post(`${this.path}/verify-email`, this.auth.verifyEmail);
  this.router.post(`${this.path}/resend-verification`, this.auth.resendVerification);
  this.router.get(`${this.path}/:userId/email-verification`, this.auth.checkEmailVerification);
  
    this.router.get(`${this.path}/admins`, this.auth.getAdminUsers);
    this.router.put(`${this.path}/addresses`, this.auth.updateUserAddresses);
    this.router.get(`${this.path}/:userId/addresses`, this.auth.getUserAddresses);
    this.router.post(`${this.path}/address`, this.auth.addUserAddress);
    this.router.delete(`${this.path}/address`, this.auth.removeUserAddress);
    // ADD DELETE USER ROUTE
    this.router.delete(`${this.path}/users/:userId`, this.auth.deleteUser);

    // Admin signup - NEW SEPARATE ENDPOINT
    this.router.post(
      `${this.path}/admin/signup`,
      ValidationMiddleware(CreateUserDto),
      this.auth.adminSignup
    );

    // ADD GET ALL NON-ADMIN USERS ROUTE
    this.router.get(`${this.path}/users`, this.auth.getAllUsers);
  }
}

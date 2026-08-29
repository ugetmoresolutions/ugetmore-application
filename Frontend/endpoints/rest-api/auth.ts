import { CustomResponse } from "@/interfaces/product/response";
import { baseUrl } from "../url";
import { IAdminUser, IUpdatePassword, IUser, IUserLogin, IUserSignUp, TokenData } from "@/interfaces/user/user";
import { DELETE, GET, POST, PUT } from "../lib/rest-api-client";

const AuthbaseURL = `${baseUrl}/auth`;


export const AUTH_API = {
    LOGIN: async (userData: IUserLogin) => {
        try {
            const response = await POST(`${AuthbaseURL}/login`, userData);
            return response
        } catch (error) {
            throw error;
        }
    },
    SIGNUP: async (userData: IUserSignUp) => {
        try {
            const response = await POST(`${AuthbaseURL}/signup`, userData);
            return response
        } catch (error) {
            throw error;
        }
    },

    ADMIN_SIGNUP: async (userData: IAdminUser) => {
        try {
            const response = await POST(`${AuthbaseURL}/admin/signup`, userData);
            return response
        } catch (error) {
            throw error;
        }
    },

    SEND_OTP: async (data: any) => {
        try {
            const response = await POST(`${AuthbaseURL}/send-otp`, data);
            return response;
        } catch (error) {
            throw error;
        }
    }
    ,
    VERIFY_OTP: async (data: any): Promise<CustomResponse<TokenData>> => {
        try {
            const response = await POST(`${AuthbaseURL}/verify-otp`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    RESET_PASSWORD: async (data: any): Promise<CustomResponse<IUser>> => {
        try {
            const response = await POST(`${AuthbaseURL}/update-password`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // ADD GET ALL USERS ENDPOINT (non-admin users)
    GET_ALL_USERS: async (): Promise<CustomResponse<IUser[]>> => {
        try {
            const response = await GET(`${AuthbaseURL}/users`);
            return response;
        } catch (error) {
            throw error;
        }
    },


     // New endpoint for getting admin users
    GET_ADMIN_USERS: async (): Promise<CustomResponse<IUser[]>> => {
        try {
            const response = await GET(`${AuthbaseURL}/admins`);
            return response;
        } catch (error) {
            throw error;
        }
    },

     // ADD DELETE USER ENDPOINT
    DELETE_USER: async (userId: number): Promise<CustomResponse<{ deleted: boolean }>> => {
        try {
            const response = await DELETE(`${AuthbaseURL}/users/${userId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
    
    UPDATE_PASSWORD: async (data: IUpdatePassword) => {
        try {
            const response = await PUT(`${AuthbaseURL}/updatePassword`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    UPDATE_USER: async (data: any): Promise<CustomResponse<TokenData>> => {
        try {
            const response = await PUT(`${AuthbaseURL}/updateUser`, data);
            return response;
        } catch (error) {
            throw error;
        }
    }
    ,
    GET_USER: async (userId: number): Promise<CustomResponse<IUser>> => {
        try {
            const response = await GET(`${AuthbaseURL}/findUserById/${userId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
    ,

      UPDATE_USER_ADDRESSES: async (userId: number, addresses: string): Promise<CustomResponse<any>> => {
    try {
      const response = await PUT(`${AuthbaseURL}/addresses`, { userId, addresses });
      return response;
    } catch (error) {
      throw error;
    }
  },

  GET_USER_ADDRESSES: async (userId: number): Promise<CustomResponse<string>> => {
    try {
      const response = await GET(`${AuthbaseURL}/${userId}/addresses`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  ADD_USER_ADDRESS: async (userId: number, address: string): Promise<CustomResponse<any>> => {
    try {
      const response = await POST(`${AuthbaseURL}/address`, { userId, address });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Email Verification Endpoints
    VERIFY_EMAIL: async (token: string): Promise<CustomResponse<IUser>> => {
        try {
            const response = await POST(`${AuthbaseURL}/verify-email`, { token });
            return response;
        } catch (error) {
            throw error;
        }
    },

    RESEND_VERIFICATION_EMAIL: async (email: string): Promise<CustomResponse<null>> => {
        try {
            const response = await POST(`${AuthbaseURL}/resend-verification`, { email });
            return response;
        } catch (error) {
            throw error;
        }
    },

    CHECK_EMAIL_VERIFICATION: async (userId: number): Promise<CustomResponse<{ isVerified: boolean }>> => {
        try {
            const response = await GET(`${AuthbaseURL}/${userId}/email-verification`);
            return response;
        } catch (error) {
            throw error;
        }
    },

//   REMOVE_USER_ADDRESS: async (userId: number, addressIndex: number): Promise<CustomResponse<any>> => {
//     try {
//       const response = await DELETE(`${AuthbaseURL}/address`, { userId, addressIndex });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },


};
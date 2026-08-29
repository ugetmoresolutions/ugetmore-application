import { HttpException } from "@/exceptions/HttpException";
import { DataStoreInToken, RequestWithUser } from "@/types/user/auth.types";
import { NextFunction, Response } from "express";
import { verify, VerifyErrors } from "jsonwebtoken";
import cookieParser from 'cookie-parser';

export const cookieMiddleware = cookieParser('your-cookie-secret-here');

export const authorizationMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const token = req.signedCookies.access_token;        
        if (!token) {
            throw new HttpException(401, "Authentication required");
        }
        verify(token, "X2nL0%@1kF9gB8yV7!pA&j5zZ0HgRpR4H", (error: VerifyErrors, user: DataStoreInToken) => {
            if (error) {
                throw new HttpException(401, error.message);
            }           
           
            req.user = {
                ...user,
                ...(req.signedCookies.user_data ? JSON.parse(req.signedCookies.user_data) : {})
            };
            
            next();
        });
    } catch (error) {
        next(error);
    }
};

export const SuperAdminAuthorizationMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const token = req.signedCookies.access_token;
        
        if (!token) {
            throw new HttpException(401, "Authentication required");
        }

        verify(token, "X2nL0%@1kF9gB8yV7!pA&j5zZ0HgRpR4H", (error: VerifyErrors, user: DataStoreInToken) => {
            if (error) {
                throw new HttpException(401, error.message);
            }
            
            const userData = req.signedCookies.user_data 
                ? JSON.parse(req.signedCookies.user_data)
                : {};
            
            if (userData.role !== "SuperAdmin") {
                throw new HttpException(403, "Super admin rights required!");
            }
            
            req.user = {
                ...user,
                ...userData
            };
            
            next();
        });
    } catch (error) {
        next(error);
    }
};

export const AdminAuthorizationMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const token = req.signedCookies.access_token;
        
        if (!token) {
            throw new HttpException(401, "Authentication required");
        }

        verify(token, "X2nL0%@1kF9gB8yV7!pA&j5zZ0HgRpR4H", (error: VerifyErrors, user: DataStoreInToken) => {
            if (error) {
                throw new HttpException(401, error.message);
            }
            
            const userData = req.signedCookies.user_data 
                ? JSON.parse(req.signedCookies.user_data)
                : {};
            
            if (userData.role !== "Admin") {
                throw new HttpException(403, "Admin rights required!");
            }
            
            req.user = {
                ...user,
                ...userData
            };
            
            next();
        });
    } catch (error) {
        next(error);
    }
};

export const setAuthCookies = (res: Response, tokens: { accessToken: string, refreshToken: string }, userData: any) => {
    res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 72 * 60 * 60 * 1000, // 3 days
        signed: true
    });
    
    res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth/refresh',
        signed: true
    });
    
    res.cookie('user_data', JSON.stringify(userData), {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 72 * 60 * 60 * 1000, // 3 days
        signed: true
    });
};

export const clearAuthCookies = (res: Response) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('user_data');
};
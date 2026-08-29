import { NextFunction, Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
// import { logger } from "@/utils/validateEnv";
import { NODE_ENV } from "@/config";

export const ErrorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status = error.status || 500;
    const message = error.message || "Something went wrong";

    // logger.error(
    //   `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`
    // );

    res.status(status).json({
      success: false,
      message,
      stack: (NODE_ENV as string) === "development" ? error.stack : {},
    });
  } catch (error) {
    next(error);
  }
};

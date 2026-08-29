import { Request, Response, NextFunction } from "express";
import { HttpException } from "@/exceptions/HttpException";
import { IContactRequest } from "@/types/contact/contact.type";

export const validateContactForm = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Incoming request body:", req.body); // Add this line
    
    const { fullName, email, message }: IContactRequest = req.body;

    if (!fullName || !email || !message) {
      console.log("Validation failed - missing fields:", { fullName, email, message });
      throw new HttpException(400, "Name, email and message are required");
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpException(400, "Please enter a valid email address");
    }

    next();
  } catch (error) {
    next(error);
  }
};
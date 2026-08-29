import { NextFunction, Request, Response } from "express";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";
import { quoteEmailTemplate, sendMail } from "@/utils/email";

export class EmailController {

  public sendQuote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name,  email, subject, message } = req.body;

      if ( !email || !subject || !message) {
        throw new HttpException(400, "All fields are required: firstName, lastName, email, subject, message");
      }

      await sendMail(
        email,
        "Quote Request Confirmation",
        `Good Day ${name}`,
        
        quoteEmailTemplate(name, email, subject, message)
      );

      const response: CustomResponse<any> = {
        data: { sent: true },
        message: "Quote request sent successfully",
        error: false
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };


}
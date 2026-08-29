import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";
import { UNIFIED_PAYFAST_SERVICE_TOKEN } from "@/interfaces/payment/payment.service.interface";

export class UnifiedPayFastController {
  private payFastService;

  constructor() {
    this.payFastService = Container.get(UNIFIED_PAYFAST_SERVICE_TOKEN);
  }

  // controllers/payment/payfast.controller.ts - UPDATE

public generatePaymentFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, couponCode } = req.body; // ADD couponCode

    if (!userId) {
      throw new HttpException(400, "userId is required");
    }

    const paymentResponse = await this.payFastService.generatePaymentFromCart(
      Number(userId), 
      couponCode // PASS COUPON CODE
    );

    const response: CustomResponse<any> = {
      error: false,
      message: "Payment link created successfully",
      data: paymentResponse,
    };

    res.status(200).json(response);

  } catch (err) {
    console.error('💥 Payment generation error:', err);
    next(err);
  }
};

}
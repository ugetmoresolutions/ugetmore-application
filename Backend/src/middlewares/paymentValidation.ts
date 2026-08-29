// middleware/paymentValidation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '@/exceptions/HttpException';

interface PaymentPayload {
  orderData: {
    cartId: number;
    address: {
      street?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      country?: string;
      fullName: string;
      phone: string;
      email: string;
    };
    deliveryOption: 'delivery' | 'collection';
  };
  userId: number;
}

export const validatePaymentPayload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderData, userId } = req.body as PaymentPayload;

    // Check if main fields exist
    if (!orderData) {
      throw new HttpException(400, "Missing 'orderData' in request body");
    }

    if (!userId || typeof userId !== 'number') {
      throw new HttpException(400, "Missing or invalid 'userId' in request body");
    }

    // Validate orderData structure
    const { cartId, address, deliveryOption } = orderData;

    if (!cartId || typeof cartId !== 'number') {
      throw new HttpException(400, "Missing or invalid 'cartId' in orderData");
    }

    if (!address || typeof address !== 'object') {
      throw new HttpException(400, "Missing 'address' in orderData");
    }

    if (!deliveryOption || !['delivery', 'collection'].includes(deliveryOption)) {
      throw new HttpException(400, "Invalid 'deliveryOption'. Must be 'delivery' or 'collection'");
    }

    // Validate required address fields
    const { fullName, email, phone } = address;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      throw new HttpException(400, "Missing or invalid 'fullName' in address");
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      throw new HttpException(400, "Missing or invalid 'email' in address");
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      throw new HttpException(400, "Missing or invalid 'phone' in address");
    }

    // Optional: Validate other address fields if they exist
    if (address.street && typeof address.street !== 'string') {
      throw new HttpException(400, "Invalid 'street' in address");
    }

    if (address.city && typeof address.city !== 'string') {
      throw new HttpException(400, "Invalid 'city' in address");
    }

    if (address.province && typeof address.province !== 'string') {
      throw new HttpException(400, "Invalid 'province' in address");
    }

    if (address.postalCode && typeof address.postalCode !== 'string') {
      throw new HttpException(400, "Invalid 'postalCode' in address");
    }

    // Sanitize and normalize data
    req.body.orderData.address = {
      ...address,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      street: address.street?.trim() || '',
      city: address.city?.trim() || '',
      province: address.province?.trim() || '',
      postalCode: address.postalCode?.trim() || '',
      country: address.country?.trim() || 'South Africa'
    };

    console.log(`Payment validation passed for user ${userId}, cart ${cartId}`);
    next();
  } catch (error) {
    next(error);
  }
};

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Optional: Middleware to log payment requests
export const logPaymentRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { orderData, userId } = req.body;
  console.log(`Payment Request - User: ${userId}, Cart: ${orderData?.cartId}, Delivery: ${orderData?.deliveryOption}`);
  next();
};
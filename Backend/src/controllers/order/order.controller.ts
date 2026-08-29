import { NextFunction, Request, Response } from "express";
import { Container } from "typedi";
import { ORDER_SERVICE_TOKEN } from "@/interfaces/order/order.service.intreface";
import { CustomResponse } from "@/types/response.interface";
import { HttpException } from "@/exceptions/HttpException";
import { Address } from "@/types/order/order.types";
import { brandingStatusUpdateTemplate, mockupAddedTemplate, orderStatusUpdateTemplate, sendMail } from "@/utils/email";
import { IFIleURL, RequestWithFile } from "@/types/cart/cart.interface";
import { promisify } from "util";
import { FILE_UPLOAD_SERVICE_TOKEN } from "@/interfaces/file-upload/file-upload.service.interface";
import fs from 'fs';

export class OrderController {
  private orderService;
  private fileUploadService;

  constructor() {
    this.orderService = Container.get(ORDER_SERVICE_TOKEN);
    this.fileUploadService = Container.get(FILE_UPLOAD_SERVICE_TOKEN);
  }

  public createOrderFromCart = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, paymentReference } = req.body;

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const order = await this.orderService.createOrderFromCart(
        userId,
        paymentReference
      );

      const response: CustomResponse<typeof order> = {
        data: order,
        message: "Order created from cart successfully",
        error: false,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  public createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, total, items, paymentReference } = req.body;

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const order = await this.orderService.createOrder(userId, {
        total,
        items,
        paymentReference,
      });

      const response: CustomResponse<typeof order> = {
        data: order,
        message: "Order created successfully",
        error: false,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };


  // In your OrderController

public getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await this.orderService.getDashboardStats();

    const response: CustomResponse<typeof stats> = {
      data: stats,
      message: "Dashboard stats fetched successfully",
      error: false,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

public getSalesAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, timeframe } = req.query;
    
    const timeRange = (startDate && endDate) || timeframe ? {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      timeframe: timeframe as "Week" | "Month" | "Year"
    } : undefined;

    const analytics = await this.orderService.getSalesAnalytics(timeRange);

    const response: CustomResponse<typeof analytics> = {
      data: analytics,
      message: "Sales analytics fetched successfully",
      error: false,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

  public uploadMediaToS3 = async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const unlinkAsync = promisify(fs.unlink);
    try {
        // Get files in a consistent format
        let files: Express.Multer.File[] = [];
        
        if (req.file) {
            files = [req.file];
        } else if (req.files) {
            files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        }

        if (files.length === 0) {
            return next(new Error('No files were uploaded'));
        }

        const createMediaArray = [];
        let errorOccurred = false;

        for (const file of files) {
            try {
                // Verify file exists before processing
                if (!fs.existsSync(file.path)) {
                    console.warn(`File ${file.filename} does not exist at path: ${file.path}`);
                    errorOccurred = true;
                    continue;
                }

                const s3Result = await this.fileUploadService.uploadFileToS3(
                    file.path, 
                    file.filename, 
                    file.mimetype
                );

                if (s3Result) {
                    createMediaArray.push({
                        publicId: `leaves/${file.filename}`,
                        url: s3Result
                    });
                    
                    // Delete the file immediately after successful upload
                    try {
                        await unlinkAsync(file.path);
                    } catch (unlinkError) {
                        console.error(`Error deleting file ${file.path}:`, unlinkError);
                    }
                }
            } catch (uploadError) {
                errorOccurred = true;
                console.error(`Error uploading file ${file.filename}:`, uploadError);
                
                // Attempt to delete the file even if upload failed
                if (fs.existsSync(file.path)) {
                    try {
                        await unlinkAsync(file.path);
                    } catch (unlinkError) {
                        console.error(`Error deleting failed upload file ${file.path}:`, unlinkError);
                    }
                }
            }
        }

        if (createMediaArray.length === 0) {
            return next(new Error('No files were uploaded successfully'));
        }

        const statusCode = errorOccurred ? 207 : 201;
        const message = errorOccurred
            ? 'Partial upload completed, but some files failed to upload'
            : files.length > 1 
                ? `${createMediaArray.length} media files uploaded successfully`
                : 'Media file uploaded successfully';

        const responseData = files.length === 1 ? createMediaArray[0] : createMediaArray;

        const response: CustomResponse<any> = {
            data: responseData,
            message: message,
            error: errorOccurred
        };

        return res.status(statusCode).json(response);
    } catch (error) {
        console.error('Unexpected error in upload handler:', error);
        next(error);
    }
};

 
public addMockupToOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { itemId, url, notes, adminId } = req.body;

    if (!orderId || !itemId || !url || !adminId) {
      throw new HttpException(400, "Order ID, item ID, URL, and admin ID are required");
    }

    const order = await this.orderService.addMockupToOrder(
      parseInt(orderId),
      itemId,
      { url, notes, adminId }
    );

    // 🔹 Fetch full order with user + items (like updateOrderStatus does)
    const completeOrder = await this.orderService.getOrderById(parseInt(orderId));

    if (completeOrder?.user?.email) {
      try {
        const product = completeOrder.items.find((i) => i.id === itemId);
        const productName = product?.product?.productName || "Unknown Product";

        const emailHtml = mockupAddedTemplate(
          completeOrder.user.fullName,
          parseInt(orderId),
          productName,
          notes || "No additional notes provided.",
          url
        );

        await sendMail(
          completeOrder.user.email,
          `New Mockup Added to Your Order #${orderId}`,
          `A new mockup has been added to your order #${orderId}. Please log in to review it.`,
          emailHtml
        );

        console.log(`✅ Mockup email sent to ${completeOrder.user.email}`);
      } catch (mailErr) {
        console.error("❌ Failed to send mockup email:", mailErr);
      }
    }

    const response: CustomResponse<typeof order> = {
      data: order,
      message: "Mockup added to order successfully",
      error: false,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

public updateBrandingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { itemId, isApproved, notes, userId, isAdmin } = req.body;

    if (!orderId || !itemId || isApproved === undefined || !userId) {
      throw new HttpException(400, "Required fields are missing");
    }

    const order = await this.orderService.updateBrandingStatus(
      parseInt(orderId),
      itemId,
      { isApproved, notes, userId, isAdmin }
    );

    // 🔹 Fetch full order again
    const completeOrder = await this.orderService.getOrderById(parseInt(orderId));

    // Only send if customer updated status
    if (!isAdmin && completeOrder?.user?.email) {
      try {
        const product = completeOrder.items.find((i) => i.id === itemId);
        const productName = product?.product?.productName || "Unknown Product";

        const status = isApproved ? "approved" : "revision_requested";

        const emailHtml = brandingStatusUpdateTemplate(
          completeOrder.user.fullName,
          parseInt(orderId),
          productName,
          status,
          notes || "",
          isApproved
        );

        await sendMail(
          completeOrder.user.email,
          `Branding Status Updated for Order #${orderId}`,
          `Your branding design status for order #${orderId} has been updated to ${status}.`,
          emailHtml
        );

        console.log(`✅ Branding email sent to ${completeOrder.user.email}`);
      } catch (mailErr) {
        console.error("❌ Failed to send branding status email:", mailErr);
      }
    }

    const response: CustomResponse<typeof order> = {
      data: order,
      message: "Branding status updated successfully",
      error: false,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

public getDesignCommunications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, itemId } = req.params;

    if (!orderId || !itemId) {
      throw new HttpException(400, "Order ID and item ID are required");
    }

    const communications = await this.orderService.getDesignCommunications(
      parseInt(orderId),
      itemId
    );

    const response: CustomResponse<typeof communications> = {
      data: communications,
      message: "Design communications fetched successfully",
      error: false,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};


public getDesignHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, itemId } = req.params; // Changed from productId to itemId

    if (!orderId || !itemId) {
      throw new HttpException(400, "Order ID and item ID are required");
    }

    const designHistory = await this.orderService.getDesignHistory(
      parseInt(orderId),
      itemId // Now passing itemId (UUID string)
    );

    const response: CustomResponse<typeof designHistory> = {
      data: designHistory,
      message: "Design history fetched successfully",
      error: false,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// public updateBrandingStatus = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { orderId } = req.params;
//     const { itemId, isApproved, notes, userId, isAdmin } = req.body; // Changed from productId to itemId

//     if (!orderId || !itemId || isApproved === undefined || !userId) {
//       throw new HttpException(400, "Required fields are missing");
//     }

//     const order = await this.orderService.updateBrandingStatus(
//       parseInt(orderId),
//       itemId, // Now passing itemId (UUID string)
//       { isApproved, notes, userId, isAdmin }
//     );

//     const response: CustomResponse<typeof order> = {
//       data: order,
//       message: "Branding status updated successfully",
//       error: false,
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     next(error);
//   }
// };

// public getOrderCommunications = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { orderId } = req.params;

//     if (!orderId) {
//       throw new HttpException(400, "Order ID is required");
//     }

//     const communications = await this.orderService.getOrderCommunications(
//       parseInt(orderId)
//     );

//     const response: CustomResponse<typeof communications> = {
//       data: communications,
//       message: "Order communications fetched successfully",
//       error: false,
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     next(error);
//   }
// };

// public addCommunication = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { orderId } = req.params;
//     const { type, message, sender, attachments, userId } = req.body;

//     if (!orderId || !type || !message || !sender || !userId) {
//       throw new HttpException(400, "Required fields are missing");
//     }

//     const order = await this.orderService.addCommunication(
//       parseInt(orderId),
//       { type, message, sender, attachments, userId }
//     );

//     const response: CustomResponse<typeof order> = {
//       data: order,
//       message: "Communication added successfully",
//       error: false,
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     next(error);
//   }
// };




  public getOrderById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.query.userId
        ? parseInt(req.query.userId as string)
        : undefined;

      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }

      const order = await this.orderService.getOrderById(orderId, userId);

      const response: CustomResponse<typeof order> = {
        data: order,
        message: "Order fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getUsersWithOrderDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderUserDetails =
        await this.orderService.getUsersWithOrderDetails();

      const response: CustomResponse<typeof orderUserDetails> = {
        data: orderUserDetails,
        message: "orderUserDetails fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
  public deleteAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const order = await this.orderService.deleteAllOrders();

      const response: CustomResponse<null> = {
        data: null,
        message: "Order deleted successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getTop5Products = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const order = await this.orderService.getTop5Products();

      const response: CustomResponse<null> = {
        data: order,
        message: "Best selling products fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
  public getAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const order = await this.orderService.getAllOrders();

      const response: CustomResponse<null> = {
        data: order,
        message: "All orders fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update order address
   */
  public updateOrderAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { addresses, userId } = req.body;

      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }

      if (!addresses || !Array.isArray(addresses)) {
        throw new HttpException(400, "Addresses array is required");
      }

      const order = await this.orderService.updateOrderAddress(
        orderId,
        addresses,
        userId
      );

      const response: CustomResponse<typeof order> = {
        data: order,
        message: "Order address updated successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get order address
   */
  public getOrderAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.query.userId
        ? parseInt(req.query.userId as string)
        : undefined;

      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }

      const addresses = await this.orderService.getOrderAddress(
        orderId,
        userId
      );

      const response: CustomResponse<string[]> = {
        data: addresses,
        message: "Order address fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add address to order
   */
  public addAddressToOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { address, userId } = req.body;

      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }

      if (!address) {
        throw new HttpException(400, "Address is required");
      }

      const order = await this.orderService.addAddressToOrder(
        orderId,
        address,
        userId
      );

      const response: CustomResponse<typeof order> = {
        data: order,
        message: "Address added to order successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getUserAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const order = await this.orderService.getUserAnalytics();

      const response: CustomResponse<null> = {
        data: order,
        message: "User analytics fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getUserOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = parseInt(req.params.userId);
      const { limit = 50, offset = 0 } = req.query;

      if (!userId || userId <= 0) {
        throw new HttpException(400, "Valid user ID is required");
      }

      const orders = await this.orderService.getUserOrders(
        userId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      const response: CustomResponse<typeof orders> = {
        data: orders,
        message: "User orders fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updateOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { status } = req.body;

      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }
      if (!status) {
        throw new HttpException(400, "Status is required");
      }

      // 1️⃣ Update order status
      const order = await this.orderService.updateOrderStatus(orderId, status);

      // 2️⃣ Fetch full order with user and items
      const completeOrder = await this.orderService.getOrderById(orderId);

      if (completeOrder?.user?.email) {
        try {
          const subject = `Your UGETMO Order #${orderId} Status Update`;
          const text = `Your order status has been updated to: ${status}`;
          const html = orderStatusUpdateTemplate(
            completeOrder.user.fullName,
            orderId,
            status,
            completeOrder.items.map((item) => ({
              product: {
                productName: item.product?.productName || "Unknown Product",
              },
              quantity: item.quantity,
              price: item.price,
              image: item.product?.images?.[0]?.urls?.[0]?.url, // Make sure this path matches your data structure
            })),
            completeOrder.total
          );

          // Send to actual customer email, not test email
          await sendMail(completeOrder.user.email, subject, text, html);

          console.log(
            `✅ Status update email sent to ${completeOrder.user.email}`
          );
        } catch (mailErr) {
          console.error("❌ Failed to send status update email:", mailErr);
        }
      } else {
        console.warn("⚠️ No user email found on order, skipping email send.");
      }

      // 4️⃣ Return response
      const response: CustomResponse<typeof order> = {
        data: order,
        message: "Order status updated successfully",
        error: false,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public updatePaymentStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { paymentStatus, paymentReference } = req.body;

      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }

      if (!paymentStatus) {
        throw new HttpException(400, "Payment status is required");
      }

      const order = await this.orderService.updatePaymentStatus(
        orderId,
        paymentStatus,
        paymentReference
      );

      const response: CustomResponse<typeof order> = {
        data: order,
        message: "Payment status updated successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getOrderByPaymentReference = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { paymentReference } = req.params;

      if (!paymentReference) {
        throw new HttpException(400, "Payment reference is required");
      }

      const order = await this.orderService.getOrderByPaymentReference(
        paymentReference
      );

      const response: CustomResponse<typeof order> = {
        data: order,
        message: "Order fetched by payment reference successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getOrdersByStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { status } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!status) {
        throw new HttpException(400, "Status is required");
      }

      const orders = await this.orderService.getOrdersByStatus(
        status as any,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      const response: CustomResponse<typeof orders> = {
        data: orders,
        message: "Orders fetched by status successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getTotalOrdersCount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.query.userId
        ? parseInt(req.query.userId as string)
        : undefined;

      const count = await this.orderService.getTotalOrdersCount(userId);

      const response: CustomResponse<{ count: number }> = {
        data: { count },
        message: "Total orders count fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public cancelOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { userId } = req.body;

      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }

      const order = await this.orderService.cancelOrder(orderId, userId);

      const response: CustomResponse<typeof order> = {
        data: order,
        message: "Order cancelled successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getOrderTotal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }

      const total = await this.orderService.getOrderTotal(orderId);

      const response: CustomResponse<{ total: number }> = {
        data: { total },
        message: "Order total fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getOrderItemsCount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (!orderId || orderId <= 0) {
        throw new HttpException(400, "Valid order ID is required");
      }

      const itemsCount = await this.orderService.getOrderItemsCount(orderId);

      const response: CustomResponse<{ itemsCount: number }> = {
        data: { itemsCount },
        message: "Order items count fetched successfully",
        error: false,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

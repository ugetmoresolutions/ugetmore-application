// services/payment/pfNotification.service.ts
import { Service } from "typedi";
import crypto from "crypto";

import { HttpException } from "@/exceptions/HttpException";
import { IPFNotificationCreate, IPFNotificationSummary } from "@/models/notification/payfast.notification.model";
import { PFNOTIFICATION_SERVICE_TOKEN } from "@/interfaces/notification/payment/notification.repository.interface";
import { PFNotificationRepository } from "@/repositories/notification/payment.notification.repository";


export interface NotificationProcessResult {
  success: boolean;
  message: string;
  isDuplicate: boolean;
  notification?: IPFNotificationSummary;
}

export interface ITNData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: string;
  item_name?: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  merchant_id: string;
  signature: string;
  email_address?: string;
  billing_date?: string;
  [key: string]: any;
}

@Service({id : PFNOTIFICATION_SERVICE_TOKEN})
export class PFNotificationService {
  constructor(private pfNotificationRepository: PFNotificationRepository) {}

  /**
   * Process incoming PayFast ITN notification
   */
  public async processITNNotification(itnData: ITNData): Promise<NotificationProcessResult> {
    try {
      console.log(`🔔 Processing PayFast ITN notification`);
      console.log(`📋 ITN Data:`, {
        m_payment_id: itnData.m_payment_id,
        pf_payment_id: itnData.pf_payment_id,
        payment_status: itnData.payment_status,
        merchant_id: itnData.merchant_id,
        amount_gross: itnData.amount_gross,
        signature: itnData.signature ? '***' + itnData.signature.slice(-4) : 'none'
      });

      // Validate required fields
      if (!itnData.m_payment_id || !itnData.pf_payment_id || !itnData.merchant_id || !itnData.payment_status) {
        console.log(`❌ Missing required ITN fields:`, {
          m_payment_id: !!itnData.m_payment_id,
          pf_payment_id: !!itnData.pf_payment_id,
          merchant_id: !!itnData.merchant_id,
          payment_status: !!itnData.payment_status
        });
        throw new HttpException(400, "Missing required ITN fields");
      }

      // Check for duplicates
      const isDuplicate = await this.isDuplicateNotification(
        parseInt(itnData.pf_payment_id), 
        itnData.signature
      );

      if (isDuplicate) {
        console.log(`⚠️ Duplicate ITN detected for PF Payment ID: ${itnData.pf_payment_id}`);
        return {
          success: true,
          message: "Duplicate notification - already processed",
          isDuplicate: true
        };
      }

      // Validate signature (optional but recommended)
      const isValidSignature = await this.validateSignature(itnData);
      if (!isValidSignature) {
        console.log(`⚠️ Signature validation failed for PF Payment ID: ${itnData.pf_payment_id}`);
      } else {
        console.log(`✅ Signature validation passed for PF Payment ID: ${itnData.pf_payment_id}`);
      }

      // Save notification to database using cleaned interface
      const notification = await this.saveNotification({
        merchantId: parseInt(itnData.merchant_id),
        pfPaymentId: parseInt(itnData.pf_payment_id),
        paymentStatus: itnData.payment_status.toUpperCase(),
        paymentReference: itnData.m_payment_id,
        amountGross: itnData.amount_gross ? parseFloat(itnData.amount_gross) : null,
        amountFee: itnData.amount_fee ? parseFloat(itnData.amount_fee) : null,
        amountNet: itnData.amount_net ? parseFloat(itnData.amount_net) : null,
        signature: itnData.signature || null,
        rawItnData: JSON.stringify(itnData)
      });

      console.log(`✅ ITN notification processed successfully for payment: ${itnData.m_payment_id}`);

      return {
        success: true,
        message: "ITN notification processed successfully",
        isDuplicate: false,
        notification
      };

    } catch (error) {
      console.error(`❌ Error processing ITN notification:`, error);
      return {
        success: false,
        message: `ITN processing failed: ${error.message}`,
        isDuplicate: false
      };
    }
  }

  public async getTotalAmount () :  Promise<{
  totalGrossAmount: number;
  totalNetAmount: number;
  totalFeeAmount: number;
  completedGrossAmount: number;
  completedNetAmount: number;
  notificationCount: number;
}>{
    try {
      return await this.pfNotificationRepository.getTotalAmount()
    } catch (error) {
      throw new HttpException(500, error.message)
    }
  }

  /**
   * Save notification to database
   */
  public async saveNotification(notificationData: IPFNotificationCreate): Promise<IPFNotificationSummary> {
    try {
      console.log(`💾 Saving notification for PF Payment ID: ${notificationData.pfPaymentId}`);
      
      // Validate notification data before saving
      if (!notificationData.merchantId || !notificationData.pfPaymentId || 
          !notificationData.paymentStatus || !notificationData.paymentReference) {
        throw new HttpException(400, "Missing required notification data");
      }

      return await this.pfNotificationRepository.createNotification(notificationData);
    } catch (error) {
      console.error('❌ Error in PFNotificationService.saveNotification:', error);
      throw error;
    }
  }

  /**
   * Find notification by PayFast payment ID
   */
  public async findByPfPaymentId(pfPaymentId: number): Promise<IPFNotificationSummary | null> {
    try {
      return await this.pfNotificationRepository.findByPfPaymentId(pfPaymentId);
    } catch (error) {
      console.error('❌ Error in PFNotificationService.findByPfPaymentId:', error);
      return null;
    }
  }

  /**
   * Find notification by payment reference (m_payment_id)
   */
  public async findByPaymentReference(paymentReference: string): Promise<IPFNotificationSummary | null> {
    try {
      console.log(`🔍 Service: Finding notification by payment reference: ${paymentReference}`);
      return await this.pfNotificationRepository.findByPaymentReference(paymentReference);
    } catch (error) {
      console.error('❌ Error in PFNotificationService.findByPaymentReference:', error);
      return null;
    }
  }

  /**
   * Check if notification is duplicate
   */
  public async isDuplicateNotification(pfPaymentId: number, signature: string): Promise<boolean> {
    try {
      if (!signature) {
        const existing = await this.pfNotificationRepository.findByPfPaymentId(pfPaymentId);
        return !!existing;
      }
      
      return await this.pfNotificationRepository.notificationExists(pfPaymentId, signature);
    } catch (error) {
      console.error('❌ Error checking duplicate notification:', error);
      return false;
    }
  }

  /**
   * Validate PayFast signature
   */
  public async validateSignature(itnData: ITNData): Promise<boolean> {
    try {
      const receivedSignature = itnData.signature;
      
      if (!receivedSignature) {
        console.log(`⚠️ No signature provided in ITN`);
        return false;
      }

      const dataForValidation = { ...itnData };
      delete dataForValidation.signature;

      const filteredParams: Record<string, string> = {};
      Object.keys(dataForValidation).forEach(key => {
        const value = dataForValidation[key];
        if (value !== null && value !== undefined && value !== '') {
          filteredParams[key] = String(value);
        }
      });

      const sortedParams = Object.keys(filteredParams)
        .sort()
        .map(key => `${key}=${filteredParams[key]}`)
        .join('&');

      console.log(`🔐 Signature validation string: ${sortedParams}`);

      const passphrase = process.env.PAYFAST_PASSPHRASE;
      const stringToHash = passphrase ? `${sortedParams}&passphrase=${passphrase}` : sortedParams;

      const calculatedSignature = crypto.createHash('md5').update(stringToHash).digest('hex');

      const isValid = calculatedSignature === receivedSignature;
      
      console.log(`🔐 Signature comparison:`, {
        calculated: calculatedSignature,
        received: receivedSignature,
        valid: isValid
      });

      return isValid;

    } catch (error) {
      console.error(`❌ Error validating signature:`, error);
      return false;
    }
  }

  /**
   * Check if payment was successful by payment reference
   */
  public async isPaymentSuccessfulByReference(paymentReference: string): Promise<boolean> {
    try {
      console.log(`🔍 Service: Checking payment success for reference: ${paymentReference}`);
      return await this.pfNotificationRepository.isPaymentSuccessfulByReference(paymentReference);
    } catch (error) {
      console.error('❌ Error checking if payment successful by reference:', error);
      return false;
    }
  }

  /**
   * Get comprehensive payment status for a payment reference
   */
  public async getPaymentStatus(paymentReference: string): Promise<{
    found: boolean;
    verified: boolean;
    status: string;
    notification?: IPFNotificationSummary;
    message: string;
  }> {
    try {
      console.log(`🔍 Getting comprehensive payment status for: ${paymentReference}`);
      
      const notification = await this.findByPaymentReference(paymentReference);
      
      if (!notification) {
        return {
          found: false,
          verified: false,
          status: 'NOT_FOUND',
          message: 'No payment notification found'
        };
      }

      const successStatuses = ['COMPLETE', 'COMPLETED', 'SUCCESS', 'PAID'];
      const isVerified = successStatuses.includes(notification.paymentStatus?.toUpperCase() || '');
      
      return {
        found: true,
        verified: isVerified,
        status: notification.paymentStatus,
        notification,
        message: isVerified ? 'Payment verified successfully' : `Payment status: ${notification.paymentStatus}`
      };
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
      return {
        found: false,
        verified: false,
        status: 'ERROR',
        message: `Error checking payment: ${error.message}`
      };
    }
  }

  /**
   * Verify if payment can be used for order creation
   */
  public async canCreateOrder(paymentReference: string): Promise<{
    canCreate: boolean;
    reason: string;
    notification?: IPFNotificationSummary;
  }> {
    try {
      console.log(`🔍 Checking if order can be created for payment: ${paymentReference}`);
      
      const paymentStatus = await this.getPaymentStatus(paymentReference);
      
      if (!paymentStatus.found) {
        return {
          canCreate: false,
          reason: 'Payment notification not found'
        };
      }

      if (!paymentStatus.verified) {
        return {
          canCreate: false,
          reason: `Payment not completed. Status: ${paymentStatus.status}`,
          notification: paymentStatus.notification
        };
      }

      return {
        canCreate: true,
        reason: 'Payment verified and ready for order creation',
        notification: paymentStatus.notification
      };
    } catch (error) {
      console.error('❌ Error checking if order can be created:', error);
      return {
        canCreate: false,
        reason: `Error verifying payment: ${error.message}`
      };
    }
  }

  /**
   * Get payment verification details for frontend display
   */
  public async getPaymentVerificationForUI(paymentReference: string): Promise<{
    exists: boolean;
    verified: boolean;
    status: string;
    amount: number;
    pfPaymentId?: number;
    receivedAt?: Date;
    canProceed: boolean;
    message: string;
  }> {
    try {
      const verification = await this.pfNotificationRepository.getPaymentVerificationDetails(paymentReference);
      
      return {
        exists: verification.exists,
        verified: verification.verified,
        status: verification.status || 'UNKNOWN',
        amount: verification.amount || 0,
        pfPaymentId: verification.pfPaymentId,
        receivedAt: verification.createdAt,
        canProceed: verification.verified,
        message: verification.verified ? 
          'Payment verified - you can proceed with order creation' : 
          verification.exists ? 
            `Payment status: ${verification.status}` : 
            'Payment not found'
      };
    } catch (error) {
      console.error('❌ Error getting payment verification for UI:', error);
      return {
        exists: false,
        verified: false,
        status: 'ERROR',
        amount: 0,
        canProceed: false,
        message: 'Error checking payment status'
      };
    }
  }

  /**
   * Get all notifications with pagination
   */
  public async getAllNotifications(
    page: number = 1, 
    limit: number = 50
  ): Promise<{ 
    notifications: IPFNotificationSummary[], 
    total: number, 
    totalPages: number 
  }> {
    try {
      return await this.pfNotificationRepository.findAllWithPagination(page, limit);
    } catch (error) {
      console.error('❌ Error in PFNotificationService.getAllNotifications:', error);
      throw error;
    }
  }

  /**
   * Get notifications by merchant ID
   */
  public async findByMerchantId(merchantId: number): Promise<IPFNotificationSummary[]> {
    try {
      return await this.pfNotificationRepository.findByMerchantId(merchantId);
    } catch (error) {
      console.error('❌ Error in PFNotificationService.findByMerchantId:', error);
      throw error;
    }
  }

  /**
   * Get notifications by payment status
   */
  public async findByPaymentStatus(paymentStatus: string): Promise<IPFNotificationSummary[]> {
    try {
      return await this.pfNotificationRepository.findByPaymentStatus(paymentStatus);
    } catch (error) {
      console.error('❌ Error in PFNotificationService.findByPaymentStatus:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  public async getNotificationStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
    today: number;
  }> {
    try {
      return await this.pfNotificationRepository.getNotificationStats();
    } catch (error) {
      console.error('❌ Error in PFNotificationService.getNotificationStats:', error);
      throw error;
    }
  }

  /**
   * Process notification and determine if payment was successful
   */
  public async isPaymentSuccessful(pfPaymentId: number): Promise<boolean> {
    try {
      const notification = await this.findByPfPaymentId(pfPaymentId);
      
      if (!notification) {
        console.log(`ℹ️ No notification found for PF Payment ID: ${pfPaymentId}`);
        return false;
      }

      const successStatuses = ['COMPLETE', 'COMPLETED', 'SUCCESS', 'PAID'];
      const isSuccessful = successStatuses.includes(notification.paymentStatus?.toUpperCase() || '');
      
      console.log(`📊 Payment ${pfPaymentId} status: ${notification.paymentStatus} - Successful: ${isSuccessful}`);
      
      return isSuccessful;
    } catch (error) {
      console.error('❌ Error checking if payment successful:', error);
      return false;
    }
  }

  /**
   * Get notification details with parsed ITN data
   */
  public async getNotificationDetails(pfPaymentId: number): Promise<{
    notification: IPFNotificationSummary | null;
    parsedItnData: any;
  }> {
    try {
      const notification = await this.findByPfPaymentId(pfPaymentId);
      
      if (!notification) {
        return {
          notification: null,
          parsedItnData: null
        };
      }

      let parsedItnData = null;
      if (notification.rawItnData) {
        try {
          parsedItnData = JSON.parse(notification.rawItnData);
        } catch (error) {
          console.error('❌ Error parsing ITN data:', error);
        }
      }

      return {
        notification,
        parsedItnData
      };
    } catch (error) {
      console.error('❌ Error getting notification details:', error);
      throw error;
    }
  }
}
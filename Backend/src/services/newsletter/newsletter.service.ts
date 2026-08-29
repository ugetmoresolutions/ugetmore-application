// services/newsletter/newsletter.service.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { 
  INewsletterService, 
  NEWSLETTER_SERVICE_TOKEN 
} from "@/interfaces/newsletter/newsletter.service.interface";
import { 
  INewsletterSubscriber, 
  ICreateSubscriber 
} from "@/types/newsletter/newsletter.type";
import { NewsletterRepository } from "@/repositories/newsletter/newsletter.repository";
import { 
  welcomeNewsletterTemplate,
  sendMail 
} from "@/utils/email";

@Service({ id: NEWSLETTER_SERVICE_TOKEN })
export class NewsletterService implements INewsletterService {
  constructor(private newsletterRepository: NewsletterRepository) {}

  public async subscribe(subscriberData: ICreateSubscriber): Promise<INewsletterSubscriber> {
    try {
      if (!subscriberData.email || !this.isValidEmail(subscriberData.email)) {
        throw new HttpException(400, "Valid email address is required");
      }

      const subscriber = await this.newsletterRepository.subscribe(
        subscriberData.email.toLowerCase().trim(), 
        subscriberData.source
      );

      // Send welcome email
      try {
        await this.sendWelcomeEmail(subscriber.email);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't throw error - subscription should still succeed
      }

      return subscriber;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to subscribe: ${error.message}`);
    }
  }

  public async unsubscribe(email: string): Promise<boolean> {
    try {
      if (!email || !this.isValidEmail(email)) {
        throw new HttpException(400, "Valid email address is required");
      }

      return await this.newsletterRepository.unsubscribe(email.toLowerCase().trim());
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to unsubscribe: ${error.message}`);
    }
  }

  public async getSubscriberByEmail(email: string): Promise<INewsletterSubscriber | null> {
    try {
      if (!email || !this.isValidEmail(email)) {
        throw new HttpException(400, "Valid email address is required");
      }

      return await this.newsletterRepository.getSubscriberByEmail(email.toLowerCase().trim());
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to get subscriber: ${error.message}`);
    }
  }

  public async getAllSubscribers(): Promise<INewsletterSubscriber[]> {
    try {
      return await this.newsletterRepository.getAllSubscribers();
    } catch (error: any) {
      throw new HttpException(500, `Failed to get subscribers: ${error.message}`);
    }
  }

  public async getActiveSubscribers(): Promise<INewsletterSubscriber[]> {
    try {
      return await this.newsletterRepository.getActiveSubscribers();
    } catch (error: any) {
      throw new HttpException(500, `Failed to get active subscribers: ${error.message}`);
    }
  }

  public async getSubscriberStats(): Promise<{ total: number; active: number }> {
    try {
      return await this.newsletterRepository.getSubscriberCount();
    } catch (error: any) {
      throw new HttpException(500, `Failed to get subscriber stats: ${error.message}`);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async sendWelcomeEmail(email: string): Promise<boolean> {
    try {
      const html = welcomeNewsletterTemplate();
      const subject = "🎉 Welcome to UGetMo Newsletter!";
      const text = "Thank you for subscribing to UGetMo newsletter. You'll be the first to know about our latest products and exclusive offers!";

      await sendMail(email, subject, text, html);
      console.log(`✅ Welcome email sent to ${email}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }
}
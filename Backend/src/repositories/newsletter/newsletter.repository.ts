// repositories/newsletter/newsletter.repository.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import {
  INewsletterSubscriber,
  ICreateSubscriber,
} from "@/types/newsletter/newsletter.type";
import { INewsletterRepository } from "@/interfaces/newsletter/newsletter.repository.interface";
import NewsletterSubscriber from "@/models/newsletter/newsletter.model";

@Service()
export class NewsletterRepository implements INewsletterRepository {
  public async subscribe(
    email: string,
    source?: string
  ): Promise<INewsletterSubscriber> {
    try {
      const existingSubscriber = await NewsletterSubscriber.findOne({
        where: { email },
      });

      if (existingSubscriber) {
        if (existingSubscriber.isActive) {
          throw new HttpException(
            409,
            "Email is already subscribed to our newsletter"
          );
        } else {
          // Reactivate existing subscriber
          await NewsletterSubscriber.update(
            {
              isActive: true,
              unsubscribedAt: null,
              source: source || existingSubscriber.source,
            },
            { where: { email } }
          );

          const updatedSubscriber = await NewsletterSubscriber.findOne({
            where: { email },
          });
          return updatedSubscriber!.toJSON() as INewsletterSubscriber;
        }
      }

      const subscriber = await NewsletterSubscriber.create({
        email,
        isActive: true,
        source: source || "website",
        subscribedAt: new Date(),
      });

      return subscriber.toJSON() as INewsletterSubscriber;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to subscribe: ${error.message}`);
    }
  }

  public async unsubscribe(email: string): Promise<boolean> {
    try {
      const [affectedRows] = await NewsletterSubscriber.update(
        {
          isActive: false,
          unsubscribedAt: new Date(),
        },
        {
          where: {
            email,
            isActive: true,
          },
        }
      );

      if (affectedRows === 0) {
        throw new HttpException(
          404,
          "Subscriber not found or already unsubscribed"
        );
      }

      return true;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to unsubscribe: ${error.message}`);
    }
  }

  public async getSubscriberByEmail(
    email: string
  ): Promise<INewsletterSubscriber | null> {
    try {
      const subscriber = await NewsletterSubscriber.findOne({
        where: { email },
      });
      return subscriber ? (subscriber.toJSON() as INewsletterSubscriber) : null;
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to get subscriber: ${error.message}`
      );
    }
  }

  public async getAllSubscribers(): Promise<INewsletterSubscriber[]> {
    try {
      const subscribers = await NewsletterSubscriber.findAll({
        order: [["subscribedAt", "DESC"]],
      });
      return subscribers.map((sub) => sub.toJSON() as INewsletterSubscriber);
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to get subscribers: ${error.message}`
      );
    }
  }

  public async getActiveSubscribers(): Promise<INewsletterSubscriber[]> {
    try {
      const subscribers = await NewsletterSubscriber.findAll({
        where: { isActive: true },
        order: [["subscribedAt", "DESC"]],
      });
      return subscribers.map((sub) => sub.toJSON() as INewsletterSubscriber);
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to get active subscribers: ${error.message}`
      );
    }
  }

  public async getSubscriberCount(): Promise<{
    total: number;
    active: number;
  }> {
    try {
      const total = await NewsletterSubscriber.count();
      const active = await NewsletterSubscriber.count({
        where: { isActive: true },
      });

      return { total, active };
    } catch (error: any) {
      throw new HttpException(
        500,
        `Failed to get subscriber count: ${error.message}`
      );
    }
  }
}

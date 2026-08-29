// interfaces/newsletter/newsletter.service.interface.ts
import { 
  INewsletterSubscriber, 
  ICreateSubscriber 
} from "@/types/newsletter/newsletter.type";
import { Token } from "typedi";

export interface INewsletterService {
  subscribe(subscriberData: ICreateSubscriber): Promise<INewsletterSubscriber>;
  unsubscribe(email: string): Promise<boolean>;
  getSubscriberByEmail(email: string): Promise<INewsletterSubscriber | null>;
  getAllSubscribers(): Promise<INewsletterSubscriber[]>;
  getActiveSubscribers(): Promise<INewsletterSubscriber[]>;
  getSubscriberStats(): Promise<{ total: number; active: number }>;
}

export const NEWSLETTER_SERVICE_TOKEN = new Token<INewsletterService>("INewsletterService");
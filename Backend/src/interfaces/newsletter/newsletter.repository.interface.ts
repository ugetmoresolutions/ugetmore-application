// interfaces/newsletter/newsletter.repository.interface.ts
import { 
  INewsletterSubscriber, 
  ICreateSubscriber 
} from "@/types/newsletter/newsletter.type";

export interface INewsletterRepository {
  subscribe(email: string, source?: string): Promise<INewsletterSubscriber>;
  unsubscribe(email: string): Promise<boolean>;
  getSubscriberByEmail(email: string): Promise<INewsletterSubscriber | null>;
  getAllSubscribers(): Promise<INewsletterSubscriber[]>;
  getActiveSubscribers(): Promise<INewsletterSubscriber[]>;
  getSubscriberCount(): Promise<{ total: number; active: number }>;
}